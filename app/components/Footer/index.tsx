'use client';

import { Flex } from '@chakra-ui/react';
import React, { useState, useContext } from 'react';
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

const Footer = () => {
    const socket = useContext(SocketContext);
    const { appState } = useContext(AppContext);
    const [showRaise, setShowRaise] = useState<boolean>(false);

    const handleCall = (user: string | null, amount: number) => {
        if (socket) {
            const callMessage = user + ' calls ' + amount;
            sendLog(socket, callMessage);
            playerCall(socket);
        }
    };

    const handleCheck = (user: string | null) => {
        if (socket) {
            const checkMessage = user + ' checks';
            sendLog(socket, checkMessage);
            playerCheck(socket);
        }
    };

    const handleFold = (user: string | null) => {
        console.log(appState.game);
        if (socket) {
            const foldMessage = user + ' folds';
            sendLog(socket, foldMessage);
            playerFold(socket);
        }
    };

    if (!appState.game || appState.game.betting == false) {
        return (
            <Flex
                justifyContent={'end'}
                gap={3}
                p={2}
                height={180}
                overflow={'hidden'}
            />
        );
    }

    const action =
        appState.clientID === appState.game.players[appState.game.action].uuid;

    const player = appState.game.players[appState.game.action];
    const playerBets = appState.game.players.map((player) => player.bet);
    const maxBet = Math.max(...playerBets);

    const canCheck = player.bet >= maxBet;
    const canCall = maxBet - player.bet === 0;
    const callAmount =
        maxBet - player.bet < player.stack ? maxBet - player.bet : player.stack;

    return (
        <Flex
            justifyContent={'end'}
            gap={3}
            p={2}
            height={180}
            overflow={'hidden'}
        >
            <Flex gap={2} alignItems={'center'}>
                {showRaise ? (
                    <RaiseInputBox
                        action={action}
                        setShowRaise={setShowRaise}
                        showRaise={showRaise}
                    />
                ) : (
                    <>
                        <ActionButton
                            text={
                                canCall ? 'call' : 'call (' + callAmount + ')'
                            }
                            color="green"
                            clickHandler={() =>
                                handleCall(appState.username, callAmount)
                            }
                            isDisabled={!action || canCall}
                        />
                        <ActionButton
                            text={'Raise'}
                            color="green"
                            clickHandler={() => setShowRaise(true)}
                            isDisabled={!action}
                        />
                        <ActionButton
                            text={'Check'}
                            color="green"
                            clickHandler={() => handleCheck(appState.username)}
                            isDisabled={!action || !canCheck}
                        />
                        <ActionButton
                            text={'Fold'}
                            color="red"
                            clickHandler={() => handleFold(appState.username)}
                            isDisabled={!action}
                        />
                    </>
                )}
            </Flex>
        </Flex>
    );
};

export default Footer;
