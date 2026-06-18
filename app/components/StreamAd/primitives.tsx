'use client';

import { Box, Flex, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { SiBitcoin, SiEthereum } from 'react-icons/si';
import { floatY, pulse, segmentStyle } from './streamAdMotion';

// Shared decor + scaffolding for the StreamAd broadcast frame. Everything here is
// static and non-interactive; motion is CSS-only (see streamAdMotion.ts). The frame
// is locked to the homepage's light look regardless of color mode, so colors are
// explicit brand inks rather than mode-aware tokens.

// ── Floating decor ──────────────────────────────────────────────────────────
//
// Mirrors the homepage's FloatingDecor items (suits + chain logos at the same
// sizes/opacities/positions), but animated with CSS keyframes instead of
// framer-motion — rAF is throttled under the stream worker.

const DECOR_ITEMS: {
    top: string;
    left: string;
    opacity: number;
    float: number;
    rot: number;
    dur: number;
    render: ReactNode;
}[] = [
    {
        top: '12%',
        left: '10%',
        opacity: 0.28,
        float: 6,
        rot: 8,
        dur: 4.6,
        render: (
            <Text fontSize="34px" color="brand.navy" lineHeight={1}>
                ♠
            </Text>
        ),
    },
    {
        top: '18%',
        left: '88%',
        opacity: 0.28,
        float: 6,
        rot: -8,
        dur: 4.2,
        render: (
            <Text fontSize="34px" color="brand.pink" lineHeight={1}>
                ♥
            </Text>
        ),
    },
    {
        top: '64%',
        left: '12%',
        opacity: 0.26,
        float: 7,
        rot: 6,
        dur: 4.8,
        render: (
            <Text fontSize="34px" color="brand.green" lineHeight={1}>
                ♣
            </Text>
        ),
    },
    {
        top: '72%',
        left: '84%',
        opacity: 0.26,
        float: 7,
        rot: -6,
        dur: 5.2,
        render: (
            <Text fontSize="34px" color="brand.yellow" lineHeight={1}>
                ♦
            </Text>
        ),
    },
    {
        top: '30%',
        left: '70%',
        opacity: 0.25,
        float: 8,
        rot: 6,
        dur: 5,
        render: <Icon as={SiEthereum} boxSize="40px" color="brand.navy" />,
    },
    {
        top: '48%',
        left: '86%',
        opacity: 0.25,
        float: 7,
        rot: -6,
        dur: 5.4,
        render: <Icon as={SiBitcoin} boxSize="40px" color="brand.yellow" />,
    },
    {
        top: '58%',
        left: '28%',
        opacity: 0.24,
        float: 7,
        rot: 8,
        dur: 5.6,
        render: (
            <Box
                w="54px"
                h="54px"
                bgImage="url('/networkLogos/base-logo.png')"
                bgRepeat="no-repeat"
                bgPosition="center"
                bgSize="contain"
            />
        ),
    },
    {
        top: '26%',
        left: '36%',
        opacity: 0.24,
        float: 6,
        rot: -6,
        dur: 5.8,
        render: (
            <Box
                w="54px"
                h="54px"
                bgImage="url('/usdc-logo.png')"
                bgRepeat="no-repeat"
                bgPosition="center"
                bgSize="contain"
            />
        ),
    },
];

export const HomeDecor = () => (
    <Box position="absolute" inset={0} pointerEvents="none" zIndex={0} aria-hidden>
        {DECOR_ITEMS.map((item, i) => (
            <Box
                key={i}
                position="absolute"
                top={item.top}
                left={item.left}
                opacity={item.opacity}
                sx={{
                    '--float': `${item.float}px`,
                    '--rot': `${item.rot}deg`,
                    transform: 'translate(-50%, -50%)',
                    animation: `${floatY} ${item.dur}s ease-in-out infinite`,
                }}
                userSelect="none"
            >
                {item.render}
            </Box>
        ))}
    </Box>
);

// ── Copy helpers ────────────────────────────────────────────────────────────

export const Highlight = ({
    children,
    color = 'brand.green',
}: {
    children: string;
    color?: string;
}) => (
    <Box as="span" position="relative" display="inline-block" color={color}>
        {children}
        <Box
            as="span"
            position="absolute"
            left="-2px"
            right="-2px"
            bottom="0.1em"
            height="0.14em"
            bg={color}
            opacity={0.3}
            borderRadius="full"
            zIndex={-1}
        />
    </Box>
);

export const InkChip = ({
    children,
    bg = 'brand.pink',
}: {
    children: string;
    bg?: string;
}) => (
    <Box
        as="span"
        bg={bg}
        color="white"
        px="0.18em"
        borderRadius="0.12em"
        display="inline-block"
        transform="rotate(-2deg)"
    >
        {children}
    </Box>
);

// Homepage badge recipe: tinted fill + border, accent-colored uppercase label.
const BADGE_TONES = {
    green: {
        bg: 'rgba(54, 163, 123, 0.1)',
        border: 'rgba(54, 163, 123, 0.28)',
        text: 'brand.green',
    },
    yellow: {
        bg: 'rgba(255, 199, 44, 0.12)',
        border: 'rgba(255, 199, 44, 0.28)',
        text: 'brand.yellowDark',
    },
    pink: {
        bg: 'rgba(235, 11, 92, 0.08)',
        border: 'rgba(235, 11, 92, 0.26)',
        text: 'brand.pink',
    },
    // Thirdweb purple — same family the homepage's "Powered by Thirdweb" badge uses.
    purple: {
        bg: 'rgba(133, 93, 205, 0.08)',
        border: 'rgba(133, 93, 205, 0.22)',
        text: 'purple.600',
    },
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

export const BadgePill = ({ label, tone = 'green' }: { label: string; tone?: BadgeTone }) => {
    const t = BADGE_TONES[tone];
    return (
        <HStack
            spacing="7px"
            px="clamp(11px, 1vw, 16px)"
            py="clamp(6px, 0.7vh, 10px)"
            borderRadius="full"
            bg={t.bg}
            border="1px solid"
            borderColor={t.border}
        >
            <Box w="6px" h="6px" borderRadius="full" bg={t.text} />
            <Text
                color={t.text}
                fontWeight={700}
                fontSize="clamp(0.66rem, 0.95vw, 0.85rem)"
                letterSpacing="0.06em"
                textTransform="uppercase"
                whiteSpace="nowrap"
            >
                {label}
            </Text>
        </HStack>
    );
};

// Left copy column shared by every scene: eyebrow / headline / sub / badges.
export const SceneCopy = ({
    eyebrow,
    eyebrowColor,
    headline,
    sub,
    badges,
    badgeTone,
}: {
    eyebrow: string;
    eyebrowColor: string;
    headline: ReactNode;
    sub: ReactNode;
    badges: string[];
    badgeTone: BadgeTone;
}) => (
    <VStack align="flex-start" spacing="clamp(14px, 2vh, 26px)" flex="1.2" minW={0}>
        <Text
            color={eyebrowColor}
            fontWeight={700}
            fontSize="clamp(0.72rem, 1vw, 0.95rem)"
            letterSpacing="0.22em"
            textTransform="uppercase"
        >
            {eyebrow}
        </Text>

        <Text
            as="h2"
            color="brand.darkNavy"
            fontWeight={800}
            lineHeight="0.98"
            letterSpacing="-0.03em"
            fontSize="clamp(2.4rem, 6.4vw, 5rem)"
        >
            {headline}
        </Text>

        <Text
            color="brand.navy"
            fontWeight={500}
            lineHeight="1.5"
            fontSize="clamp(0.95rem, 1.55vw, 1.4rem)"
            maxW="40ch"
        >
            {sub}
        </Text>

        <HStack spacing="clamp(8px, 0.9vw, 14px)" flexWrap="wrap">
            {badges.map((b) => (
                <BadgePill key={b} label={b} tone={badgeTone} />
            ))}
        </HStack>
    </VStack>
);

// White stage card matching the homepage EarningsCard/SetupCard recipe (card.white
// + border.lightGray + card.hero shadow, with a top accent bar).
export const StageCard = ({
    accent,
    header,
    headerRight,
    children,
}: {
    accent: string;
    header: string;
    headerRight?: ReactNode;
    children: ReactNode;
}) => (
    <Box
        position="relative"
        w="clamp(320px, 35vw, 530px)"
        bg="white"
        borderRadius="2xl"
        border="1px solid"
        borderColor="brand.lightGray"
        boxShadow="0 25px 80px rgba(0, 0, 0, 0.12), 0 8px 32px rgba(0, 0, 0, 0.08)"
        overflow="hidden"
    >
        <Box position="absolute" top={0} left={0} right={0} h="4px" bg={accent} />
        <Box p="clamp(22px, 2.4vw, 38px)">
            <Flex justify="space-between" align="center" mb="clamp(16px, 1.9vh, 26px)">
                <Text
                    color="brand.navy"
                    fontWeight={700}
                    fontSize="clamp(0.78rem, 1.05vw, 1rem)"
                    letterSpacing="0.14em"
                    textTransform="uppercase"
                >
                    {header}
                </Text>
                {headerRight}
            </Flex>
            {children}
        </Box>
    </Box>
);

// Homepage-style LIVE badge: solid pink chip with pulsing white dot.
export const LiveTag = () => (
    <HStack
        spacing="6px"
        bg="brand.pink"
        border="1px solid"
        borderColor="brand.pinkDark"
        borderRadius="full"
        px="10px"
        py="4px"
        boxShadow="0 4px 14px rgba(235, 11, 92, 0.35)"
    >
        <Box
            w="7px"
            h="7px"
            borderRadius="full"
            bg="white"
            sx={{ animation: `${pulse} 1.6s ease-in-out infinite` }}
        />
        <Text
            color="white"
            fontWeight={800}
            fontSize="clamp(0.6rem, 0.8vw, 0.75rem)"
            letterSpacing="0.14em"
        >
            LIVE
        </Text>
    </HStack>
);

// ── Persistent chrome ───────────────────────────────────────────────────────

// Scene order accents: hero (pink), host (yellow), instant (green), leaderboard
// (podium gold), create (purple), tournaments (green).
const SEGMENT_ACCENTS = ['brand.pink', 'brand.yellow', 'brand.green', '#FFD700', 'purple.500', 'brand.green'];

export const ProgressSegments = () => (
    <HStack spacing="clamp(5px, 0.5vw, 8px)">
        {SEGMENT_ACCENTS.map((accent, i) => (
            <Box
                key={i}
                position="relative"
                w="clamp(26px, 2.8vw, 44px)"
                h="4px"
                borderRadius="full"
                bg="rgba(11, 20, 48, 0.12)"
                overflow="hidden"
            >
                <Box
                    position="absolute"
                    inset={0}
                    borderRadius="full"
                    bg={accent}
                    sx={segmentStyle(i)}
                />
            </Box>
        ))}
    </HStack>
);

export const QrCard = () => (
    <HStack
        spacing="clamp(10px, 1vw, 16px)"
        bg="white"
        border="1px solid"
        borderColor="brand.lightGray"
        borderRadius="16px"
        p="clamp(10px, 1vw, 14px)"
        boxShadow="0 25px 80px rgba(0, 0, 0, 0.12), 0 8px 32px rgba(0, 0, 0, 0.08)"
        align="center"
    >
        <VStack align="flex-end" spacing="2px">
            <Text
                color="brand.darkNavy"
                fontWeight={800}
                fontSize="clamp(0.68rem, 0.9vw, 0.85rem)"
                letterSpacing="0.12em"
                textTransform="uppercase"
                textAlign="right"
            >
                Scan to play
            </Text>
            <Text
                color="brand.navy"
                fontWeight={600}
                fontSize="clamp(0.62rem, 0.85vw, 0.8rem)"
                textAlign="right"
            >
                stackedpoker.io
            </Text>
        </VStack>
        <Box
            as="img"
            src="/qr-stackedpoker.svg"
            alt=""
            w="clamp(88px, 8.6vw, 124px)"
            h="clamp(88px, 8.6vw, 124px)"
            borderRadius="8px"
            border="1px solid"
            borderColor="brand.lightGray"
        />
    </HStack>
);
