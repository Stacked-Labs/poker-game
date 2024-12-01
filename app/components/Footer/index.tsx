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
import useAudio from '@/app/hooks/useAudio';

const Footer = () => {
    const socket = useContext(SocketContext);
    const { appState } = useContext(AppContext);
    const [showRaise, setShowRaise] = useState<boolean>(false);

    // Initialize audio using useAudio hook
    const { play: playFlip, setVolume: setVolumeFlip } = useAudio(
        '/sound/card_flip_1.mp3',
        appState.volume
    );
    const { play: playCheck, setVolume: setVolumeCheck } = useAudio(
        '/sound/check_1.mp3',
        appState.volume
    );
    const { play: playChips, setVolume: setVolumeChips } = useAudio(
        '/sound/chips_1.mp3',
        appState.volume
    );
    const { play: playRaise, setVolume: setVolumeRaise } = useAudio(
        '/sound/chips_allin.mp3',
        appState.volume
    );

    useEffect(() => {
        setVolumeFlip(appState.volume);
        setVolumeCheck(appState.volume);
        setVolumeChips(appState.volume);
        setVolumeRaise(appState.volume);
    }, [
        appState.volume,
        setVolumeFlip,
        setVolumeCheck,
        setVolumeChips,
        setVolumeRaise,
    ]);

    const handleCall = (user: string | null, amount: number) => {
        if (socket) {
            const callMessage = `${user} calls ${amount}`;
            sendLog(socket, callMessage);
            playerCall(socket);
            console.log(appState.volume);
            playChips();
        }
    };

    const handleCheck = (user: string | null) => {
        if (socket) {
            const checkMessage = `${user} checks`;
            sendLog(socket, checkMessage);
            playerCheck(socket);
            console.log(appState.volume);
            playCheck();
        }
    };

    const handleFold = (user: string | null) => {
        if (socket) {
            const foldMessage = `${user} folds`;
            sendLog(socket, foldMessage);
            playerFold(socket);
            console.log(appState.volume);
            playFlip();
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
            <Flex
                gap={2}
                alignItems={'center'}
                width={{ base: '100%', md: 'fit-content' }}
            >
                {showRaise ? (
                    <RaiseInputBox
                        action={action}
                        setShowRaise={setShowRaise}
                        showRaise={showRaise}
                        raiseSound={playRaise}
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
