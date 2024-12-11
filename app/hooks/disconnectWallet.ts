import { useActiveWallet, useDisconnect } from 'thirdweb/react';
import useToastHelper from './useToastHelper';

export const useDisconnectWallet = () => {
    const wallet = useActiveWallet();
    const { disconnect } = useDisconnect();
    const { warning } = useToastHelper();

    const handleDisconnectWallet = () => {
        if (!wallet) {
            console.error('No wallet found to disconnect.');
            return;
        }

        disconnect(wallet);
        localStorage.removeItem('authToken');
        localStorage.removeItem('address');

        warning('Wallet disconnected.');
    };

    return handleDisconnectWallet;
};
