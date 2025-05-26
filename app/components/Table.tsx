import React, { useContext, useEffect, useState } from 'react';
import {
    Flex,
    Grid,
    GridItem,
    Image,
    useBreakpointValue,
} from '@chakra-ui/react';
import EmptySeatButton from './EmptySeatButton';
import TakenSeatButton from './TakenSeatButton';
import { Player, Game as GameType } from '../interfaces';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { sendLog } from '../hooks/server_actions';
import { SocketContext } from '../contexts/WebSocketProvider';
import Felt from './Felt';

const initialPlayers: (Player | null)[] = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
];

const seatIndices = [
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'current',
];

const templateGridLarge = `"a one two three b"
                        "four felt felt felt five"
                        "six felt felt felt seven"
                        "c eight current nine d"`;

const templateGridSmall = `"a one b"
                        "two felt three"
                        "four felt five"
                        "six felt seven"
                        "eight current nine"`;

function getWinner(game: GameType) {
    const winnerNum = game.pots[game.pots.length - 1].winningPlayerNums[0];
    const winningPlayer = game.players.filter(
        (player) => player.position == winnerNum
    )[0];
    return winningPlayer;
}

function handleWinner(game: GameType | null, socket: WebSocket | null) {
    if (!game || !socket) {
        return null;
    }
    if (game && game.stage === 1 && game.pots.length !== 0) {
        const winningPlayer = getWinner(game);
        if (
            !winningPlayer ||
            !game.players.some((p) => p && p.uuid === winningPlayer.uuid)
        ) {
            console.log('Winning player was kicked or left the game.');
            return;
        }
        const pot = game.pots[game.pots.length - 1].amount;
        const message = winningPlayer.username + ' wins ' + pot;
        sendLog(socket, message);
    }
}

function getRevealedPlayers(game: GameType) {
    const revealedNums = game.pots[game.pots.length - 1].eligiblePlayerNums;
    // if only one player was eligible for the pot (everyone else folded), then they do not have to reveal
    if (revealedNums.length <= 1) {
        return [];
    }
    const revealedPlayers = game.players.filter((player) =>
        revealedNums.includes(player.position)
    );
    return revealedPlayers;
}

const Table = () => {
    const socket = useContext(SocketContext);
    const { appState } = useContext(AppContext);
    const [revealedPlayers, setRevealedPlayers] = useState<Player[]>([]);
    const [players, setPlayers] = useState(initialPlayers);
    const [winningPlayer, setWinningPlayer] = useState<Player | null>(null);

    const shouldRotate = useBreakpointValue({ base: true, md: false }) ?? false;

    // map game players to their visual seats
    useEffect(() => {
        if (!appState.game?.players) return;

        const updatedPlayers: (Player | null)[] = Array(10).fill(null);

        // Assign players to their correct seats
        appState.game.players.forEach((player) => {
            if (player.seatID >= 1 && player.seatID <= 10) {
                updatedPlayers[player.seatID - 1] = player;
            }
        });

        setPlayers([...updatedPlayers]);
    }, [appState.game?.players]);

    useEffect(() => {
        const game = appState.game;
        // this effect triggers when betting is over
        if (
            game &&
            game.stage === 1 &&
            game.pots.length !== 0 &&
            !game.betting
        ) {
            setRevealedPlayers(getRevealedPlayers(game));
            handleWinner(game, socket);

            // set winning player
            if (
                game.pots.length > 0 &&
                game.pots[game.pots.length - 1].winningPlayerNums.length > 0
            ) {
                const winner = getWinner(game);
                setWinningPlayer(winner);
            }

            const timer = setTimeout(() => {
                setRevealedPlayers([]);
                setWinningPlayer(null);
                if (socket) {
                    //dealGame(socket);
                }
            }, 5000);
            return () => {
                clearTimeout(timer);
            };
        }
    }, [appState.game?.dealer]);

    const isPlayerTurn = (player: Player): boolean => {
        if (
            !appState.game ||
            !appState.game.running ||
            !appState.game.betting
        ) {
            return false;
        }
        return player.position === appState.game.action;
    };

    const isPlayerWinner = (player: Player): boolean => {
        if (!winningPlayer) return false;
        return player.uuid === winningPlayer.uuid;
    };

    return (
        <Flex
            position={'relative'}
            justify={'center'}
            width={{
                base: '100vw',
                sm: '95vw',
                md: '90vw',
                lg: '80vw',
                xl: '70vw',
                '2xl': '70vw',
            }}
            height={{
                base: '100vh',
                md: '90vh',
                lg: '85vh',
                xl: '80vh',
            }}
            overflow="hidden"
        >
            <Image
                src={!shouldRotate ? '/table-horizontal.webp' : '/table-vertical.webp'}
                objectFit={'contain'}
                width={{
                    base: '95%',
                    sm: '90%',
                    md: '85%',
                    lg: '80%',
                }}
                height="100%"
            />
            <Grid
                px={{ base: 2, sm: 3, md: 4 }}
                py={{ base: 2, sm: 3, md: 4 }}
                position={'absolute'}
                width={'100%'}
                height={'100%'}
                top={0}
                left={0}
                templateAreas={!shouldRotate ? templateGridLarge : templateGridSmall}
                gridTemplateRows={
                    !shouldRotate 
                        ? 'repeat(4, 1fr)' 
                        : 'repeat(5, 1fr)'
                }
                gridTemplateColumns={
                    !shouldRotate 
                        ? 'repeat(5, 1fr)' 
                        : 'repeat(3, 1fr)'
                }
                gap={{ base: 2, sm: 3, md: 4 }}
                placeItems="center"
                justifyContent={'center'}
            >
                {players &&
                    seatIndices.map((gridIndex: string, index: number) => {
                        const player: Player | null = players[index];
                        const seatId = index + 1;
                        return (
                            <GridItem
                                key={index}
                                area={gridIndex}
                                display={'flex'}
                                justifyContent={'center'}
                                alignItems={
                                    shouldRotate
                                        ? seatId === 1
                                            ? 'end'
                                            : seatId === 10
                                                ? 'start'
                                                : 'center'
                                        : 'center'
                                }
                                width={'100%'}
                                height={'100%'}
                                transform={{
                                    base: shouldRotate && (seatId === 1 || seatId === 10) 
                                        ? 'scale(0.8)' 
                                        : 'none',
                                    md: 'none'
                                }}
                            >
                                {player && player !== null ? (
                                    <TakenSeatButton
                                        player={player}
                                        isCurrentTurn={isPlayerTurn(player)}
                                        isWinner={isPlayerWinner(player)}
                                    />
                                ) : (
                                    <EmptySeatButton
                                        seatId={seatId}
                                        disabled={
                                            appState.game?.players?.some(
                                                (player) =>
                                                    player.uuid === appState.clientID
                                            ) || appState.isSeatRequested
                                        }
                                    />
                                )}
                            </GridItem>
                        );
                    })}
                <GridItem
                    height={{ base: '60%', md: '50%' }}
                    width={{ base: '80%', md: '70%' }}
                    area={'felt'}
                    justifyContent={'center'}
                >
                    <Felt />
                </GridItem>
            </Grid>
        </Flex>
    );
};

export default Table;
