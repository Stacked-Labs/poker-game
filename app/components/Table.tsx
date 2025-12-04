import React, { useContext, useEffect, useRef, useState } from 'react';
import { Box, Flex, Grid, GridItem } from '@chakra-ui/react';
import EmptySeatButton from './EmptySeatButton';
import TakenSeatButton from './TakenSeatButton';
import { Player, Game as GameType } from '../interfaces';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '../contexts/WebSocketProvider';
import Felt from './Felt';
import { tableColors } from '../utils/tableColors';

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

const templateGridSmall = `"a six b"
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

function getWinner(game: GameType) {
    // For backward compatibility, return the first winner
    const winners = getWinners(game);
    return winners.length > 0 ? winners[0] : null;
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

const Table = () => {
    const socket = useContext(SocketContext);
    const { appState } = useContext(AppContext);
    const [revealedPlayers, setRevealedPlayers] = useState<Player[]>([]);
    const [players, setPlayers] = useState(initialPlayers);
    const [winningPlayers, setWinningPlayers] = useState<Player[]>([]);
    const [activePotIndex, setActivePotIndex] = useState<number | null>(null);
    const imageRef = React.useRef<HTMLImageElement>(null);
    const [imageDimensions, setImageDimensions] = useState({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
    });
    const [isGridReady, setIsGridReady] = useState(false);
    const potHighlightTimeouts = useRef<number[]>([]);
    const [tableColorKey, setTableColorKey] = useState<string>('green');
    const tableColorObj = tableColors[tableColorKey];

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

    useEffect(() => {
        if (imageDimensions.width > 0 && imageDimensions.height > 0) {
            setIsGridReady(true);
        }
    }, [imageDimensions.height, imageDimensions.width]);

    // Track actual rendered image dimensions
    useEffect(() => {
        const updateImageDimensions = () => {
            if (imageRef.current) {
                const img = imageRef.current;
                const rect = img.getBoundingClientRect();
                setImageDimensions({
                    width: rect.width,
                    height: rect.height,
                    top:
                        rect.top -
                        img.parentElement!.parentElement!.getBoundingClientRect()
                            .top,
                    left:
                        rect.left -
                        img.parentElement!.parentElement!.getBoundingClientRect()
                            .left,
                });
            }
        };

        updateImageDimensions();

        // Update on window resize
        window.addEventListener('resize', updateImageDimensions);

        // Use ResizeObserver for more accurate tracking
        const resizeObserver = new ResizeObserver(updateImageDimensions);
        if (imageRef.current) {
            resizeObserver.observe(imageRef.current);
        }

        return () => {
            window.removeEventListener('resize', updateImageDimensions);
            resizeObserver.disconnect();
        };
    }, []);

    // Use CSS media queries for orientation to avoid SSR/CSR mismatch

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
                (pot.winningHand && pot.winningHand.length > 0);
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
            if (pot.winningPlayerNums && pot.winningPlayerNums.length > 0) {
                if (pot.winningPlayerNums.includes(player.position)) {
                    const share =
                        pot.amount / Math.max(pot.winningPlayerNums.length, 1);
                    total += share;
                }
            }
        }
        return total;
    };

    // Build winning card set to be used by children for highlighting if needed
    // no-op local computation reserved for future selection logic

    return (
        <Flex
            className="table-container"
            position={'relative'}
            justify={'center'}
            width={{
                base: '100vw',
                lg: '80vw',
                xl: '70vw',
                '2xl': '70vw',
            }}
            height="100%"
            maxHeight="100%"
            maxWidth="100%"
            overflow="hidden"
            bg={'transparent'}
        >
            <Box
                as="picture"
                className="table-image"
                height="100%"
                width="auto"
                maxW="100%"
                maxH="100%"
            >
                <source
                    media="(orientation: portrait)"
                    srcSet={'/' + tableColorObj.vertical}
                />
                <img
                    ref={imageRef}
                    src={'/' + tableColorObj.horizontal}
                    alt="Poker table"
                    style={{
                        objectFit: 'contain',
                        height: '100%',
                        width: 'auto',
                        maxWidth: '100%',
                        maxHeight: '100%',
                    }}
                    onLoad={() => {
                        // Update dimensions immediately after image loads
                        if (imageRef.current) {
                            const img = imageRef.current;
                            const rect = img.getBoundingClientRect();
                            const containerRect =
                                img.parentElement!.parentElement!.getBoundingClientRect();
                            setImageDimensions({
                                width: rect.width,
                                height: rect.height,
                                top: rect.top - containerRect.top,
                                left: rect.left - containerRect.left,
                            });
                        }
                    }}
                />
            </Box>
            {!isGridReady && (
                <Box
                    position="absolute"
                    width="70vw"
                    maxWidth="100%"
                    aspectRatio={{ base: '3 / 4', md: '4 / 3', lg: '16 / 9' }}
                    bg="transparent"
                />
            )}
            {isGridReady && (
                <Grid
                    className="table-grid"
                    p={1}
                    position={'absolute'}
                    width={
                        imageDimensions.width
                            ? `${imageDimensions.width}px`
                            : '100%'
                    }
                    height={
                        imageDimensions.height
                            ? `${imageDimensions.height}px`
                            : '100%'
                    }
                    top={imageDimensions.top ? `${imageDimensions.top}px` : 0}
                    left={
                        imageDimensions.left ? `${imageDimensions.left}px` : 0
                    }
                    templateAreas={templateGridLarge}
                    gridTemplateRows={'repeat(4, minmax(0, 1fr))'}
                    gridTemplateColumns={'repeat(5, 1fr)'}
                    sx={{
                        '@media (orientation: portrait)': {
                            gridTemplateAreas: templateGridSmall,
                            gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                        },
                    }}
                    gap={{ base: 2, md: 2, lg: 4 }}
                    placeItems="center"
                    justifyContent={'center'}
                    opacity={isGridReady ? 1 : 0}
                    pointerEvents={isGridReady ? 'auto' : 'none'}
                    transition="opacity 0.2s ease-in-out"
                >
                    {players &&
                        seatIndices.map(({ id, value }) => {
                            const player: Player | null = players[value - 1];
                            return (
                                <GridItem
                                    key={value}
                                    className={`seat seat-${value}`}
                                    area={id}
                                    display={'flex'}
                                    justifyContent={'center'}
                                    alignItems={'center'}
                                    sx={{
                                        '@media (orientation: portrait)': {
                                            alignItems:
                                                value === 1
                                                    ? 'end'
                                                    : value === 10
                                                      ? 'top'
                                                      : 'center',
                                        },
                                    }}
                                    width={'100%'}
                                    height={'100%'}
                                >
                                    {player && player !== null ? (
                                        <TakenSeatButton
                                            player={player}
                                            isCurrentTurn={isPlayerTurn(player)}
                                            isWinner={isPlayerWinner(player)}
                                            isRevealed={isPlayerRevealed(
                                                player
                                            )}
                                            winnings={getPlayerWinnings(player)}
                                            activePotIndex={activePotIndex}
                                        />
                                    ) : (() => {
                                        const isDisabled =
                                            appState.game?.players?.some(
                                                (player) =>
                                                    player.uuid ===
                                                    appState.clientID
                                            ) ||
                                            appState.seatRequested != null;

                                        return isDisabled ? null : (
                                            <EmptySeatButton
                                                seatId={value}
                                                disabled={false}
                                            />
                                        );
                                    })()}
                                </GridItem>
                            );
                        })}
                    <GridItem
                        height={{ base: '100%', md: '70%', lg: '60%' }}
                        width={'80%'}
                        area={'felt'}
                        className="grid-felt"
                        justifyContent={'center'}
                    >
                        <Felt activePotIndex={activePotIndex} />
                    </GridItem>
                </Grid>
            )}
        </Flex>
    );
};

export default Table;
