'use client';

import {
    acceptPlayer,
    denyPlayer,
    kickPlayer,
} from '@/app/hooks/server_actions';
import React, { useContext } from 'react';
import PendingPlayers from './PendingPlayers';
import AcceptedPlayers from './AcceptedPlayers';
import { Checkbox, Flex, VStack, useColorModeValue } from '@chakra-ui/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import useToastHelper from '@/app/hooks/useToastHelper';

const PlayerList = () => {
    const { appState, dispatch } = useContext(AppContext);
    const pendingPlayers = appState.pendingPlayers || [];
    const socket = useContext(SocketContext);
    const toast = useToastHelper();
    const popupSettingBg = useColorModeValue(
        'card.lightGray',
        'legacy.grayDarkest'
    );
    const popupSettingBorder = useColorModeValue(
        'rgba(51, 68, 121, 0.12)',
        'rgba(255, 255, 255, 0.12)'
    );
    const checkboxBorder = useColorModeValue('brand.navy', 'brand.lightGray');

    const handleAcceptPlayer = async (uuid: string) => {
        if (socket && uuid) {
            const player = pendingPlayers.find((p) => p.uuid === uuid);
            const playerIdentifier = player?.username || uuid.substring(0, 8);

            acceptPlayer(socket, uuid);

            toast.success(
                `Player ${playerIdentifier} accepted`,
                'Player will now be seated at the table',
                3000
            );
        } else {
            toast.error('Unable to accept player', 'Please try again');
        }
    };

    const handleDenyPlayer = async (uuid: string) => {
        if (socket && uuid) {
            const player = pendingPlayers.find((p) => p.uuid === uuid);
            const playerIdentifier = player?.username || uuid.substring(0, 8);

            denyPlayer(socket, uuid);

            toast.info(
                `Player ${playerIdentifier} request denied`,
                'Player has been removed from the queue',
                3000
            );
        } else {
            toast.error('Unable to deny player request', 'Please try again');
        }
    };

    const handleKickPlayer = async (uuid: string) => {
        try {
            if (uuid && socket) {
                const kickedPlayer = appState.game?.players?.find(
                    (player) => player.uuid === uuid
                );
                const playerIdentifier =
                    kickedPlayer?.username || uuid.substring(0, 8);

                toast.warning(
                    `Kicking player ${playerIdentifier}...`,
                    'Please wait while we remove the player',
                    2000
                );

                kickPlayer(socket, uuid);
            } else {
                toast.error('Unable to kick player', 'Please try again');
            }
        } catch (error) {
            console.error('Error kicking player:', error);
            toast.error(
                'Failed to kick player',
                'An error occurred. Please try again.'
            );
        }
    };

    return (
        <VStack gap={{ base: 4, md: 6 }} align="stretch" w="100%">
            <Flex
                alignItems="center"
                bg={popupSettingBg}
                borderRadius={{ base: '10px', md: '12px' }}
                px={{ base: 2, md: 3 }}
                py={{ base: 1.5, md: 2 }}
                border="1px solid"
                borderColor={popupSettingBorder}
                alignSelf="flex-end"
                width="fit-content"
                sx={{
                    '@media (max-width: 480px) and (orientation: portrait)': {
                        borderRadius: '9px',
                        paddingLeft: '8px',
                        paddingRight: '8px',
                        paddingTop: '6px',
                        paddingBottom: '6px',
                    },
                }}
            >
                <Checkbox
                    size={{ base: 'sm', md: 'md' }}
                    colorScheme="green"
                    isChecked={!appState.showSeatRequestPopups}
                    onChange={(event) => {
                        dispatch({
                            type: 'setShowSeatRequestPopups',
                            payload: !event.target.checked,
                        });
                    }}
                    fontSize={{ base: 'xs', md: 'sm' }}
                    fontWeight="semibold"
                    color="text.secondary"
                    sx={{
                        '.chakra-checkbox__control': {
                            width: '18px',
                            height: '18px',
                            borderRadius: '5px',
                            border: '2px solid',
                            borderColor: checkboxBorder,
                            bg: 'transparent',
                        },
                        '.chakra-checkbox__control[data-checked]': {
                            bg: 'brand.green',
                            borderColor: 'brand.green',
                        },
                        '@media (max-width: 480px) and (orientation: portrait)':
                            {
                                '.chakra-checkbox__control': {
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '4px',
                                },
                            },
                    }}
                >
                    Disable seat request popups
                </Checkbox>
            </Flex>
            <AcceptedPlayers
                acceptedPlayers={appState.game?.players}
                handleKickPlayer={handleKickPlayer}
            />
            <PendingPlayers
                pendingPlayers={pendingPlayers}
                handleAcceptPlayer={handleAcceptPlayer}
                handleDenyPlayer={handleDenyPlayer}
            />
        </VStack>
    );
};

export default PlayerList;
