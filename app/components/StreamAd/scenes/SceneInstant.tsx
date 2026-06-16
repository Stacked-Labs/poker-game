'use client';

import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { Highlight, SceneCopy } from '../primitives';

const COMPARISONS = [
    { old: 'Submit your ID. Wait for review.', stacked: "Connect a wallet. You're in." },
    { old: 'Wait days for withdrawals.', stacked: 'Settle to your wallet, on-chain.' },
    { old: 'Volatile token of the week.', stacked: 'USDC. Always $1.' },
];

const CompareRow = ({ old, stacked }: { old: string; stacked: string }) => (
    <Flex
        direction="column"
        bg="white"
        border="1px solid"
        borderColor="brand.lightGray"
        borderRadius="14px"
        boxShadow="0 8px 24px rgba(11, 20, 48, 0.08)"
        overflow="hidden"
    >
        <HStack
            spacing="clamp(8px, 0.9vw, 12px)"
            px="clamp(12px, 1.3vw, 20px)"
            py="clamp(8px, 1vh, 13px)"
            bg="rgba(235, 11, 92, 0.06)"
        >
            <Text color="brand.pink" fontWeight={800} fontSize="clamp(0.85rem, 1.1vw, 1.1rem)" lineHeight="1">
                ✕
            </Text>
            <Text
                color="brand.navy"
                opacity={0.7}
                fontWeight={500}
                fontSize="clamp(0.85rem, 1.1vw, 1.1rem)"
                textDecoration="line-through"
                textDecorationColor="rgba(235, 11, 92, 0.5)"
            >
                {old}
            </Text>
        </HStack>
        <HStack
            spacing="clamp(8px, 0.9vw, 12px)"
            px="clamp(12px, 1.3vw, 20px)"
            py="clamp(8px, 1vh, 13px)"
            bg="rgba(54, 163, 123, 0.08)"
        >
            <Text color="brand.green" fontWeight={800} fontSize="clamp(0.85rem, 1.1vw, 1.1rem)" lineHeight="1">
                ✓
            </Text>
            <Text color="brand.darkNavy" fontWeight={700} fontSize="clamp(0.9rem, 1.2vw, 1.2rem)">
                {stacked}
            </Text>
        </HStack>
    </Flex>
);

// Scene C — instant play: no gates, USDC on Base, old way vs Stacked.
export default function SceneInstant() {
    return (
        <Flex h="100%" align="center" justify="space-between" gap="clamp(20px, 3vw, 56px)" minH={0}>
            <SceneCopy
                eyebrow="No gates · Instant play"
                eyebrowColor="brand.green"
                headline={
                    <>
                        No signup.
                        <br />
                        Just <Highlight>poker</Highlight>.
                    </>
                }
                sub={
                    <>
                        Connect a wallet and you&apos;re dealt in. USDC on Base, always $1,
                        every pot settled on-chain. Open a link on any device.
                    </>
                }
                badges={['USDC on Base', 'On-chain settlement', 'Any device']}
                badgeTone="green"
            />

            <Flex flex="1" h="100%" minW={0} align="center" justify="center" display={{ base: 'none', sm: 'flex' }}>
                <VStack
                    align="stretch"
                    spacing="clamp(12px, 1.4vh, 20px)"
                    w="clamp(330px, 37vw, 560px)"
                >
                    <HStack justify="space-between" px="2px">
                        <Text
                            color="brand.navy"
                            opacity={0.6}
                            fontWeight={700}
                            fontSize="clamp(0.62rem, 0.85vw, 0.8rem)"
                            letterSpacing="0.16em"
                            textTransform="uppercase"
                        >
                            The old way
                        </Text>
                        <Text
                            color="brand.green"
                            fontWeight={700}
                            fontSize="clamp(0.62rem, 0.85vw, 0.8rem)"
                            letterSpacing="0.16em"
                            textTransform="uppercase"
                        >
                            On Stacked
                        </Text>
                    </HStack>
                    {COMPARISONS.map((c) => (
                        <CompareRow key={c.stacked} old={c.old} stacked={c.stacked} />
                    ))}
                    <HStack justify="center" spacing="8px" pt="clamp(4px, 0.6vh, 8px)">
                        <Box
                            as="img"
                            src="/usdc-logo.png"
                            alt=""
                            w="clamp(18px, 1.8vw, 26px)"
                            h="clamp(18px, 1.8vw, 26px)"
                        />
                        <Text color="brand.navy" fontWeight={600} fontSize="clamp(0.74rem, 0.95vw, 0.95rem)">
                            Powered by USDC on Base
                        </Text>
                    </HStack>
                </VStack>
            </Flex>
        </Flex>
    );
}
