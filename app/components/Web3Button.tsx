'use client';

import React, { useState } from 'react';
import {
    Button,
    ButtonProps,
    Icon,
    Spinner,
    IconButton,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Flex,
} from '@chakra-ui/react';
import { FaChevronDown, FaWallet } from 'react-icons/fa';
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
import CopyLinkButton from './CopyLinkButton';

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

    const auth = useAuth();
    const isAuth = auth.isAuthenticated;

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

    if (accountAddress && isAuth) {
        const address = accountAddress
            ? `${accountAddress.substring(0, 4)}...${accountAddress.substring(accountAddress.length - 4)}`
            : '';

        return (
            <Menu closeOnSelect={false} colorScheme="charcoal">
                <MenuButton
                    as={Button}
                    rightIcon={<FaChevronDown />}
                    variant={props.variant ?? 'connectButton'}
                >
                    {address}
                </MenuButton>
                <MenuList bg={'charcoal.800'} color={'white'} width={'100%'}>
                    <MenuItem bg={'charcoal.800'}>
                        <Flex alignItems={'center'} gap={2}>
                            {address}
                            <CopyLinkButton link={accountAddress} />
                        </Flex>
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem
                        bg={'charcoal.800'}
                        _hover={{
                            bg: 'charcoal',
                            color: 'white',
                        }}
                        onClick={handleDisconnect}
                    >
                        Disconnect
                    </MenuItem>
                </MenuList>
            </Menu>
        );
    }

    return (
        <Button
            variant={props.variant ?? 'connectButton'}
            leftIcon={
                <Icon
                    as={FaWallet}
                    color={connected ? 'green.100' : 'white'}
                    boxSize={{ base: 5, md: 6 }}
                />
            }
            borderColor={connected ? 'green.100' : 'white'}
            color={connected && !isHovered ? 'green.100' : 'white'}
            _hover={{
                borderColor: connected ? 'green.100' : 'white',
                borderWidth: '2px',
                bg: '#202020',
                color: 'white',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleConnect}
            fontSize={{ base: 'sm', md: 'md' }}
            aria-label={accountAddress ? 'Disconnect Wallet' : 'Connect Wallet'}
            {...props}
        >
            {isConnecting || isAutoConnecting || (accountAddress && !isAuth) ? (
                <Spinner />
            ) : (
                'Connect'
            )}
        </Button>
    );
};

export default Web3Button;
