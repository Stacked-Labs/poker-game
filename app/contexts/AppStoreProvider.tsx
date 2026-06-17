import React, {
    createContext,
    useReducer,
    ReactChild,
    useEffect,
    useMemo,
} from 'react';
import {
    AppState,
    BlindObligation,
    CardBackVariant,
    DisplayMode,
    Message,
    Game,
    Log,
    PendingPlayer,
    SeatAccepted,
    SettlementStatus,
    LeaderboardPlayer,
    TournamentClock,
    TournamentElim,
    TournamentLive,
    TournamentMeta,
    TournamentMyResult,
} from '@/app/interfaces';
import { isTableOwner as fetchIsTableOwner } from '@/app/hooks/server_actions';
import { useAuth } from '@/app/contexts/AuthContext';

const initialState: AppState = {
    messages: [],
    logs: [],
    username: null,
    clientID: null,
    address: null,
    table: null,
    game: null,
    volume: 1,
    chatSoundEnabled: true,
    chatOverlayEnabled: true,
    fourColorDeckEnabled: false,
    cardBackDesign: 'classic-red',
    unreadMessageCount: 0,
    isChatOpen: false,
    seatRequested: null,
    seatAccepted: null,
    pendingPlayers: [],
    showSeatRequestPopups: true,
    isSettingsOpen: false,
    blindObligation: null,
    isTableOwner: null,
    settlementStatus: null,
    displayMode: 'chips',
    displayModeExplicit: false,
    tableClosed: null,
    tournamentLive: null,
};

export type ACTIONTYPE =
    | { type: 'addMessage'; payload: Message }
    | { type: 'addLog'; payload: Log }
    | { type: 'setUsername'; payload: string }
    | { type: 'updateGame'; payload: Game }
    | { type: 'resetGame' }
    | { type: 'updatePlayerID'; payload: string }
    | { type: 'setTablename'; payload: string }
    | { type: 'setVolume'; payload: number }
    | { type: 'setChatSoundEnabled'; payload: boolean }
    | { type: 'setChatOverlayEnabled'; payload: boolean }
    | { type: 'setFourColorDeckEnabled'; payload: boolean }
    | { type: 'setCardBackDesign'; payload: CardBackVariant }
    | { type: 'incrementUnreadCount' }
    | { type: 'resetUnreadCount' }
    | { type: 'setChatOpen'; payload: boolean }
    | { type: 'setSeatRequested'; payload: number | null }
    | { type: 'setSeatAccepted'; payload: SeatAccepted | null }
    | { type: 'setPendingPlayers'; payload: PendingPlayer[] }
    | { type: 'setShowSeatRequestPopups'; payload: boolean }
    | { type: 'setIsSettingsOpen'; payload: boolean }
    | { type: 'setBlindObligation'; payload: AppState['blindObligation'] }
    | { type: 'clearBlindObligation' }
    | { type: 'setIsTableOwner'; payload: boolean | null }
    | { type: 'setSettlementStatus'; payload: SettlementStatus }
    | {
          type: 'updateGameBundle';
          payload: {
              game: Game;
              clearSeatRequested?: boolean;
              clearSeatAccepted?: boolean;
              blindObligation?: BlindObligation | null;
          };
      }
    | {
          type: 'seatRequestAcceptedBundle';
          payload: { seatAccepted: SeatAccepted };
      }
    | { type: 'addMessageWithUnread'; payload: Message }
    | { type: 'setDisplayMode'; payload: DisplayMode }
    | { type: 'setDisplayModeAuto'; payload: DisplayMode }
    | { type: 'setTableClosed'; payload: { reason: string; message: string } }
    | { type: 'setTournamentSeed'; payload: TournamentLive }
    | {
          type: 'setTournamentMeta';
          payload: { tournamentId: number; meta: TournamentMeta };
      }
    | {
          type: 'setTournamentClock';
          payload: { tournamentId: number; clock: TournamentClock };
      }
    | {
          type: 'setTournamentPlayerCount';
          payload: { tournamentId: number; active: number };
      }
    | {
          type: 'addTournamentElimination';
          payload: { tournamentId: number; elim: TournamentElim };
      }
    | {
          type: 'setTournamentLeaderboard';
          payload: { tournamentId: number; leaderboard: LeaderboardPlayer[] };
      }
    | {
          type: 'setTournamentComplete';
          payload: { tournamentId: number; winnerUuid: string };
      }
    | {
          type: 'setTournamentStatus';
          payload: { tournamentId: number; status: TournamentLive['status'] };
      }
    | {
          type: 'setTournamentMyResult';
          payload: { tournamentId: number; result: TournamentMyResult };
      }
    | { type: 'clearTournamentMyResult' }
    | { type: 'resetTournamentLive' };

const MAX_MESSAGES = 500;
const MAX_LOGS = 1000;
const TOURNAMENT_FEED_CAP = 50;

// Return the current live-tournament slice if it matches `tournamentId`, else a
// fresh one. Lets WS pushes that arrive before the REST seed lazily initialize
// the slice instead of being dropped.
function ensureTournamentLive(
    state: AppState,
    tournamentId: number
): TournamentLive {
    const cur = state.tournamentLive;
    if (cur && cur.tournamentId === tournamentId) return cur;
    return {
        tournamentId,
        meta: null,
        clock: null,
        playersActive: null,
        feed: [],
        leaderboard: [],
        completed: null,
        myResult: null,
        status: 'connecting',
    };
}

function reducer(state: AppState, action: ACTIONTYPE): AppState {
    switch (action.type) {
        case 'addMessage': {
            const messages = [...state.messages, action.payload];
            return {
                ...state,
                messages:
                    messages.length > MAX_MESSAGES
                        ? messages.slice(-MAX_MESSAGES)
                        : messages,
            };
        }
        case 'addLog': {
            const logs = [...state.logs, action.payload];
            return {
                ...state,
                logs: logs.length > MAX_LOGS ? logs.slice(-MAX_LOGS) : logs,
            };
        }
        case 'setUsername':
            return { ...state, username: action.payload };
        case 'updateGame':
            return { ...state, game: action.payload };
        case 'resetGame':
            return {
                ...state,
                clientID: null,
                username: null,
                game: null,
                seatRequested: null,
                seatAccepted: null,
                pendingPlayers: [],
                showSeatRequestPopups: true,
                isSettingsOpen: false,
                isTableOwner: null,
                settlementStatus: null,
                tableClosed: null,
                tournamentLive: null,
            };
        case 'updatePlayerID':
            return { ...state, clientID: action.payload };
        case 'setTablename':
            return {
                ...state,
                table: action.payload,
                isTableOwner: null,
                showSeatRequestPopups: true,
                isSettingsOpen: false,
            };
        case 'setVolume':
            if (typeof window !== 'undefined') {
                localStorage.setItem('volume', action.payload.toString());
            }
            return { ...state, volume: action.payload };
        case 'setChatSoundEnabled':
            if (typeof window !== 'undefined') {
                localStorage.setItem(
                    'chatSoundEnabled',
                    action.payload.toString()
                );
            }
            return { ...state, chatSoundEnabled: action.payload };
        case 'setChatOverlayEnabled':
            if (typeof window !== 'undefined') {
                localStorage.setItem(
                    'chatOverlayEnabled',
                    action.payload.toString()
                );
            }
            return { ...state, chatOverlayEnabled: action.payload };
        case 'setFourColorDeckEnabled':
            if (typeof window !== 'undefined') {
                localStorage.setItem(
                    'fourColorDeckEnabled',
                    action.payload.toString()
                );
            }
            return { ...state, fourColorDeckEnabled: action.payload };
        case 'setCardBackDesign':
            if (typeof window !== 'undefined') {
                localStorage.setItem('cardBackDesign', action.payload);
            }
            return { ...state, cardBackDesign: action.payload };
        case 'incrementUnreadCount':
            return {
                ...state,
                unreadMessageCount: state.unreadMessageCount + 1,
            };
        case 'resetUnreadCount':
            return { ...state, unreadMessageCount: 0 };
        case 'setChatOpen':
            if (action.payload === true) {
                return {
                    ...state,
                    isChatOpen: action.payload,
                    unreadMessageCount: 0,
                };
            }
            return { ...state, isChatOpen: action.payload };
        case 'setSeatRequested':
            return { ...state, seatRequested: action.payload };
        case 'setSeatAccepted':
            return { ...state, seatAccepted: action.payload };
        case 'setPendingPlayers':
            return { ...state, pendingPlayers: action.payload };
        case 'setShowSeatRequestPopups':
            return { ...state, showSeatRequestPopups: action.payload };
        case 'setIsSettingsOpen':
            return { ...state, isSettingsOpen: action.payload };
        case 'setBlindObligation':
            return { ...state, blindObligation: action.payload };
        case 'clearBlindObligation':
            return { ...state, blindObligation: null };
        case 'setIsTableOwner':
            return { ...state, isTableOwner: action.payload };
        case 'setSettlementStatus':
            return { ...state, settlementStatus: action.payload };
        case 'updateGameBundle': {
            const {
                game,
                clearSeatRequested,
                clearSeatAccepted,
                blindObligation,
            } = action.payload;
            const next: AppState = { ...state, game };
            if (clearSeatRequested) next.seatRequested = null;
            if (clearSeatAccepted) next.seatAccepted = null;
            if (blindObligation !== undefined)
                next.blindObligation = blindObligation;
            return next;
        }
        case 'seatRequestAcceptedBundle':
            return {
                ...state,
                seatAccepted: action.payload.seatAccepted,
                seatRequested: null,
            };
        case 'addMessageWithUnread': {
            const messages = [...state.messages, action.payload];
            return {
                ...state,
                messages:
                    messages.length > MAX_MESSAGES
                        ? messages.slice(-MAX_MESSAGES)
                        : messages,
                unreadMessageCount: state.unreadMessageCount + 1,
            };
        }
        case 'setDisplayMode':
            if (typeof window !== 'undefined') {
                localStorage.setItem('displayMode', action.payload);
                localStorage.setItem('displayModeExplicit', 'true');
            }
            return {
                ...state,
                displayMode: action.payload,
                displayModeExplicit: true,
            };
        case 'setDisplayModeAuto':
            if (typeof window !== 'undefined') {
                localStorage.setItem('displayMode', action.payload);
            }
            return { ...state, displayMode: action.payload };
        case 'setTableClosed':
            return { ...state, tableClosed: action.payload };
        case 'setTournamentSeed': {
            // Preserve the live-only feed and the local player's result across a
            // re-seed (reconnect) for the same tournament — they can't be
            // reconstructed from REST.
            const prev = state.tournamentLive;
            const same =
                prev && prev.tournamentId === action.payload.tournamentId;
            return {
                ...state,
                tournamentLive: {
                    ...action.payload,
                    feed: same ? prev!.feed : action.payload.feed,
                    myResult: same ? prev!.myResult : action.payload.myResult,
                },
            };
        }
        case 'setTournamentMeta': {
            const live = ensureTournamentLive(
                state,
                action.payload.tournamentId
            );
            return {
                ...state,
                tournamentLive: { ...live, meta: action.payload.meta },
            };
        }
        case 'setTournamentClock': {
            const live = ensureTournamentLive(
                state,
                action.payload.tournamentId
            );
            return {
                ...state,
                tournamentLive: {
                    ...live,
                    clock: action.payload.clock,
                    status: 'live',
                },
            };
        }
        case 'setTournamentPlayerCount': {
            const live = ensureTournamentLive(
                state,
                action.payload.tournamentId
            );
            return {
                ...state,
                tournamentLive: {
                    ...live,
                    playersActive: action.payload.active,
                },
            };
        }
        case 'addTournamentElimination': {
            const live = ensureTournamentLive(
                state,
                action.payload.tournamentId
            );
            const feed = [action.payload.elim, ...live.feed].slice(
                0,
                TOURNAMENT_FEED_CAP
            );
            return {
                ...state,
                tournamentLive: {
                    ...live,
                    feed,
                    playersActive: action.payload.elim.remaining,
                },
            };
        }
        case 'setTournamentLeaderboard': {
            const live = ensureTournamentLive(
                state,
                action.payload.tournamentId
            );
            return {
                ...state,
                tournamentLive: {
                    ...live,
                    leaderboard: action.payload.leaderboard,
                },
            };
        }
        case 'setTournamentComplete': {
            const live = ensureTournamentLive(
                state,
                action.payload.tournamentId
            );
            return {
                ...state,
                tournamentLive: {
                    ...live,
                    completed: { winnerUuid: action.payload.winnerUuid },
                },
            };
        }
        case 'setTournamentStatus': {
            const live = ensureTournamentLive(
                state,
                action.payload.tournamentId
            );
            return {
                ...state,
                tournamentLive: { ...live, status: action.payload.status },
            };
        }
        case 'setTournamentMyResult': {
            const live = ensureTournamentLive(
                state,
                action.payload.tournamentId
            );
            return {
                ...state,
                tournamentLive: { ...live, myResult: action.payload.result },
            };
        }
        case 'clearTournamentMyResult':
            if (!state.tournamentLive) return state;
            return {
                ...state,
                tournamentLive: { ...state.tournamentLive, myResult: null },
            };
        case 'resetTournamentLive':
            return { ...state, tournamentLive: null };
        default: {
            const exhaustiveCheck: never = action;
            throw new Error(`Unhandled action type: ${exhaustiveCheck}`);
        }
    }
}

export const AppContext = createContext<{
    appState: AppState;
    dispatch: React.Dispatch<ACTIONTYPE>;
}>({
    appState: initialState,
    dispatch: () => null,
});

export const AppStoreProvider = ({ children }: { children: ReactChild }) => {
    const [appState, dispatch] = useReducer(reducer, initialState);
    // Get auth state to re-check ownership when wallet changes (crypto tables)
    const { isAuthenticated, userAddress } = useAuth();

    useEffect(() => {
        const storedVolume = localStorage.getItem('volume');
        if (storedVolume) {
            dispatch({ type: 'setVolume', payload: parseFloat(storedVolume) });
        }
        const storedChatSoundEnabled = localStorage.getItem('chatSoundEnabled');
        if (storedChatSoundEnabled !== null) {
            dispatch({
                type: 'setChatSoundEnabled',
                payload: storedChatSoundEnabled === 'true',
            });
        }
        const storedChatOverlayEnabled =
            localStorage.getItem('chatOverlayEnabled');
        if (storedChatOverlayEnabled !== null) {
            dispatch({
                type: 'setChatOverlayEnabled',
                payload: storedChatOverlayEnabled === 'true',
            });
        }
        const storedFourColorDeckEnabled = localStorage.getItem(
            'fourColorDeckEnabled'
        );
        if (storedFourColorDeckEnabled !== null) {
            dispatch({
                type: 'setFourColorDeckEnabled',
                payload: storedFourColorDeckEnabled === 'true',
            });
        }
        const storedCardBackDesign = localStorage.getItem('cardBackDesign');
        if (storedCardBackDesign !== null) {
            // Legacy 'classic' (the original dark-navy crosshatch) maps to
            // the new card-room blue, which is the closest visual match.
            const migrated: CardBackVariant =
                storedCardBackDesign === 'classic'
                    ? 'classic-blue'
                    : (storedCardBackDesign as CardBackVariant);
            dispatch({
                type: 'setCardBackDesign',
                payload: migrated,
            });
        }
        const storedDisplayMode = localStorage.getItem('displayMode');
        const storedDisplayModeExplicit =
            localStorage.getItem('displayModeExplicit') === 'true';
        if (
            storedDisplayMode === 'chips' ||
            storedDisplayMode === 'bb' ||
            storedDisplayMode === 'usdc'
        ) {
            dispatch({
                type: storedDisplayModeExplicit
                    ? 'setDisplayMode'
                    : 'setDisplayModeAuto',
                payload: storedDisplayMode,
            });
        }
    }, []);

    // Auto-switch display mode based on the current table's crypto flag.
    // Only fires while the user has not made an explicit choice; any manual
    // selection in Settings flips displayModeExplicit and locks behavior.
    useEffect(() => {
        if (appState.displayModeExplicit) return;
        const isCrypto = appState.game?.config?.crypto === true;
        if (isCrypto && appState.displayMode !== 'usdc') {
            dispatch({ type: 'setDisplayModeAuto', payload: 'usdc' });
        } else if (!isCrypto && appState.displayMode === 'usdc') {
            dispatch({ type: 'setDisplayModeAuto', payload: 'chips' });
        }
    }, [
        appState.game?.config?.crypto,
        appState.displayMode,
        appState.displayModeExplicit,
    ]);

    // Re-check ownership when table, clientID, or auth state changes
    // For crypto tables, ownership is based on wallet address (JWT), so we need
    // to re-check when isAuthenticated or userAddress changes
    useEffect(() => {
        let isCancelled = false;

        const checkOwnership = async () => {
            if (!appState.table) {
                dispatch({ type: 'setIsTableOwner', payload: null });
                return;
            }

            try {
                const result = await fetchIsTableOwner(appState.table);
                if (!isCancelled) {
                    dispatch({
                        type: 'setIsTableOwner',
                        payload: Boolean(result?.isTableOwner),
                    });
                }
            } catch (error) {
                console.error('Error checking table ownership:', error);
                if (!isCancelled) {
                    dispatch({ type: 'setIsTableOwner', payload: false });
                }
            }
        };

        checkOwnership();

        return () => {
            isCancelled = true;
        };
    }, [appState.table, appState.clientID, isAuthenticated, userAddress]);

    const contextValue = useMemo(
        () => ({ appState, dispatch }),
        [appState, dispatch]
    );

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};
