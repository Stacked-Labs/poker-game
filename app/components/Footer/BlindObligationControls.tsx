import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Box, Button, Flex, Stack, Text } from '@chakra-ui/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import useToastHelper from '@/app/hooks/useToastHelper';
import {
    payOwedBlinds,
    waitForBB as sendWaitForBB,
    playerSetReady,
} from '@/app/hooks/server_actions';
import { BlindObligationOptions } from '@/app/interfaces';

const BlindObligationControls = () => {
    const { appState, dispatch } = useContext(AppContext);
    const socket = useContext(SocketContext);
    const toast = useToastHelper();
    const [submitting, setSubmitting] = useState<
        'post_now' | 'wait_bb' | 'sit_out' | null
    >(null);

    const game = appState.game;
    const obligation = appState.blindObligation;
    const localPlayer = game?.players?.find(
        (p) => p.uuid === appState.clientID
    );
    const seatIndex = localPlayer ? localPlayer.seatID - 1 : -1;

    const owesSB =
        seatIndex >= 0
            ? Boolean(game?.owesSB?.[seatIndex])
            : Boolean(obligation?.owesSB);
    const owesBB =
        seatIndex >= 0
            ? Boolean(game?.owesBB?.[seatIndex])
            : Boolean(obligation?.owesBB);
    const waitingForBB =
        seatIndex >= 0
            ? Boolean(game?.waitingForBB?.[seatIndex])
            : Boolean(obligation?.waitingForBB);

    const options: BlindObligationOptions[] =
        obligation?.options ??
        (['post_now', 'wait_bb', 'sit_out'] as BlindObligationOptions[]);

    const shouldRender =
        !!localPlayer &&
        (owesSB || owesBB || waitingForBB || obligation);

    const summaryText = useMemo(() => {
        const parts = [];
        if (owesSB) parts.push('SB');
        if (owesBB) parts.push('BB');
        if (parts.length === 0 && waitingForBB) {
            return 'Waiting for your big blind';
        }
        if (parts.length === 0) return null;
        if (parts.length === 2) return 'You owe SB + BB';
        return `You owe ${parts[0]}`;
    }, [owesBB, owesSB, waitingForBB]);

    const supportingText = useMemo(() => {
        if (waitingForBB) {
            return 'You are out until your next big blind. Choose “Post now” to rejoin immediately.';
        }
        if (owesSB || owesBB) {
            return 'Pick how to handle your owed blind to get dealt again.';
        }
        return null;
    }, [owesBB, owesSB, waitingForBB]);

    useEffect(() => {
        if (!submitting) return;
        const timer = setTimeout(() => setSubmitting(null), 2500);
        return () => clearTimeout(timer);
    }, [submitting]);

    useEffect(() => {
        if (!owesSB && !owesBB && !waitingForBB && submitting) {
            setSubmitting(null);
        }
    }, [owesBB, owesSB, waitingForBB, submitting]);

    const handleChoice = (choice: 'post_now' | 'wait_bb' | 'sit_out') => {
        if (!socket || !localPlayer) {
            toast.error('Not connected', 'Reconnect before trying again.', 4000);
            return;
        }

        setSubmitting(choice);
        switch (choice) {
            case 'post_now':
                payOwedBlinds(socket);
                toast.info('Posting blinds', 'We will seat you next hand.');
                break;
            case 'wait_bb':
                sendWaitForBB(socket);
                dispatch({
                    type: 'setBlindObligation',
                    payload: {
                        seatID: localPlayer.seatID,
                        owesSB,
                        owesBB,
                        waitingForBB: true,
                        options,
                    },
                });
                toast.info(
                    'Waiting for big blind',
                    'You will rejoin automatically on your BB.'
                );
                break;
            case 'sit_out':
                playerSetReady(socket, false);
                dispatch({ type: 'clearBlindObligation' });
                toast.info('Sitting out', 'You will stay out until you return.');
                break;
            default:
                break;
        }
    };

    if (!shouldRender) return null;

    const buttonWidth = { base: '100%', md: 'auto' };

    return (
        <Box
            width="100%"
            px={{ base: 3, md: 4 }}
            py={{ base: 3, md: 3 }}
            bg="rgba(11, 20, 48, 0.85)"
            border="1px solid"
            borderColor="brand.navy"
            borderRadius={{ base: '14px', md: '16px' }}
            boxShadow="0 8px 24px rgba(11, 20, 48, 0.35)"
        >
            <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ base: 'flex-start', md: 'center' }}
                justify="space-between"
                gap={{ base: 3, md: 4 }}
            >
                <Flex direction="column" gap={1} minW={0} flex={1}>
                    <Text
                        fontWeight="bold"
                        color="white"
                        fontSize={{ base: 'sm', md: 'md' }}
                    >
                        {summaryText || 'Blind decision needed'}
                    </Text>
                    {supportingText && (
                        <Text
                            color="text.secondary"
                            fontSize={{ base: 'xs', md: 'sm' }}
                            noOfLines={2}
                        >
                            {supportingText}
                        </Text>
                    )}
                </Flex>

                <Stack
                    direction={{ base: 'column', sm: 'row' }}
                    spacing={{ base: 2, md: 3 }}
                    width={{ base: '100%', md: 'auto' }}
                >
                    {options.includes('post_now') && (
                        <Button
                            bg="brand.green"
                            color="white"
                            borderRadius="10px"
                            px={{ base: 3, md: 4 }}
                            py={{ base: 2, md: 2.5 }}
                            minW={{ base: 'auto', md: '130px' }}
                            width={buttonWidth}
                            _hover={{
                                bg: 'rgba(54, 163, 123, 0.9)',
                                transform: 'translateY(-1px)',
                            }}
                            _active={{ transform: 'translateY(0px)' }}
                            isDisabled={submitting !== null}
                            isLoading={submitting === 'post_now'}
                            loadingText="Posting"
                            onClick={() => handleChoice('post_now')}
                        >
                            Post now
                        </Button>
                    )}
                    {options.includes('wait_bb') && (
                        <Button
                            variant="outline"
                            borderColor="brand.yellow"
                            color="brand.yellow"
                            borderWidth="2px"
                            borderRadius="10px"
                            px={{ base: 3, md: 4 }}
                            py={{ base: 2, md: 2.5 }}
                            minW={{ base: 'auto', md: '130px' }}
                            width={buttonWidth}
                            _hover={{
                                bg: 'rgba(253, 197, 29, 0.12)',
                                transform: 'translateY(-1px)',
                            }}
                            _active={{ transform: 'translateY(0px)' }}
                            isDisabled={submitting !== null || waitingForBB}
                            isLoading={submitting === 'wait_bb'}
                            loadingText="Setting wait"
                            onClick={() => handleChoice('wait_bb')}
                        >
                            {waitingForBB ? 'Waiting for BB' : 'Wait for BB'}
                        </Button>
                    )}
                    {options.includes('sit_out') && (
                        <Button
                            variant="ghost"
                            color="text.secondary"
                            borderRadius="10px"
                            px={{ base: 3, md: 4 }}
                            py={{ base: 2, md: 2.5 }}
                            minW={{ base: 'auto', md: '110px' }}
                            width={buttonWidth}
                            _hover={{
                                bg: 'rgba(255, 255, 255, 0.06)',
                                color: 'white',
                                transform: 'translateY(-1px)',
                            }}
                            _active={{ transform: 'translateY(0px)' }}
                            isDisabled={submitting !== null}
                            isLoading={submitting === 'sit_out'}
                            loadingText="Updating"
                            onClick={() => handleChoice('sit_out')}
                        >
                            Sit out
                        </Button>
                    )}
                </Stack>
            </Flex>
        </Box>
    );
};

export default BlindObligationControls;
