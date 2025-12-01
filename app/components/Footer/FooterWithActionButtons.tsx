'use client';

import { Flex, Modal, useDisclosure } from '@chakra-ui/react';
import React, {
    useState,
    useContext,
    useEffect,
    useCallback,
    useRef,
} from 'react';
import ActionButton from './ActionButton';
import { AppContext } from '../../contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import RaiseInputBox from './RaiseInputBox';
import {
    sendLog,
    playerCall,
    playerCheck,
    playerFold,
} from '@/app/hooks/server_actions';
import {
    HOTKEY_CALL,
    HOTKEY_CHECK,
    HOTKEY_FOLD,
    HOTKEY_RAISE,
} from './constants';
import GuardModal from '../GuardModal';

const AUTO_ACTION_DELAY_MS = 500;

type QueuedAction = 'call' | 'check' | 'fold';

type QueuedActionState = Record<QueuedAction, boolean>;

const createInitialQueuedActions = (): QueuedActionState => ({
    call: false,
    check: false,
    fold: false,
});

const FooterWithActionButtons = ({
    isCurrentTurn,
}: {
    isCurrentTurn: boolean;
}) => {
    const socket = useContext(SocketContext);
    const { appState } = useContext(AppContext);
    const [showRaise, setShowRaise] = useState<boolean>(false);
    const [queuedActions, setQueuedActions] = useState<QueuedActionState>(() =>
        createInitialQueuedActions()
    );
    const gameIsPaused = appState.game?.paused || false;
    const { isOpen, onOpen, onClose } = useDisclosure();
    const game = appState.game;
    const players = game?.players ?? [];
    const actingPlayer =
        game && typeof game.action === 'number' ? players[game.action] : null;
    const localPlayer =
        players.find((player) => player.uuid === appState.clientID) ?? null;
    const playerBets = players.map((player) => player.bet);
    const maxBet = playerBets.length ? Math.max(...playerBets) : 0;
    const callDifference = localPlayer
        ? Math.max(maxBet - localPlayer.bet, 0)
        : 0;
    const callAmount = localPlayer
        ? Math.min(callDifference, localPlayer.stack)
        : 0;
    const canCheck = localPlayer ? callDifference === 0 : false;
    const needsToCall = localPlayer ? callDifference > 0 : false;
    const queueMode = !isCurrentTurn && !gameIsPaused && Boolean(localPlayer);
    const resetQueuedActions = useCallback(() => {
        setQueuedActions(createInitialQueuedActions());
    }, []);
    const autoActionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const clearAutoActionTimeout = useCallback(() => {
        if (autoActionTimeoutRef.current) {
            clearTimeout(autoActionTimeoutRef.current);
            autoActionTimeoutRef.current = null;
        }
    }, []);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            console.log('footerwith.tsx: ' + key);

            const active = document.activeElement;
            if (
                (active &&
                    (active.tagName === 'INPUT' ||
                        active.tagName === 'TEXTAREA' ||
                        (active as HTMLElement).isContentEditable)) ||
                gameIsPaused ||
                !isCurrentTurn
            ) {
                return;
            }

            switch (key) {
                case HOTKEY_CALL:
                    if (needsToCall) {
                        handleCall(appState.username, callAmount);
                        e.preventDefault();
                    }
                    break;
                case HOTKEY_RAISE:
                    setShowRaise(true);
                    e.preventDefault();
                    break;
                case HOTKEY_CHECK:
                    if (canCheck) {
                        handleCheck(appState.username);
                        e.preventDefault();
                    }
                    break;
                case HOTKEY_FOLD:
                    canCheck ? onOpen() : handleFold(appState.username);
                    e.preventDefault();
                    break;
                default:
                    break;
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [
        gameIsPaused,
        appState.clientID,
        appState.game?.action,
        needsToCall,
        canCheck,
        callAmount,
        isCurrentTurn,
    ]);

    const handleCall = (user: string | null, amount: number) => {
        resetQueuedActions();
        if (socket) {
            const callMessage = `${user} calls ${amount}`;
            sendLog(socket, callMessage);
            playerCall(socket);
        }
    };

    const handleCheck = (user: string | null) => {
        resetQueuedActions();
        if (socket) {
            const checkMessage = `${user} checks`;
            sendLog(socket, checkMessage);
            playerCheck(socket);
        }
    };

    const handleFold = (user: string | null) => {
        resetQueuedActions();
        if (socket) {
            const foldMessage = `${user} folds`;
            sendLog(socket, foldMessage);
            playerFold(socket);
        }
    };

    useEffect(() => {
        clearAutoActionTimeout();
        if (
            !isCurrentTurn ||
            !localPlayer ||
            gameIsPaused ||
            (!queuedActions.call && !queuedActions.check && !queuedActions.fold)
        ) {
            return;
        }

        autoActionTimeoutRef.current = setTimeout(() => {
            const username = appState.username;
            const hasQueuedCall = queuedActions.call;
            const hasQueuedCheck = queuedActions.check;
            const hasQueuedFold = queuedActions.fold;

            if (hasQueuedCall) {
                if (needsToCall && callAmount > 0) {
                    handleCall(username, callAmount);
                    return;
                }
                if (canCheck) {
                    handleCheck(username);
                    return;
                }
                handleFold(username);
                return;
            }

            if (hasQueuedCheck) {
                if (canCheck) {
                    handleCheck(username);
                    return;
                }
                if (hasQueuedFold) {
                    handleFold(username);
                    return;
                }
                setQueuedActions((prev) => ({ ...prev, check: false }));
                return;
            }

            if (hasQueuedFold) {
                handleFold(username);
            }
        }, AUTO_ACTION_DELAY_MS);

        return clearAutoActionTimeout;
    }, [
        isCurrentTurn,
        localPlayer,
        gameIsPaused,
        needsToCall,
        callAmount,
        canCheck,
        appState.username,
        queuedActions,
        clearAutoActionTimeout,
    ]);

    if (!socket || !appState || !appState.game || !localPlayer) {
        return null;
    }

    const toggleQueuedAction = (action: QueuedAction) => {
        setQueuedActions((prev) => ({
            ...prev,
            [action]: !prev[action],
        }));
    };

    const handleCallButtonClick = () => {
        if (queueMode) {
            toggleQueuedAction('call');
            return;
        }
        if (!needsToCall) {
            handleCheck(appState.username);
            return;
        }
        handleCall(appState.username, callAmount);
    };

    const handleCheckButtonClick = () => {
        if (queueMode) {
            toggleQueuedAction('check');
            return;
        }
        handleCheck(appState.username);
    };

    const handleFoldButtonClick = () => {
        if (queueMode) {
            toggleQueuedAction('fold');
            return;
        }
        canCheck ? onOpen() : handleFold(appState.username);
    };

    // Debug logging for action buttons visibility
    console.log('🔍 FooterWithActionButtons Debug:', {
        isCurrentTurn,
        clientID: appState.clientID,
        gameAction: appState.game.action,
        actingPlayer: actingPlayer
            ? {
                  uuid: actingPlayer.uuid,
                  address: actingPlayer.address,
                  username: actingPlayer.username,
                  position: actingPlayer.position,
                  seatID: actingPlayer.seatID,
              }
            : null,
        localPlayer: localPlayer
            ? {
                  uuid: localPlayer.uuid,
                  seatID: localPlayer.seatID,
                  bet: localPlayer.bet,
                  stack: localPlayer.stack,
              }
            : null,
        gameBetting: appState.game.betting,
        gamePaused: gameIsPaused,
        canCheck,
        needsToCall,
        callAmount,
        maxBet,
        playerBets,
        queuedActions,
        queueMode,
    });

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} isCentered size={'xs'}>
                <GuardModal
                    handleFold={handleFold}
                    username={appState.username}
                    onClose={onClose}
                />
            </Modal>
            <Flex
                justifyContent={{ base: 'space-between', md: 'end' }}
                gap={{ base: 1, md: 2 }}
                p={1}
                height={{ base: '100px', md: '120px' }}
                overflow={'visible'}
                alignItems={'center'}
                zIndex={showRaise && isCurrentTurn ? 100 : 0}
                bg="transparent"
                width="100%"
                position="relative"
            >
                {showRaise && isCurrentTurn ? (
                    <RaiseInputBox
                        isCurrentTurn={isCurrentTurn}
                        setShowRaise={setShowRaise}
                        showRaise={showRaise}
                    />
                ) : (
                    <>
                        <ActionButton
                            text={'Raise'}
                            color="green"
                            clickHandler={() => setShowRaise(true)}
                            isDisabled={!isCurrentTurn || gameIsPaused}
                            hotkey={HOTKEY_RAISE}
                        />
                        {!gameIsPaused && needsToCall && (
                            <ActionButton
                                text={'Call (' + callAmount + ')'}
                                color="green"
                                clickHandler={handleCallButtonClick}
                                isDisabled={gameIsPaused}
                                hotkey={HOTKEY_CALL}
                                queued={queuedActions.call}
                                queueMode={queueMode}
                            />
                        )}
                        {!gameIsPaused && canCheck && (
                            <ActionButton
                                text={'Check'}
                                color="green"
                                clickHandler={handleCheckButtonClick}
                                isDisabled={gameIsPaused}
                                hotkey={HOTKEY_CHECK}
                                queued={queuedActions.check}
                                queueMode={queueMode}
                            />
                        )}
                        <ActionButton
                            text={'Fold'}
                            color="red"
                            clickHandler={handleFoldButtonClick}
                            isDisabled={gameIsPaused}
                            hotkey={HOTKEY_FOLD}
                            queued={queuedActions.fold}
                            queueMode={queueMode}
                        />
                    </>
                )}
            </Flex>
        </>
    );
};

export default FooterWithActionButtons;
