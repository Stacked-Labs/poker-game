'use client';

import {
    createContext,
    ReactNode,
    useEffect,
    useState,
    useContext,
    useRef,
    useCallback,
    Context,
} from 'react';
import {
    Message,
    Game,
    Log,
    Player,
    BlindObligationOptions,
    GameEventRecord,
} from '@/app/interfaces';
import { AppContext } from './AppStoreProvider';
import useToastHelper from '../hooks/useToastHelper';
import { soundManager } from '../utils/SoundManager';
import { formatGameEvent } from '../utils/formatGameEvent';
import SeatRequestConflictModal from '../components/SeatRequestConflictModal';
import { useSeatReactionsStore } from '@/app/stores/seatReactions';
import { usePointsAnimationStore } from '@/app/stores/pointsAnimation';
import {
    isPlayerActionLabelType,
    usePlayerActionLabelStore,
} from '@/app/stores/playerActionLabel';
import {
    getSeatReactionEmoteUrl,
    parseSeatReactionMessage,
} from '@/app/utils/seatReaction';
import { useAuth } from '@/app/contexts/AuthContext';

/*
WebSocket context creates a single connection to the server per client.
It handles opening, closing, and error handling of the websocket. It also
dispatches websocket messages to update the central state store.

Trust boundary: the WS may open before SIWE auth has completed. The backend
treats unauthenticated connections as spectators — hole cards are stripped
via GenerateSpectatorView, ledger/pending-player data is owner-gated, and all
write actions (take-seat, accept-player, kick-player, start-game, blinds, …)
are refused without an authenticated session. After SIWE the connection
force-reconnects and the backend upgrades the session via TryReclaimSeat,
so no privileged data ever flows over the unauthenticated phase.

If you add a new server → client message, confirm the spectator path doesn't
leak anything that wasn't already public.
*/

export const SocketContext: Context<WebSocket | null> =
    createContext<WebSocket | null>(null);

type SocketProviderProps = {
    children: ReactNode;
    tableId: string;
};

const TOAST_ID_RECONNECTED = 'isReconnected';
const SETTLEMENT_PENDING_SPINNER_DELAY_MS = 3000;
const SETTLEMENT_SUCCESS_DISPLAY_MS = 2500;
// Suppress the "Reconnected" toast for blips shorter than this — tab-switch
// reconnects and sub-3s network hiccups would otherwise spam users.
const RECONNECT_TOAST_GRACE_MS = 3000;

export function SocketProvider(props: SocketProviderProps) {
    const { tableId } = props;
    const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL; // expected to point to /ws base
    const WS_DEBUG = process.env.NEXT_PUBLIC_DEBUG_WS === 'true';
    const debugLog = useCallback(
        (...args: unknown[]) => {
            if (WS_DEBUG) console.log(...args);
        },
        [WS_DEBUG]
    );
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const { appState, dispatch } = useContext(AppContext);
    const socketRef = useRef<WebSocket | null>(null);
    const appStateRef = useRef(appState);
    const isReconnectingRef = useRef(false);
    const manualCloseRef = useRef(false);
    const disconnectedAtRef = useRef<number | null>(null);
    const connectionLostShownRef = useRef(false);
    const winSoundPlayedRef = useRef(false);
    const { isAuthenticated, userAddress } = useAuth();
    const authRef = useRef({ isAuthenticated, address: userAddress });
    const authStateAtConnectRef = useRef({
        isAuthenticated: false,
        address: null as string | null,
    });

    const {
        error: originalError,
        success: originalSuccess,
        info: originalInfo,
        connectionLost: originalConnectionLost,
        close: originalClose,
    } = useToastHelper();

    const toastErrorRef = useRef(originalError);
    const toastSuccessRef = useRef(originalSuccess);
    const toastInfoRef = useRef(originalInfo);
    const toastConnectionLostRef = useRef(originalConnectionLost);
    const toastCloseRef = useRef(originalClose);

    useEffect(() => {
        toastErrorRef.current = originalError;
        toastSuccessRef.current = originalSuccess;
        toastInfoRef.current = originalInfo;
        toastConnectionLostRef.current = originalConnectionLost;
        toastCloseRef.current = originalClose;
    }, [
        originalError,
        originalSuccess,
        originalInfo,
        originalConnectionLost,
        originalClose,
    ]);

    const reconnectionAttemptsRef = useRef(0);
    const maxReconnectionAttempts = 5;
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const settlementPendingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const settlementSuccessTimerRef = useRef<NodeJS.Timeout | null>(null);
    // Set to true while the local player has player.in === true during a running hand.
    // Consumed at settlement-status: success so points only animate for actual participants.
    const userWasInHandRef = useRef(false);
    const [seatRequestConflict, setSeatRequestConflict] = useState<{
        seatId: number | null;
        message?: string;
    } | null>(null);

    useEffect(() => {
        appStateRef.current = appState;
    }, [appState]);

    useEffect(() => {
        authRef.current = { isAuthenticated, address: userAddress };
    }, [isAuthenticated, userAddress]);

    const getReconnectDelay = useCallback((attempt: number) => {
        const baseDelay = 1000;
        const maxDelay = 16000;
        return Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    }, []);

    const connectWebSocket = useCallback(async () => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        debugLog('[WebSocket] connection attempt start');

        if (!WS_BASE_URL || !API_URL) {
            console.error('WebSocket URL or API URL is not defined.');
            toastErrorRef.current(
                'Configuration Error',
                'WebSocket or API URL not set.'
            );
            return;
        }

        if (socketRef.current) {
            debugLog('[WebSocket] connection attempt skipped: already connected/in progress');
            isReconnectingRef.current = false;
            return;
        }

        try {
            debugLog('[WebSocket] initializing session', `${API_URL}/api/init-session`);
            const sessionInitResponse = await fetch(
                `${API_URL}/api/init-session`,
                {
                    method: 'GET',
                    credentials: 'include',
                }
            );

            if (!sessionInitResponse.ok) {
                console.error(
                    'Failed to initialize session:',
                    sessionInitResponse.status,
                    sessionInitResponse.statusText
                );
                toastErrorRef.current(
                    'Session Init Failed',
                    `Server error: ${sessionInitResponse.statusText}`
                );
                isReconnectingRef.current = false;
                    attemptReconnection();
                return;
            }
            const sessionData = await sessionInitResponse.json();
            debugLog('[WebSocket] session initialized', sessionData);
            // Build per-table WS URL: `${WS_BASE_URL}/table/${tableId}`
            const trimmed = WS_BASE_URL.endsWith('/')
                ? WS_BASE_URL.slice(0, -1)
                : WS_BASE_URL;
            const perTableUrl = `${trimmed}/table/${tableId}`;
            debugLog('[WebSocket] connecting', perTableUrl);
            const _socket = new WebSocket(perTableUrl);

            socketRef.current = _socket;
            setSocket(_socket);

            _socket.onopen = () => {
                debugLog('[WebSocket] connected');
                authStateAtConnectRef.current = {
                    isAuthenticated: authRef.current.isAuthenticated,
                    address: authRef.current.address,
                };
                const wasReconnecting = isReconnectingRef.current;
                const disconnectedAt = disconnectedAtRef.current;
                const connectionLostShown = connectionLostShownRef.current;
                isReconnectingRef.current = false;
                reconnectionAttemptsRef.current = 0;
                disconnectedAtRef.current = null;
                connectionLostShownRef.current = false;

                toastCloseRef.current('connectionFailed');

                const outageMs = disconnectedAt
                    ? Date.now() - disconnectedAt
                    : 0;
                const shouldNotifyReconnect =
                    connectionLostShown ||
                    (wasReconnecting && outageMs >= RECONNECT_TOAST_GRACE_MS);

                if (shouldNotifyReconnect) {
                    toastSuccessRef.current(
                        'Reconnected',
                        'Connection restored',
                        2000,
                        TOAST_ID_RECONNECTED
                    );
                }
                // Always send join-table on open
                const joinMessage = { action: 'join-table' } as const;
                debugLog('[WebSocket] send', joinMessage);
                _socket.send(JSON.stringify(joinMessage));
                debugLog('[WebSocket] join-table sent');

                // Subscribe to tournament fan-out events when on a tournament table
                const tournamentMatch = tableId.match(/^tournament-(\d+)-table-\d+$/);
                if (tournamentMatch) {
                    const joinTournament = { action: 'join-tournament', tournament_id: Number(tournamentMatch[1]) };
                    debugLog('[WebSocket] send', joinTournament);
                    _socket.send(JSON.stringify(joinTournament));
                    debugLog('[WebSocket] join-tournament sent');
                }
            };

            _socket.onclose = (event) => {
                debugLog('[WebSocket] disconnected', event);
                socketRef.current = null;
                setSocket(null);

                if (manualCloseRef.current) {
                    manualCloseRef.current = false;
                    return;
                }

                if (disconnectedAtRef.current === null) {
                    disconnectedAtRef.current = Date.now();
                }
                attemptReconnection();
            };

            _socket.onerror = (err) => {
                console.error('WebSocket error:', err);
                socketRef.current = null;
                setSocket(null);
                // Don't show error toast here - onclose will handle it
                // This prevents duplicate error toasts
            };

            _socket.onmessage = (e) => {
                let eventData;
                try {
                    eventData = JSON.parse(e.data);
                } catch (error) {
                    console.error(
                        'Failed to parse WebSocket message as JSON:',
                        error
                    );
                    console.error('Raw WebSocket data:', e.data);
                    return; // Stop processing if JSON is invalid
                }

                // Incoming messages can be high-volume; keep behind debug flag.
                debugLog('[WebSocket] recv', eventData);

                // Handle pending_players_update first as it uses event.type
                if (eventData.type === 'pending_players_update') {
                    if (Array.isArray(eventData.payload)) {
                        dispatch({
                            type: 'setPendingPlayers',
                            payload: eventData.payload,
                        });
                    } else {
                        console.error(
                            'pending_players_update payload is not an array:',
                            eventData.payload
                        );
                        dispatch({ type: 'setPendingPlayers', payload: [] });
                    }
                    return; // Message handled
                }

                if (eventData.type === 'is_pending_player') {
                    // Handle is_pending_player message
                    const payload = eventData.payload;
                    // Normalize payload into `number | null` (some servers send boolean)
                    if (typeof payload === 'number') {
                        dispatch({ type: 'setSeatRequested', payload });
                    } else if (payload === true) {
                        // Pending, but seat id not provided; keep existing numeric seatRequested if any.
                        if (typeof appStateRef.current.seatRequested !== 'number') {
                            dispatch({ type: 'setSeatRequested', payload: null });
                        }
                    } else {
                        // false / null / undefined / anything else => not pending
                        dispatch({ type: 'setSeatRequested', payload: null });
                        // Also clear any stale accepted state from a previous request cycle.
                        if (appStateRef.current.seatAccepted) {
                            dispatch({ type: 'setSeatAccepted', payload: null });
                        }
                    }
                    return; // Message handled
                }

                switch (eventData.action) {
                    case 'new-message': {
                        const seatReaction = parseSeatReactionMessage(
                            eventData.message
                        );
                        if (seatReaction) {
                            useSeatReactionsStore.getState().showReaction({
                                id: seatReaction.nonce,
                                targetUuid: seatReaction.targetUuid,
                                emoteId: seatReaction.emoteId,
                                emoteName: seatReaction.emoteName,
                                emoteUrl: getSeatReactionEmoteUrl(
                                    seatReaction.emoteId
                                ),
                                senderUuid:
                                    seatReaction.senderUuid ?? undefined,
                                createdAt: seatReaction.ts,
                            });
                            return;
                        }

                        const newMessage: Message = {
                            name: eventData.username,
                            message: eventData.message,
                            timestamp: eventData.timestamp,
                            isSeated: eventData.is_seated ?? false,
                        };

                        // Single dispatch: bundle message + unread count when chat is closed
                        if (!appStateRef.current.isChatOpen) {
                            dispatch({ type: 'addMessageWithUnread', payload: newMessage });
                        } else {
                            dispatch({ type: 'addMessage', payload: newMessage });
                        }
                        return;
                    }
                    case 'new-log': {
                        const newLog: Log = {
                            message: eventData.message,
                            timestamp: eventData.timestamp,
                        };

                        dispatch({ type: 'addLog', payload: newLog });

                        if (
                            eventData.message.startsWith('Seat request cancelled successfully.') &&
                            appStateRef.current.seatRequested !== null
                        ) {
                            dispatch({ type: 'setSeatRequested', payload: null });
                            toastSuccessRef.current(
                                'Request Cancelled',
                                'Seat request cancelled successfully.',
                                5000
                            );
                        }
                        return;
                    }
                    case 'game-event': {
                        const event = eventData.event as GameEventRecord;

                        // 1. Play sound immediately (event-driven, no state watching)
                        soundManager.play(event.event_type);

                        // Surface a transient per-seat action label for muted users.
                        if (
                            isPlayerActionLabelType(event.event_type) &&
                            event.player_uuid
                        ) {
                            usePlayerActionLabelStore
                                .getState()
                                .trigger(event.player_uuid, event.event_type);
                        }

                        // 2. Format and add to logs (if applicable)
                        const logMessage = formatGameEvent(event);
                        if (logMessage) {
                            dispatch({
                                type: 'addLog',
                                payload: {
                                    message: logMessage,
                                    timestamp: event.timestamp,
                                },
                            });
                        }
                        return;
                    }
                    case 'update-game': {
                        const newGame: Game = {
                            running: eventData.game.running,
                            dealer: eventData.game.dealer,
                            action: eventData.game.action,
                            utg: eventData.game.utg,
                            sb: eventData.game.sb,
                            bb: eventData.game.bb,
                            communityCards: eventData.game.communityCards,
                            stage: eventData.game.stage,
                            betting: eventData.game.betting,
                            config: eventData.game.config,
                            players: eventData.game.players,
                            pots: eventData.game.pots,
                            minRaise: eventData.game.minRaise,
                            readyCount: eventData.game.readyCount,
                            paused: eventData.game.paused,
                            pendingPause: eventData.game.pendingPause ?? false,
                            pendingBlinds: eventData.game?.pendingBlinds ?? undefined,
                            owesBB: eventData.game?.owesBB,
                            waitingForBB: eventData.game?.waitingForBB,
                            actionDeadline:
                                eventData.game?.actionDeadline ??
                                eventData.actionDeadline ??
                                0,
                            rabbitCards: eventData.game?.rabbitCards,
                            settlementStuck: eventData.game?.settlementStuck,
                            settlementInProgress: eventData.game?.settlementInProgress,
                        };

                        // Time bank contract (§14): `actionDeadline` is absolute epoch-ms
                        // and already encodes `config.baseActionMs + actor.timeBankMs`.
                        // `timeBankMs` (per player) and `baseActionMs` (on config) ride
                        // through the wholesale `players`/`config` assignment above. The
                        // client must NOT locally re-arm the timer — it only counts down to
                        // the server-supplied deadline. Warn if the deadline is already past
                        // on receipt, which would indicate clock skew or a stale broadcast.
                        if (
                            newGame.actionDeadline > 0 &&
                            newGame.actionDeadline < Date.now()
                        ) {
                            console.warn(
                                '[WebSocket] update-game actionDeadline is already in the past on receipt',
                                {
                                    actionDeadline: newGame.actionDeadline,
                                    now: Date.now(),
                                    skewMs: Date.now() - newGame.actionDeadline,
                                }
                            );
                        }

                        const hasAnyCommunityCard = (
                            newGame.communityCards ?? []
                        ).some((card) => Number(card) > 0);
                        if (!hasAnyCommunityCard) {
                            winSoundPlayedRef.current = false;
                        }

                        const isShowdown =
                            newGame.stage === 1 &&
                            !newGame.betting &&
                            (newGame.pots?.length ?? 0) > 0 &&
                            hasAnyCommunityCard;
                        const localUuid = appStateRef.current.clientID;
                        const localPlayerNum =
                            newGame.players?.find(
                                (p: Player) => p.uuid === localUuid
                            )?.position ?? null;
                        const localIsWinner =
                            Boolean(localUuid) &&
                            localPlayerNum !== null &&
                            (newGame.pots ?? []).some((pot) => {
                                const winsByNums =
                                    (pot.winningPlayerNums ?? []).includes(
                                        localPlayerNum
                                    );
                                const winsByWinnersArray = (
                                    pot.winners ?? []
                                ).some((w) => {
                                    if (w.uuid === localUuid) return true;
                                    return w.playerNum === localPlayerNum;
                                });
                                return winsByNums || winsByWinnersArray;
                            });

                        if (
                            isShowdown &&
                            localIsWinner &&
                            !winSoundPlayedRef.current
                        ) {
                            winSoundPlayedRef.current = true;
                            soundManager.play('win');
                        }

                        // Build a single bundled payload to avoid multiple dispatches
                        const bundlePayload: {
                            game: Game;
                            clearSeatRequested?: boolean;
                            clearSeatAccepted?: boolean;
                            blindObligation?: import('@/app/interfaces').BlindObligation | null;
                        } = { game: newGame };

                        // If player was just successfully seated, reset the flags
                        const isPlayerSeated = eventData.game.players?.some(
                            (p: Player) => {
                                return p.uuid === appStateRef.current.clientID;
                            }
                        );
                        if (isPlayerSeated) {
                            if (
                                typeof appStateRef.current.seatRequested ===
                                'number'
                            ) {
                                bundlePayload.clearSeatRequested = true;
                            }
                            if (appStateRef.current.seatAccepted) {
                                bundlePayload.clearSeatAccepted = true;
                            }
                        }

                        // Update blind obligation helper for the local seat
                        const localPlayer = eventData.game.players?.find(
                            (p: Player) =>
                                p.uuid === appStateRef.current.clientID
                        );

                        // Track whether the local player was dealt into this hand
                        if (newGame.running && localPlayer?.in) {
                            userWasInHandRef.current = true;
                        }

                        const playerIndex = localPlayer
                            ? localPlayer.position
                            : -1;
                        const owesBB =
                            playerIndex >= 0
                                ? Boolean(
                                      eventData.game?.owesBB?.[playerIndex]
                                  )
                                : false;
                        const waitingForBB =
                            playerIndex >= 0
                                ? Boolean(
                                      eventData.game?.waitingForBB?.[
                                          playerIndex
                                      ]
                                  )
                                : false;

                        if (localPlayer && (owesBB || waitingForBB)) {
                            const existingOptions =
                                appStateRef.current.blindObligation?.options ??
                                ([
                                    'post_now',
                                    'wait_bb',
                                    'sit_out',
                                ] as BlindObligationOptions[]);
                            bundlePayload.blindObligation = {
                                seatID: localPlayer.seatID,
                                owesBB,
                                waitingForBB,
                                options: existingOptions,
                            };
                        } else if (
                            appStateRef.current.blindObligation &&
                            !owesBB &&
                            !waitingForBB
                        ) {
                            bundlePayload.blindObligation = null;
                        }

                        dispatch({ type: 'updateGameBundle', payload: bundlePayload });
                        return;
                    }
                    case 'blind-obligation': {
                        // Only set state if the message targets our seat
                        const localSeatID =
                            appStateRef.current.game?.players?.find(
                                (p: Player) =>
                                    p.uuid === appStateRef.current.clientID
                            )?.seatID;

                        if (localSeatID && localSeatID !== eventData.seatID) {
                            return;
                        }

                        dispatch({
                            type: 'setBlindObligation',
                            payload: {
                                seatID: eventData.seatID,
                                owesBB: Boolean(eventData.owesBB),
                                waitingForBB: Boolean(eventData.waitingForBB),
                                options: Array.isArray(eventData.options)
                                    ? eventData.options
                                    : ([
                                          'post_now',
                                          'wait_bb',
                                          'sit_out',
                                      ] as BlindObligationOptions[]),
                            },
                        });
                        return;
                    }
                    case 'game-paused': {
                        toastInfoRef.current(
                            'Game Paused',
                            `Game paused by ${eventData.pausedBy || 'table owner'}.`,
                            5000
                        );
                        // The backend sends a full 'update-game' before this message
                        // with the correct paused state and actionDeadline: 0.
                        // Do NOT dispatch a redundant updateGame here as it would use
                        // stale appStateRef data and overwrite the correct actionDeadline.
                        return;
                    }
                    case 'game-resumed': {
                        toastSuccessRef.current(
                            'Game Resumed',
                            `Game resumed by ${eventData.resumedBy || 'table owner'}.`,
                            5000
                        );
                        // The backend sends a full 'update-game' before this message
                        // with the correct paused state and restored actionDeadline.
                        // Do NOT dispatch a redundant updateGame here as it would use
                        // stale appStateRef data and overwrite the correct actionDeadline.

                        // Clear settlement failed banner if it was showing
                        if (appStateRef.current.settlementStatus === 'failed') {
                            dispatch({ type: 'setSettlementStatus', payload: null });
                        }
                        return;
                    }
                    case 'settlement-status': {
                        const status = eventData.status;

                        // Validate status is one of the expected values
                        if (
                            status !== 'pending' &&
                            status !== 'success' &&
                            status !== 'failed'
                        ) {
                            console.warn(
                                '[WebSocket] Ignoring settlement-status event with unrecognized status:',
                                status
                            );
                            return;
                        }

                        // Clear any pending delay timer
                        if (settlementPendingTimerRef.current) {
                            clearTimeout(settlementPendingTimerRef.current);
                            settlementPendingTimerRef.current = null;
                        }

                        if (status === 'pending') {
                            // Delay showing the spinner so fast settlements stay invisible
                            settlementPendingTimerRef.current = setTimeout(() => {
                                dispatch({ type: 'setSettlementStatus', payload: 'pending' });
                                settlementPendingTimerRef.current = null;
                            }, SETTLEMENT_PENDING_SPINNER_DELAY_MS);
                        } else if (status === 'success') {
                            // Show the success banner briefly, then clear
                            if (settlementSuccessTimerRef.current) {
                                clearTimeout(settlementSuccessTimerRef.current);
                            }
                            dispatch({ type: 'setSettlementStatus', payload: 'success' });
                            // Trigger floating points animation only for crypto games
                            // where the local player was actually dealt into the hand
                            if (appStateRef.current.game?.config?.crypto && appStateRef.current.game?.config?.chain === 'base' && userWasInHandRef.current) {
                                const bb = appStateRef.current.game?.config?.bb ?? 0;
                                if (bb > 0) {
                                    usePointsAnimationStore.getState().triggerPoints(bb);
                                }
                            }
                            userWasInHandRef.current = false;
                            settlementSuccessTimerRef.current = setTimeout(() => {
                                dispatch({ type: 'setSettlementStatus', payload: null });
                                settlementSuccessTimerRef.current = null;
                            }, SETTLEMENT_SUCCESS_DISPLAY_MS);
                        } else if (status === 'failed') {
                            // 'failed' — show immediately
                            dispatch({ type: 'setSettlementStatus', payload: 'failed' });
                        }
                        return;
                    }
                    case 'table-closed': {
                        dispatch({
                            type: 'setTableClosed',
                            payload: {
                                reason: eventData.reason ?? 'TableClosed',
                                message: eventData.message ?? 'This table has been closed on-chain.',
                            },
                        });
                        return;
                    }
                    case 'update-player-uuid': {
                        // Update ref immediately so subsequent messages (like update-game)
                        // can use the clientID right away, before the async state update propagates
                        appStateRef.current = {
                            ...appStateRef.current,
                            clientID: eventData.uuid,
                        };
                        dispatch({
                            type: 'updatePlayerID',
                            payload: eventData.uuid,
                        });
                        return;
                    }
                    case 'seat-request-accepted': {
                        // Only keep "accepted" UI state when the player is actually queued.
                        // For immediate seating (queued=false), clear request state and let
                        // update-game drive the visible seated/cards state.
                        if (eventData.queued) {
                            dispatch({
                                type: 'seatRequestAcceptedBundle',
                                payload: {
                                    seatAccepted: {
                                        seatId: eventData.seatId,
                                        buyIn: eventData.buyIn,
                                        queued: eventData.queued,
                                        message: eventData.message,
                                    },
                                },
                            });
                        } else {
                            dispatch({ type: 'setSeatRequested', payload: null });
                            dispatch({ type: 'setSeatAccepted', payload: null });
                        }
                        // Show success toast
                        toastSuccessRef.current(
                            'Seat Accepted',
                            eventData.message,
                            5000
                        );
                        return;
                    }
                    case 'error': {
                        // Special-case: the user tried to request a seat that is already being requested.
                        // Use a modal instead of a long toast (better UX on small screens).
                        if (
                            eventData.message ===
                            'A player is already requesting for this seat.'
                        ) {
                            const requestedSeatId =
                                typeof eventData.seatId === 'number'
                                    ? eventData.seatId
                                    : (appStateRef.current
                                          .seatRequested as number | null);

                            setSeatRequestConflict({
                                seatId:
                                    typeof requestedSeatId === 'number'
                                        ? requestedSeatId
                                        : null,
                                message: eventData.message,
                            });

                            if (
                                typeof appStateRef.current.seatRequested ===
                                'number'
                            ) {
                                dispatch({
                                    type: 'setSeatRequested',
                                    payload: null,
                                });
                            }
                            return;
                        }

                        // Handle other errors with toast fallback
                        toastErrorRef.current(eventData.message);
                        // If seat request was denied (message check), reset the flag
                        const errorMsg =
                            typeof eventData.message === 'string'
                                ? eventData.message
                                : '';
                        if (
                            (errorMsg === 'Seat request denied.' ||
                                errorMsg
                                    .toLowerCase()
                                    .includes('seat request denied')) &&
                            typeof appStateRef.current.seatRequested === 'number'
                        ) {
                            dispatch({
                                type: 'setSeatRequested',
                                payload: null,
                            });
                        }
                        return;
                    }
                    case 'tournament-clock': {
                        dispatch({
                            type: 'setTournamentClock',
                            payload: {
                                tournamentId: eventData.tournament_id,
                                clock: {
                                    level: eventData.level,
                                    levelNumber: eventData.level_number,
                                    sb: eventData.small,
                                    bb: eventData.big,
                                    ante: eventData.ante,
                                    remainingMs: eventData.remaining_ms,
                                    totalMs: eventData.total_ms,
                                    receivedAt: Date.now(),
                                    onBreak: eventData.on_break,
                                    breakRemainingMs: eventData.break_remaining_ms,
                                    secondsToNextBreak:
                                        eventData.seconds_to_next_break,
                                    nextBreakAfterLevel:
                                        eventData.next_break_after_level,
                                },
                            },
                        });
                        return;
                    }
                    case 'tournament-player-count': {
                        dispatch({
                            type: 'setTournamentPlayerCount',
                            payload: {
                                tournamentId: eventData.tournament_id,
                                active: eventData.active,
                            },
                        });
                        return;
                    }
                    case 'tournament-elimination': {
                        const tournamentId = eventData.tournament_id;
                        // Accumulate into the persistent feed (replaces the
                        // ephemeral "player eliminated" toast).
                        dispatch({
                            type: 'addTournamentElimination',
                            payload: {
                                tournamentId,
                                elim: {
                                    playerUuid: eventData.player_uuid,
                                    position: eventData.position,
                                    remaining: eventData.remaining,
                                },
                            },
                        });
                        // The local player's bust opens a persistent result card
                        // (replaces the ephemeral "you've been eliminated" toast).
                        // Delayed so the player can watch the showdown before the popup appears.
                        if (
                            eventData.player_uuid ===
                            appStateRef.current.clientID
                        ) {
                            setTimeout(() => {
                                dispatch({
                                    type: 'setTournamentMyResult',
                                    payload: {
                                        tournamentId,
                                        result: {
                                            kind: 'bust',
                                            position: eventData.position,
                                        },
                                    },
                                });
                            }, 5000);
                        }
                        return;
                    }
                    case 'tournament-table-move': {
                        const isLocalPlayer = eventData.player_uuid === appStateRef.current.clientID;
                        if (isLocalPlayer) {
                            const tournamentId = eventData.tournament_id;
                            const toTableNumber = Number(eventData.to_table_index) + 1;
                            toastInfoRef.current(
                                'Moving you to a new table',
                                'Tables were rebalanced — reseating you now…',
                                4000
                            );
                            if (tournamentId != null && Number.isFinite(toTableNumber)) {
                                // Navigate to the destination table. A full navigation
                                // (not SPA) is intentional: it tears down this table's
                                // WebSocket and opens a clean connection to the new one.
                                setTimeout(() => {
                                    window.location.href = `/table/tournament-${tournamentId}-table-${toTableNumber}`;
                                }, 2500);
                            }
                        }
                        return;
                    }
                    case 'tournament-complete': {
                        const tournamentId = eventData.tournament_id;
                        dispatch({
                            type: 'setTournamentComplete',
                            payload: {
                                tournamentId,
                                winnerUuid: eventData.winner_uuid,
                            },
                        });
                        if (
                            eventData.winner_uuid ===
                            appStateRef.current.clientID
                        ) {
                            dispatch({
                                type: 'setTournamentMyResult',
                                payload: {
                                    tournamentId,
                                    result: { kind: 'win' },
                                },
                            });
                        }
                        return;
                    }
                    default: {
                        console.warn(
                            `Unhandled action type: ${eventData.action}`
                        );
                        return;
                    }
                }
            };
        } catch (e) {
            console.error('Fatal error during WebSocket connection setup:', e);
            toastErrorRef.current(
                'Connection Error',
                'Could not establish WebSocket connection. Check console.'
            );
            // If the exception occurs during fetch or new WebSocket(), then attempt reconnection.
            isReconnectingRef.current = false;
            attemptReconnection(); // Safe to call here
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        WS_BASE_URL,
        tableId,
        appStateRef,
        dispatch,
        debugLog,
        // isReconnecting intentionally excluded: it is not used inside the function body,
        // and including it causes the useCallback to be recreated on every reconnection
        // state change, which triggers the useEffect cleanup and cancels the pending
        // reconnect timeout before it fires.
    ]);

    const forceReconnect = useCallback(
        (reason: string) => {
            if (!socketRef.current) return;

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }

            // Avoid reconnection toasts for intentional reconnects.
            manualCloseRef.current = true;
            isReconnectingRef.current = false;
            reconnectionAttemptsRef.current = 0;

            try {
                socketRef.current.close(1000, reason);
            } catch (error) {
                console.error('Error closing WebSocket for reconnect:', error);
            }

            socketRef.current = null;
            setSocket(null);
            connectWebSocket();
        },
        [connectWebSocket]
    );

    const attemptReconnection = useCallback(() => {
        if (!WS_BASE_URL || reconnectionAttemptsRef.current >= maxReconnectionAttempts) {
            if (reconnectionAttemptsRef.current >= maxReconnectionAttempts) {
                isReconnectingRef.current = false;
                connectionLostShownRef.current = true;
                toastConnectionLostRef.current(
                    null, // persist until closed or user refreshes
                    'connectionFailed'
                );
            }
            return;
        }
        if (isReconnectingRef.current) return; // Already trying to reconnect

        isReconnectingRef.current = true;
        debugLog('[WebSocket] reconnecting');
        const nextAttempt = reconnectionAttemptsRef.current + 1;
        reconnectionAttemptsRef.current = nextAttempt;

        const delay = getReconnectDelay(nextAttempt - 1);

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
        }, delay);
    }, [
        WS_BASE_URL,
        maxReconnectionAttempts,
        getReconnectDelay,
        connectWebSocket,
    ]);

    useEffect(() => {
        if (!socketRef.current && !isReconnectingRef.current) {
            connectWebSocket();
        }
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (socketRef.current) {
                debugLog('[WebSocket] closing connection on cleanup');
                manualCloseRef.current = true;
                socketRef.current.close(1000, 'Component unmounting'); // Clean close
                socketRef.current = null;
                setSocket(null);
            }
        };
        // isReconnecting state intentionally excluded: using the ref avoids recreating
        // this effect (and running its cleanup) on every reconnection state change,
        // which would cancel the pending reconnect timeout before it fires.
    }, [connectWebSocket]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!socketRef.current || !isAuthenticated || !userAddress) return;

        const authAtConnect = authStateAtConnectRef.current;
        const needsAuthRefresh =
            !authAtConnect.isAuthenticated ||
            authAtConnect.address !== userAddress;

        if (needsAuthRefresh) {
            forceReconnect('Auth state updated');
        }
    }, [forceReconnect, isAuthenticated, userAddress]);

    // Detect isAuthenticated transitioning from true → false (wallet disconnect / logout).
    // The effect above early-returns when !isAuthenticated, so without this separate effect
    // the WebSocket would stay open with the old JWT cookie even after logoutUser() clears it.
    const prevIsAuthenticatedRef = useRef(isAuthenticated);
    useEffect(() => {
        const wasAuthenticated = prevIsAuthenticatedRef.current;
        prevIsAuthenticatedRef.current = isAuthenticated;

        if (wasAuthenticated && !isAuthenticated && socketRef.current) {
            debugLog('[WebSocket] auth lost; forcing reconnect as unauthenticated');
            forceReconnect('Wallet disconnected');
        }
    }, [forceReconnect, isAuthenticated]);

    // This useEffect is to ensure the socket state (used by context consumers) is updated
    // when socketRef.current changes. setSocket is batched by React.
    useEffect(() => {
        if (socketRef.current !== socket) {
            setSocket(socketRef.current);
        }
    }, [socket]); // socketRef.current is intentionally excluded — mutable refs don't trigger re-renders

    // Handle visibility change (tab focus) and online/offline events
    // When user returns to the tab or network comes back, attempt reconnection
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                debugLog('[WebSocket] tab visible; checking connection');

                // Check if socket is disconnected or in a bad state
                const isDisconnected =
                    !socketRef.current ||
                    socketRef.current.readyState === WebSocket.CLOSED ||
                    socketRef.current.readyState === WebSocket.CLOSING;

                if (isDisconnected && !isReconnectingRef.current) {
                    debugLog('[WebSocket] disconnected; resetting attempts and reconnecting');
                    // Reset reconnection attempts for a fresh start
                    reconnectionAttemptsRef.current = 0;

                    // Clear any pending reconnection timeout
                    if (reconnectTimeoutRef.current) {
                        clearTimeout(reconnectTimeoutRef.current);
                        reconnectTimeoutRef.current = null;
                    }

                    // Attempt immediate reconnection
                    connectWebSocket();
                }
            }
        };

        const handleOnline = () => {
            debugLog('[WebSocket] network online; checking connection');

            // Only attempt if tab is visible and socket is disconnected
            if (document.visibilityState !== 'visible') {
                debugLog('[WebSocket] tab not visible; skipping online reconnect');
                return;
            }

            const isDisconnected =
                !socketRef.current ||
                socketRef.current.readyState === WebSocket.CLOSED ||
                socketRef.current.readyState === WebSocket.CLOSING;

            if (isDisconnected && !isReconnectingRef.current) {
                debugLog('[WebSocket] online + disconnected; reconnecting');

                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }

                connectWebSocket();
            }
        };

        const handleOffline = () => {
            debugLog('[WebSocket] network offline');
            // Optionally show a toast or update UI state
        };

        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            );
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [connectWebSocket, debugLog]);

    return (
        <>
            <SocketContext.Provider value={socket}>
                {props.children}
            </SocketContext.Provider>
            <SeatRequestConflictModal
                isOpen={Boolean(seatRequestConflict)}
                onClose={() => setSeatRequestConflict(null)}
                seatId={seatRequestConflict?.seatId}
            />
        </>
    );
}
