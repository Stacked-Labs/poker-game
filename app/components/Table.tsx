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
import { sendLog, dealGame } from '../hooks/server_actions';
import { SocketContext } from '../contexts/WebSocketProvider';
import Felt from './Felt';

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
                        "two c three"
                        "four d five"
                        "felt felt felt"
                        "six e seven"
                        "eight f nine"
                        "g current h"`;

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

type tableProps = {
    players: (Player | null)[];
    setPlayers: React.Dispatch<React.SetStateAction<(Player | null)[]>>;
};

const Table = ({ players, setPlayers }: tableProps) => {
    const socket = useContext(SocketContext);
    const { appState, dispatch } = useContext(AppContext);
    const [revealedPlayers, setRevealedPlayers] = useState<Player[]>([]);
    const game = appState.game;

    const shouldRotate = useBreakpointValue({ base: true, md: false }) ?? false;

    // map game players to their visual seats
    useEffect(() => {
        const updatedPlayers: (Player | null)[] = [...players];
        if (game?.players == null) {
            return;
        }
        for (let i = 0; i < game.players.length; i++) {
            updatedPlayers[game.players[i].seatID - 1] = game.players[i];
        }

        setPlayers(updatedPlayers);
    }, [game?.players]);

    useEffect(() => {
        // this effect triggers when betting is over
        if (game && game.stage === 1 && game.pots.length !== 0) {
            setRevealedPlayers(getRevealedPlayers(game));
            handleWinner(game, socket);
            const timer = setTimeout(() => {
                setRevealedPlayers([]);
                if (socket) {
                    dealGame(socket);
                }
            }, 5000);
            return () => {
                clearTimeout(timer);
            };
        }
    }, [game?.pots]);

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
                        ? '/table-horizontal.png'
                        : '/table-vertical.png'
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
                {seatIndices.map((gridIndex: string, index: number) => {
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
                                    ? seatId == 1
                                        ? 'end'
                                        : seatId == 10
                                          ? 'top'
                                          : 'center'
                                    : 'center'
                            }
                            width={'100%'}
                            height={'100%'}
                        >
                            {player && player !== null ? (
                                <TakenSeatButton player={player} />
                            ) : (
                                <EmptySeatButton
                                    seatId={seatId}
                                    disabled={false}
                                />
                            )}
                        </GridItem>
                    );
                })}
            </Grid>
        </Flex>
    );
};

export default Table;
