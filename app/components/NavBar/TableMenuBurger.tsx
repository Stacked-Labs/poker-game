'use client';

import {
    Box,
    Icon,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    useDisclosure,
    Tooltip,
} from '@chakra-ui/react';
import VolumeButton from '../VolumeButton';
import WalletButton from '../WalletButton';
import { ReactElement, useContext, useEffect, useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { FaPause } from 'react-icons/fa';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import {
    handleLeaveTable,
    handleReturnReady,
    handleSitOutNext,
    handleCancelRejoin,
} from '@/app/hooks/useTableOptions';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import useToastHelper from '@/app/hooks/useToastHelper';
import AwayButton from './AwayButton';
import LeaveButton from './LeaveButton';
import WithdrawButton from './WithdrawButton';
import { CHAIN_CONFIG, defaultChain } from '@/app/thirdwebclient';
import {
    sendPauseGameCommand,
    sendResumeGameCommand,
} from '@/app/hooks/server_actions';
import useIsTableOwner from '@/app/hooks/useIsTableOwner';


const Item = ({ button }: { button: ReactElement }) => {
    return (
        <MenuItem
            bg="transparent"
            width="fit-content"
            p={0}
            mb={2}
            _hover={{ bg: 'transparent' }}
            _focus={{ bg: 'transparent' }}
        >
            {button}
        </MenuItem>
    );
};

const TableMenuBurger = ({
    isUserSeated,
    isAway,
}: {
    isUserSeated: boolean | undefined;
    isAway: boolean | undefined;
}) => {
    const { appState } = useContext(AppContext);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const socket = useContext(SocketContext);
    const { info } = useToastHelper();
    const isOwner = useIsTableOwner();
    const isCryptoGame = Boolean(appState.game?.config?.crypto);
    const tableChain = isCryptoGame
        ? (CHAIN_CONFIG[appState.game?.config?.chain ?? '']?.chain ?? defaultChain)
        : undefined;
    const localPlayer = appState.game?.players?.find(
        (p) => p.uuid === appState.clientID
    );
    const leaveAfterHandRequested = Boolean(localPlayer?.leaveAfterHand);
    const [optimisticPendingPause, setOptimisticPendingPause] = useState(false);

    useEffect(() => {
        setOptimisticPendingPause(false);
    }, [appState.game?.pendingPause, appState.game?.paused]);

    useEffect(() => {
        if (!optimisticPendingPause) return;
        const t = setTimeout(() => setOptimisticPendingPause(false), 15_000);
        return () => clearTimeout(t);
    }, [optimisticPendingPause]);

    const effectivePendingPause = optimisticPendingPause || Boolean(appState.game?.pendingPause);

    // Don't render if no socket connection
    if (!socket) return null;

    return (
        // Only show burger menu in portrait mode
        <Box
            className="table-menu-burger"
            sx={{
                '@media (orientation: portrait)': {
                    display: 'block',
                },
                '@media (orientation: landscape)': {
                    display: 'none',
                },
            }}
        >
            <Menu
                isOpen={isOpen}
                onClose={onClose}
                onOpen={onOpen}
                closeOnSelect={false}
                isLazy
                lazyBehavior="unmount"
            >
                <MenuButton
                    as={IconButton}
                    aria-label="Open table menu"
                    icon={
                        <Icon
                            as={isOpen ? FiX : FiMenu}
                            boxSize={{ base: 4, md: 5 }}
                        />
                    }
                    size={{ base: 'md', md: 'md' }}
                    px={2}
                    py={2}
                    width={{ base: '40px', sm: '40px', md: '48px' }}
                    height={{ base: '40px', sm: '40px', md: '48px' }}
                    zIndex={999}
                    {...(isOpen
                        ? {
                              // Open state — solid navy tactile chip,
                              // signals "menu open, click to close."
                              bg: 'brand.navy',
                              color: 'white',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow:
                                  'inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 #1B2754',
                              transition:
                                  'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease',
                              _hover: { bg: 'brand.navy' },
                              _active: {
                                  bg: '#243059',
                                  transform: 'translateY(2px)',
                                  boxShadow:
                                      'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #1B2754',
                              },
                          }
                        : {
                              // Closed: opaque page-toned chip so it reads
                              // against the table felt.
                              variant: 'tactileChromeSolid',
                          })}
                />
                <MenuList
                    zIndex={999}
                    bg="transparent"
                    border="none"
                    boxShadow="none"
                    gap={2}
                    padding={0}
                >
                    <Item button={<WalletButton chain={tableChain} />} />
                    {isCryptoGame && (
                        <Item button={<WithdrawButton />} />
                    )}
                    {isUserSeated && !isAway && (
                        <Item
                            button={
                                <AwayButton
                                    isAway={isAway}
                                    sitOutNextHand={localPlayer?.sitOutNextHand}
                                    readyNextHand={localPlayer?.readyNextHand}
                                    handleReturnReady={() =>
                                        handleReturnReady(socket, info)
                                    }
                                    handleSitOutNext={() =>
                                        handleSitOutNext(socket, info)
                                    }
                                    handleCancelRejoin={() =>
                                        handleCancelRejoin(socket, info)
                                    }
                                />
                            }
                        />
                    )}
                    <Item button={<VolumeButton />} />
                    {isOwner &&
                        appState.game?.running &&
                        !appState.game?.paused &&
                        socket && (
                        <Item
                            button={
                                <Tooltip
                                    label={effectivePendingPause ? 'Cancel Pause' : 'Pause Game'}
                                    aria-label={effectivePendingPause ? 'Cancel pause tooltip' : 'Pause game tooltip'}
                                >
                                    <IconButton
                                        icon={
                                            <Icon
                                                as={FaPause}
                                                boxSize={{ base: 4, md: 5 }}
                                            />
                                        }
                                        aria-label={effectivePendingPause ? 'Cancel Pause' : 'Pause Game'}
                                        size={{ base: 'md', md: 'md' }}
                                        px={2}
                                        py={2}
                                        width={{
                                            base: '40px',
                                            sm: '40px',
                                            md: '48px',
                                        }}
                                        height={{
                                            base: '40px',
                                            sm: '40px',
                                            md: '48px',
                                        }}
                                        onClick={() => {
                                            if (effectivePendingPause) {
                                                setOptimisticPendingPause(false);
                                                sendResumeGameCommand(socket);
                                            } else {
                                                setOptimisticPendingPause(true);
                                                sendPauseGameCommand(socket);
                                            }
                                        }}
                                        bg={effectivePendingPause ? 'orange.400' : 'brand.yellow'}
                                        color="white"
                                        border="none"
                                        borderRadius="12px"
                                        boxShadow={
                                            effectivePendingPause
                                                ? 'inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 #B45A0B'
                                                : 'inset 0 1px 0 rgba(255,255,255,0.30), 0 2px 0 #B78900'
                                        }
                                        transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
                                        _hover={{
                                            bg: effectivePendingPause ? 'orange.400' : 'brand.yellow',
                                        }}
                                        _active={{
                                            bg: effectivePendingPause ? 'orange.500' : 'brand.yellowDark',
                                            transform: 'translateY(2px)',
                                            boxShadow: effectivePendingPause
                                                ? 'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #B45A0B'
                                                : 'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #B78900',
                                        }}
                                    />
                                </Tooltip>
                            }
                        />
                    )}
                    {isUserSeated && (
                        <Item
                            button={
                                <LeaveButton
                                    isUserSeated
                                    isLeaveRequested={leaveAfterHandRequested}
                                    settlementInProgress={Boolean(appState.game?.settlementInProgress)}
                                    handleLeaveTable={() =>
                                        handleLeaveTable(
                                            socket,
                                            info,
                                            leaveAfterHandRequested
                                        )
                                    }
                                />
                            }
                        />
                    )}
                </MenuList>
            </Menu>
        </Box>
    );
};

export default TableMenuBurger;
