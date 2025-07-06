'use client';

import React, { useState } from 'react';
import {
    Button,
    ButtonProps,
    Icon,
    Spinner,
    IconButton,
} from '@chakra-ui/react';
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

interface Web3ButtonProps extends ButtonProps {
    /**
     * When true, render a compact icon-only button (used in game navbar on mobile).
     * When false or undefined, render the full text button.
     */
    compact?: boolean;
}

const Web3Button: React.FC<Web3ButtonProps> = ({
    compact = false,
    ...props
}) => {
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

    const connected = Boolean(accountAddress);

    if (compact) {
        return (
            <IconButton
                aria-label={
                    accountAddress ? 'Disconnect Wallet' : 'Connect Wallet'
                }
                icon={
                    <Icon
                        as={FaWallet}
                        boxSize={{ base: 5, md: 6 }}
                        color={connected ? 'green.100' : 'white'}
                    />
                }
                variant="white"
                size="lg"
                onClick={accountAddress ? handleDisconnect : handleConnect}
                role="button"
                tabIndex={0}
                _focus={{ boxShadow: 'outline' }}
                borderColor={connected ? 'green.100' : 'white'}
                borderWidth="2px"
                {...props}
            />
        );
    }

    return (
        <Button
            variant={props.variant ?? 'homeSectionButton'}
            leftIcon={
                <Icon
                    as={FaWallet}
                    color={connected ? 'green.100' : 'white'}
                    boxSize={{ base: 5, md: 6 }}
                />
            }
            bg={'#2D2D2D'}
            borderColor={connected ? 'green.100' : 'white'}
            borderWidth="2px"
            color={connected && !isHovered ? 'green.100' : 'white'}
            _hover={{
                borderColor: connected ? 'green.100' : 'white',
                borderWidth: '2px',
                bg: '#202020',
                color: 'white',
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
