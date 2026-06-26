import { Flex } from '@chakra-ui/react';
import React, { useContext } from 'react';
import Pot from './Pot';
import CommunityCards from './CommunityCards';
import AnteChip from './AnteChip';
import DualBoardCommunityCards from './DualBoardCommunityCards';
import RunItTwiceWaiting from './RunItTwiceWaiting';
import GameStatusBanner from '../GameStatusBanner';
import { AppContext } from '@/app/contexts/AppStoreProvider';

const Felt = ({ activePotIndex }: { activePotIndex: number | null }) => {
    const { appState } = useContext(AppContext);
    const game = appState.game;
    const ritPhase = game?.ritPhase ?? 0;
    const showDualBoard = ritPhase >= 2;
    const stageLabel = game?.running
        ? game.stage === 2
            ? 'preflop'
            : 'postflop'
        : 'waiting';

    return (
        <Flex
            data-testid="game-stage"
            data-stage={stageLabel}
            className="felt-container"
            height={'auto'}
            width={'100%'}
            alignItems={'center'}
            justifyContent={'center'}
            position={'relative'}
            sx={{
                // Query container so the absolutely-positioned Pot / AnteChip can
                // size in `cqw` (% of felt width) and scale with the community
                // cards instead of stepping at viewport breakpoints.
                containerType: 'inline-size',
                '@media (orientation: portrait)': {
                    width: '90%',
                },
            }}
            gap={{ base: 1, md: 2, lg: 3 }}
        >
            <Pot activePotIndex={activePotIndex} />
            {showDualBoard ? (
                <DualBoardCommunityCards activePotIndex={activePotIndex} />
            ) : (
                <CommunityCards activePotIndex={activePotIndex} />
            )}
            <AnteChip />
            <RunItTwiceWaiting />
            <GameStatusBanner />
        </Flex>
    );
};
export default Felt;
