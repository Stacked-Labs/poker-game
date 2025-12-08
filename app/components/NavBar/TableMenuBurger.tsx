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
import { ReactElement, useContext } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { FaPlay, FaPause } from 'react-icons/fa';
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
import { ColorModeButton } from '../ColorModeButton';
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
    const localPlayer = appState.game?.players?.find(
        (p) => p.uuid === appState.clientID
    );
    const leaveAfterHandRequested = Boolean(localPlayer?.leaveAfterHand);

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
                    bg="btn.lightGray"
                    color="text.secondary"
                    border="none"
                    borderRadius="12px"
                    _hover={
                        isOpen
                            ? {
                                  bg: 'brand.navy',
                                  color: 'white',
                              }
                            : {
                                  bg: 'brand.navy',
                                  color: 'white',
                                  boxShadow:
                                      '0 4px 12px rgba(51, 68, 121, 0.3)',
                              }
                    }
                    transition="all 0.2s ease"
                />
                <MenuList
                    zIndex={999}
                    bg="transparent"
                    border="none"
                    boxShadow="none"
                    gap={2}
                    padding={0}
                >
                    <Item button={<WalletButton />} />
                    {isUserSeated && (
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
                    {isOwner && appState.game?.running && socket && (
                        <Item
                            button={
                                <Tooltip
                                    label={
                                        appState.game?.paused
                                            ? 'Resume Game'
                                            : 'Pause Game'
                                    }
                                    aria-label={
                                        appState.game?.paused
                                            ? 'Resume game tooltip'
                                            : 'Pause game tooltip'
                                    }
                                >
                                    <IconButton
                                        icon={
                                            appState.game?.paused ? (
                                                <Icon
                                                    as={FaPlay}
                                                    boxSize={{ base: 4, md: 5 }}
                                                />
                                            ) : (
                                                <Icon
                                                    as={FaPause}
                                                    boxSize={{ base: 4, md: 5 }}
                                                />
                                            )
                                        }
                                        aria-label={
                                            appState.game?.paused
                                                ? 'Resume Game'
                                                : 'Pause Game'
                                        }
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
                                            if (appState.game?.paused) {
                                                sendResumeGameCommand(socket);
                                            } else {
                                                sendPauseGameCommand(socket);
                                            }
                                        }}
                                        bg={
                                            appState.game?.paused
                                                ? 'brand.green'
                                                : 'brand.yellow'
                                        }
                                        color="white"
                                        border="none"
                                        borderRadius="12px"
                                        _hover={{
                                            transform: 'translateY(-2px)',
                                            boxShadow: appState.game?.paused
                                                ? '0 4px 12px rgba(54, 163, 123, 0.4)'
                                                : '0 4px 12px rgba(253, 197, 29, 0.4)',
                                        }}
                                        transition="all 0.2s ease"
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
                    <Item button={<ColorModeButton variant="menu" />} />
                </MenuList>
            </Menu>
        </Box>
    );
};

export default TableMenuBurger;
