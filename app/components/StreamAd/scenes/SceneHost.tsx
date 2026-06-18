'use client';

import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { Highlight, LiveTag, SceneCopy, StageCard } from '../primitives';

const SETTLEMENTS = [
    { hand: 'Hand #2934', amount: '+$0.42' },
    { hand: 'Hand #2933', amount: '+$0.18' },
    { hand: 'Hand #2932', amount: '+$0.36' },
];

// Static take on the homepage EarningsCard.
const EarningsCard = () => (
    <StageCard accent="brand.yellow" header="Host earnings" headerRight={<LiveTag />}>
        <VStack align="stretch" spacing="clamp(14px, 1.8vh, 24px)">
            <Box>
                <Text
                    color="brand.darkNavy"
                    fontWeight={800}
                    lineHeight="1"
                    fontSize="clamp(2.8rem, 4.4vw, 4.4rem)"
                    letterSpacing="-0.02em"
                >
                    $147.32
                </Text>
                <HStack spacing="6px" mt="clamp(6px, 0.8vh, 10px)">
                    <Text color="brand.green" fontWeight={700} fontSize="clamp(0.88rem, 1.15vw, 1.15rem)">
                        ▲ +$0.42
                    </Text>
                    <Text color="brand.navy" fontWeight={500} fontSize="clamp(0.88rem, 1.15vw, 1.15rem)">
                        from last hand
                    </Text>
                </HStack>
            </Box>

            <VStack align="stretch" spacing="clamp(6px, 0.8vh, 10px)">
                {SETTLEMENTS.map((s) => (
                    <Flex
                        key={s.hand}
                        justify="space-between"
                        align="center"
                        bg="rgba(255, 199, 44, 0.12)"
                        border="1px solid rgba(255, 199, 44, 0.28)"
                        borderRadius="10px"
                        px="clamp(10px, 1vw, 14px)"
                        py="clamp(7px, 0.8vh, 10px)"
                    >
                        <Text color="brand.navy" fontWeight={600} fontSize="clamp(0.82rem, 1.05vw, 1.05rem)">
                            {s.hand}
                        </Text>
                        <Text color="brand.green" fontWeight={800} fontSize="clamp(0.82rem, 1.05vw, 1.05rem)">
                            {s.amount}
                        </Text>
                    </Flex>
                ))}
            </VStack>

            <Text
                color="brand.navy"
                fontWeight={600}
                fontSize="clamp(0.7rem, 0.9vw, 0.85rem)"
                textAlign="center"
            >
                Credited on-chain, hand by hand
            </Text>
        </VStack>
    </StageCard>
);

// Scene B — Host to Earn: the 25%-of-the-platform-fee host share pitch.
export default function SceneHost() {
    return (
        <Flex h="100%" align="center" justify="space-between" gap="clamp(20px, 3vw, 56px)" minH={0}>
            <SceneCopy
                eyebrow="Host to earn · From every hand"
                eyebrowColor="brand.yellowDark"
                headline={
                    <>
                        Run the table.
                        <br />
                        Keep <Highlight color="brand.yellowDark">25%</Highlight>
                        <br />
                        of the fee.
                    </>
                }
                sub={
                    <>
                        Anyone can host. Every real-money hand at your table pays you,
                        credited on-chain, hand by hand. You don&apos;t even have to play.
                    </>
                }
                badges={['25% of the platform fee', 'Paid per hand', 'No deploy cost']}
                badgeTone="yellow"
            />

            <Flex flex="1" h="100%" minW={0} align="center" justify="center" display={{ base: 'none', sm: 'flex' }}>
                <EarningsCard />
            </Flex>
        </Flex>
    );
}
