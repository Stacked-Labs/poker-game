'use client';

import { Box, Icon, Text } from '@chakra-ui/react';
import { motion, useReducedMotion } from 'framer-motion';
import { GiToken } from 'react-icons/gi';
import { type ReactNode } from 'react';

type FloatingDecorProps = {
    density?: 'minimal' | 'light' | 'dense';
    scale?: 'section' | 'page';
};

type DecorItem = {
    key: string;
    level: 1 | 2 | 3;
    top: string;
    left: string;
    opacity?: number;
    float: number;
    rotate: number;
    duration: number;
    delay?: number;
    // shown in the lighter mobile pass — keep this set small
    mobile?: boolean;
    render: ReactNode;
};

const MotionBox = motion(Box);

const Suit = ({
    glyph,
    color,
    size = 'md',
}: {
    glyph: string;
    color: string;
    size?: 'sm' | 'md' | 'lg';
}) => {
    const sizeMap = {
        sm: { base: '22px', md: '26px' },
        md: { base: '28px', md: '34px' },
        lg: { base: '40px', md: '52px' },
    };
    return (
        <Text fontSize={sizeMap[size]} color={color} lineHeight={1}>
            {glyph}
        </Text>
    );
};

const ChipIcon = ({
    color = 'brand.green',
    size = 'md',
}: {
    color?: string;
    size?: 'sm' | 'md' | 'lg';
}) => {
    const sizeMap = {
        sm: { base: '26px', md: '32px' },
        md: { base: '34px', md: '42px' },
        lg: { base: '46px', md: '58px' },
    };
    return <Icon as={GiToken} boxSize={sizeMap[size]} color={color} />;
};

const LogoImage = ({
    src,
    size = 'md',
}: {
    src: string;
    size?: 'sm' | 'md' | 'lg';
}) => {
    const sizeMap = {
        sm: { base: '34px', md: '40px' },
        md: { base: '44px', md: '54px' },
        lg: { base: '60px', md: '72px' },
    };
    return (
        <Box
            w={sizeMap[size]}
            h={sizeMap[size]}
            bgImage={`url('${src}')`}
            bgRepeat="no-repeat"
            bgPosition="center"
            bgSize="contain"
        />
    );
};

const UsdcLogo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => (
    <LogoImage src="/usdc-logo.png" size={size} />
);

// Per-section items (legacy, kept for HomeSection). Suits, chips, USDC only.
const SECTION_ITEMS: DecorItem[] = [
    {
        key: 'suit-spade',
        level: 1,
        top: '12%',
        left: '10%',
        opacity: 0.28,
        float: 6,
        rotate: 8,
        duration: 4.6,
        mobile: true,
        render: <Suit glyph="♠" color="brand.navy" />,
    },
    {
        key: 'suit-heart',
        level: 1,
        top: '18%',
        left: '88%',
        opacity: 0.28,
        float: 6,
        rotate: -8,
        duration: 4.2,
        mobile: true,
        render: <Suit glyph="♥" color="brand.pink" />,
    },
    {
        key: 'suit-club',
        level: 1,
        top: '64%',
        left: '12%',
        opacity: 0.26,
        float: 7,
        rotate: 6,
        duration: 4.8,
        render: <Suit glyph="♣" color="brand.green" />,
    },
    {
        key: 'suit-diamond',
        level: 2,
        top: '72%',
        left: '84%',
        opacity: 0.26,
        float: 7,
        rotate: -6,
        duration: 5.2,
        mobile: true,
        render: <Suit glyph="♦" color="brand.yellow" />,
    },
    {
        key: 'chip-green',
        level: 2,
        top: '30%',
        left: '70%',
        opacity: 0.22,
        float: 8,
        rotate: 6,
        duration: 5,
        render: <ChipIcon color="brand.green" />,
    },
    {
        key: 'chip-navy',
        level: 2,
        top: '48%',
        left: '86%',
        opacity: 0.22,
        float: 7,
        rotate: -6,
        duration: 5.4,
        render: <ChipIcon color="brand.navy" />,
    },
    {
        key: 'usdc-logo',
        level: 2,
        top: '26%',
        left: '36%',
        opacity: 0.24,
        float: 6,
        rotate: -6,
        duration: 5.8,
        render: <UsdcLogo />,
    },
];

// Page-scale items — distributed across the whole post-hero region.
// `top` is relative to the wrapper, which spans many viewports.
// Trimmed to ~14 items (~1–2 visible per viewport) to cut concurrent
// motion loops. Suits, chips, and the USDC mark only — no volatile coins.
const PAGE_ITEMS: DecorItem[] = [
    // 0–25%
    { key: 'p-spade-1', level: 1, top: '3%', left: '8%', opacity: 0.22, float: 6, rotate: 8, duration: 4.8, mobile: true,
      render: <Suit glyph="♠" color="brand.navy" /> },
    { key: 'p-usdc-1', level: 1, top: '9%', left: '78%', opacity: 0.20, float: 6, rotate: -6, duration: 5.6,
      render: <UsdcLogo size="lg" /> },
    { key: 'p-heart-1', level: 1, top: '16%', left: '22%', opacity: 0.22, float: 6, rotate: -6, duration: 4.4, mobile: true,
      render: <Suit glyph="♥" color="brand.pink" /> },

    // 25–50%
    { key: 'p-chip-1', level: 1, top: '27%', left: '86%', opacity: 0.22, float: 7, rotate: 8, duration: 5.6,
      render: <ChipIcon color="brand.green" /> },
    { key: 'p-diamond-1', level: 1, top: '34%', left: '14%', opacity: 0.22, float: 7, rotate: -6, duration: 5.0, mobile: true,
      render: <Suit glyph="♦" color="brand.yellow" size="lg" /> },
    { key: 'p-club-1', level: 1, top: '44%', left: '80%', opacity: 0.22, float: 6, rotate: 6, duration: 4.4,
      render: <Suit glyph="♣" color="brand.green" /> },

    // 50–75%
    { key: 'p-usdc-2', level: 1, top: '53%', left: '12%', opacity: 0.20, float: 6, rotate: -6, duration: 5.8, mobile: true,
      render: <UsdcLogo /> },
    { key: 'p-chip-2', level: 1, top: '60%', left: '70%', opacity: 0.22, float: 7, rotate: -8, duration: 5.4,
      render: <ChipIcon color="brand.navy" size="sm" /> },
    { key: 'p-spade-2', level: 1, top: '68%', left: '24%', opacity: 0.22, float: 6, rotate: 6, duration: 4.4,
      render: <Suit glyph="♠" color="brand.navy" /> },

    // 75–100%
    { key: 'p-heart-2', level: 1, top: '77%', left: '84%', opacity: 0.22, float: 6, rotate: -6, duration: 4.4, mobile: true,
      render: <Suit glyph="♥" color="brand.pink" size="lg" /> },
    { key: 'p-diamond-2', level: 1, top: '84%', left: '16%', opacity: 0.22, float: 7, rotate: -6, duration: 5.0,
      render: <Suit glyph="♦" color="brand.yellow" size="sm" /> },
    { key: 'p-club-2', level: 1, top: '90%', left: '68%', opacity: 0.22, float: 7, rotate: 8, duration: 4.8,
      render: <Suit glyph="♣" color="brand.green" /> },
    { key: 'p-chip-3', level: 1, top: '95%', left: '30%', opacity: 0.22, float: 7, rotate: -8, duration: 5.4,
      render: <ChipIcon color="brand.yellow" size="sm" /> },
    { key: 'p-usdc-3', level: 1, top: '97%', left: '82%', opacity: 0.20, float: 6, rotate: -6, duration: 5.8,
      render: <UsdcLogo size="sm" /> },
];

const FloatingDecor = ({
    density = 'light',
    scale = 'section',
}: FloatingDecorProps) => {
    const prefersReducedMotion = useReducedMotion();
    const levelMap = { minimal: 1, light: 2, dense: 3 };
    const level = levelMap[density];

    const items =
        scale === 'page'
            ? PAGE_ITEMS
            : SECTION_ITEMS.filter((item) => item.level <= level);

    return (
        <Box
            aria-hidden="true"
            position="absolute"
            inset={0}
            pointerEvents="none"
            zIndex={0}
        >
            {items.map((item) => (
                <MotionBox
                    key={item.key}
                    position="absolute"
                    top={item.top}
                    left={item.left}
                    opacity={item.opacity ?? 0.25}
                    transform="translate(-50%, -50%)"
                    // Personality layer renders everywhere; mobile gets a
                    // lighter subset to keep the floating-glyph count low.
                    display={
                        item.mobile
                            ? { base: 'block', md: 'block' }
                            : { base: 'none', md: 'block' }
                    }
                    animate={
                        prefersReducedMotion
                            ? undefined
                            : {
                                  y: [0, -item.float, 0],
                                  rotate: [0, item.rotate, 0],
                              }
                    }
                    transition={
                        prefersReducedMotion
                            ? undefined
                            : {
                                  duration: item.duration,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                  delay: item.delay ?? 0,
                              }
                    }
                >
                    {item.render}
                </MotionBox>
            ))}
        </Box>
    );
};

export default FloatingDecor;
