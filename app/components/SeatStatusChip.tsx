import React from 'react';
import { Box, Tag, Icon, Text } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    MdWifiOff,
    MdLogout,
    MdLocalCafe,
    MdPerson,
} from 'react-icons/md';
import type { IconType } from 'react-icons';
import type { SeatStatusKind } from '../lib/seatStatus';

type StatusConfig = {
    label: string;
    icon: IconType;
    bg: string;
    fg: string;
};

const STATUS_CONFIG: Record<Exclude<SeatStatusKind, 'none'>, StatusConfig> = {
    offline: {
        label: 'Offline',
        icon: MdWifiOff,
        bg: 'gray.600',
        fg: 'gray.100',
    },
    leaving: {
        label: 'Leaving',
        icon: MdLogout,
        bg: 'brand.pink',
        fg: 'brand.lightGray',
    },
    sittingOut: {
        label: 'Sitting out',
        icon: MdLocalCafe,
        bg: 'brand.yellow',
        fg: 'brand.lightNavy',
    },
    away: {
        label: 'Away',
        icon: MdPerson,
        bg: 'brand.yellow',
        fg: 'brand.darkNavy',
    },
    joining: {
        label: 'Joining',
        icon: MdPerson,
        bg: 'brand.lightGray',
        fg: 'brand.darkNavy',
    },
};

const SeatStatusChip = ({ kind }: { kind: SeatStatusKind }) => {
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
                        <StatusTag kind={kind} />
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
};

const StatusTag = ({ kind }: { kind: Exclude<SeatStatusKind, 'none'> }) => {
    const config = STATUS_CONFIG[kind];
    return (
        <Tag
            bg={config.bg}
            color={config.fg}
            variant="solid"
            size={{ base: 'xs', md: 'sm' }}
            fontSize={{ base: '8px', md: 'sm' }}
            px={{ base: 1, md: 2 }}
            py={{ base: 0.1, md: 0.2 }}
            fontWeight="bold"
            borderRadius="6px"
            display="flex"
            alignItems="center"
            gap={1}
            aria-label={config.label}
            boxShadow={
                kind === 'offline' ? '0 2px 8px rgba(0, 0, 0, 0.3)' : undefined
            }
        >
            <Icon
                as={config.icon}
                color={config.fg}
                boxSize={{ base: 2.5, md: 3 }}
            />
            <Text
                as="span"
                color={config.fg}
                display={{ base: 'none', md: 'inline' }}
            >
                {config.label}
            </Text>
        </Tag>
    );
};

export default SeatStatusChip;
