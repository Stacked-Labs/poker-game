import React, {
    createContext,
    useContext,
    useState,
    Dispatch,
    SetStateAction,
} from 'react';

interface UserBasic {
    name: string;
    seatId: number | null;
}

interface UserContextType {
    currentUser: UserBasic;
    setCurrentUser: Dispatch<SetStateAction<UserBasic>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<UserBasic>({
        name: '',
        seatId: null,
    });
    const value = { currentUser, setCurrentUser };

    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
};

export const useCurrentUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useCurrentUser must be used within a UserProvider');
    }
    return context;
};
