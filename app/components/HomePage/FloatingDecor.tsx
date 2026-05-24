'use client';

import { Box, Icon, Text } from '@chakra-ui/react';
import { motion, useReducedMotion } from 'framer-motion';
import { SiBitcoin, SiEthereum } from 'react-icons/si';
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

const EthIcon = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const sizeMap = {
        sm: { base: '24px', md: '30px' },
        md: { base: '32px', md: '40px' },
        lg: { base: '44px', md: '56px' },
    };
    return <Icon as={SiEthereum} boxSize={sizeMap[size]} color="brand.navy" />;
};

const BtcIcon = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const sizeMap = {
        sm: { base: '24px', md: '30px' },
        md: { base: '32px', md: '40px' },
        lg: { base: '44px', md: '56px' },
    };
    return <Icon as={SiBitcoin} boxSize={sizeMap[size]} color="brand.yellow" />;
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

const BaseLogo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => (
    <LogoImage src="/networkLogos/base-logo.png" size={size} />
);

const UsdcLogo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => (
    <LogoImage src="/usdc-logo.png" size={size} />
);

// Per-section items (legacy, kept for HomeSection)
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
        render: <Suit glyph="♦" color="brand.yellow" />,
    },
    {
        key: 'eth-icon',
        level: 2,
        top: '30%',
        left: '70%',
        opacity: 0.25,
        float: 8,
        rotate: 6,
        duration: 5,
        render: <EthIcon />,
    },
    {
        key: 'btc-icon',
        level: 2,
        top: '48%',
        left: '86%',
        opacity: 0.25,
        float: 7,
        rotate: -6,
        duration: 5.4,
        render: <BtcIcon />,
    },
    {
        key: 'base-logo',
        level: 2,
        top: '58%',
        left: '28%',
        opacity: 0.24,
        float: 7,
        rotate: 8,
        duration: 5.6,
        render: <BaseLogo />,
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
// 24 items, ~2–3 visible per viewport. Mix of small/medium/large for rhythm.
const PAGE_ITEMS: DecorItem[] = [
    // 0–25%
    { key: 'p-spade-1', level: 1, top: '2%', left: '8%', opacity: 0.22, float: 6, rotate: 8, duration: 4.8,
      render: <Suit glyph="♠" color="brand.navy" /> },
    { key: 'p-eth-1', level: 1, top: '6%', left: '72%', opacity: 0.18, float: 8, rotate: 6, duration: 5.2,
      render: <EthIcon /> },
    { key: 'p-usdc-1', level: 1, top: '10%', left: '22%', opacity: 0.20, float: 6, rotate: -6, duration: 5.6,
      render: <UsdcLogo size="lg" /> },
    { key: 'p-heart-1', level: 1, top: '14%', left: '88%', opacity: 0.22, float: 6, rotate: -6, duration: 4.4,
      render: <Suit glyph="♥" color="brand.pink" /> },
    { key: 'p-club-1', level: 1, top: '18%', left: '12%', opacity: 0.22, float: 7, rotate: 6, duration: 4.6,
      render: <Suit glyph="♣" color="brand.green" /> },
    { key: 'p-btc-1', level: 1, top: '22%', left: '64%', opacity: 0.18, float: 7, rotate: -8, duration: 5.4,
      render: <BtcIcon /> },

    // 25–50%
    { key: 'p-base-1', level: 1, top: '27%', left: '86%', opacity: 0.20, float: 7, rotate: 8, duration: 5.6,
      render: <BaseLogo /> },
    { key: 'p-diamond-1', level: 1, top: '32%', left: '20%', opacity: 0.22, float: 7, rotate: -6, duration: 5.0,
      render: <Suit glyph="♦" color="brand.yellow" size="lg" /> },
    { key: 'p-spade-2', level: 1, top: '37%', left: '74%', opacity: 0.22, float: 6, rotate: 6, duration: 4.4,
      render: <Suit glyph="♠" color="brand.navy" size="sm" /> },
    { key: 'p-usdc-2', level: 1, top: '42%', left: '10%', opacity: 0.20, float: 6, rotate: -6, duration: 5.8,
      render: <UsdcLogo /> },
    { key: 'p-eth-2', level: 1, top: '46%', left: '88%', opacity: 0.18, float: 8, rotate: -6, duration: 5.4,
      render: <EthIcon size="lg" /> },
    { key: 'p-heart-2', level: 1, top: '50%', left: '36%', opacity: 0.22, float: 6, rotate: 8, duration: 4.6,
      render: <Suit glyph="♥" color="brand.pink" /> },

    // 50–75%
    { key: 'p-club-2', level: 1, top: '54%', left: '78%', opacity: 0.22, float: 7, rotate: 8, duration: 4.8,
      render: <Suit glyph="♣" color="brand.green" size="sm" /> },
    { key: 'p-btc-2', level: 1, top: '58%', left: '14%', opacity: 0.18, float: 7, rotate: 6, duration: 5.2,
      render: <BtcIcon /> },
    { key: 'p-base-2', level: 1, top: '62%', left: '60%', opacity: 0.20, float: 7, rotate: -8, duration: 5.8,
      render: <BaseLogo size="sm" /> },
    { key: 'p-diamond-2', level: 1, top: '66%', left: '88%', opacity: 0.22, float: 7, rotate: -6, duration: 5.0,
      render: <Suit glyph="♦" color="brand.yellow" /> },
    { key: 'p-spade-3', level: 1, top: '70%', left: '24%', opacity: 0.22, float: 6, rotate: 6, duration: 4.4,
      render: <Suit glyph="♠" color="brand.navy" /> },
    { key: 'p-usdc-3', level: 1, top: '74%', left: '70%', opacity: 0.20, float: 6, rotate: -6, duration: 5.8,
      render: <UsdcLogo size="sm" /> },

    // 75–100%
    { key: 'p-heart-3', level: 1, top: '78%', left: '10%', opacity: 0.22, float: 6, rotate: -6, duration: 4.4,
      render: <Suit glyph="♥" color="brand.pink" size="lg" /> },
    { key: 'p-eth-3', level: 1, top: '82%', left: '46%', opacity: 0.18, float: 8, rotate: 6, duration: 5.2,
      render: <EthIcon size="sm" /> },
    { key: 'p-base-3', level: 1, top: '86%', left: '84%', opacity: 0.20, float: 7, rotate: 8, duration: 5.6,
      render: <BaseLogo /> },
    { key: 'p-club-3', level: 1, top: '90%', left: '20%', opacity: 0.22, float: 7, rotate: 8, duration: 4.8,
      render: <Suit glyph="♣" color="brand.green" /> },
    { key: 'p-btc-3', level: 1, top: '94%', left: '70%', opacity: 0.18, float: 7, rotate: -8, duration: 5.4,
      render: <BtcIcon size="sm" /> },
    { key: 'p-diamond-3', level: 1, top: '97%', left: '38%', opacity: 0.22, float: 7, rotate: -6, duration: 5.0,
      render: <Suit glyph="♦" color="brand.yellow" size="sm" /> },
];

const FloatingDecor = ({
    density = 'light',
    scale = 'section',
}: FloatingDecorProps) => {
    const prefersReducedMotion = useReducedMotion();
    const levelMap = { minimal: 1, light: 2, dense: 3 };
    const level = levelMap[density];

    const items = scale === 'page'
        ? PAGE_ITEMS
        : SECTION_ITEMS.filter((item) => item.level <= level);

    return (
        <Box
            position="absolute"
            inset={0}
            pointerEvents="none"
            zIndex={0}
            display={{ base: 'none', md: 'block' }}
        >
            {items.map((item) => (
                <MotionBox
                    key={item.key}
                    position="absolute"
                    top={item.top}
                    left={item.left}
                    opacity={item.opacity ?? 0.25}
                    transform="translate(-50%, -50%)"
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
