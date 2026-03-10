'use client';

/**
 * MockSocketProvider — dev-only drop-in replacement for SocketProvider.
 *
 * Provides:
 *   - A null WebSocket (SocketContext = null, all socket.send() calls are no-ops)
 *   - Real AppContext dispatch calls that inject mock game state
 *   - A fixed floating control panel for switching scenarios/POV/display mode
 *
 * Used at: /table/ui-test
 */

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Box, Flex, Text, Button, HStack } from '@chakra-ui/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import {
    SCENARIOS,
    SCENARIO_KEYS,
    PLAYER_IDS,
    type ScenarioKey,
} from './mockData';
import type { DisplayMode } from '@/app/interfaces';

export default function MockSocketProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { dispatch } = useContext(AppContext);

    const [scenarioKey, setScenarioKey] = useState<ScenarioKey>('preflop');
    const [yourSeat, setYourSeat] = useState(1);
    const [displayMode, setDisplayModeState] = useState<DisplayMode>('chips');

    const game = SCENARIOS[scenarioKey].game;

    // Seats occupied in the current scenario
    const occupiedSeats = useMemo(
        () => new Set(game.players.map((p) => p.seatID)),
        [game.players]
    );

    // clientId follows seat selection so POV rotation updates in Table.tsx
    const clientId = useMemo(
        () => game.players.find((p) => p.seatID === yourSeat)?.uuid ?? PLAYER_IDS[0],
        [game.players, yourSeat]
    );

    // Push mock game state into the real AppContext whenever anything changes
    useEffect(() => {
        dispatch({ type: 'updatePlayerID', payload: clientId });
        dispatch({ type: 'setTablename', payload: 'ui-test' });
        dispatch({ type: 'updateGame', payload: game });
    }, [dispatch, game, clientId]);

    useEffect(() => {
        dispatch({ type: 'setDisplayMode', payload: displayMode });
    }, [dispatch, displayMode]);

    const handleScenarioChange = (key: ScenarioKey) => {
        setScenarioKey(key);
        setYourSeat(1);
    };

    return (
        <SocketContext.Provider value={null}>
            {children}

            {/* ── Floating dev control panel ──────────────────────────────── */}
            <Box
                position="fixed"
                bottom={3}
                left="50%"
                transform="translateX(-50%)"
                zIndex={9999}
                bg="rgba(8, 15, 38, 0.95)"
                border="1px solid rgba(255,255,255,0.1)"
                borderRadius="12px"
                px={3}
                py={2}
                boxShadow="0 8px 32px rgba(0,0,0,0.6)"
                sx={{ backdropFilter: 'blur(10px)' }}
                pointerEvents="auto"
            >
                <Flex align="center" gap={3} flexWrap="nowrap">

                    {/* Scenarios */}
                    <HStack spacing={1}>
                        {SCENARIO_KEYS.map((key) => (
                            <Button
                                key={key}
                                size="xs"
                                h="22px"
                                px={2}
                                fontSize="10px"
                                variant={scenarioKey === key ? 'solid' : 'ghost'}
                                colorScheme={scenarioKey === key ? 'yellow' : 'whiteAlpha'}
                                color={scenarioKey === key ? 'brand.navy' : 'whiteAlpha.600'}
                                fontWeight={scenarioKey === key ? 'bold' : 'normal'}
                                onClick={() => handleScenarioChange(key)}
                                _hover={{ bg: 'whiteAlpha.100' }}
                            >
                                {SCENARIOS[key].label}
                            </Button>
                        ))}
                    </HStack>

                    <Box w="1px" h="16px" bg="whiteAlpha.200" flexShrink={0} />

                    {/* Display mode */}
                    <HStack spacing={1}>
                        {(['chips', 'bb', 'usdc'] as DisplayMode[]).map((m) => (
                            <Button
                                key={m}
                                size="xs"
                                h="22px"
                                px={2}
                                fontSize="9px"
                                textTransform="uppercase"
                                letterSpacing="wide"
                                variant={displayMode === m ? 'solid' : 'ghost'}
                                colorScheme={displayMode === m ? 'blue' : 'whiteAlpha'}
                                color={displayMode === m ? 'white' : 'whiteAlpha.500'}
                                onClick={() => setDisplayModeState(m)}
                                _hover={{ bg: 'whiteAlpha.100' }}
                            >
                                {m}
                            </Button>
                        ))}
                    </HStack>

                    <Box w="1px" h="16px" bg="whiteAlpha.200" flexShrink={0} />

                    {/* POV seat selector */}
                    <HStack spacing={1} align="center">
                        <Text
                            fontSize="9px"
                            color="whiteAlpha.400"
                            letterSpacing="wider"
                            textTransform="uppercase"
                            whiteSpace="nowrap"
                            flexShrink={0}
                        >
                            POV
                        </Text>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((seat) => {
                            const occupied = occupiedSeats.has(seat);
                            return (
                                <Button
                                    key={seat}
                                    size="xs"
                                    h="22px"
                                    minW="22px"
                                    px={0}
                                    fontSize="9px"
                                    variant={yourSeat === seat ? 'solid' : 'ghost'}
                                    colorScheme={yourSeat === seat ? 'green' : 'whiteAlpha'}
                                    color={yourSeat === seat ? 'white' : 'whiteAlpha.400'}
                                    isDisabled={!occupied}
                                    onClick={() => setYourSeat(seat)}
                                    opacity={occupied ? 1 : 0.25}
                                    _hover={occupied ? { bg: 'whiteAlpha.100' } : {}}
                                    _disabled={{ opacity: 0.25, cursor: 'default' }}
                                >
                                    {seat}
                                </Button>
                            );
                        })}
                    </HStack>

                    <Box w="1px" h="16px" bg="whiteAlpha.200" flexShrink={0} />

                    {/* Label */}
                    <Text
                        fontSize="8px"
                        color="whiteAlpha.300"
                        letterSpacing="widest"
                        textTransform="uppercase"
                        whiteSpace="nowrap"
                        flexShrink={0}
                    >
                        UI Test
                    </Text>
                </Flex>
            </Box>
        </SocketContext.Provider>
    );
}
