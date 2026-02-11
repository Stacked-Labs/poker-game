'use client'

import React, { useContext, useEffect, useRef, useState } from 'react';
import { Box, Flex, Grid, GridItem } from '@chakra-ui/react';
import EmptySeatButton from './EmptySeatButton';
import TakenSeatButton from './TakenSeatButton';
import { Player, Game as GameType } from '../interfaces';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '../contexts/WebSocketProvider';
import Felt from './Felt';
import SettlementBanner from './SettlementBanner';
import { tableColors } from '../utils/tableColors';
import { isTableExisting } from '../hooks/server_actions';
import useToastHelper from '../hooks/useToastHelper';
import { useRouter } from 'next/navigation';

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

const SEAT_COUNT = 10;

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

const templateGridLandscape = `"a five six seven b"
                        "four felt felt felt eight"
                        "three felt felt felt nine"
                        "c two one ten d"`;

const templateGridPortrait = `"a six b"
                        "five c seven"
                        "four d eight"
                        "felt felt felt"
                        "three e nine"
                        "two f ten"
                        "g one h"`;

function getWinners(game: GameType): Player[] {
    const winners: Player[] = [];

    // Get all winners from all pots
    game.pots.forEach((pot) => {
        if (pot.winningPlayerNums.length > 0) {
            pot.winningPlayerNums.forEach((winnerNum) => {
                const winningPlayer = game.players.find(
                    (player) => player.position === winnerNum
                );
                if (
                    winningPlayer &&
                    !winners.some((w) => w.uuid === winningPlayer.uuid)
                ) {
                    winners.push(winningPlayer);
                }
            });
        }
    });

    return winners;
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

const SHOWDOWN_SPOTLIGHT_DURATION = 8000;

const Table = ({ tableId }: { tableId: string }) => {
    const socket = useContext(SocketContext);
    const { appState, dispatch } = useContext(AppContext);
    const [revealedPlayers, setRevealedPlayers] = useState<Player[]>([]);
    const [players, setPlayers] = useState(initialPlayers);
    const [winningPlayers, setWinningPlayers] = useState<Player[]>([]);
    const [activePotIndex, setActivePotIndex] = useState<number | null>(null);
    const potHighlightTimeouts = useRef<number[]>([]);
    const [tableColorKey, setTableColorKey] = useState<string>('green');
    const tableColorObj = tableColors[tableColorKey];
    const router = useRouter();
    const toast = useToastHelper();
    const [tableStatus, setTableStatus] = useState<'checking' | 'success'>(
        'checking'
    );

    const clearPotHighlightTimers = () => {
        potHighlightTimeouts.current.forEach((timeout) => {
            clearTimeout(timeout);
        });
        potHighlightTimeouts.current = [];
    };

    useEffect(() => {
        const initialKey = localStorage.getItem('tableColorKey') || 'green';
        setTableColorKey(initialKey);

        const onStorage = () => {
            const key = localStorage.getItem('tableColorKey') || 'green';
            setTableColorKey(key);
        };

        window.addEventListener('storage', onStorage);
        window.addEventListener('tableColorChanged', onStorage);

        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('tableColorChanged', onStorage);
        };
    }, []);

    // map game players to their visual seats
    useEffect(() => {
        if (!appState.game?.players) return;

        const updatedPlayers: (Player | null)[] = Array(SEAT_COUNT).fill(null);

        // Assign players to their correct seats
        appState.game.players.forEach((player) => {
            if (player.seatID >= 1 && player.seatID <= SEAT_COUNT) {
                updatedPlayers[player.seatID - 1] = player;
            }
        });

        setPlayers([...updatedPlayers]);
    }, [appState.game?.players]);

    useEffect(() => {
        const game = appState.game;

        // Clear winners immediately if game conditions indicate we should reset
        if (
            !game ||
            !game.running ||
            (game.stage === 2 && game.betting) ||
            game.pots.length === 0
        ) {
            setWinningPlayers([]);
            setRevealedPlayers([]);
            return;
        }

        // Show winners when hand is over
        if (game.stage === 1 && game.pots.length !== 0 && !game.betting) {
            setRevealedPlayers(getRevealedPlayers(game));

            // set winning players
            const winners = getWinners(game);
            setWinningPlayers(winners);

            const timer = setTimeout(() => {
                setRevealedPlayers([]);
                setWinningPlayers([]);
                if (socket) {
                    //dealGame(socket);
                }
            }, 6500);
            return () => {
                clearTimeout(timer);
            };
        }
    }, [
        appState.game?.stage,
        appState.game?.betting,
        appState.game?.pots,
        appState.game?.running,
        appState.game,
        socket,
    ]);

    useEffect(() => {
        const game = appState.game;
        clearPotHighlightTimers();

        if (
            !game ||
            !game.running ||
            game.stage !== 1 ||
            game.betting ||
            !game.pots ||
            game.pots.length === 0
        ) {
            setActivePotIndex(null);
            return;
        }

        const indices: number[] = [];
        for (let i = game.pots.length - 1; i >= 0; i--) {
            const pot = game.pots[i];
            const hasWinner =
                (pot.winningPlayerNums && pot.winningPlayerNums.length > 0) ||
                pot.winners?.some((w) => (w.winningHand?.length ?? 0) > 0) ||
                (pot.winners?.length ?? 0) > 0;
            if (hasWinner) {
                indices.push(i);
            }
        }

        if (indices.length === 0) {
            setActivePotIndex(0);
            return;
        }

        const stepDuration = SHOWDOWN_SPOTLIGHT_DURATION / indices.length;

        indices.forEach((potIdx, sequenceIdx) => {
            const timeout = window.setTimeout(() => {
                setActivePotIndex(potIdx);
            }, sequenceIdx * stepDuration);
            potHighlightTimeouts.current.push(timeout);
        });

        const finalTimeout = window.setTimeout(() => {
            setActivePotIndex(0);
        }, SHOWDOWN_SPOTLIGHT_DURATION);
        potHighlightTimeouts.current.push(finalTimeout);

        return () => {
            clearPotHighlightTimers();
        };
    }, [
        appState.game?.stage,
        appState.game?.betting,
        appState.game?.pots,
        appState.game?.running,
    ]);

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
        return winningPlayers.some((winner) => winner.uuid === player.uuid);
    };

    const isPlayerRevealed = (player: Player): boolean => {
        return revealedPlayers.some((p) => p.uuid === player.uuid);
    };

    const getPlayerWinnings = (player: Player): number => {
        const game = appState.game;
        if (
            !game ||
            game.pots.length === 0 ||
            game.betting ||
            game.stage !== 1
        ) {
            return 0;
        }
        let total = 0;
        for (const pot of game.pots) {
            const winner = pot.winners?.find(
                (w) => w.playerNum === player.position
            );
            if (winner) {
                total += winner.share;
                continue;
            }
            if (
                pot.winningPlayerNums &&
                pot.winningPlayerNums.includes(player.position)
            ) {
                total += pot.amount / Math.max(pot.winningPlayerNums.length, 1);
            }
        }
        return total;
    };

    useEffect(() => {
        const verifyAndJoinTable = async () => {
            if (tableId) {
                try {
                    const result = await isTableExisting(tableId);
                    if (result.status === 'success') {
                        dispatch({ type: 'setTablename', payload: tableId });
                        setTableStatus('success');
                    } else {
                        await new Promise((resolve) =>
                            setTimeout(resolve, 5000)
                        );
                        router.push('/create-game');
                    }
                } catch (error) {
                    console.error('Error checking table existence:', error);
                    toast.error('Table does not exist.');
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                    router.push('/create-game');
                }
            }
        };

        verifyAndJoinTable();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableId]);

    const povAnchorSeatId = (() => {
        const clientId = appState.clientID;
        const seatedPlayer = clientId
            ? appState.game?.players?.find((p) => p.uuid === clientId)
            : undefined;
        const seatId = seatedPlayer?.seatID;
        return seatId && seatId >= 1 && seatId <= SEAT_COUNT ? seatId : null;
    })();

    const getActualSeatIdForVisualSeat = (visualSeatId: number): number => {
        if (!povAnchorSeatId) return visualSeatId;
        return ((povAnchorSeatId + (visualSeatId - 1) - 1) % SEAT_COUNT) + 1;
    };

    return (
        <Flex
            className="table-container"
            position="relative"
            justify="center"
            align="center"
            width="100%"
            py={'2%'}
            height="100%"
            flex={1}
            overflow="hidden"
            bg="transparent"
        >
            {/* Table image - switches via CSS media query */}
            <Box
                as="picture"
                height="100%"
                width="100%"
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                <source
                    media="(orientation: portrait)"
                    srcSet={'/' + tableColorObj.vertical}
                />
                <Box
                    as="img"
                    src={'/' + tableColorObj.horizontal}
                    alt="Poker table"
                    height="100%"
                    width="100%"
                    objectFit="contain"
                />
            </Box>

            {/* Grid overlay - fills container and manages its own padding */}
            <Grid
                className="table-grid"
                position="absolute"
                inset={0}
                py="2%"
                mx="auto"
                width="80%"
                templateAreas={templateGridLandscape}
                gridTemplateRows="repeat(4, 1fr)"
                gridTemplateColumns="repeat(5, 1fr)"
                gap="3%"
                sx={{
                    '@media (orientation: portrait)': {
                        width: '100%',
                        gap: '1%',
                        gridTemplateAreas: templateGridPortrait,
                        gridTemplateRows: 'repeat(7, 1fr)',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                    },
                }}
                placeItems="center"
                justifyContent="center"
            >
                {players &&
                    seatIndices.map(({ id, value }) => {
                        const actualSeatId = getActualSeatIdForVisualSeat(value);
                        const player: Player | null = players[actualSeatId - 1];
                        return (
                            <GridItem
                                key={value}
                                className={`seat seat-${value}`}
                                area={id}
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                sx={{
                                    '@media (orientation: portrait)': {
                                        alignItems:
                                            value === 1
                                                ? 'end'
                                                : value === 10
                                                  ? 'start'
                                                  : 'center',
                                    },
                                }}
                                width="100%"
                                height="100%"
                            >
                                {player && player !== null ? (
                                    <TakenSeatButton
                                        player={player}
                                        visualSeatId={value}
                                        isCurrentTurn={isPlayerTurn(player)}
                                        isWinner={isPlayerWinner(player)}
                                        isRevealed={isPlayerRevealed(player)}
                                        winnings={getPlayerWinnings(player)}
                                        activePotIndex={activePotIndex}
                                    />
                                ) : (
                                    (() => {
                                        const isDisabled =
                                            appState.game?.players?.some(
                                                (player) =>
                                                    player.uuid ===
                                                    appState.clientID
                                            ) || appState.seatRequested != null;

                                        return isDisabled ? null : (
                                            <EmptySeatButton
                                                seatId={actualSeatId}
                                                disabled={false}
                                            />
                                        );
                                    })()
                                )}
                            </GridItem>
                        );
                    })}
                <GridItem
                    height="100%"
                    width="80%"
                    area="felt"
                    className="grid-felt"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Felt activePotIndex={activePotIndex} />
                </GridItem>
            </Grid>
            <SettlementBanner />
        </Flex>
    );
};

export default Table;
