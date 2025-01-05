import React, { FC, createContext, useReducer, ReactNode } from 'react';

interface StateData {
    isConnected: boolean;
    isDiscordConnected: boolean;
    isUserSitting: boolean;
}

const typeStateMap = {
    SET_IS_CONNECTED: 'isConnected',
    SET_IS_DISCORD_CONNECTED: 'isDiscordConnected',
    SET_IS_USER_SITTING: 'isUserSitting',
};

const initialState: StateData = {
    isConnected: false,
    isDiscordConnected: false,
    isUserSitting: false,
};

const reducer = (
    state: StateData,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    action: { type: keyof typeof typeStateMap; payload: any }
) => {
    const stateName = typeStateMap[action.type];
    if (!stateName) {
        console.warn(`Unknown action type: ${action.type}`);
        return state;
    }

    switch (action.type) {
        //  EXAMPLE
        // case 'RENAME_ACCOUNT':
        //   const currentAcc = state.accounts[action.payload.shard]?.accounts;
        //   const newAcc = currentAcc!.map((account: any) => {
        //     if (account.addr === action.payload.account.addr) {
        //       return action.payload.account;
        //     }
        //     return account;
        //   });
        //   return {
        //     ...state,
        //     accounts: {
        //       ...state.accounts,
        //       [action.payload.shard]: {
        //         ...state.accounts[action.payload.shard],
        //         accounts: newAcc,
        //       },
        //     },
        //   };

        default:
            return { ...state, [stateName]: action.payload };
    }
};

const MetaStateContext = createContext(initialState);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MetaDispatchContext = createContext<any>(null);

const StateProvider: FC<{ children?: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <MetaDispatchContext.Provider value={dispatch}>
            <MetaStateContext.Provider value={state}>
                {children}
            </MetaStateContext.Provider>
        </MetaDispatchContext.Provider>
    );
};

export { typeStateMap, MetaStateContext, MetaDispatchContext, StateProvider };
