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
    Tooltip,
    useClipboard,
} from '@chakra-ui/react';
import { FaChevronDown, FaWallet, FaSignOutAlt, FaCopy } from 'react-icons/fa';
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
// removed CopyLinkButton; inlining copy logic

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

    // Clipboard for account address (so clicking the address also copies)
    const { hasCopied: hasCopiedAddress, onCopy: onCopyAddress } = useClipboard(
        accountAddress || ''
    );

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
                variant="outlined"
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
            <Menu
                closeOnSelect={false}
                colorScheme="charcoal"
                placement="bottom-end"
            >
                <MenuButton
                    as={Button}
                    rightIcon={<FaChevronDown />}
                    variant={props.variant ?? 'connectButton'}
                >
                    {address}
                </MenuButton>
                <MenuList
                    bg={'charcoal.800'}
                    color={'white'}
                    width={'fit-content'}
                    textAlign="right"
                    fontWeight="bold"
                >
                    <MenuItem
                        bg={'charcoal.800'}
                        textAlign="right"
                        fontWeight="bold"
                    >
                        <Tooltip
                            label={
                                hasCopiedAddress
                                    ? 'Copied!'
                                    : 'Copy to clipboard'
                            }
                            closeOnClick={false}
                            height={'100%'}
                        >
                            <Flex
                                onClick={onCopyAddress}
                                alignItems={'center'}
                                justifyContent={'flex-end'}
                                gap={2}
                                w="100%"
                                cursor={'pointer'}
                                color="white"
                                _hover={{ color: 'lightgrey' }}
                            >
                                {address}
                                <Icon as={FaCopy} />
                            </Flex>
                        </Tooltip>
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem
                        bg={'charcoal.800'}
                        color={'red.400'}
                        _hover={{
                            bg: 'charcoal',
                            color: 'red.300',
                        }}
                        onClick={handleDisconnect}
                        fontWeight="bold"
                    >
                        <Flex
                            alignItems={'center'}
                            justifyContent={'flex-end'}
                            gap={2}
                            w="100%"
                        >
                            Disconnect
                            <Icon as={FaSignOutAlt} />
                        </Flex>
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
