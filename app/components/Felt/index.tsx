import { Badge, Flex, Text } from '@chakra-ui/react';
import React, { useContext } from 'react';
import Pot from './Pot';
import CommunityCards from './CommunityCards';
import RITSecondBoard from './RITSecondBoard';
import GameStatusBanner from '../GameStatusBanner';
import { AppContext } from '@/app/contexts/AppStoreProvider';

// ritPhase values: 0=None, 1=AwaitingConsent, 2=Board1, 3=Board2, 4=Concluded
const RIT_PHASE_BOARD1    = 2;
const RIT_PHASE_BOARD2    = 3;
const RIT_PHASE_CONCLUDED = 4;

const Felt = ({ activePotIndex }: { activePotIndex: number | null }) => {
    const { appState } = useContext(AppContext);
    const game = appState.game;
    const stageLabel = game?.running
        ? game.stage === 2
            ? 'preflop'
            : 'postflop'
        : 'waiting';

    // Board-1 label + badge appear while board 1 is running (phase 2+).
    const showBoardLabels =
        game?.ritPhase !== undefined &&
        game.ritPhase >= RIT_PHASE_BOARD1 &&
        game.ritPhase <= RIT_PHASE_CONCLUDED;

    // const showSecondBoard =
    //     game?.ritPhase !== undefined &&
    //     game.ritPhase >= RIT_PHASE_BOARD2 &&
    //     game.ritPhase <= RIT_PHASE_CONCLUDED;

    const showRITBadge =
        game?.running &&
        showBoardLabels;

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
            {showRITBadge && (
                <Badge
                    data-testid="rit-active-badge"
                    position="absolute"
                    top={{ base: '-6', md: '-8' }}
                    right="0"
                    colorScheme="green"
                    variant="subtle"
                    fontSize="2xs"
                    borderRadius="full"
                    px={2}
                    py={0.5}
                    letterSpacing="wider"
                    textTransform="uppercase"
                >
                    Run It Twice
                </Badge>
            )}

            <Flex
                data-testid="rit-board-1"
                width="100%"
                alignItems="center"
                justifyContent="center"
                gap={{ base: 1, md: 2, lg: 3 }}
            >
                <Pot activePotIndex={activePotIndex} />
                {showBoardLabels && (
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
            {showRITBadge && (
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
                    <div
                        data-testid="rit-second-board-cards"
                        style={{ display: 'contents' }}
                    >
                        <RITSecondBoard />
                    </div>
                </Flex>
            )}
            <GameStatusBanner />
        </Flex>
    );
};
export default Felt;
