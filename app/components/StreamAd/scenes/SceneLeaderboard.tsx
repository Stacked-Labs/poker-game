'use client';

import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { Highlight, SceneCopy, StageCard } from '../primitives';

// Podium + tier colors from the real leaderboard (LeaderboardTable.tsx / tierUtils.ts).
const PODIUM = [
    { rank: '#1', tier: '💎', name: 'pokerwhale', points: '48,210', bar: '#FFD700' },
    { rank: '#2', tier: '💎', name: 'basedshark', points: '41,876', bar: '#C0C0C0' },
    { rank: '#3', tier: '⭐', name: 'rivermagic', points: '36,402', bar: '#CD7F32' },
];

const Row = ({
    rank,
    tier,
    name,
    points,
    bar,
    you = false,
    climb,
}: {
    rank: string;
    tier: string;
    name: string;
    points: string;
    bar: string;
    you?: boolean;
    climb?: string;
}) => (
    <HStack
        spacing="clamp(10px, 1vw, 14px)"
        bg={you ? 'rgba(54, 163, 123, 0.07)' : 'transparent'}
        border="1px solid"
        borderColor={you ? 'rgba(54, 163, 123, 0.3)' : 'brand.lightGray'}
        borderRadius="12px"
        px="clamp(12px, 1.3vw, 18px)"
        py="clamp(9px, 1.2vh, 15px)"
        position="relative"
        overflow="hidden"
    >
        <Box position="absolute" left={0} top={0} bottom={0} w="4px" bg={you ? 'brand.green' : bar} />
        <Text
            color="brand.darkNavy"
            fontWeight={800}
            fontSize="clamp(0.85rem, 1.1vw, 1.1rem)"
            w="clamp(34px, 3.2vw, 46px)"
            flexShrink={0}
        >
            {rank}
        </Text>
        <Text fontSize="clamp(0.85rem, 1.1vw, 1.1rem)" lineHeight="1" flexShrink={0}>
            {tier}
        </Text>
        <HStack spacing="6px" minW={0} flex="1">
            <Text
                color={you ? 'brand.green' : 'brand.darkNavy'}
                fontWeight={you ? 800 : 600}
                fontSize="clamp(0.85rem, 1.1vw, 1.1rem)"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
            >
                {you ? 'YOU' : `@${name}`}
            </Text>
            {climb && (
                <Text
                    color="brand.green"
                    fontWeight={800}
                    fontSize="clamp(0.74rem, 0.95vw, 0.95rem)"
                    whiteSpace="nowrap"
                >
                    ▲ {climb}
                </Text>
            )}
        </HStack>
        <Text
            color="brand.darkNavy"
            fontWeight={800}
            fontSize="clamp(0.85rem, 1.1vw, 1.1rem)"
            whiteSpace="nowrap"
        >
            {points}{' '}
            <Box as="span" color="brand.navy" fontWeight={600} fontSize="0.8em">
                pts
            </Box>
        </Text>
    </HStack>
);

const MiniLeaderboard = () => (
    <StageCard
        accent="#FFD700"
        header="Leaderboard"
        headerRight={
            <Text
                color="brand.yellowDark"
                fontWeight={800}
                fontSize="clamp(0.66rem, 0.88vw, 0.85rem)"
                letterSpacing="0.14em"
            >
                UPDATES LIVE
            </Text>
        }
    >
        <VStack align="stretch" spacing="clamp(8px, 1vh, 12px)">
            {PODIUM.map((p) => (
                <Row key={p.rank} {...p} />
            ))}
            <Text
                color="brand.navy"
                opacity={0.5}
                fontWeight={800}
                textAlign="center"
                lineHeight="0.5"
                fontSize="clamp(0.85rem, 1.1vw, 1.1rem)"
            >
                · · ·
            </Text>
            <Row rank="#12" tier="⭐" name="" points="12,450" bar="brand.green" you climb="3" />
            <Text
                color="brand.navy"
                fontWeight={600}
                fontSize="clamp(0.72rem, 0.92vw, 0.9rem)"
                textAlign="center"
                pt="clamp(2px, 0.4vh, 6px)"
            >
                Points are awarded for playing on Base Mainnet
            </Text>
        </VStack>
    </StageCard>
);

// Scene E — leaderboard: points, tiers, and the climb. Podium-gold accent.
export default function SceneLeaderboard() {
    return (
        <Flex h="100%" align="center" justify="space-between" gap="clamp(20px, 3vw, 56px)" minH={0}>
            <SceneCopy
                eyebrow="Global leaderboard · Every hand counts"
                eyebrowColor="brand.yellowDark"
                headline={
                    <>
                        Stack <Highlight color="brand.yellowDark">points</Highlight>.
                        <br />
                        Climb ranks.
                        <br />
                        Get rewarded.
                    </>
                }
                sub={
                    <>
                        Every hand you play earns points. Finish quests for bonuses, refer
                        friends for multipliers, and climb from Iron to Diamond.
                    </>
                }
                badges={['Points every hand', 'Bonus quests', 'Referral multipliers']}
                badgeTone="yellow"
            />

            <Flex flex="1" h="100%" minW={0} align="center" justify="center" display={{ base: 'none', sm: 'flex' }}>
                <MiniLeaderboard />
            </Flex>
        </Flex>
    );
}
