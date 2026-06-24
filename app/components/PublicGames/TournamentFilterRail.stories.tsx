import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { useState } from 'react';
import TournamentFilterRail, {
    type PlayFilter,
    type SpeedFilter,
    type StatusFilter,
    type TournamentSort,
} from './TournamentFilterRail';

const meta = {
    title: 'PublicGames/TournamentFilterRail',
    component: TournamentFilterRail,
    parameters: { nextjs: { appDirectory: true } },
    decorators: [
        (Story) => (
            <Box bg="card.lightGray" p={{ base: 4, md: 8 }} maxW="760px">
                <Story />
            </Box>
        ),
    ],
} satisfies Meta<typeof TournamentFilterRail>;

export default meta;
type Story = StoryObj<typeof meta>;

function Interactive() {
    const [status, setStatus] = useState<StatusFilter>('all');
    const [play, setPlay] = useState<PlayFilter>('all');
    const [speed, setSpeed] = useState<SpeedFilter>('all');
    const [sort, setSort] = useState<TournamentSort>('soon');
    return (
        <TournamentFilterRail
            status={status}
            onStatus={setStatus}
            play={play}
            onPlay={setPlay}
            speed={speed}
            onSpeed={setSpeed}
            sort={sort}
            onSort={setSort}
            resultCount={12}
        />
    );
}

export const Default: Story = {
    render: () => <Interactive />,
};

// A filtered view: USDC + Turbo active, sorted by biggest GTD.
export const Filtered: Story = {
    args: {
        status: 'open',
        onStatus: () => {},
        play: 'real',
        onPlay: () => {},
        speed: 'turbo',
        onSpeed: () => {},
        sort: 'gtd',
        onSort: () => {},
        resultCount: 4,
    },
};
