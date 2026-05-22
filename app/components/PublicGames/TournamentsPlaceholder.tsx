'use client';

import {
    Box,
    Button,
    Flex,
    HStack,
    Heading,
    SimpleGrid,
    Text,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaXTwitter } from 'react-icons/fa6';
import { FaDiscord } from 'react-icons/fa';

const X_URL = 'https://x.com/stacked_poker';
const DISCORD_URL = 'https://discord.gg/347RBVcvpn';

// A reserved-but-empty section. The ghost cards intentionally use the same
// row shape as PublicGameCard so the eye reads "this is where tournaments
// will live" — not "here's a marketing pitch."

interface GhostTournament {
    title: string;
    format: string;
    buyIn: string;
    when: string;
}

const GHOSTS: GhostTournament[] = [
    {
        title: 'Sunday Major',
        format: 'NLH · Freezeout',
        buyIn: '$25',
        when: 'TBA',
    },
    {
        title: 'Bounty Hunter',
        format: 'NLH · Progressive',
        buyIn: '$10 + $10',
        when: 'TBA',
    },
    {
        title: 'Friday Freeroll',
        format: 'NLH · Freezeout',
        buyIn: 'Free',
        when: 'TBA',
    },
];

export default function TournamentsPlaceholder() {
    return (
        <VStack align="stretch" spacing={{ base: 5, md: 6 }} w="full">
            <Header />
            <SimpleGrid
                columns={{ base: 1, md: 3 }}
                spacing={{ base: 3, md: 4 }}
            >
                {GHOSTS.map((g) => (
                    <GhostCard key={g.title} {...g} />
                ))}
            </SimpleGrid>
            <NotifyHook />
        </VStack>
    );
}

function Header() {
    const badgeBg = useColorModeValue(
        'rgba(54, 163, 123, 0.10)',
        'rgba(54, 163, 123, 0.18)'
    );
    return (
        <VStack align="start" spacing={2} maxW="640px">
            <HStack spacing={2}>
                <Heading
                    fontSize={{ base: 'lg', md: 'xl' }}
                    fontWeight="extrabold"
                    letterSpacing="-0.01em"
                    color="text.primary"
                >
                    Tournaments
                </Heading>
                <Box
                    bg={badgeBg}
                    color="brand.green"
                    fontSize="2xs"
                    fontWeight="bold"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    px={2}
                    py="2px"
                    borderRadius="full"
                >
                    Coming soon
                </Box>
            </HStack>
            <Text color="text.secondary" fontSize="sm" lineHeight={1.5}>
                Scheduled MTTs and bounties, settled on-chain in USDC.
                Designs below are placeholders — we&apos;ll announce dates
                and structures soon.
            </Text>
        </VStack>
    );
}

const shimmer = keyframes`
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
`;

function GhostCard({ title, format, buyIn, when }: GhostTournament) {
    const cardBg = useColorModeValue('card.white', 'card.darkNavy');
    const borderColor = useColorModeValue(
        'rgba(11, 20, 48, 0.08)',
        'rgba(255, 255, 255, 0.08)'
    );
    const shimmerStripe = useColorModeValue(
        'linear-gradient(90deg, rgba(11,20,48,0.03) 0%, rgba(11,20,48,0.07) 50%, rgba(11,20,48,0.03) 100%)',
        'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 100%)'
    );
    const labelColor = useColorModeValue('text.muted', 'whiteAlpha.600');

    return (
        <Box
            borderWidth="1px"
            borderStyle="dashed"
            borderColor={borderColor}
            borderRadius="14px"
            bg={cardBg}
            p={{ base: 4, md: 4 }}
            position="relative"
            overflow="hidden"
            aria-hidden
        >
            <VStack align="stretch" spacing={3}>
                <HStack justify="space-between" align="flex-start">
                    <VStack align="start" spacing={0.5} minW={0}>
                        <Text
                            fontWeight="bold"
                            color="text.primary"
                            fontSize="md"
                            noOfLines={1}
                        >
                            {title}
                        </Text>
                        <Text
                            fontSize="2xs"
                            color={labelColor}
                            textTransform="uppercase"
                            letterSpacing="0.08em"
                            fontWeight="semibold"
                        >
                            {format}
                        </Text>
                    </VStack>
                    <Text
                        fontSize="md"
                        fontWeight="bold"
                        color="text.primary"
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        {buyIn}
                    </Text>
                </HStack>
                <Box
                    h="6px"
                    borderRadius="full"
                    bg={shimmerStripe}
                    backgroundSize="200% 100%"
                    animation={`${shimmer} 2.4s ease-in-out infinite`}
                />
                <Flex justify="space-between" align="center">
                    <Text
                        fontSize="2xs"
                        color={labelColor}
                        textTransform="uppercase"
                        letterSpacing="0.08em"
                        fontWeight="semibold"
                    >
                        Starts
                    </Text>
                    <Text
                        fontSize="xs"
                        color="text.secondary"
                        fontWeight="semibold"
                    >
                        {when}
                    </Text>
                </Flex>
            </VStack>
        </Box>
    );
}

function NotifyHook() {
    const bg = useColorModeValue(
        'rgba(255, 255, 255, 0.7)',
        'rgba(255, 255, 255, 0.04)'
    );
    const border = useColorModeValue(
        'rgba(11, 20, 48, 0.08)',
        'rgba(255, 255, 255, 0.08)'
    );

    return (
        <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'stretch', md: 'center' }}
            justify="space-between"
            gap={{ base: 3, md: 4 }}
            p={{ base: 4, md: 4 }}
            borderRadius="14px"
            bg={bg}
            border="1px solid"
            borderColor={border}
        >
            <Text color="text.secondary" fontSize="sm" maxW="560px">
                Want a heads-up when the first tournament hits the lobby?
                Follow along — we&apos;ll post dates and structures there
                first.
            </Text>
            <HStack spacing={2} flexShrink={0}>
                <Button
                    as="a"
                    href={X_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    leftIcon={<FaXTwitter />}
                    size="sm"
                    borderRadius="full"
                    fontWeight="semibold"
                >
                    Follow on X
                </Button>
                <Button
                    as="a"
                    href={DISCORD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    leftIcon={<FaDiscord />}
                    size="sm"
                    borderRadius="full"
                    fontWeight="semibold"
                >
                    Join Discord
                </Button>
            </HStack>
        </Flex>
    );
}
