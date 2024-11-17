import React, { createContext, useReducer, ReactChild, useEffect } from 'react';
import { AppState, Message, Game, Log } from '@/app/interfaces';

const initialState: AppState = {
    messages: [],
    logs: [],
    username: null,
    clientID: null,
    address: null,
    table: null,
    game: null,
    volume: 1,
};

type ACTIONTYPE =
    | { type: 'addMessage'; payload: Message }
    | { type: 'addLog'; payload: Log }
    | { type: 'setUsername'; payload: string }
    | { type: 'updateGame'; payload: Game }
    | { type: 'resetGame' }
    | { type: 'updatePlayerID'; payload: string }
    | { type: 'setTablename'; payload: string }
    | { type: 'setVolume'; payload: number };

function reducer(state: AppState, action: ACTIONTYPE) {
    switch (action.type) {
        case 'addMessage':
            return { ...state, messages: [...state.messages, action.payload] };
        case 'addLog':
            return { ...state, logs: [...state.logs, action.payload] };
        case 'setUsername':
            return { ...state, username: action.payload };
        case 'updateGame':
            return { ...state, game: action.payload };
        case 'resetGame':
            return { ...state, clientID: null, username: null, game: null };
        case 'updatePlayerID':
            return { ...state, clientID: action.payload };
        case 'setTablename':
            return { ...state, table: action.payload };
        case 'setVolume':
            if (typeof window !== 'undefined') {
                localStorage.setItem('volume', action.payload.toString());
            }
            return { ...state, volume: action.payload };
        default:
            throw new Error();
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

    useEffect(() => {
        const storedVolume = localStorage.getItem('volume');
        if (storedVolume) {
            dispatch({ type: 'setVolume', payload: parseFloat(storedVolume) });
        }
    }, []);

    return (
        <AppContext.Provider value={{ appState, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};
