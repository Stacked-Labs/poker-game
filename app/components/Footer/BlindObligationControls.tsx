import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Button, Flex } from '@chakra-ui/react';
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
    const [autoWaitKey, setAutoWaitKey] = useState<string | null>(null);

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

    const options: BlindObligationOptions[] = useMemo(
        () =>
            obligation?.options ??
            (['post_now', 'wait_bb', 'sit_out'] as BlindObligationOptions[]),
        [obligation?.options]
    );

    const shouldRender =
        !!localPlayer && (owesSB || owesBB || waitingForBB || obligation);

    // Default to wait for BB once per obligation instance
    useEffect(() => {
        const key = obligation
            ? `${obligation.seatID}:${obligation.owesSB}:${obligation.owesBB}:${obligation.waitingForBB}`
            : null;
        const canAutoWait =
            obligation &&
            options.includes('wait_bb') &&
            !waitingForBB &&
            key !== autoWaitKey;

        if (!canAutoWait || !socket || !localPlayer) return;

        setSubmitting('wait_bb');
        sendWaitForBB(socket);
        dispatch({
            type: 'setBlindObligation',
            payload: {
                seatID: obligation.seatID,
                owesSB,
                owesBB,
                waitingForBB: true,
                options,
            },
        });
        setAutoWaitKey(key);
        toast.info(
            'Waiting for big blind',
            'You will rejoin automatically on your BB.'
        );
    }, [
        obligation,
        options,
        waitingForBB,
        socket,
        localPlayer,
        dispatch,
        owesSB,
        owesBB,
        toast,
        autoWaitKey,
    ]);

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
            toast.error(
                'Not connected',
                'Reconnect before trying again.',
                4000
            );
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
                toast.info(
                    'Sitting out',
                    'You will stay out until you return.'
                );
                break;
            default:
                break;
        }
    };

    if (!shouldRender) return null;

    return (
        <Flex
            justifyContent={{ base: 'space-between', md: 'center' }}
            gap={{ base: 1, md: 2 }}
            p={2}
            height={{ base: '100px', md: '120px' }}
            overflow={'visible'}
            alignItems={'center'}
            zIndex={1}
            bg="transparent"
        >
            {options.includes('wait_bb') && (
                <Button
                    bg="transparent"
                    color="brand.yellow"
                    borderColor="brand.yellow"
                    border="2px solid"
                    borderRadius={{ base: '8px', md: '10px' }}
                    padding={{ base: 4, sm: 5, md: 4, lg: 5 }}
                    textTransform={'uppercase'}
                    onClick={() => handleChoice('wait_bb')}
                    isDisabled={submitting !== null || waitingForBB}
                    isLoading={submitting === 'wait_bb'}
                    loadingText="Waiting"
                    fontWeight="bold"
                    fontSize={{
                        base: '15px',
                        sm: '16px',
                        md: 'medium',
                        lg: 'large',
                        xl: 'large',
                        '2xl': 'large',
                    }}
                    maxW={{ base: 'unset', md: '180px', lg: '200px' }}
                    width={{ base: '100%', md: 'auto' }}
                    flex={{ base: 1, md: '0 0 auto' }}
                    height={{ base: '100%', md: '100%', lg: '100%' }}
                    flexShrink={{ base: 1, md: 0 }}
                    position={'relative'}
                    zIndex={10}
                    _hover={{
                        bg: !(submitting !== null || waitingForBB)
                            ? 'rgba(253, 197, 29, 0.12)'
                            : 'transparent',
                        transform: !(submitting !== null || waitingForBB)
                            ? 'translateY(-1px)'
                            : 'none',
                        boxShadow: !(submitting !== null || waitingForBB)
                            ? 'lg'
                            : 'none',
                    }}
                    _active={{
                        transform: !(submitting !== null || waitingForBB)
                            ? 'translateY(0px)'
                            : 'none',
                    }}
                    transition="all 0.2s"
                >
                    {waitingForBB ? 'Waiting for BB' : 'Wait for BB'}
                </Button>
            )}
            {options.includes('post_now') && (
                <Button
                    bg="brand.green"
                    color="white"
                    borderColor="brand.green"
                    border="2px solid"
                    borderRadius={{ base: '8px', md: '10px' }}
                    padding={{ base: 4, sm: 5, md: 4, lg: 5 }}
                    textTransform={'uppercase'}
                    onClick={() => handleChoice('post_now')}
                    isDisabled={submitting !== null}
                    isLoading={submitting === 'post_now'}
                    loadingText="Posting"
                    fontWeight="bold"
                    fontSize={{
                        base: '15px',
                        sm: '16px',
                        md: 'medium',
                        lg: 'large',
                        xl: 'large',
                        '2xl': 'large',
                    }}
                    maxW={{ base: 'unset', md: '180px', lg: '200px' }}
                    width={{ base: '100%', md: 'auto' }}
                    flex={{ base: 1, md: '0 0 auto' }}
                    height={{ base: '100%', md: '100%', lg: '100%' }}
                    flexShrink={{ base: 1, md: 0 }}
                    position={'relative'}
                    zIndex={10}
                    _hover={{
                        bg: !submitting ? '#2d8763' : 'brand.green',
                        transform: !submitting ? 'translateY(-1px)' : 'none',
                        boxShadow: !submitting ? 'lg' : 'none',
                    }}
                    _active={{
                        transform: !submitting ? 'translateY(0px)' : 'none',
                    }}
                    transition="all 0.2s"
                >
                    Post now
                </Button>
            )}
            {options.includes('sit_out') && (
                <Button
                    bg="transparent"
                    color="white"
                    borderColor="whiteAlpha.600"
                    border="2px solid"
                    borderRadius={{ base: '8px', md: '10px' }}
                    padding={{ base: 4, sm: 5, md: 4, lg: 5 }}
                    textTransform={'uppercase'}
                    onClick={() => handleChoice('sit_out')}
                    isDisabled={submitting !== null}
                    isLoading={submitting === 'sit_out'}
                    loadingText="Updating"
                    fontWeight="bold"
                    fontSize={{
                        base: '15px',
                        sm: '16px',
                        md: 'medium',
                        lg: 'large',
                        xl: 'large',
                        '2xl': 'large',
                    }}
                    maxW={{ base: 'unset', md: '180px', lg: '200px' }}
                    width={{ base: '100%', md: 'auto' }}
                    flex={{ base: 1, md: '0 0 auto' }}
                    height={{ base: '100%', md: '100%', lg: '100%' }}
                    flexShrink={{ base: 1, md: 0 }}
                    position={'relative'}
                    zIndex={10}
                    _hover={{
                        bg: !submitting
                            ? 'rgba(255, 255, 255, 0.06)'
                            : 'transparent',
                        transform: !submitting ? 'translateY(-1px)' : 'none',
                        boxShadow: !submitting ? 'lg' : 'none',
                    }}
                    _active={{
                        transform: !submitting ? 'translateY(0px)' : 'none',
                    }}
                    transition="all 0.2s"
                >
                    Sit out
                </Button>
            )}
        </Flex>
    );
};

export default BlindObligationControls;
