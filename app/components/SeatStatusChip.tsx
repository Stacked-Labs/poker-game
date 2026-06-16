import React from 'react';
import { Box, Tag, Icon, Text } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    MdWifiOff,
    MdLogout,
    MdLocalCafe,
    MdSnooze,
    MdPersonAdd,
} from 'react-icons/md';
import type { IconType } from 'react-icons';
import type { SeatStatusKind } from '../lib/seatStatus';

// Shared sizing tokens for the two seat-top badges (this chip + the
// hand-strength tag in TakenSeatButton). Kept identical so both render at
// matching heights at every breakpoint and orientation.
export const SEAT_BADGE_STYLE = {
    minH: { base: '16px', md: '20px' },
    h: { base: '16px', md: '20px' },
    fontSize: { base: '10px', md: '12px' },
    px: { base: 1.5, md: 2 },
    py: 0,
    fontWeight: 'bold' as const,
    borderRadius: '6px',
    border: '1px solid',
    lineHeight: 1,
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    letterSpacing: '0.01em',
};

export const SEAT_BADGE_PORTRAIT_SX = {
    '@media (orientation: portrait)': {
        minH: '14px',
        h: '14px',
        fontSize: '9px',
        px: 1,
        py: 0,
        borderRadius: '5px',
    },
};

export const SEAT_BADGE_ICON_STYLE = {
    width: { base: '11px', md: '13px' },
    height: { base: '11px', md: '13px' },
    sx: {
        '@media (orientation: portrait)': {
            width: '10px',
            height: '10px',
        },
    },
};

export const SEAT_BADGE_TOP_OFFSET = { base: -2, md: -2.5 };

type StatusConfig = {
    label: string;
    icon: IconType;
    bg: string;
    fg: string;
    borderColor: string;
    boxShadow: string;
};

const STATUS_CONFIG: Record<Exclude<SeatStatusKind, 'none'>, StatusConfig> = {
    offline: {
        label: 'Offline',
        icon: MdWifiOff,
        bg: 'brand.pink',
        fg: 'white',
        borderColor: 'brand.pinkDark',
        boxShadow:
            '0 0 16px rgba(235, 11, 92, 0.45), 0 1px 2px rgba(0, 0, 0, 0.35)',
    },
    leaving: {
        label: 'Leaving',
        icon: MdLogout,
        bg: 'brand.pink',
        fg: 'white',
        borderColor: 'brand.pinkDark',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
    },
    sittingOut: {
        label: 'Sitting out',
        icon: MdLocalCafe,
        bg: 'brand.yellow',
        fg: 'brand.darkNavy',
        borderColor: 'rgba(120, 90, 0, 0.45)',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
    },
    away: {
        label: 'Away',
        icon: MdSnooze,
        bg: 'brand.yellow',
        fg: 'brand.darkNavy',
        borderColor: 'rgba(120, 90, 0, 0.45)',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
    },
    joining: {
        label: 'Joining',
        icon: MdPersonAdd,
        bg: 'brand.green',
        fg: 'white',
        borderColor: 'brand.greenDark',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
    },
};

const SeatStatusChip = ({
    kind,
    iconOnly = false,
}: {
    kind: SeatStatusKind;
    iconOnly?: boolean;
}) => {
    return (
        <Box
            position="absolute"
            top={SEAT_BADGE_TOP_OFFSET}
            right={0}
            zIndex={5}
            pointerEvents="none"
        >
            <AnimatePresence mode="wait" initial={false}>
                {kind !== 'none' && (
                    <motion.div
                        key={kind}
                        initial={{ opacity: 0, y: -4, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.9 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                    >
                        <StatusTag kind={kind} iconOnly={iconOnly} />
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
};

const StatusTag = ({
    kind,
    iconOnly,
}: {
    kind: Exclude<SeatStatusKind, 'none'>;
    iconOnly: boolean;
}) => {
    const config = STATUS_CONFIG[kind];
    return (
        <Tag
            {...SEAT_BADGE_STYLE}
            bg={config.bg}
            color={config.fg}
            variant="solid"
            borderColor={config.borderColor}
            gap={1}
            aria-label={config.label}
            boxShadow={config.boxShadow}
            sx={SEAT_BADGE_PORTRAIT_SX}
        >
            <Icon
                as={config.icon}
                color={config.fg}
                {...SEAT_BADGE_ICON_STYLE}
            />
            {!iconOnly && (
                <Text
                    as="span"
                    color={config.fg}
                    display={{ base: 'none', md: 'inline' }}
                    lineHeight={1}
                >
                    {config.label}
                </Text>
            )}
        </Tag>
    );
};

export default SeatStatusChip;
