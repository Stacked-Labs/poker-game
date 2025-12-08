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

const AUTO_ACTION_DELAY_MS = 750;

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
    const toggleQueuedAction = useCallback((action: QueuedAction) => {
        setQueuedActions((prev) => ({
            ...prev,
            [action]: !prev[action],
        }));
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
            const active = document.activeElement as HTMLElement | null;
            const isEditableElement =
                active &&
                (active.tagName === 'INPUT' ||
                    active.tagName === 'TEXTAREA' ||
                    active.isContentEditable);

            if (isEditableElement || gameIsPaused) {
                return;
            }

            const handledQueueShortcut = (() => {
                if (!queueMode) {
                    return false;
                }

                switch (key) {
                    case HOTKEY_CALL:
                        toggleQueuedAction('call');
                        e.preventDefault();
                        return true;
                    case HOTKEY_CHECK:
                        toggleQueuedAction('check');
                        e.preventDefault();
                        return true;
                    case HOTKEY_FOLD:
                        toggleQueuedAction('fold');
                        e.preventDefault();
                        return true;
                    default:
                        return false;
                }
            })();

            if (!isCurrentTurn) {
                return;
            }

            if (handledQueueShortcut || showRaise) {
                return;
            }

            switch (key) {
                case HOTKEY_CALL:
                    if (needsToCall) {
                        handleCall();
                        e.preventDefault();
                    }
                    break;
                case HOTKEY_RAISE:
                    setShowRaise(true);
                    e.preventDefault();
                    break;
                case HOTKEY_CHECK:
                    if (canCheck) {
                        handleCheck();
                        e.preventDefault();
                    }
                    break;
                case HOTKEY_FOLD:
                    canCheck ? onOpen() : handleFold();
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
        queueMode,
        showRaise,
        needsToCall,
        canCheck,
        isCurrentTurn,
        toggleQueuedAction,
    ]);

    const handleCall = () => {
        resetQueuedActions();
        if (socket) {
            playerCall(socket);
        }
    };

    const handleCheck = () => {
        resetQueuedActions();
        if (socket) {
            playerCheck(socket);
        }
    };

    const handleFold = () => {
        resetQueuedActions();
        if (socket) {
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
            const hasQueuedCall = queuedActions.call;
            const hasQueuedCheck = queuedActions.check;
            const hasQueuedFold = queuedActions.fold;

            if (hasQueuedCall) {
                if (needsToCall && callAmount > 0) {
                    handleCall();
                    return;
                }
                if (canCheck) {
                    handleCheck();
                    return;
                }
                handleFold();
                return;
            }

            if (hasQueuedCheck) {
                if (canCheck) {
                    handleCheck();
                    return;
                }
                if (hasQueuedFold) {
                    handleFold();
                    return;
                }
                setQueuedActions((prev) => ({ ...prev, check: false }));
                return;
            }

            if (hasQueuedFold) {
                handleFold();
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
        queuedActions,
        clearAutoActionTimeout,
    ]);

    if (!socket || !appState || !appState.game || !localPlayer) {
        return null;
    }

    const handleCallButtonClick = () => {
        if (queueMode) {
            toggleQueuedAction('call');
            return;
        }
        if (!needsToCall) {
            handleCheck();
            return;
        }
        handleCall();
    };

    const handleCheckButtonClick = () => {
        if (queueMode) {
            toggleQueuedAction('check');
            return;
        }
        handleCheck();
    };

    const handleFoldButtonClick = () => {
        if (queueMode) {
            toggleQueuedAction('fold');
            return;
        }
        canCheck ? onOpen() : handleFold();
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} isCentered size={'xs'}>
                <GuardModal handleFold={handleFold} onClose={onClose} />
            </Modal>
            <Flex
                className="footer-action-buttons"
                overflow={'visible'}
                alignItems={'center'}
                zIndex={showRaise && isCurrentTurn ? 100 : 0}
                bg="transparent"
                width="100%"
                position="relative"
                sx={{
                    // Portrait/Vertical mode: Compact layout
                    '@media (orientation: portrait)': {
                        justifyContent: 'space-between',
                        gap: '1%',
                        padding: '1%',
                        height: '100%',
                        maxHeight: '70px',
                        minHeight: '50px',
                    },
                    // Landscape/Horizontal mode: Full layout
                    '@media (orientation: landscape)': {
                        justifyContent: 'flex-end',
                        gap: '0.8%',

                        height: '100%',
                    },
                }}
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
