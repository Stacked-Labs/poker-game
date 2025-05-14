'use client';

import React, { useState } from 'react';
import { Button, ButtonProps, Icon, Spinner } from '@chakra-ui/react';
import { FaWallet } from 'react-icons/fa';
import {
    useActiveWallet,
    useActiveAccount,
    useConnectModal,
    useDisconnect,
    useIsAutoConnecting,
    useSetActiveWallet,
} from 'thirdweb/react';
import { client } from '../thirdwebclient';
import useToastHelper from '../hooks/useToastHelper';
import { useAuth, logoutUser } from '../contexts/AuthContext';

interface Web3ButtonProps extends ButtonProps {}

const Web3Button: React.FC<Web3ButtonProps> = (props) => {
    const [isHovered, setIsHovered] = useState(false);
    const { connect, isConnecting } = useConnectModal();
    const accountAddress = useActiveAccount()?.address;
    const wallet = useActiveWallet();
    const setActiveWallet = useSetActiveWallet();
    const isAutoConnecting = useIsAutoConnecting();
    const { disconnect } = useDisconnect();
    const { warning, error } = useToastHelper();

    useAuth(); // TODO: is this the best place for this?

    const handleConnect = async () => {
        const currentWallet = await connect({ client });
        if (!currentWallet) {
            error('Failed to connect wallet');
            return;
        }
        setActiveWallet(currentWallet);
    };

    const handleDisconnect = async () => {
        if (wallet) {
            disconnect(wallet);
            await logoutUser();
            warning('Wallet disconnected.');
        }
    };

    return (
        <Button
            variant={'homeSectionButton'}
            leftIcon={
                <Icon
                    as={FaWallet}
                    color="white"
                    boxSize={{ base: 4, md: 6 }}
                />
            }
            bg={'#2D2D2D'}
            _hover={{
                borderColor: 'white',
                borderWidth: '2px',
                bg: '#202020',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={accountAddress ? handleDisconnect : handleConnect}
            fontSize={{ base: 'sm', md: 'md' }}
            aria-label={accountAddress ? 'Disconnect Wallet' : 'Connect Wallet'}
            {...props}
        >
            {isConnecting || isAutoConnecting ? (
                <Spinner />
            ) : accountAddress ? (
                isHovered ? (
                    'Disconnect'
                ) : (
                    `${accountAddress.substring(0, 4)}...${accountAddress.substring(
                        accountAddress.length - 4
                    )}`
                )
            ) : (
                'Connect'
            )}
        </Button>
    );
};

export default Web3Button;
