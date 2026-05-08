'use client';

import { useContext } from 'react';
import { Flex, Button, Text, Spinner, Icon } from '@chakra-ui/react';
import { FaUserCheck } from 'react-icons/fa';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import useToastHelper from '@/app/hooks/useToastHelper';
import {
    handleReturnReady,
    handleCancelRejoin,
} from '@/app/hooks/useTableOptions';

/* ── shared responsive sizing (matches ActionButton scale) ─────────────── */
const portraitButton = {
    borderRadius: '10px',
    padding: '2%',
    fontSize: '3cqw',
    flex: 1,
    height: 'auto',
    minHeight: '8cqh',
    maxHeight: '100%',
    flexShrink: 1,
};

const landscapeButton = {
    borderRadius: '10px',
    padding: '0.5% 1.5%',
    fontSize: '1cqw',
    height: '100%',
    flexShrink: 0,
};

/* ── shared tactile transition ─────────────────────────────────────────── */
const TACTILE_TRANSITION =
    'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease';

/* ── wrapper Flex — identical to FooterWithActionButtons layout ────────── */
const footerFlexSx = {
    '@media (orientation: portrait)': {
        justifyContent: 'space-between',
        gap: '1%',
        padding: '1%',
        height: '100%',
        maxHeight: '70px',
        minHeight: '50px',
    },
    '@media (orientation: landscape)': {
        justifyContent: 'flex-end',
        gap: '0.8%',
        height: '100%',
    },
};

const AwayRejoinFooter = () => {
    const { appState } = useContext(AppContext);
    const socket = useContext(SocketContext);
    const { info } = useToastHelper();

    const localPlayer = appState.game?.players?.find(
        (p) => p.uuid === appState.clientID
    );
    const readyNextHand = localPlayer?.readyNextHand;

    if (readyNextHand) {
        return (
            <Flex
                className="away-rejoin-footer"
                alignItems="center"
                overflow="visible"
                bg="transparent"
                width="100%"
                position="relative"
                zIndex={1}
                sx={footerFlexSx}
            >
                {/* Status indicator — dashed felt pill, unchanged layout */}
                <Flex
                    alignItems="center"
                    justifyContent="center"
                    gap={2}
                    bg="rgba(54, 163, 123, 0.06)"
                    border="1.5px dashed"
                    borderColor="brand.green"
                    color="brand.green"
                    fontWeight="bold"
                    letterSpacing="0.04em"
                    textTransform="uppercase"
                    position="relative"
                    overflow="hidden"
                    sx={{
                        '@media (orientation: portrait)': portraitButton,
                        '@media (orientation: landscape)': {
                            ...landscapeButton,
                            minWidth: '7cqw',
                            maxWidth: '12cqw',
                        },
                    }}
                >
                    <Spinner
                        size="sm"
                        color="brand.green"
                        speed="1s"
                        flexShrink={0}
                    />
                    <Text
                        color="brand.green"
                        fontWeight="bold"
                        fontSize="inherit"
                        letterSpacing="inherit"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        Rejoining next hand...
                    </Text>
                </Flex>

                {/* Cancel — pink-outline tactile (destructive secondary) */}
                <Button
                    data-testid="cancel-rejoin-btn"
                    bg="transparent"
                    color="brand.pink"
                    border="2px solid"
                    borderColor="brand.pink"
                    fontWeight="bold"
                    letterSpacing="0.04em"
                    textTransform="uppercase"
                    position="relative"
                    overflow="hidden"
                    cursor="pointer"
                    onClick={() => handleCancelRejoin(socket, info)}
                    boxShadow="0 2px 0 #950839"
                    transition={TACTILE_TRANSITION}
                    _hover={{ bg: 'rgba(235, 11, 92, 0.12)' }}
                    _active={{
                        bg: 'rgba(235, 11, 92, 0.18)',
                        transform: 'translateY(2px)',
                        boxShadow: '0 0 0 #950839',
                    }}
                    sx={{
                        '@media (orientation: portrait)': {
                            ...portraitButton,
                            maxWidth: '30%',
                        },
                        '@media (orientation: landscape)': {
                            ...landscapeButton,
                            minWidth: '7cqw',
                            maxWidth: '12cqw',
                        },
                    }}
                >
                    Cancel
                </Button>
            </Flex>
        );
    }

    // "I'm Back" state — solid green tactile chip
    return (
        <Flex
            className="away-rejoin-footer"
            alignItems="center"
            overflow="visible"
            bg="transparent"
            width="100%"
            position="relative"
            zIndex={1}
            sx={footerFlexSx}
        >
            <Button
                data-testid="rejoin-footer-btn"
                bg="brand.green"
                color="white"
                border="none"
                fontWeight="bold"
                letterSpacing="0.04em"
                textTransform="uppercase"
                position="relative"
                overflow="hidden"
                cursor="pointer"
                onClick={() => handleReturnReady(socket, info)}
                boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 #22674E"
                transition={TACTILE_TRANSITION}
                _hover={{ bg: 'brand.green' }}
                _active={{
                    bg: 'brand.greenDark',
                    transform: 'translateY(2px)',
                    boxShadow:
                        'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #22674E',
                }}
                sx={{
                    '@media (orientation: portrait)': portraitButton,
                    '@media (orientation: landscape)': {
                        ...landscapeButton,
                        minWidth: '7cqw',
                        maxWidth: '12cqw',
                    },
                }}
            >
                <Icon as={FaUserCheck} boxSize={{ base: 5, md: 6 }} mr={2} />
                {"I'm Back"}
            </Button>
        </Flex>
    );
};

export default AwayRejoinFooter;
