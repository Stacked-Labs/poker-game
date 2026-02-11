import React, { createContext, useReducer, ReactChild, useEffect, useMemo } from 'react';
import {
    AppState,
    BlindObligation,
    CardBackVariant,
    Message,
    Game,
    Log,
    PendingPlayer,
    SeatAccepted,
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
    cardBackDesign: 'classic',
    unreadMessageCount: 0,
    isChatOpen: false,
    seatRequested: null,
    seatAccepted: null,
    pendingPlayers: [],
    showSeatRequestPopups: true,
    isSettingsOpen: false,
    blindObligation: null,
    isTableOwner: null,
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
    | { type: 'updateGameBundle'; payload: {
        game: Game;
        clearSeatRequested?: boolean;
        clearSeatAccepted?: boolean;
        blindObligation?: BlindObligation | null;
      }}
    | { type: 'seatRequestAcceptedBundle'; payload: { seatAccepted: SeatAccepted } }
    | { type: 'addMessageWithUnread'; payload: Message };

const MAX_MESSAGES = 500;
const MAX_LOGS = 1000;

function reducer(state: AppState, action: ACTIONTYPE) {
    switch (action.type) {
        case 'addMessage': {
            const messages = [...state.messages, action.payload];
            return { ...state, messages: messages.length > MAX_MESSAGES ? messages.slice(-MAX_MESSAGES) : messages };
        }
        case 'addLog': {
            const logs = [...state.logs, action.payload];
            return { ...state, logs: logs.length > MAX_LOGS ? logs.slice(-MAX_LOGS) : logs };
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
        case 'updateGameBundle': {
            const { game, clearSeatRequested, clearSeatAccepted, blindObligation } = action.payload;
            const next: AppState = { ...state, game };
            if (clearSeatRequested) next.seatRequested = null;
            if (clearSeatAccepted) next.seatAccepted = null;
            if (blindObligation !== undefined) next.blindObligation = blindObligation;
            return next;
        }
        case 'seatRequestAcceptedBundle':
            return { ...state, seatAccepted: action.payload.seatAccepted, seatRequested: null };
        case 'addMessageWithUnread': {
            const messages = [...state.messages, action.payload];
            return {
                ...state,
                messages: messages.length > MAX_MESSAGES ? messages.slice(-MAX_MESSAGES) : messages,
                unreadMessageCount: state.unreadMessageCount + 1,
            };
        }
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
        const storedChatSoundEnabled =
            localStorage.getItem('chatSoundEnabled');
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
            dispatch({
                type: 'setCardBackDesign',
                payload: storedCardBackDesign as CardBackVariant,
            });
        }
    }, []);

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

    const contextValue = useMemo(() => ({ appState, dispatch }), [appState, dispatch]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};
