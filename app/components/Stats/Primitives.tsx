'use client';

import {
    Text,
    Flex,
    Box,
    Badge,
    HStack,
    VStack,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
} from '@chakra-ui/react';
import { ReactNode } from 'react';

// ── Icons ──────────────────────────────────────────────────────────────────────

export const RefreshIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
);

// ── Helpers ────────────────────────────────────────────────────────────────────

export const StatusDot = ({ ok }: { ok: boolean }) => (
    <Box
        display="inline-block"
        w="10px"
        h="10px"
        borderRadius="full"
        flexShrink={0}
        bg={ok ? 'brand.green' : 'brand.pink'}
        boxShadow="inset 0 0 0 1px rgba(0,0,0,0.15)"
        _dark={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)' }}
    />
);

export const ChainSelector = ({
    value,
    onChange,
}: {
    value: 'base' | 'base-sepolia';
    onChange: (v: 'base' | 'base-sepolia') => void;
}) => (
    <HStack gap={2}>
        {([
            { key: 'base' as const,         label: 'Base',         badge: 'Mainnet' },
            { key: 'base-sepolia' as const, label: 'Base Sepolia', badge: 'Testnet' },
        ] as const).map(({ key, label, badge }) => {
            const active = value === key;
            return (
                <Box
                    key={key}
                    as="button"
                    type="button"
                    px={3}
                    py={1.5}
                    borderRadius="full"
                    fontSize="sm"
                    fontWeight={700}
                    letterSpacing="0.02em"
                    cursor="pointer"
                    display="flex"
                    alignItems="center"
                    gap={1.5}
                    onClick={() => onChange(key)}
                    bg={active ? 'brand.green' : 'rgba(0,0,0,0.05)'}
                    color={active ? 'white' : 'text.secondary'}
                    border="1px solid"
                    borderColor={active ? 'transparent' : 'rgba(0,0,0,0.10)'}
                    boxShadow={
                        active
                            ? 'inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 0 #22674E'
                            : 'inset 0 1px 0 rgba(255,255,255,0.50), 0 1px 0 rgba(0,0,0,0.10)'
                    }
                    transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease, color 80ms ease, border-color 80ms ease"
                    _hover={
                        active
                            ? { bg: 'brand.green' }
                            : { bg: 'rgba(0,0,0,0.08)', color: 'text.primary', borderColor: 'rgba(0,0,0,0.18)' }
                    }
                    _active={
                        active
                            ? {
                                  bg: 'brand.greenDark',
                                  transform: 'translateY(1px)',
                                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #22674E',
                              }
                            : {
                                  bg: 'rgba(0,0,0,0.12)',
                                  transform: 'translateY(1px)',
                                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15), 0 0 0 transparent',
                              }
                    }
                    _focusVisible={{
                        outline: 'none',
                        boxShadow: active
                            ? 'inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 0 #22674E, 0 0 0 3px rgba(54, 163, 123, 0.45)'
                            : '0 0 0 3px rgba(54, 163, 123, 0.45)',
                    }}
                    _dark={
                        active
                            ? {}
                            : {
                                  bg: 'rgba(255,255,255,0.06)',
                                  color: 'rgba(255,255,255,0.85)',
                                  borderColor: 'rgba(255,255,255,0.14)',
                                  boxShadow:
                                      'inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 0 rgba(0,0,0,0.4)',
                                  _hover: {
                                      bg: 'rgba(255,255,255,0.10)',
                                      color: 'white',
                                      borderColor: 'rgba(255,255,255,0.20)',
                                  },
                                  _active: {
                                      bg: 'rgba(0,0,0,0.20)',
                                      transform: 'translateY(1px)',
                                      boxShadow:
                                          'inset 0 1px 2px rgba(0,0,0,0.30), 0 0 0 transparent',
                                  },
                              }
                    }
                >
                    {label}
                    <Badge
                        fontSize="2xs"
                        px={1.5}
                        py={0.5}
                        borderRadius="full"
                        bg={active ? 'whiteAlpha.300' : 'rgba(0,0,0,0.06)'}
                        color={active ? 'white' : 'text.secondary'}
                        _dark={
                            active
                                ? {}
                                : { bg: 'whiteAlpha.100', color: 'whiteAlpha.800' }
                        }
                    >
                        {badge}
                    </Badge>
                </Box>
            );
        })}
    </HStack>
);

export const stateColor = (state: string) => {
    switch (state) {
        case 'operational': return 'brand.green';
        case 'degraded':    return 'brand.yellow';
        case 'downtime':    return 'brand.pink';
        default:            return 'border.lightGray';
    }
};

export const stateOk = (state: string) => state === 'operational';

export const fmt = (n: number | undefined) => (n === undefined || n === null ? '—' : n.toLocaleString());

// ── Card wrapper ───────────────────────────────────────────────────────────────

export const Card = ({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: ReactNode;
    children: ReactNode;
}) => (
    <Box
        bg="card.white"
        borderRadius="16px"
        p={6}
        border="1px solid"
        borderColor="border.lightGray"
        _dark={{ borderColor: 'whiteAlpha.100' }}
        boxShadow="card.lift"
    >
        <Flex align="center" justify="space-between" mb={4}>
            <Text fontSize="md" fontWeight="extrabold" color="text.primary">{title}</Text>
            {subtitle && (
                <Text
                    fontSize="xs"
                    color="text.secondary"
                    _dark={{ color: 'whiteAlpha.600' }}
                >
                    {subtitle}
                </Text>
            )}
        </Flex>
        {children}
    </Box>
);

// ── Big stat card ──────────────────────────────────────────────────────────────

export const StatCard = ({
    label,
    value,
    helpText,
    accent,
}: {
    label: string;
    value: number | string | undefined;
    helpText?: string;
    accent?: string;
}) => (
    <Box
        bg="card.white"
        borderRadius="16px"
        p={5}
        border="1px solid"
        borderColor="border.lightGray"
        _dark={{ borderColor: 'whiteAlpha.100' }}
        boxShadow="card.lift"
    >
        <Stat>
            <StatLabel
                fontSize="sm"
                color="text.secondary"
                fontWeight="medium"
                _dark={{ color: 'whiteAlpha.700' }}
            >
                {label}
            </StatLabel>
            <StatNumber
                fontSize={{ base: '2xl', md: '3xl' }}
                fontWeight="extrabold"
                color={accent ?? 'text.primary'}
                lineHeight={1.1}
                mt={1}
                sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
                {value === undefined || value === null ? '—' : typeof value === 'number' ? value.toLocaleString() : value}
            </StatNumber>
            {helpText && (
                <StatHelpText
                    fontSize="xs"
                    color="text.secondary"
                    mt={1}
                    _dark={{ color: 'whiteAlpha.600' }}
                >
                    {helpText}
                </StatHelpText>
            )}
        </Stat>
    </Box>
);

// ── Health service card ────────────────────────────────────────────────────────

export const ServiceCard = ({
    name,
    ok,
    rows,
    children,
}: {
    name: string;
    ok: boolean;
    rows?: { label: string; value: ReactNode; mono?: boolean }[];
    children?: ReactNode;
}) => (
    <Box
        bg="card.white"
        borderRadius="16px"
        p={6}
        border="1px solid"
        borderColor={ok ? 'border.lightGray' : 'brand.pink'}
        _dark={ok ? { borderColor: 'whiteAlpha.100' } : { borderColor: 'brand.pink' }}
        boxShadow={ok ? 'card.lift' : '0 8px 24px rgba(235, 11, 92, 0.14)'}
        flex={1}
    >
        <HStack mb={4} gap={2.5}>
            <StatusDot ok={ok} />
            <Text fontSize="md" fontWeight="extrabold" color="text.primary">{name}</Text>
        </HStack>
        {rows && (
            <VStack align="stretch" gap={2}>
                {rows.map(({ label, value, mono }) => (
                    <Flex
                        key={label}
                        justify="space-between"
                        align="center"
                        py={2}
                        px={3}
                        bg="card.lightGray"
                        borderRadius="8px"
                        _dark={{ bg: 'whiteAlpha.50' }}
                    >
                        <Text
                            fontSize="sm"
                            color="text.secondary"
                            _dark={{ color: 'whiteAlpha.700' }}
                        >
                            {label}
                        </Text>
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color="text.primary"
                            fontFamily={mono ? 'monospace' : undefined}
                            sx={mono ? { fontVariantNumeric: 'tabular-nums' } : undefined}
                        >
                            {value}
                        </Text>
                    </Flex>
                ))}
            </VStack>
        )}
        {children}
    </Box>
);
