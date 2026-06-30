'use client';

import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import {
    Box,
    Container,
    Flex,
    HStack,
    VStack,
    Text,
    Heading,
    Image,
    Icon,
    Checkbox,
    Button,
    Link,
} from '@chakra-ui/react';
import {
    FiGift,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiSlash,
    FiAlertTriangle,
} from 'react-icons/fi';
import { USDC_LOGO } from '@/app/components/PublicGames/types';

// The claim landing page is a cold invitee's front door (a link shared on
// X / Telegram / Discord), so it lives in the brand register: warm, recreational
// readable, trustworthy, and first-class in both light and dark. This is the
// pure presentational layer — every state renders from props, so the whole
// flow can be reviewed in Storybook. The data container (FreeClaimView) feeds it.

export type ClaimTerminalVariant =
    | 'full'
    | 'started'
    | 'used'
    | 'invalid'
    | 'disabled'
    | 'registered'
    | 'self_claim'
    | 'error';

export interface ClaimTournament {
    name: string;
    status: string;
    scheduled_start_at?: string;
    buy_in_usdc: number;
    guarantee_usdc: number;
    prize_pool_usdc: number | null;
}

export type ReminderUi =
    | { mode: 'checkbox'; checked: boolean; onChange: (v: boolean) => void }
    | { mode: 'ios' }
    | { mode: 'none' };

export interface FreeClaimScreenProps {
    status: 'available' | 'success' | ClaimTerminalVariant;
    tournament?: ClaimTournament;
    /** available state */
    isAuthenticated?: boolean;
    claiming?: boolean;
    reminder?: ReminderUi;
    onClaim?: () => void;
    /** Slot for the real WalletButton (container) / a stub (stories). */
    walletSlot?: ReactNode;
    /** Slot for AddToGoogleCalendarButton, used in the iOS reminder fallback. */
    calendarSlot?: ReactNode;
    /** success + terminal */
    onView?: () => void;
    onRetry?: () => void;
    /** Slot for FriendInviteSection on the success screen. */
    friendInviteSlot?: ReactNode;
}

// Preview money is micro-USDC (1 USDC = 1,000,000). Whole-dollar, comma-grouped.
function usd(microUsdc?: number | null): string {
    return `$${((microUsdc ?? 0) / 1_000_000).toLocaleString('en-US', {
        maximumFractionDigits: 0,
    })}`;
}

function formatStart(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

// Mirrors TournamentDetail's MoneyHero label logic: pre-fill, the host guarantee
// leads (never mislabel a guarantee as a realized prize pool); once the live pool
// overtakes it, the bigger number leads.
function prizeFigure(t: ClaimTournament): {
    label: string;
    value: string;
    caption?: string;
} | null {
    const guarantee = t.guarantee_usdc ?? 0;
    const pool = t.prize_pool_usdc ?? 0;
    if (guarantee <= 0 && pool <= 0) return null;
    if (pool > guarantee) return { label: 'Prize pool', value: usd(pool) };
    return {
        label: 'Guaranteed pool',
        value: usd(guarantee),
        caption: 'Guaranteed by the Host, grows with the field',
    };
}

const TERMINAL: Record<
    ClaimTerminalVariant,
    { icon: IconType; tone: 'neutral' | 'green'; title: string; body: string }
> = {
    full: {
        icon: FiSlash,
        tone: 'neutral',
        title: 'Every free seat is taken',
        body: 'They’ve all been claimed for now. Keep an eye out, your Host may run another.',
    },
    started: {
        icon: FiClock,
        tone: 'neutral',
        title: 'Registration has closed',
        body: 'This event has already started, so free entry is no longer open.',
    },
    used: {
        icon: FiXCircle,
        tone: 'neutral',
        title: 'This invite was already used',
        body: 'Each bring-a-friend link works once. Ask your Host for the public link.',
    },
    invalid: {
        icon: FiXCircle,
        tone: 'neutral',
        title: 'This link isn’t valid',
        body: 'Double-check it, or ask whoever shared it for a fresh one.',
    },
    disabled: {
        icon: FiGift,
        tone: 'neutral',
        title: 'No free entry here',
        body: 'This event isn’t handing out free tickets right now.',
    },
    registered: {
        icon: FiCheckCircle,
        tone: 'green',
        title: 'You’re already in',
        body: 'Your seat at this event is locked. We’ll see you at the felt.',
    },
    self_claim: {
        icon: FiXCircle,
        tone: 'neutral',
        title: 'That’s your own invite',
        body: 'Share this link with a friend, you can’t claim a seat you sent yourself.',
    },
    error: {
        icon: FiAlertTriangle,
        tone: 'neutral',
        title: 'Something went wrong',
        body: 'We couldn’t load this invite just now. Give it another try.',
    },
};

function BrandMark() {
    return (
        <Link
            href="/"
            alignSelf="center"
            fontWeight={800}
            fontSize="md"
            letterSpacing="-0.02em"
            color="text.primary"
            _hover={{ textDecoration: 'none', color: 'brand.green' }}
        >
            Stacked
        </Link>
    );
}

function FreeEntryPill() {
    return (
        <HStack
            alignSelf="center"
            spacing={1.5}
            px={3}
            py={1}
            borderRadius="full"
            bg="bg.greenTint"
            borderWidth="1px"
            borderColor="border.greenSubtle"
        >
            <Icon as={FiGift} boxSize={3.5} color="brand.green" aria-hidden />
            <Text fontSize="sm" fontWeight={700} color="brand.green">
                Free entry applied
            </Text>
        </HStack>
    );
}

function TerminalIcon({
    icon,
    tone,
}: {
    icon: IconType;
    tone: 'neutral' | 'green';
}) {
    return (
        <Flex
            align="center"
            justify="center"
            boxSize={14}
            borderRadius="full"
            bg={tone === 'green' ? 'bg.greenTint' : 'bg.pillNeutral'}
        >
            <Icon
                as={icon}
                boxSize={7}
                color={tone === 'green' ? 'brand.green' : 'text.muted'}
                aria-hidden
            />
        </Flex>
    );
}

function Shell({ children }: { children: ReactNode }) {
    return (
        <Container maxW="container.sm" py={{ base: 8, md: 14 }}>
            <VStack spacing={6} align="stretch">
                <BrandMark />
                {children}
            </VStack>
        </Container>
    );
}

export default function FreeClaimScreen({
    status,
    tournament,
    isAuthenticated = false,
    claiming = false,
    reminder = { mode: 'none' },
    onClaim,
    walletSlot,
    calendarSlot,
    onView,
    onRetry,
    friendInviteSlot,
}: FreeClaimScreenProps) {
    // ── Success ──────────────────────────────────────────────────────────
    if (status === 'success') {
        return (
            <Shell>
                <VStack spacing={5} textAlign="center">
                    <Icon as={FiCheckCircle} boxSize={14} color="brand.green" />
                    <Heading size="lg" color="text.primary">
                        You’re in, free of charge
                    </Heading>
                    <Text color="text.secondary">
                        Your seat in <b>{tournament?.name}</b> is locked. We’ll
                        see you at the felt.
                    </Text>
                    <Button
                        variant="tactilePrimary"
                        size="lg"
                        w="full"
                        onClick={onView}
                    >
                        Go to the tournament
                    </Button>
                    {friendInviteSlot && (
                        <Box
                            w="full"
                            pt={2}
                            sx={{ '&:empty': { display: 'none', p: 0 } }}
                        >
                            {friendInviteSlot}
                        </Box>
                    )}
                </VStack>
            </Shell>
        );
    }

    // ── Terminal / unavailable ───────────────────────────────────────────
    if (status !== 'available') {
        const copy = TERMINAL[status];
        const isPositive = status === 'registered';
        return (
            <Shell>
                <VStack spacing={4} textAlign="center" pt={{ base: 4, md: 8 }}>
                    <TerminalIcon icon={copy.icon} tone={copy.tone} />
                    <Heading size="lg" color="text.primary">
                        {copy.title}
                    </Heading>
                    <Text color="text.secondary">{copy.body}</Text>
                    {status === 'error' ? (
                        <Button
                            variant="tactilePrimary"
                            w="full"
                            maxW="280px"
                            onClick={onRetry}
                        >
                            Try again
                        </Button>
                    ) : tournament && onView ? (
                        <Button
                            variant={
                                isPositive ? 'tactilePrimary' : 'tactileNeutral'
                            }
                            w="full"
                            maxW="280px"
                            onClick={onView}
                        >
                            {isPositive
                                ? 'Go to the tournament'
                                : `View ${tournament.name}`}
                        </Button>
                    ) : (
                        <Button
                            as="a"
                            href="/"
                            variant="tactileNeutral"
                            w="full"
                            maxW="280px"
                            _hover={{ textDecoration: 'none' }}
                        >
                            Explore Stacked
                        </Button>
                    )}
                </VStack>
            </Shell>
        );
    }

    // ── Available — the pre-claim surface ────────────────────────────────
    const figure = tournament ? prizeFigure(tournament) : null;

    return (
        <Shell>
            <VStack spacing={2} textAlign="center">
                <FreeEntryPill />
                <Heading size="lg" color="text.primary">
                    {tournament?.name}
                </Heading>
                {tournament?.scheduled_start_at && (
                    <HStack color="text.secondary" fontSize="sm" spacing={1.5}>
                        <Icon as={FiClock} aria-hidden />
                        <Text color="text.secondary">
                            {formatStart(tournament.scheduled_start_at)}
                        </Text>
                    </HStack>
                )}
            </VStack>

            {/* Prize panel — flat felt, the card-room money surface. USDC-blue
                figure + coin mark, matching TournamentDetail's MoneyHero so the
                two pages a claimer sees back-to-back agree. No gradient. */}
            {figure && (
                <Box
                    bg="card.felt"
                    borderWidth="1px"
                    borderColor="border.felt"
                    borderRadius="xl"
                    p={6}
                    textAlign="center"
                >
                    <Text
                        fontSize="2xs"
                        textTransform="uppercase"
                        letterSpacing="0.08em"
                        fontWeight="semibold"
                        color="whiteAlpha.700"
                    >
                        {figure.label}
                    </Text>
                    <HStack
                        justify="center"
                        align="center"
                        spacing={2}
                        mt={1.5}
                    >
                        <Image
                            src={USDC_LOGO}
                            alt=""
                            boxSize={{ base: '24px', md: '28px' }}
                            flexShrink={0}
                        />
                        <Text
                            // The felt ground is always Penthouse Midnight (both
                            // modes), so the figure uses MoneyHero's dark-mode money
                            // blue here in both modes — intentionally different from
                            // MoneyHero's lighter-ground light value (#2775CA).
                            color="#5C9DEF"
                            fontWeight="bold"
                            fontSize={{ base: '4xl', md: '5xl' }}
                            lineHeight="1"
                            letterSpacing="-0.02em"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            {figure.value}
                        </Text>
                    </HStack>
                    {figure.caption && (
                        <Text mt={2} fontSize="sm" color="whiteAlpha.800">
                            {figure.caption}
                        </Text>
                    )}
                </Box>
            )}

            {/* Promise + caveat read as one statement, separated from the CTA. */}
            <VStack spacing={1.5} textAlign="center">
                <Text fontSize="md" fontWeight={600} color="text.primary">
                    Your first entry is on the house, no buy-in.
                </Text>
                <Text fontSize="sm" color="text.secondary">
                    If you bust and want back in, a re-buy is a real USDC
                    buy-in. Your free entry only covers the first.
                </Text>
            </VStack>

            {/* Orientation + trust for a cold invitee who may not know Stacked. */}
            <Text fontSize="sm" color="text.muted" textAlign="center">
                New to Stacked? It’s online poker where your money stays in a
                wallet you control, and a friend saved you a free seat to try
                it.
            </Text>

            {/* Reminder lever — the biggest show-up signal. Checkbox where push is
                supported; an honest add-to-home-screen + calendar fallback on iOS. */}
            {reminder.mode === 'checkbox' && (
                <Checkbox
                    isChecked={reminder.checked}
                    onChange={(e) => reminder.onChange(e.target.checked)}
                    colorScheme="green"
                    alignSelf="center"
                >
                    Remind me before it starts
                </Checkbox>
            )}
            {reminder.mode === 'ios' && (
                <VStack spacing={2} align="center">
                    <Text
                        fontSize="sm"
                        color="text.secondary"
                        textAlign="center"
                    >
                        Want a reminder before it starts? Add Stacked to your
                        home screen. Tap Share, then Add to Home Screen.
                    </Text>
                    {calendarSlot}
                </VStack>
            )}

            {/* CTA */}
            {isAuthenticated ? (
                <Button
                    variant="tactilePrimary"
                    size="lg"
                    w="full"
                    onClick={onClaim}
                    isLoading={claiming}
                    loadingText="Locking your seat…"
                >
                    Lock my free seat
                </Button>
            ) : (
                <VStack spacing={2}>
                    <Text
                        fontSize="sm"
                        color="text.secondary"
                        textAlign="center"
                    >
                        One tap to sign in and lock your seat.
                    </Text>
                    {walletSlot}
                </VStack>
            )}
        </Shell>
    );
}
