'use client';

import {
    Icon,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    useBreakpointValue,
    useDisclosure,
} from '@chakra-ui/react';
import VolumeButton from '../VolumeButton';
import WalletButton from '../WalletButton';
import { ReactElement, useContext } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import {
    handleLeaveTable,
    handleReturnReady,
    handleSitOutNext,
} from '@/app/hooks/useTableOptions';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import useToastHelper from '@/app/hooks/useToastHelper';
import AwayButton from './AwayButton';
import LeaveButton from './LeaveButton';

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
    const { appState, dispatch } = useContext(AppContext);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const isMobile = useBreakpointValue({ base: true, lg: false }) ?? true;
    const socket = useContext(SocketContext);
    const { info } = useToastHelper();

    if (!isMobile || !socket) return null;

    return (
        <Menu
            isOpen={isOpen}
            onClose={onClose}
            onOpen={onOpen}
            closeOnSelect={false}
        >
            <MenuButton
                as={IconButton}
                aria-label="Open table menu"
                icon={<Icon as={isOpen ? FiX : FiMenu} boxSize={5} />}
                size="lg"
                zIndex={999}
                bg="brand.lightGray"
                color="brand.navy"
                border="none"
                borderRadius="12px"
                _hover={{
                    bg: 'brand.navy',
                    color: 'white',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(51, 68, 121, 0.3)',
                }}
                transition="all 0.2s ease"
            />
            <MenuList
                zIndex={999}
                bg="transparent"
                border="none"
                gap={2}
                padding={0}
            >
                <Item button={<WalletButton />} />
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
    );
};

export default TableMenuBurger;
