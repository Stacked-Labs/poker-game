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
            top={{ base: -2, md: -3 }}
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
            bg={config.bg}
            color={config.fg}
            variant="solid"
            size={{ base: 'xs', md: 'sm' }}
            fontSize={{ base: '8px', md: 'sm' }}
            px={iconOnly ? 1 : { base: 1, md: 2 }}
            py={iconOnly ? 0.5 : { base: 0.5, md: 1 }}
            fontWeight="bold"
            borderRadius="6px"
            border="1px solid"
            borderColor={config.borderColor}
            display="flex"
            alignItems="center"
            gap={iconOnly ? 0 : 1}
            aria-label={config.label}
            boxShadow={config.boxShadow}
        >
            <Icon
                as={config.icon}
                color={config.fg}
                boxSize={{ base: 3, md: 3 }}
            />
            {!iconOnly && (
                <Text
                    as="span"
                    color={config.fg}
                    display={{ base: 'none', md: 'inline' }}
                >
                    {config.label}
                </Text>
            )}
        </Tag>
    );
};

export default SeatStatusChip;
