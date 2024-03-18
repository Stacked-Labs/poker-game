import React, {
    FC,
    createContext,
    useReducer,
    ReactNode,
    useEffect,
} from 'react';
import { User } from './interfaces';
import { useAccount, useConnect } from 'wagmi';

interface StateData {
    isConnected: boolean;
    isDiscordConnected: boolean;
    isUserSitting: boolean;
    User: User;
}

const typeStateMap = {
    SET_IS_CONNECTED: 'isConnected',
    SET_IS_DISCORD_CONNECTED: 'isDiscordConnected',
    SET_IS_USER_SITTING: 'isUserSitting',
    SET_USER: 'User',
};

const initialState: StateData = {
    isConnected: false,
    isDiscordConnected: false,
    isUserSitting: false,
    User: {
        address: '',
        username: undefined,
        amount: undefined,
    },
};

const reducer = (
    state: StateData,
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
const MetaDispatchContext = createContext<any>(null);

const StateProvider: FC<{ children?: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { address } = useAccount();

    useEffect(() => {
        if (address) {
            dispatch({ type: 'SET_USER', payload: { address } });
        }
    }, [address]);

    return (
        <MetaDispatchContext.Provider value={dispatch}>
            <MetaStateContext.Provider value={state}>
                {children}
            </MetaStateContext.Provider>
        </MetaDispatchContext.Provider>
    );
};

export { typeStateMap, MetaStateContext, MetaDispatchContext, StateProvider };
