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
    { id: 'one', value: 1 },
    { id: 'two', value: 2 },
    { id: 'three', value: 3 },
    { id: 'four', value: 4 },
    { id: 'five', value: 5 },
    { id: 'six', value: 6 },
    { id: 'seven', value: 7 },
    { id: 'eight', value: 8 },
    { id: 'nine', value: 9 },
    { id: 'ten', value: 10 },
];

const templateGridLarge = `"a five six seven b"
                        "four felt felt felt eight"
                        "three felt felt felt nine"
                        "c two one ten d"`;

const templateGridSmall = `"a one b"
                        "two c three"
                        "four d five"
                        "felt felt felt"
                        "six e seven"
                        "eight f nine"
                        "g ten h"`;

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
                lg: '80vw',
                xl: '70vw',
                '2xl': '70vw',
            }}
        >
            <Image
                src={
                    !shouldRotate
                        ? '/table-horizontal.webp'
                        : '/table-vertical.webp'
                }
                objectFit={'contain'}
                width={'80%'}
            />
            <Grid
                px={4}
                py={4}
                position={'absolute'}
                width={'100%'}
                height={'100%'}
                top={0}
                left={0}
                templateAreas={
                    !shouldRotate ? templateGridLarge : templateGridSmall
                }
                gridTemplateRows={
                    !shouldRotate ? 'repeat(4, 1fr)' : 'repeat(7, 1fr)'
                }
                gridTemplateColumns={
                    !shouldRotate ? 'repeat(5, 1fr)' : 'repeat(3, 1fr)'
                }
                gap={4}
                placeItems="center"
                justifyContent={'center'}
            >
                {players &&
                    seatIndices.map(({ id, value }) => {
                        const player: Player | null = players[value - 1];
                        return (
                            <GridItem
                                key={value}
                                area={id}
                                display={'flex'}
                                justifyContent={'center'}
                                alignItems={
                                    shouldRotate
                                        ? value === 1
                                            ? 'end'
                                            : value === 10
                                              ? 'top'
                                              : 'center'
                                        : 'center'
                                }
                                width={'100%'}
                                height={'100%'}
                            >
                                {player && player !== null ? (
                                    <TakenSeatButton
                                        player={player}
                                        isCurrentTurn={isPlayerTurn(player)}
                                        isWinner={isPlayerWinner(player)}
                                    />
                                ) : (
                                    <EmptySeatButton
                                        seatId={value}
                                        disabled={
                                            appState.game?.players?.some(
                                                (player) =>
                                                    player.uuid ===
                                                    appState.clientID
                                            ) || appState.isSeatRequested
                                        }
                                    />
                                )}
                            </GridItem>
                        );
                    })}
                <GridItem
                    height={'50%'}
                    width={'70%'}
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
