'use client';

import {
    Box,
    Icon,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Tooltip,
    useBreakpointValue,
} from '@chakra-ui/react';
import VolumeButton from '../VolumeButton';
import Web3Button from '../Web3Button';
import { ReactElement, useContext } from 'react';
import { FaChevronDown, FaUserCheck } from 'react-icons/fa6';
import { FiLogOut } from 'react-icons/fi';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import {
    handleLeaveTable,
    handleReturnReady,
    handleSitOutNext,
} from '@/app/hooks/useTableOptions';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { FaCoffee } from 'react-icons/fa';
import useToastHelper from '@/app/hooks/useToastHelper';
import AwayButton from '../AwayButton';

interface LeaveButtonProps {
    isUserSeated: boolean;
    isLeaveRequested: boolean;
    handleLeaveTable: () => void;
}

interface AwayButtonProps {
    isAway: boolean;
    sitOutPending: boolean;
    handleReturnReady: () => void;
    handleSitOutNext: () => void;
}

const Item = ({ button }: { button: ReactElement }) => {
    return (
        <MenuItem bg={'none'} width={'fit-content'} p={0} mb={2}>
            {button}
        </MenuItem>
    );
};

const LeaveButton = ({
    isUserSeated,
    isLeaveRequested,
    handleLeaveTable,
}: LeaveButtonProps) => {
    if (!isUserSeated) return null;

    return (
        <Tooltip
            label={
                isLeaveRequested ? 'Leaving after this hand...' : 'Leave Table'
            }
        >
            <IconButton
                icon={<Icon as={FiLogOut} boxSize={{ base: 5, md: 8 }} />}
                aria-label="Leave Table"
                size={'lg'}
                colorScheme={isLeaveRequested ? 'gray' : 'red'}
                onClick={handleLeaveTable}
                isDisabled={isLeaveRequested}
                opacity={isLeaveRequested ? 0.6 : 1}
                variant={'outlined'}
            />
        </Tooltip>
    );
};

const TableMenuBurger = () => {
    const { appState, dispatch } = useContext(AppContext);
    const isMobile = useBreakpointValue({ base: true, lg: false }) ?? true;
    const socket = useContext(SocketContext);
    const { info } = useToastHelper();

    // Check if the current user is seated at the table
    const isUserSeated = appState.game?.players?.some(
        (player) => player.uuid === appState.clientID
    );

    // Local player state
    const localPlayer = appState.game?.players?.find(
        (p) => p.uuid === appState.clientID
    );
    const isAway = !!localPlayer && localPlayer.stack > 0 && !localPlayer.ready;

    if (!isMobile || !socket) return null;

    return (
        <Box position={'absolute'} left={'0.5rem'} zIndex={999}>
            <Menu closeOnSelect={false}>
                <MenuButton
                    as={IconButton}
                    aria-label="Open table menu"
                    icon={<Icon as={FaChevronDown} boxSize={5} />}
                    size={'lg'}
                    zIndex={999}
                />
                <MenuList zIndex={999} bg={'none'} border={'none'} gap={2}>
                    {isUserSeated && (
                        <Item
                            button={
                                <AwayButton
                                    isAway={isAway}
                                    sitOutPending={appState.isSitOutNext}
                                    handleReturnReady={() =>
                                        handleReturnReady(socket, info)
                                    }
                                    handleSitOutNext={() =>
                                        handleSitOutNext(socket, dispatch, info)
                                    }
                                />
                            }
                        />
                    )}
                    <Item button={<VolumeButton />} />
                    <Item button={<Web3Button compact />} />
                    {isUserSeated && (
                        <Item
                            button={
                                <LeaveButton
                                    isUserSeated
                                    isLeaveRequested={appState.isLeaveRequested}
                                    handleLeaveTable={() =>
                                        handleLeaveTable(
                                            socket,
                                            appState.username,
                                            info
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
