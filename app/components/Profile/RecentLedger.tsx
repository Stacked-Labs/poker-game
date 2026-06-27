'use client';

import { useMemo, useState } from 'react';
import { Box, Button, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { FaCrown, FaUsers } from 'react-icons/fa';
import { FaMedal } from 'react-icons/fa6';
import { relativeTime, absoluteTime } from '@/app/utils/relativeTime';

export type Activity =
    | {
          type: 'result';
          id: number;
          name: string;
          finishPosition: number;
          prizeUsdc: number;
          endedAt: string | null;
          buyInUsdc?: number;
          fieldSize?: number;
          format?: string;
      }
    | {
          type: 'hosted';
          id: number;
          name: string;
          entrants: number;
          endedAt: string | null;
          status?: string;
          buyInUsdc?: number;
          format?: string;
      };

export interface RecentLedgerProps {
    items: Activity[];
}

export function ordinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function usdc(base: number): string {
    return (base / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function stake(buyInUsdc?: number): string | null {
    if (buyInUsdc === undefined) return null;
    return buyInUsdc === 0 ? 'Free' : `$${usdc(buyInUsdc)}`;
}

const FORMAT_LABEL: Record<string, string> = {
    standard_mtt: 'MTT',
    sit_n_go: 'Sit & Go',
    turbo: 'Turbo',
    hyper: 'Hyper',
};
function formatLabel(format?: string): string | null {
    if (!format) return null;
    return FORMAT_LABEL[format] ?? format.replace(/_/g, ' ');
}

type Filter = 'all' | 'played' | 'hosted';
const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'played', label: 'Played' },
    { key: 'hosted', label: 'Hosted' },
];

// Column widths shared by header + rows so everything aligns into a real table.
const COL_RESULT = { base: '76px', md: '104px' };
const COL_RIGHT = { base: '72px', md: '96px' };

// The recent ledger: ONE uniform row shape for both played + hosted (identity + meta on the
// left, a result column, a prize/status column), aligned like a table and as data-rich as the
// payload allows. Live/in-progress is pinned by the container; win gold is quarantined from tier.
export default function RecentLedger({ items }: RecentLedgerProps) {
    const [filter, setFilter] = useState<Filter>('all');
    const hasResults = items.some((i) => i.type === 'result');
    const hasHosted = items.some((i) => i.type === 'hosted');

    const shown = useMemo(() => {
        if (filter === 'played') return items.filter((i) => i.type === 'result');
        if (filter === 'hosted') return items.filter((i) => i.type === 'hosted');
        return items;
    }, [items, filter]);

    if (items.length === 0) return null;

    return (
        <Box
            bg="card.white"
            border="1px solid"
            borderColor="border.felt"
            borderRadius="20px"
            p={{ base: 4, md: 5 }}
        >
            <HStack justify="space-between" align="center" mb={3} flexWrap="wrap" gap={2}>
                <Text
                    as="h2"
                    fontSize="xs"
                    fontWeight={700}
                    letterSpacing="0.04em"
                    textTransform="uppercase"
                    color="text.muted"
                >
                    Recent
                </Text>
                {hasResults && hasHosted && (
                    <HStack spacing={1}>
                        {FILTERS.map((f) => {
                            const active = filter === f.key;
                            return (
                                <Button
                                    key={f.key}
                                    onClick={() => setFilter(f.key)}
                                    variant="unstyled"
                                    h="28px"
                                    minW="auto"
                                    px={2.5}
                                    borderRadius="full"
                                    fontSize="2xs"
                                    fontWeight={700}
                                    bg={active ? 'bg.greenTint' : 'bg.pillNeutral'}
                                    color={active ? 'brand.green' : 'text.secondary'}
                                    _focusVisible={{ boxShadow: 'focus.ring' }}
                                >
                                    {f.label}
                                </Button>
                            );
                        })}
                    </HStack>
                )}
            </HStack>

            {/* Column header (desktop) — gives the ledger a real table read. */}
            <HStack
                display={{ base: 'none', md: 'flex' }}
                spacing={3}
                px={1}
                pb={2}
                borderBottom="1px solid"
                borderColor="border.lightGray"
            >
                <Text flex={1} fontSize="2xs" fontWeight={700} letterSpacing="0.06em" textTransform="uppercase" color="text.muted">
                    Event
                </Text>
                <Text w={COL_RESULT} textAlign="right" fontSize="2xs" fontWeight={700} letterSpacing="0.06em" textTransform="uppercase" color="text.muted">
                    Result
                </Text>
                <Text w={COL_RIGHT} textAlign="right" fontSize="2xs" fontWeight={700} letterSpacing="0.06em" textTransform="uppercase" color="text.muted">
                    Prize
                </Text>
            </HStack>

            <VStack
                align="stretch"
                spacing={0}
                divider={<Box h="1px" bg="border.lightGray" opacity={0.55} />}
            >
                {shown.map((it) =>
                    it.type === 'result' ? (
                        <ResultRow key={`r-${it.id}`} item={it} />
                    ) : (
                        <HostedRow key={`h-${it.id}`} item={it} />
                    )
                )}
            </VStack>
        </Box>
    );
}

// Shared left zone: type icon + name + a compact meta sub-line (date · buy-in · format).
function EventCell({
    icon,
    iconColor,
    iconDark,
    name,
    endedAt,
    buyInUsdc,
    format,
}: {
    icon: typeof FaCrown;
    iconColor: string;
    iconDark?: string;
    name: string;
    endedAt: string | null;
    buyInUsdc?: number;
    format?: string;
}) {
    const meta: { text: string; live?: boolean }[] = [];
    if (endedAt === null) meta.push({ text: 'Live', live: true });
    else {
        const rel = relativeTime(endedAt);
        if (rel) meta.push({ text: rel });
    }
    const s = stake(buyInUsdc);
    if (s) meta.push({ text: s });
    const fmt = formatLabel(format);
    if (fmt) meta.push({ text: fmt });

    return (
        <HStack spacing={2.5} flex={1} minW={0}>
            <Icon
                as={icon}
                color={iconColor}
                _dark={iconDark ? { color: iconDark } : undefined}
                boxSize="15px"
                flexShrink={0}
                aria-hidden
            />
            <VStack align="start" spacing={0} minW={0}>
                <Text color="text.primary" noOfLines={1} fontWeight={600} fontSize="sm">
                    {name}
                </Text>
                <HStack spacing={1.5} minW={0}>
                    {meta.map((m, i) => (
                        <HStack key={i} spacing={1.5} flexShrink={0}>
                            {i > 0 && (
                                <Text fontSize="2xs" color="text.muted" aria-hidden>
                                    ·
                                </Text>
                            )}
                            {m.live && (
                                <Box boxSize="6px" borderRadius="full" bg="brand.green" />
                            )}
                            <Text
                                fontSize="2xs"
                                color={m.live ? 'brand.green' : 'text.muted'}
                                fontWeight={m.live ? 700 : 500}
                                title={!m.live && endedAt ? absoluteTime(endedAt) : undefined}
                            >
                                {m.text}
                            </Text>
                        </HStack>
                    ))}
                </HStack>
            </VStack>
        </HStack>
    );
}

function ResultRow({ item }: { item: Extract<Activity, { type: 'result' }> }) {
    const isWin = item.finishPosition === 1;
    const isPodium = item.finishPosition >= 1 && item.finishPosition <= 3;
    return (
        <HStack
            spacing={3}
            py={2}
            px={isWin ? 2 : 0}
            bg={isWin ? 'bg.yellowTint' : 'transparent'}
            border={isWin ? '1px solid' : undefined}
            borderColor={isWin ? 'border.yellowSubtle' : undefined}
            borderRadius={isWin ? '8px' : undefined}
            transition="background-color 0.15s ease"
            _hover={{ bg: isWin ? 'bg.yellowTint' : 'bg.pillNeutral' }}
        >
            <EventCell
                icon={isWin ? FaCrown : isPodium ? FaMedal : FaUsers}
                iconColor={isWin ? 'brand.yellowDark' : isPodium ? 'text.gray600' : 'text.muted'}
                iconDark={isWin ? 'brand.yellow' : undefined}
                name={item.name}
                endedAt={item.endedAt}
                buyInUsdc={item.buyInUsdc}
                format={item.format}
            />
            <Box w={COL_RESULT} textAlign="right" flexShrink={0}>
                <Text
                    fontSize="sm"
                    fontWeight={700}
                    color={isWin ? 'brand.yellowDark' : 'text.primary'}
                    _dark={isWin ? { color: 'brand.yellow' } : undefined}
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {ordinal(item.finishPosition)}
                </Text>
                {item.fieldSize ? (
                    <Text fontSize="2xs" color="text.muted">
                        of {item.fieldSize.toLocaleString()}
                    </Text>
                ) : null}
            </Box>
            <Box w={COL_RIGHT} textAlign="right" flexShrink={0}>
                {item.prizeUsdc > 0 ? (
                    <Text
                        fontSize="sm"
                        fontWeight={700}
                        color="text.usdc"
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        +${usdc(item.prizeUsdc)}
                    </Text>
                ) : (
                    <Text fontSize="sm" color="text.muted">
                        —
                    </Text>
                )}
            </Box>
        </HStack>
    );
}

function HostedRow({ item }: { item: Extract<Activity, { type: 'hosted' }> }) {
    return (
        <HStack
            spacing={3}
            py={2}
            transition="background-color 0.15s ease"
            _hover={{ bg: 'bg.pillNeutral' }}
        >
            <EventCell
                icon={FaUsers}
                iconColor="text.secondary"
                name={`Hosted · ${item.name}`}
                endedAt={item.endedAt}
                buyInUsdc={item.buyInUsdc}
                format={item.format}
            />
            <Box w={COL_RESULT} textAlign="right" flexShrink={0}>
                <Text
                    fontSize="sm"
                    fontWeight={700}
                    color="text.primary"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {item.entrants.toLocaleString()}
                </Text>
                <Text fontSize="2xs" color="text.muted">
                    entrants
                </Text>
            </Box>
            <Box w={COL_RIGHT} textAlign="right" flexShrink={0}>
                {item.status ? (
                    <Text
                        fontSize="2xs"
                        fontWeight={700}
                        color="text.secondary"
                        bg="bg.pillNeutral"
                        px={1.5}
                        py={0.5}
                        borderRadius="full"
                        textTransform="capitalize"
                        display="inline-block"
                    >
                        {item.status}
                    </Text>
                ) : (
                    <Text fontSize="sm" color="text.muted">
                        —
                    </Text>
                )}
            </Box>
        </HStack>
    );
}
