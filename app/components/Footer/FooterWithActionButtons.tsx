'use client';

import { Flex } from '@chakra-ui/react';
import React, { useState, useContext, useEffect } from 'react';
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

const FooterWithActionButtons = ({
    isCurrentTurn,
}: {
    isCurrentTurn: boolean;
}) => {
    const socket = useContext(SocketContext);
    const { appState } = useContext(AppContext);
    const [showRaise, setShowRaise] = useState<boolean>(false);
    const gameIsPaused = appState.game?.paused || false;

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
                    if (!canCall) {
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
                    handleFold(appState.username);
                    e.preventDefault();
                    break;
                default:
                    break;
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [gameIsPaused, appState.clientID, appState.game?.action]);

    const handleCall = (user: string | null, amount: number) => {
        if (socket) {
            const callMessage = `${user} calls ${amount}`;
            sendLog(socket, callMessage);
            playerCall(socket);
        }
    };

    const handleCheck = (user: string | null) => {
        if (socket) {
            const checkMessage = `${user} checks`;
            sendLog(socket, checkMessage);
            playerCheck(socket);
        }
    };

    const handleFold = (user: string | null) => {
        if (socket) {
            const foldMessage = `${user} folds`;
            sendLog(socket, foldMessage);
            playerFold(socket);
        }
    };

    if (!socket || !appState || !appState.game) {
        return null;
    }

    const player = appState.game.players[appState.game.action];
    const playerBets = appState.game.players.map((player) => player.bet);
    const maxBet = Math.max(...playerBets);

    const canCheck = player.bet >= maxBet;
    const canCall = maxBet - player.bet === 0;
    const callAmount =
        maxBet - player.bet < player.stack ? maxBet - player.bet : player.stack;

    return (
        <Flex
            justifyContent={{ base: 'space-between', md: 'end' }}
            gap={{ base: 1, md: 2 }}
            p={2}
            height={{ base: '100px', md: '150px' }}
            overflow={'visible'}
            alignItems={'center'}
        >
            {showRaise && isCurrentTurn ? (
                <RaiseInputBox
                    isCurrentTurn={isCurrentTurn}
                    setShowRaise={setShowRaise}
                    showRaise={showRaise}
                />
            ) : (
                <>
                    {isCurrentTurn && !canCall && !gameIsPaused && (
                        <ActionButton
                            text={'Call (' + callAmount + ')'}
                            color="green"
                            clickHandler={() =>
                                handleCall(appState.username, callAmount)
                            }
                            isDisabled={false}
                            hotkey={HOTKEY_CALL}
                        />
                    )}
                    <ActionButton
                        text={'Raise'}
                        color="green"
                        clickHandler={() => setShowRaise(true)}
                        isDisabled={!isCurrentTurn || gameIsPaused}
                        hotkey={HOTKEY_RAISE}
                    />
                    {isCurrentTurn && canCheck && !gameIsPaused && (
                        <ActionButton
                            text={'Check'}
                            color="green"
                            clickHandler={() => handleCheck(appState.username)}
                            isDisabled={false}
                            hotkey={HOTKEY_CHECK}
                        />
                    )}
                    <ActionButton
                        text={'Fold'}
                        color="red"
                        clickHandler={() => handleFold(appState.username)}
                        isDisabled={!isCurrentTurn || gameIsPaused}
                        hotkey={HOTKEY_FOLD}
                    />
                </>
            )}
        </Flex>
    );
};

export default FooterWithActionButtons;
