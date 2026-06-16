'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Button, HStack, useColorMode } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThirdwebProvider } from 'thirdweb/react';
import TableMenuBurger from './TableMenuBurger';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { SoundContext } from '@/app/contexts/SoundProvider';
import { AuthContext } from '@/app/contexts/AuthContext';
import type { AppState, Game, Player } from '@/app/interfaces';

const queryClient = new QueryClient();

const CLIENT_UUID = 'self-uuid';

const basePlayer: Player = {
    username: 'alice.eth',
    uuid: CLIENT_UUID,
    address: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
    position: 1,
    seatID: 4,
    ready: true,
    in: true,
    called: false,
    left: false,
    totalBuyIn: 5_000,
    stack: 4_200,
    bet: 0,
    totalBet: 0,
    cards: [0, 0],
    isOnline: true,
};

const baseGame: Game = {
    running: true,
    dealer: 2,
    action: 1,
    utg: 1,
    sb: 0,
    bb: 1,
    communityCards: [0, 0, 0, 0, 0],
    stage: 0,
    betting: true,
    config: {
        maxBuyIn: 10_000,
        bb: 20,
        sb: 10,
        crypto: true,
        contractAddress: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
        chain: 'base-sepolia',
    },
    players: [basePlayer],
    pots: [],
    minRaise: 40,
    readyCount: 4,
    paused: false,
    actionDeadline: 0,
};

const baseAppState: AppState = {
    messages: [],
    logs: [],
    username: 'alice.eth',
    clientID: CLIENT_UUID,
    address: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
    table: 'storybook-table',
    game: baseGame,
    volume: 0.5,
    chatSoundEnabled: false,
    chatOverlayEnabled: false,
    fourColorDeckEnabled: false,
    cardBackDesign: 'classic-blue',
    unreadMessageCount: 0,
    isChatOpen: false,
    seatRequested: null,
    seatAccepted: null,
    pendingPlayers: [],
    showSeatRequestPopups: false,
    isSettingsOpen: false,
    blindObligation: null,
    isTableOwner: true,
    settlementStatus: null,
    displayMode: 'chips',
    tableClosed: null,
};

const mockSocket = {
    readyState: WebSocket.OPEN,
    send: () => {},
} as unknown as WebSocket;

const mockSound = {
    play: () => {},
    stop: () => {},
    isReady: () => false,
};

const defaultAuth = {
    isAuthenticated: false,
    isAuthenticating: false,
    userAddress: null,
    lastAuthenticatedAddress: null,
    xUsername: null,
    xProfileImageUrl: null,
    requestAuthentication: () => {},
    refreshAuthStatus: async () => {},
    refreshXStatus: async () => {},
};

const ColorModeToggle = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    return (
        <HStack position="fixed" top={4} left={4} zIndex={9999}>
            <Button size="xs" onClick={toggleColorMode}>
                {colorMode} → toggle
            </Button>
        </HStack>
    );
};

const meta = {
    title: 'NavBar/TableMenuBurger',
    component: TableMenuBurger,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Portrait-only burger menu rendered over the table felt. Each chip should read clearly against the felt without relying on a surrounding container — verify in both color modes.',
            },
        },
    },
    decorators: [
        (Story) => (
            <QueryClientProvider client={queryClient}>
                <ThirdwebProvider>
                    <AuthContext.Provider value={defaultAuth}>
                        <AppContext.Provider
                            value={{
                                appState: baseAppState,
                                dispatch: () => null,
                            }}
                        >
                            <SoundContext.Provider value={mockSound}>
                                <SocketContext.Provider value={mockSocket}>
                                    {/* Simulate the table felt */}
                                    <Box
                                        minH="100vh"
                                        width="100%"
                                        bgGradient="radial(circle at 50% 35%, #1a3a2e 0%, #0d1f17 80%)"
                                        position="relative"
                                        p={4}
                                    >
                                        <ColorModeToggle />
                                        <Box
                                            position="absolute"
                                            top={4}
                                            right={4}
                                            sx={{
                                                // Force visible in landscape too so
                                                // the story isn't empty on desktop review.
                                                '.table-menu-burger': {
                                                    display:
                                                        'block !important',
                                                },
                                            }}
                                        >
                                            <Story />
                                        </Box>
                                    </Box>
                                </SocketContext.Provider>
                            </SoundContext.Provider>
                        </AppContext.Provider>
                    </AuthContext.Provider>
                </ThirdwebProvider>
            </QueryClientProvider>
        ),
    ],
    args: {
        isUserSeated: true,
        isAway: false,
    },
    argTypes: {
        isUserSeated: { control: 'boolean' },
        isAway: { control: 'boolean' },
    },
} satisfies Meta<typeof TableMenuBurger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Seated: Story = {};

export const Spectator: Story = {
    args: { isUserSeated: false, isAway: false },
};

export const Away: Story = {
    args: { isUserSeated: true, isAway: true },
};
