'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Box, Button, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { FaCrown, FaUsers } from 'react-icons/fa';
import { FaMedal } from 'react-icons/fa6';
import { relativeTime, absoluteTime } from '@/app/utils/relativeTime';
import { formatUsdcMicro } from '@/app/utils/usdc';

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

function stake(buyInUsdc?: number): string | null {
    if (buyInUsdc === undefined) return null;
    return buyInUsdc === 0 ? 'Free' : `$${formatUsdcMicro(buyInUsdc)}`;
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

// Hosted-tournament lifecycle → a friendly status chip. The chip is driven by the real status,
// NOT by a missing end-timestamp, so a Cancelled/Completed tournament never reads "Live".
const STATUS_META: Record<
    string,
    { label: string; fg: string; fgDark?: string; bg: string; live?: boolean }
> = {
    running: { label: 'Live', fg: 'brand.green', bg: 'bg.greenTint', live: true },
    late_registration: { label: 'Live', fg: 'brand.green', bg: 'bg.greenTint', live: true },
    registration: { label: 'Registering', fg: 'text.secondary', bg: 'bg.pillNeutral' },
    pending: { label: 'Upcoming', fg: 'text.secondary', bg: 'bg.pillNeutral' },
    completed: { label: 'Completed', fg: 'text.muted', bg: 'bg.pillNeutral' },
    cancelled: { label: 'Cancelled', fg: 'text.muted', bg: 'bg.pillNeutral' },
    emergency_refund: { label: 'Refunded', fg: 'brand.yellowDark', fgDark: 'brand.yellow', bg: 'bg.yellowTint' },
};
function humanizeStatus(s: string): string {
    return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function StatusChip({ status }: { status: string }) {
    const m = STATUS_META[status.toLowerCase()];
    const label = m?.label ?? humanizeStatus(status);
    return (
        <HStack
            spacing={1}
            bg={m?.bg ?? 'bg.pillNeutral'}
            px={1.5}
            py={0.5}
            borderRadius="full"
            flexShrink={0}
        >
            {m?.live && <Box boxSize="5px" borderRadius="full" bg="brand.green" aria-hidden />}
            <Text
                fontSize="2xs"
                fontWeight={700}
                letterSpacing="0.02em"
                color={m?.fg ?? 'text.secondary'}
                _dark={m?.fgDark ? { color: m.fgDark } : undefined}
            >
                {label}
            </Text>
        </HStack>
    );
}

function MetaText({ children, title }: { children: ReactNode; title?: string }) {
    return (
        <Text fontSize="2xs" color="text.muted" fontWeight={500} title={title}>
            {children}
        </Text>
    );
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
// One horizontal padding for EVERY row (and the header) so nothing insets differently — the win
// highlight is a full-width tint, not a box that sticks out.
const ROW_PX = { base: 2, md: 3 };

// The recent ledger: one uniform row shape for played + hosted, aligned like a table. The win row
// carries the single warm accent as a same-width tint; hosted status reads from a real chip.
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
                                    border="none"
                                    h="28px"
                                    minW="auto"
                                    px={2.5}
                                    borderRadius="full"
                                    fontSize="2xs"
                                    fontWeight={700}
                                    bg={active ? 'bg.greenTint' : 'bg.pillNeutral'}
                                    color={active ? 'brand.green' : 'text.secondary'}
                                    transition="background-color 0.12s ease, color 0.12s ease"
                                    _hover={
                                        active
                                            ? { bg: 'bg.greenTint', color: 'brand.greenDark' }
                                            : { bg: 'border.pillNeutral', color: 'text.primary' }
                                    }
                                    _focusVisible={{ boxShadow: 'focus.ring' }}
                                >
                                    {f.label}
                                </Button>
                            );
                        })}
                    </HStack>
                )}
            </HStack>

            {/* Column header (desktop) — same horizontal padding as the rows so columns line up. */}
            <HStack
                display={{ base: 'none', md: 'flex' }}
                spacing={3}
                px={ROW_PX}
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

            <VStack align="stretch" spacing={1} mt={1}>
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

function Row({ children, highlight }: { children: ReactNode; highlight?: boolean }) {
    return (
        <HStack
            spacing={3}
            px={ROW_PX}
            py={2.5}
            borderRadius="10px"
            bg={highlight ? 'bg.yellowTint' : 'transparent'}
            transition="background-color 0.15s ease"
            _hover={{ bg: highlight ? 'bg.yellowTint' : 'bg.pillNeutral' }}
        >
            {children}
        </HStack>
    );
}

// Left zone: type icon + name + a compact meta line built by each row.
function EventCell({
    icon,
    iconColor,
    iconDark,
    name,
    meta,
}: {
    icon: typeof FaCrown;
    iconColor: string;
    iconDark?: string;
    name: string;
    meta: ReactNode[];
}) {
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
            <VStack align="start" spacing={1} minW={0}>
                <Text color="text.primary" noOfLines={1} fontWeight={600} fontSize="sm">
                    {name}
                </Text>
                {meta.length > 0 && (
                    <HStack spacing={1.5} minW={0} rowGap={1} flexWrap="wrap">
                        {meta.map((m, i) => (
                            <HStack key={i} spacing={1.5} flexShrink={0}>
                                {i > 0 && (
                                    <Text fontSize="2xs" color="text.muted" aria-hidden>
                                        ·
                                    </Text>
                                )}
                                {m}
                            </HStack>
                        ))}
                    </HStack>
                )}
            </VStack>
        </HStack>
    );
}

function ResultRow({ item }: { item: Extract<Activity, { type: 'result' }> }) {
    const isWin = item.finishPosition === 1;
    const isPodium = item.finishPosition >= 1 && item.finishPosition <= 3;

    const meta: ReactNode[] = [];
    if (item.endedAt) {
        meta.push(<MetaText title={absoluteTime(item.endedAt)}>{relativeTime(item.endedAt)}</MetaText>);
    }
    const s = stake(item.buyInUsdc);
    if (s) meta.push(<MetaText>{s}</MetaText>);
    const fmt = formatLabel(item.format);
    if (fmt) meta.push(<MetaText>{fmt}</MetaText>);

    return (
        <Row highlight={isWin}>
            <EventCell
                icon={isWin ? FaCrown : isPodium ? FaMedal : FaUsers}
                iconColor={isWin ? 'brand.yellowDark' : isPodium ? 'text.gray600' : 'text.muted'}
                iconDark={isWin ? 'brand.yellow' : undefined}
                name={item.name}
                meta={meta}
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
                    <Text fontSize="sm" fontWeight={700} color="text.usdc" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        +${formatUsdcMicro(item.prizeUsdc)}
                    </Text>
                ) : (
                    <Text fontSize="sm" color="text.muted">
                        —
                    </Text>
                )}
            </Box>
        </Row>
    );
}

function HostedRow({ item }: { item: Extract<Activity, { type: 'hosted' }> }) {
    const meta: ReactNode[] = [];
    if (item.status) meta.push(<StatusChip status={item.status} />);
    if (item.endedAt) {
        meta.push(<MetaText title={absoluteTime(item.endedAt)}>{relativeTime(item.endedAt)}</MetaText>);
    }
    const s = stake(item.buyInUsdc);
    if (s) meta.push(<MetaText>{s}</MetaText>);
    const fmt = formatLabel(item.format);
    if (fmt) meta.push(<MetaText>{fmt}</MetaText>);

    return (
        <Row>
            <EventCell icon={FaUsers} iconColor="text.secondary" name={`Hosted · ${item.name}`} meta={meta} />
            <Box w={COL_RESULT} textAlign="right" flexShrink={0}>
                <Text fontSize="sm" fontWeight={700} color="text.primary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {item.entrants.toLocaleString()}
                </Text>
                <Text fontSize="2xs" color="text.muted">
                    entrants
                </Text>
            </Box>
            <Box w={COL_RIGHT} textAlign="right" flexShrink={0}>
                <Text fontSize="sm" color="text.muted">
                    —
                </Text>
            </Box>
        </Row>
    );
}
