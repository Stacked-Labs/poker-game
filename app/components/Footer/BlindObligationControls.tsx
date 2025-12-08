import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
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

type QueueableBlindAction = Extract<
    BlindObligationOptions,
    'post_now' | 'wait_bb'
>;

const BlindObligationControls = () => {
    const { appState, dispatch } = useContext(AppContext);
    const socket = useContext(SocketContext);
    const toast = useToastHelper();
    const [submitting, setSubmitting] = useState<
        'post_now' | 'wait_bb' | 'sit_out' | null
    >(null);
    const [queuedBlindAction, setQueuedBlindAction] =
        useState<QueueableBlindAction | null>(null);
    const [autoQueueKey, setAutoQueueKey] = useState<string | null>(null);
    const previousStageRef = useRef<number | null>(null);

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

    // Default to queue "post now" once per new obligation (fallback to wait if needed)
    useEffect(() => {
        const key = obligation
            ? `${obligation.seatID}:${obligation.owesSB}:${obligation.owesBB}:${obligation.waitingForBB}`
            : null;
        const canAutoQueue =
            obligation &&
            !waitingForBB &&
            key !== autoQueueKey &&
            (options.includes('post_now') || options.includes('wait_bb'));

        if (!canAutoQueue) return;

        const defaultAction = options.includes('post_now')
            ? 'post_now'
            : options.includes('wait_bb')
              ? 'wait_bb'
              : null;

        if (!defaultAction) return;

        setQueuedBlindAction(defaultAction);
        setAutoQueueKey(key);
    }, [obligation, options, waitingForBB, autoQueueKey]);

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

    useEffect(() => {
        if (!shouldRender && queuedBlindAction) {
            setQueuedBlindAction(null);
        }
    }, [queuedBlindAction, shouldRender]);

    const executeQueuedBlindChoice = useCallback(
        (choice: QueueableBlindAction) => {
            if (!socket || !localPlayer) {
                toast.error(
                    'Not connected',
                    'Reconnect before trying again.',
                    4000
                );
                return;
            }

            setQueuedBlindAction(null);
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
                default:
                    break;
            }
        },
        [socket, localPlayer, toast, dispatch, owesSB, owesBB, options]
    );

    useEffect(() => {
        const stage = game?.stage ?? null;
        if (stage === null) {
            previousStageRef.current = null;
            return;
        }

        const stageChanged =
            previousStageRef.current !== null &&
            previousStageRef.current !== stage;

        if (
            stageChanged &&
            stage === 1 &&
            queuedBlindAction &&
            !game?.betting
        ) {
            executeQueuedBlindChoice(queuedBlindAction);
        }

        previousStageRef.current = stage;
    }, [
        game?.stage,
        game?.betting,
        queuedBlindAction,
        executeQueuedBlindChoice,
    ]);

    const handleChoice = (choice: 'post_now' | 'wait_bb' | 'sit_out') => {
        if (!socket || !localPlayer) {
            toast.error(
                'Not connected',
                'Reconnect before trying again.',
                4000
            );
            return;
        }

        switch (choice) {
            case 'post_now':
                setQueuedBlindAction((prev) => {
                    if (prev === 'post_now') {
                        toast.info(
                            'Auto action cleared',
                            'Post blind now request removed.'
                        );
                        return null;
                    }
                    toast.info(
                        'Auto post ready',
                        'We will post your blinds once this hand ends.'
                    );
                    return 'post_now';
                });
                break;
            case 'wait_bb':
                setQueuedBlindAction((prev) => {
                    if (prev === 'wait_bb') {
                        toast.info(
                            'Auto action cleared',
                            'Wait for big blind request removed.'
                        );
                        return null;
                    }
                    toast.info(
                        'Will wait for big blind',
                        'We will auto-select wait once this hand ends.'
                    );
                    return 'wait_bb';
                });
                break;
            case 'sit_out':
                setSubmitting('sit_out');
                playerSetReady(socket);
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
            className="blind-obligation-controls"
            justifyContent={{ base: 'space-between', md: 'center' }}
            gap={{ base: 1, md: 2 }}
            p={2}
            height="auto"
            maxHeight={{ base: '70px', md: '100px' }}
            minHeight={{ base: '50px', md: '70px' }}
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
                    border={
                        queuedBlindAction === 'wait_bb'
                            ? '2px solid'
                            : '2px dashed'
                    }
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
                    opacity={
                        queuedBlindAction === 'wait_bb'
                            ? 1
                            : waitingForBB
                              ? 0.7
                              : 0.85
                    }
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
                    {waitingForBB
                        ? 'Waiting for BB'
                        : queuedBlindAction === 'wait_bb'
                          ? 'Wait for BB (Queued)'
                          : 'Wait for BB'}
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
                    opacity={queuedBlindAction === 'post_now' ? 1 : 0.95}
                    borderStyle={
                        queuedBlindAction === 'post_now' ? 'solid' : 'solid'
                    }
                    transition="all 0.2s"
                >
                    {queuedBlindAction === 'post_now'
                        ? 'Post now (Queued)'
                        : 'Post now'}
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
