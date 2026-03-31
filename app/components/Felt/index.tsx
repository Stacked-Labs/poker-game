import { Flex, Text } from '@chakra-ui/react';
import React, { useContext } from 'react';
import Pot from './Pot';
import CommunityCards from './CommunityCards';
import RITSecondBoard from './RITSecondBoard';
import RITConsentModal from './RITConsentModal';
import GameStatusBanner from '../GameStatusBanner';
import { AppContext } from '@/app/contexts/AppStoreProvider';

// ritPhase values: 0=None, 1=AwaitingConsent, 2=Board1, 3=Board2, 4=Concluded
const RIT_PHASE_BOARD2 = 3;

const Felt = ({ activePotIndex }: { activePotIndex: number | null }) => {
    const { appState } = useContext(AppContext);
    const game = appState.game;
    const stageLabel = game?.running
        ? game.stage === 2
            ? 'preflop'
            : 'postflop'
        : 'waiting';

    const showSecondBoard =
        game?.ritPhase !== undefined &&
        game.ritPhase >= RIT_PHASE_BOARD2 &&
        game.ritSecondBoard &&
        game.ritSecondBoard.length > 0;

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
                '@media (orientation: portrait)': {
                    width: '90%',
                },
            }}
            gap={{ base: 1, md: 2, lg: 3 }}
            direction="column"
        >
            <Flex
                data-testid="rit-board-1"
                width="100%"
                alignItems="center"
                justifyContent="center"
                gap={{ base: 1, md: 2, lg: 3 }}
            >
                <Pot activePotIndex={activePotIndex} />
                {showSecondBoard && (
                    <Text
                        data-testid="rit-board-1-label"
                        fontSize="2xs"
                        color="green.300"
                        fontWeight="bold"
                        whiteSpace="nowrap"
                    >
                        1
                    </Text>
                )}
                <CommunityCards activePotIndex={activePotIndex} />
            </Flex>
            {showSecondBoard && (
                <Flex
                    width="100%"
                    alignItems="center"
                    justifyContent="center"
                    gap={{ base: 1, md: 2, lg: 3 }}
                    data-testid="rit-board-2"
                >
                    <Text
                        data-testid="rit-board-2-label"
                        fontSize="2xs"
                        color="blue.300"
                        fontWeight="bold"
                        whiteSpace="nowrap"
                    >
                        2
                    </Text>
                    <RITSecondBoard />
                </Flex>
            )}
            <RITConsentModal />
            <GameStatusBanner />
        </Flex>
    );
};
export default Felt;
