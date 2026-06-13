'use client';

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import RaiseInputBox from './RaiseInputBox';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import type { AppState, Game, Player } from '@/app/interfaces';

// Minimal live-hand mock so the bet/raise controls render with it being the
// hero's turn. bb=70 deliberately makes BB amounts non-round (279/70 = 3.99…),
// which exercises the BB display rounding too.
const CLIENT_UUID = 'self-uuid';

const hero: Player = {
    username: 'hero.eth',
    uuid: CLIENT_UUID,
    address: '0x0000000000000000000000000000000000000He0',
    position: 1,
    seatID: 4,
    ready: true,
    in: true,
    called: false,
    left: false,
    totalBuyIn: 5_000,
    stack: 279,
    bet: 0,
    totalBet: 0,
    cards: [0, 0],
    isOnline: true,
};

const game: Game = {
    running: true,
    dealer: 2,
    action: 0,
    utg: 0,
    sb: 35,
    bb: 70,
    communityCards: [0, 0, 0, 0, 0],
    stage: 2,
    betting: true,
    config: { maxBuyIn: 10_000, bb: 70, sb: 35 },
    players: [hero],
    pots: [
        {
            topShare: 0,
            amount: 150,
            eligiblePlayerNums: [0],
            winningPlayerNums: [],
            winningScore: 0,
        },
    ],
    minRaise: 70,
    readyCount: 2,
    paused: false,
    actionDeadline: 0,
};

const makeAppState = (displayMode: AppState['displayMode']): AppState => ({
    messages: [],
    logs: [],
    username: 'hero.eth',
    clientID: CLIENT_UUID,
    address: hero.address,
    table: 'storybook-table',
    game,
    volume: 0,
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
    isTableOwner: null,
    settlementStatus: null,
    displayMode,
    tableClosed: null,
});

const mockSocket = {
    readyState: WebSocket.OPEN,
    send: () => {},
} as unknown as WebSocket;

function Harness({
    mode,
    width = '1100px',
}: {
    mode: AppState['displayMode'];
    width?: string;
}) {
    const [showRaise, setShowRaise] = useState(true);
    return (
        <AppContext.Provider
            value={{ appState: makeAppState(mode), dispatch: () => null }}
        >
            <SocketContext.Provider value={mockSocket}>
                {/* container-type lets the cqw units inside RaiseInputBox resolve,
                    exactly as the real footer container does. */}
                <Box
                    sx={{ containerType: 'inline-size' }}
                    width="100%"
                    maxW={width}
                    mx="auto"
                    mt="40px"
                    height="120px"
                    bg="#0B1430"
                    borderRadius="12px"
                    p="10px"
                >
                    <RaiseInputBox
                        isCurrentTurn
                        showRaise={showRaise}
                        setShowRaise={setShowRaise}
                    />
                </Box>
            </SocketContext.Provider>
        </AppContext.Provider>
    );
}

const meta = {
    title: 'Footer/RaiseInputBox',
    component: RaiseInputBox,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof RaiseInputBox>;

export default meta;
type Story = StoryObj<typeof meta>;

// Desktop/landscape: the Min · 1/2 · 3/4 · Pot · All In row should fill the
// width evenly (regression guard for the pot buttons not stretching).
export const LandscapeBB: Story = {
    name: 'Landscape · BB mode',
    render: () => <Harness mode="bb" />,
};

export const LandscapeChips: Story = {
    name: 'Landscape · Chips mode',
    render: () => <Harness mode="chips" />,
};

// Narrower desktop width — buttons still distribute evenly without clumping.
export const LandscapeNarrow: Story = {
    name: 'Landscape · narrower width',
    render: () => <Harness mode="bb" width="760px" />,
};
