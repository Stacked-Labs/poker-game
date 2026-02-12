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
import {
    getSeatReactionEmoteUrl,
    parseSeatReactionMessage,
} from '@/app/utils/seatReaction';
import { useAuth } from '@/app/contexts/AuthContext';

/*  
WebSocket context creates a single connection to the server per client. 
It handles opening, closing, and error handling of the websocket. It also
dispatches websocket messages to update the central state store. 
*/

export const SocketContext: Context<WebSocket | null> =
    createContext<WebSocket | null>(null);

type SocketProviderProps = {
    children: ReactNode;
    tableId: string;
};

const TOAST_ID_RECONNECTING = 'attemptReconnection';
const TOAST_ID_RECONNECTED = 'isReconnected';

export function SocketProvider(props: SocketProviderProps) {
    const { tableId } = props;
    const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL; // expected to point to /ws base
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const { appState, dispatch } = useContext(AppContext);
    const socketRef = useRef<WebSocket | null>(null);
    const appStateRef = useRef(appState);
    const isReconnectingRef = useRef(false);
    const manualCloseRef = useRef(false);
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

    const [isReconnecting, setIsReconnecting] = useState(false);
    const [reconnectionAttempts, setReconnectionAttempts] = useState(0);
    const maxReconnectionAttempts = 5;
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hasShownInitialErrorRef = useRef(false);
    const settlementPendingTimerRef = useRef<NodeJS.Timeout | null>(null);
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

        if (!WS_BASE_URL || !API_URL) {
            console.error('WebSocket URL or API URL is not defined.');
            toastErrorRef.current(
                'Configuration Error',
                'WebSocket or API URL not set.'
            );
            return;
        }

        if (socketRef.current) {
            console.log(
                'WebSocket connection attempt skipped: already connected or in progress.'
            );
            isReconnectingRef.current = false;
            setIsReconnecting(false);
            return;
        }

        try {
            console.log(
                `Initializing session with ${API_URL}/api/init-session`
            );
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
                setIsReconnecting(false);
                attemptReconnection();
                return;
            }
            const sessionData = await sessionInitResponse.json();
            console.log(
                'Session initialization/confirmation successful:',
                sessionData
            );
            // Build per-table WS URL: `${WS_BASE_URL}/table/${tableId}`
            const trimmed = WS_BASE_URL.endsWith('/')
                ? WS_BASE_URL.slice(0, -1)
                : WS_BASE_URL;
            const perTableUrl = `${trimmed}/table/${tableId}`;
            console.log(`Attempting to connect WebSocket to ${perTableUrl}`);
            const _socket = new WebSocket(perTableUrl);

            socketRef.current = _socket;
            setSocket(_socket);

            _socket.onopen = () => {
                console.log('WebSocket connected');
                authStateAtConnectRef.current = {
                    isAuthenticated: authRef.current.isAuthenticated,
                    address: authRef.current.address,
                };
                const wasReconnecting = isReconnectingRef.current;
                isReconnectingRef.current = false;
                setIsReconnecting(false); // Reset reconnection state on successful open
                setReconnectionAttempts(0); // Reset attempts on successful open
                hasShownInitialErrorRef.current = false; // Reset error flag on successful connection

                // Close any connection lost toasts
                toastCloseRef.current(TOAST_ID_RECONNECTING);
                toastCloseRef.current('connectionFailed');

                if (wasReconnecting) {
                    // This flag might still be true if this open is from a reconnect attempt
                    toastSuccessRef.current(
                        'Reconnected',
                        'Connection restored',
                        2000,
                        TOAST_ID_RECONNECTED
                    );
                }
                // Always send join-table on open
                const joinMessage = { action: 'join-table' } as const;
                console.log('🔼 WebSocket Message Sent:', {
                    timestamp: new Date().toISOString(),
                    message: joinMessage,
                    stringified: JSON.stringify(joinMessage),
                });
                _socket.send(JSON.stringify(joinMessage));
                console.log('Sent join-table message after connection.');
            };

            _socket.onclose = (event) => {
                console.log('WebSocket disconnected:', event);
                socketRef.current = null;
                setSocket(null);

                if (manualCloseRef.current) {
                    manualCloseRef.current = false;
                    return;
                }

                // Only show error toast on first disconnect, not during reconnection attempts
                if (!hasShownInitialErrorRef.current) {
                    toastConnectionLostRef.current(
                        null, // persist until closed
                        TOAST_ID_RECONNECTING
                    );
                    hasShownInitialErrorRef.current = true;
                }

                attemptReconnection(); // Attempt to reconnect even if close was clean
            };

            _socket.onerror = (err) => {
                console.error('WebSocket error:', err);
                socketRef.current = null;
                setSocket(null);
                // Don't show error toast here - onclose will handle it
                // This prevents duplicate error toasts
            };

            _socket.onmessage = (e) => {
                // Log all incoming WebSocket messages for debugging
                console.log('🔽 WebSocket Message Received:', {
                    timestamp: new Date().toISOString(),
                    rawData: e.data,
                    parsedData: (() => {
                        try {
                            return JSON.parse(e.data);
                        } catch (error) {
                            return {
                                error: 'Failed to parse JSON',
                                data: e.data,
                            };
                        }
                    })(),
                });

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
                    if (eventData.payload !== undefined) {
                        dispatch({
                            type: 'setSeatRequested',
                            payload: eventData.payload, // true if the player is pending, false otherwise
                        });
                    } else {
                        console.error(
                            'is_pending_player is undefined',
                            eventData.payload
                        );
                        dispatch({
                            type: 'setSeatRequested',
                            payload: null,
                        });
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
                        };
                        dispatch({ type: 'addMessage', payload: newMessage });

                        // Only increment unread count if chat isn't open
                        if (!appStateRef.current.isChatOpen) {
                            dispatch({ type: 'incrementUnreadCount' });
                        }
                        return;
                    }
                    case 'new-log': {
                        const newLog: Log = {
                            message: eventData.message,
                            timestamp: eventData.timestamp,
                        };

                        dispatch({ type: 'addLog', payload: newLog });
                        return;
                    }
                    case 'game-event': {
                        const event = eventData.event as GameEventRecord;

                        // 1. Play sound immediately (event-driven, no state watching)
                        soundManager.play(event.event_type);

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
                            owesSB: eventData.game?.owesSB,
                            owesBB: eventData.game?.owesBB,
                            waitingForBB: eventData.game?.waitingForBB,
                            actionDeadline:
                                eventData.game?.actionDeadline ??
                                eventData.actionDeadline ??
                                0,
                        };

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

                        dispatch({ type: 'updateGame', payload: newGame });

                        // If player was just successfully seated, reset the flags
                        const isPlayerSeated = eventData.game.players?.some(
                            (p: Player) => {
                                return p.uuid === appStateRef.current.clientID;
                            }
                        );
                        if (isPlayerSeated) {
                            // Clear pending request state
                            if (appStateRef.current.seatRequested) {
                                dispatch({
                                    type: 'setSeatRequested',
                                    payload: null,
                                });
                            }
                            // Clear accepted state - player is now fully seated
                            if (appStateRef.current.seatAccepted) {
                                dispatch({
                                    type: 'setSeatAccepted',
                                    payload: null,
                                });
                            }
                        }

                        // Update blind obligation helper for the local seat
                        const localPlayer = eventData.game.players?.find(
                            (p: Player) =>
                                p.uuid === appStateRef.current.clientID
                        );

                        const seatIndex = localPlayer
                            ? localPlayer.seatID - 1
                            : -1;
                        const owesSB =
                            seatIndex >= 0
                                ? Boolean(eventData.game?.owesSB?.[seatIndex])
                                : false;
                        const owesBB =
                            seatIndex >= 0
                                ? Boolean(eventData.game?.owesBB?.[seatIndex])
                                : false;
                        const waitingForBB =
                            seatIndex >= 0
                                ? Boolean(
                                      eventData.game?.waitingForBB?.[seatIndex]
                                  )
                                : false;

                        if (localPlayer && (owesSB || owesBB || waitingForBB)) {
                            const existingOptions =
                                appStateRef.current.blindObligation?.options ??
                                ([
                                    'post_now',
                                    'wait_bb',
                                    'sit_out',
                                ] as BlindObligationOptions[]);
                            dispatch({
                                type: 'setBlindObligation',
                                payload: {
                                    seatID: localPlayer.seatID,
                                    owesSB,
                                    owesBB,
                                    waitingForBB,
                                    options: existingOptions,
                                },
                            });
                        } else if (
                            appStateRef.current.blindObligation &&
                            !owesSB &&
                            !owesBB &&
                            !waitingForBB
                        ) {
                            dispatch({ type: 'clearBlindObligation' });
                        }
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
                                owesSB: Boolean(eventData.owesSB),
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
                            }, 3000);
                        } else if (status === 'success') {
                            dispatch({ type: 'setSettlementStatus', payload: null });
                        } else if (status === 'failed') {
                            // 'failed' — show immediately
                            dispatch({ type: 'setSettlementStatus', payload: 'failed' });
                        }
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
                        // Player's seat request was accepted by the table owner
                        dispatch({
                            type: 'setSeatAccepted',
                            payload: {
                                seatId: eventData.seatId,
                                buyIn: eventData.buyIn,
                                queued: eventData.queued,
                                message: eventData.message,
                            },
                        });
                        // Clear the pending state since we're now accepted
                        dispatch({ type: 'setSeatRequested', payload: null });
                        // Show success toast
                        toastSuccessRef.current(
                            'Seat Accepted',
                            eventData.message,
                            5000
                        );
                        return;
                    }
                    case 'error':
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

                            if (appStateRef.current.seatRequested) {
                                dispatch({
                                    type: 'setSeatRequested',
                                    payload: null,
                                });
                            }
                            return;
                        }

                        // Handle other errors with toast fallback
                        toastErrorRef.current(
                            `Error ${eventData.code}: ${eventData.message}`
                        );
                        // If seat request was denied (message check), reset the flag
                        if (
                            eventData.message === 'Seat request denied.' &&
                            appStateRef.current.seatRequested
                        ) {
                            dispatch({
                                type: 'setSeatRequested',
                                payload: null,
                            });
                        }
                        return;
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
            setIsReconnecting(false);
            attemptReconnection(); // Safe to call here
        }
    }, [
        WS_BASE_URL,
        tableId,
        appStateRef, // Added appStateRef to deps as it's used in onopen
        dispatch,
        isReconnecting, // Added isReconnecting
        // getReconnectDelay, reconnectionAttempts, maxReconnectionAttempts are for attemptReconnection
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
            setIsReconnecting(false);
            setReconnectionAttempts(0);
            hasShownInitialErrorRef.current = false;

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
        if (!WS_BASE_URL || reconnectionAttempts >= maxReconnectionAttempts) {
            if (reconnectionAttempts >= maxReconnectionAttempts) {
                isReconnectingRef.current = false;
                setIsReconnecting(false);
                hasShownInitialErrorRef.current = false; // Reset for next connection attempt
                toastConnectionLostRef.current(
                    null, // persist until closed or user refreshes
                    'connectionFailed'
                );
            }
            return;
        }
        if (isReconnectingRef.current) return; // Already trying to reconnect

        isReconnectingRef.current = true;
        setIsReconnecting(true);
        const nextAttempt = reconnectionAttempts + 1;
        setReconnectionAttempts(nextAttempt);
        const delay = getReconnectDelay(reconnectionAttempts);

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
        }, delay);
    }, [
        WS_BASE_URL,
        reconnectionAttempts,
        maxReconnectionAttempts,
        getReconnectDelay,
        connectWebSocket,
        isReconnecting,
    ]);

    useEffect(() => {
        if (!socketRef.current && !isReconnecting) {
            // Also check isReconnecting to prevent multiple initial calls
            connectWebSocket();
        }
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (socketRef.current) {
                console.log('Closing WebSocket connection on unmount/cleanup.');
                manualCloseRef.current = true;
                socketRef.current.close(1000, 'Component unmounting'); // Clean close
                socketRef.current = null;
                setSocket(null);
            }
        };
    }, [connectWebSocket, isReconnecting]); // Added isReconnecting to dependencies

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

    // This useEffect is to ensure the socket state (used by context consumers) is updated
    // when socketRef.current changes. setSocket is batched by React.
    useEffect(() => {
        if (socketRef.current !== socket) {
            setSocket(socketRef.current);
        }
    }, [socket, socketRef.current]); // Watch socketRef.current as well

    // Handle visibility change (tab focus) and online/offline events
    // When user returns to the tab or network comes back, attempt reconnection
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log(
                    'Tab became visible, checking WebSocket connection...'
                );

                // Check if socket is disconnected or in a bad state
                const isDisconnected =
                    !socketRef.current ||
                    socketRef.current.readyState === WebSocket.CLOSED ||
                    socketRef.current.readyState === WebSocket.CLOSING;

                if (isDisconnected && !isReconnectingRef.current) {
                    console.log(
                        'WebSocket disconnected, resetting attempts and reconnecting...'
                    );
                    // Reset reconnection attempts for a fresh start
                    setReconnectionAttempts(0);
                    hasShownInitialErrorRef.current = false;

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
            console.log('Network came back online, checking WebSocket...');

            // Only attempt if tab is visible and socket is disconnected
            if (document.visibilityState !== 'visible') {
                console.log(
                    'Tab not visible, skipping reconnection on online event'
                );
                return;
            }

            const isDisconnected =
                !socketRef.current ||
                socketRef.current.readyState === WebSocket.CLOSED ||
                socketRef.current.readyState === WebSocket.CLOSING;

            if (isDisconnected && !isReconnectingRef.current) {
                console.log('Network online + disconnected, reconnecting...');
                setReconnectionAttempts(0);
                hasShownInitialErrorRef.current = false;

                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }

                connectWebSocket();
            }
        };

        const handleOffline = () => {
            console.log('Network went offline');
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
    }, [connectWebSocket]);

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
