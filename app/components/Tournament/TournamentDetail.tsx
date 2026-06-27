'use client';

import { Fragment, useRef, useState, type ReactNode } from 'react';
import {
    Box,
    Button,
    Container,
    Divider,
    Flex,
    HStack,
    Icon,
    IconButton,
    Image,
    Input,
    Link,
    Spinner,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Table,
    Tabs,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tooltip,
    Tr,
    useBreakpointValue,
    useColorModeValue,
    usePrefersReducedMotion,
    VStack,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import type { IconType } from 'react-icons';
import {
    FiArrowLeft,
    FiCamera,
    FiCheck,
    FiClock,
    FiEdit2,
    FiExternalLink,
    FiGlobe,
    FiLink,
    FiShield,
    FiX,
} from 'react-icons/fi';
import { FaChartLine, FaDiscord, FaTelegram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import useToastHelper from '../../hooks/useToastHelper';
import type { Tournament } from '../../hooks/server_actions';
import type { LeaderboardPlayer } from '../../interfaces';
import ChainBadge from '../ChainBadge';
import { SocialIconButton, type SocialTone } from '../SocialIconButton';
import PlayerAvatar from '../PlayerAvatar';
import PlayerNameLink from '../PlayerNameLink';
import ExternalLink from '../ExternalLink';
import Footer from '../HomePage/Footer';
import StructureSheet from './StructureSheet';
import PayoutLadder, { RankBadge } from './PayoutLadder';
import AboutPanel from './AboutPanel';
import FreeTicketsPanel from './FreeTicketsPanel';
import { USDC_BLUE, USDC_LOGO } from '../PublicGames/types';
import {
    formatTournamentStart,
    formatUsdc,
    formatUsdcAuto,
    getStatusDescriptor,
    HIDE_X_SCROLLBAR_SX,
    isFreePlay as getIsFreePlay,
    useCountdown,
} from '../PublicGames/tournamentFormat';
import {
    identityFor,
    TournamentDefaultAvatar,
    TournamentDefaultCover,
} from '../PublicGames/tournamentDefaults';
import {
    bbAtLateRegClose,
    levelDurationMin,
    startingBigBlinds,
    templateLabel,
} from '../PublicGames/blindStructures';
import {
    payoutForPosition,
    placesPaid,
    projectedPrizePoolUsdc,
} from '../PublicGames/payouts';
import { shortenAddress, playerDisplayName } from '@/app/utils/address';

// LeaderboardPlayer now lives in app/interfaces (shared with the live-tournament
// state slice). Re-exported here so existing `from './TournamentDetail'` imports
// (page.tsx, stories) keep working.
export type { LeaderboardPlayer };

// The host keeps 25% of the platform fee (Tournament.sol HOST_SHARE_BPS = 2500);
// the platform keeps the rest. Used to project the host's take during signup.
const HOST_FEE_SHARE_BPS = 2500;

export interface RefundState {
    loading?: boolean;
    alreadyClaimed?: boolean;
    eligible?: boolean;
    estimatedUsdc?: number | null;
    claiming?: boolean;
}

export interface EmergencyState {
    opened?: boolean;
    available?: boolean;
    opening?: boolean;
    msUntilAvailable?: number;
}

// A winner whose auto-payout push failed at settlement; the prize sits in the
// contract's claimable bucket until they pull it. claimableUsdc in micro-USDC.
export interface UnclaimedPrizeState {
    loading?: boolean;
    claimableUsdc?: number | null;
    claiming?: boolean;
    claimed?: boolean;
}

// Host community links. Any may be empty; chart_url is provider-agnostic.
export interface CommunityLinkValues {
    x_url?: string;
    website_url?: string;
    discord_url?: string;
    telegram_url?: string;
    chart_url?: string;
}

export interface TournamentDetailProps {
    tournament: Tournament;
    players: LeaderboardPlayer[];
    /** Players signed up while the tournament is still in its registration
     *  window (before anyone is seated). Empty once it starts. */
    registrants?: LeaderboardPlayer[];
    myWallet?: string;
    /** Whether the viewer has a verified (SIWE) session. When false, the
     * register / late-register / re-enter CTAs become a sign-in prompt. */
    isSignedIn?: boolean;
    isRegistered?: boolean;
    blindLevel?: number | null;
    /** True while the tournament is on a scheduled rest break (from /clock). */
    onBreak?: boolean;
    actionLoading?: boolean;
    actionLabel?: string;
    goToTableLoading?: boolean;
    /** Host-only: claimable rake in micro-USDC (null = loading). */
    hostRakeUsdc?: number | null;
    rakeClaiming?: boolean;
    refund?: RefundState;
    emergency?: EmergencyState;
    /** Viewer's failed-push prize awaiting a manual claim (completed only). */
    unclaimed?: UnclaimedPrizeState;
    /** Host-only: their reserved guarantee deposit in micro-USDC, reclaimable in
     *  emergency-refund state (null = loading). */
    hostEmergencyRefundUsdc?: number | null;
    hostRefundClaiming?: boolean;
    onRegister?: (isReentry?: boolean) => void;
    onUnregister?: () => void;
    onGoToTable?: () => void;
    onFundAndOpen?: () => void;
    onClaimRake?: () => void;
    onClaimRefund?: () => void;
    onClaimPrize?: () => void;
    onEnableEmergencyRefund?: () => void;
    onClaimHostEmergencyRefund?: () => void;
    onBack?: () => void;
    /** Host-only inline edits. Called with the new value so the parent can
     *  persist it via PATCH /api/tournaments/:id. */
    onUpdateBranding?: (patch: {
        logo_url?: string | null;
        banner_url?: string | null;
    }) => void;
    onUpdateDescription?: (description: string) => void;
    onUpdateLinks?: (links: CommunityLinkValues) => void;
    /** Host-only: upload a branding image. Resolves once stored + persisted;
     *  rejects (so the editor reverts its preview) on failure. */
    onUploadImage?: (kind: 'logo' | 'banner', file: File) => Promise<void>;
}

const dotPulse = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 rgba(54, 163, 123, 0.5); }
    50%      { box-shadow: 0 0 0 5px rgba(54, 163, 123, 0); }
`;
// Broadcast-style "live" pulse for the sticky action bar: a Neon Stake ring that
// breathes outward, so a running tournament reads as on-air at a glance.
const livePulseRed = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 rgba(235, 11, 92, 0.55); }
    50%      { box-shadow: 0 0 0 6px rgba(235, 11, 92, 0); }
`;
// Progress bar grows from the left on mount; a soft highlight sweeps across it.
const fillGrow = keyframes`
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
`;
const fillShimmer = keyframes`
    0%        { transform: translateX(-120%); }
    55%, 100% { transform: translateX(360%); }
`;
const valuePop = keyframes`
    0%   { transform: scale(1); }
    50%  { transform: scale(1.07); }
    100% { transform: scale(1); }
`;
// Cashout strip (refund / payouts): a gentle rise-in, plus a one-time coin flip
// on the currency mark — a small poker-table wink as your money comes back.
const cashoutIn = keyframes`
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
`;
const coinFlip = keyframes`
    from { transform: rotateY(0deg); }
    to   { transform: rotateY(360deg); }
`;

function formatDuration(ms: number): string {
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    if (h > 0) return `${h}h ${m}m`;
    const s = Math.floor((ms % 60_000) / 1_000);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function explorerBase(chain?: string): string {
    return chain === 'base'
        ? 'https://basescan.org'
        : 'https://sepolia.basescan.org';
}

const shortAddr = shortenAddress;

// Pull a display handle out of a host's X/Twitter community URL, if present.
function xHandle(url?: string): string | null {
    if (!url) return null;
    const m = url.match(/(?:x|twitter)\.com\/@?([A-Za-z0-9_]{1,15})/i);
    return m ? `@${m[1]}` : null;
}

// Host-only inline image editor. Wraps the cover or avatar and, for the host,
// overlays an "add / change" affordance (always-visible badge for touch, full
// prompt on hover/focus) plus a menu to replace or remove. Frontend skeleton:
// it reads the chosen file into an object URL for preview and hands it back via
// onPick; the real upload + persistence is a backend follow-up.
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

function HostImageEditor({
    canEdit,
    hasImage,
    label,
    rounded,
    coverArea = false,
    maxMb = 5,
    uploading = false,
    onSelectFile,
    onPick,
    onRemove,
    children,
}: {
    canEdit: boolean;
    hasImage: boolean;
    label: string;
    rounded: string;
    coverArea?: boolean;
    /** Size cap in MB enforced client-side before upload. */
    maxMb?: number;
    /** True while the chosen file is uploading; shows a spinner overlay. */
    uploading?: boolean;
    /** Real upload path: hand the chosen File to the parent. When provided it
     *  supersedes onPick (which is the object-URL preview fallback). */
    onSelectFile?: (file: File) => void;
    onPick: (url: string) => void;
    onRemove: () => void;
    children: ReactNode;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const toast = useToastHelper();
    const removeColor = useColorModeValue('red.600', 'red.300');
    const scrim = 'rgba(11, 20, 48, 0.58)';

    const handleFile = (file?: File | null) => {
        if (!file) return;
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            toast.error('Please choose a PNG, JPEG, or WebP image');
            return;
        }
        if (file.size > maxMb * 1024 * 1024) {
            toast.error(`Image must be under ${maxMb} MB`);
            return;
        }
        if (onSelectFile) onSelectFile(file);
        else onPick(URL.createObjectURL(file));
    };

    if (!canEdit) return <>{children}</>;

    return (
        <Box
            position="relative"
            lineHeight={0}
            role="group"
            {...(coverArea ? { w: 'full', h: 'full' } : {})}
        >
            {children}
            {uploading && (
                <Flex
                    position="absolute"
                    inset={0}
                    align="center"
                    justify="center"
                    borderRadius={rounded}
                    bg={scrim}
                    zIndex={2}
                >
                    <Spinner color="white" size={coverArea ? 'md' : 'sm'} />
                </Flex>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                disabled={uploading}
                onChange={(e) => {
                    handleFile(e.target.files?.[0]);
                    e.target.value = '';
                }}
            />
            {/* The whole image is the add / change target: clicking it (or the
                badge) opens the file picker. */}
            <Box
                as="button"
                type="button"
                aria-label={hasImage ? `Change ${label}` : `Add ${label}`}
                onClick={() => inputRef.current?.click()}
                position="absolute"
                inset={0}
                borderRadius={rounded}
                overflow="hidden"
                cursor="pointer"
                sx={{
                    '& .hint': { opacity: 0 },
                    '&:hover .hint, &:focus-visible .hint': { opacity: 1 },
                    '&:hover .badge, &:focus-visible .badge': { opacity: 0 },
                }}
                _focusVisible={{
                    outline: '2px solid',
                    outlineColor: 'brand.green',
                    outlineOffset: '-2px',
                }}
            >
                {/* Always-visible badge so the affordance is discoverable on touch;
                    fades out when the full hover prompt takes over. */}
                <Flex
                    className="badge"
                    position="absolute"
                    bottom={coverArea ? 2 : 1.5}
                    right={coverArea ? 2 : 1.5}
                    align="center"
                    justify="center"
                    boxSize={coverArea ? '32px' : '28px'}
                    borderRadius="full"
                    bg={scrim}
                    color="white"
                    transition="opacity 140ms ease"
                >
                    <Icon as={FiCamera} boxSize={coverArea ? '17px' : '15px'} />
                </Flex>
                {/* Hover / focus prompt over the whole image. */}
                <Flex
                    className="hint"
                    position="absolute"
                    inset={0}
                    direction="column"
                    align="center"
                    justify="center"
                    gap={coverArea ? 2 : 1}
                    bg={scrim}
                    transition="opacity 140ms ease"
                >
                    <Icon
                        as={FiCamera}
                        color="white"
                        boxSize={coverArea ? '26px' : '20px'}
                    />
                    <Text
                        color="white"
                        fontSize={coverArea ? 'sm' : 'xs'}
                        fontWeight="bold"
                        letterSpacing="0.04em"
                        px={2}
                        textAlign="center"
                    >
                        {hasImage ? `Change ${label}` : `Add ${label}`}
                    </Text>
                </Flex>
            </Box>
            {/* Remove control, shown when there is an uploaded image. */}
            {hasImage && (
                <IconButton
                    aria-label={`Remove ${label}`}
                    icon={<Icon as={FiX} boxSize="14px" />}
                    size="xs"
                    isRound
                    border="none"
                    position="absolute"
                    top={1.5}
                    right={1.5}
                    zIndex={1}
                    bg={scrim}
                    color="white"
                    _hover={{ bg: removeColor }}
                    opacity={{ base: 1, md: 0 }}
                    _groupHover={{ opacity: 1 }}
                    onClick={onRemove}
                />
            )}
        </Box>
    );
}

// The tournament blurb: read-only for players, click-to-edit for the host, and a
// gentle "Add a description" prompt for the host when it is empty.
const LINK_FIELDS: {
    key: keyof CommunityLinkValues;
    label: string;
    icon: IconType;
    tone: SocialTone;
    placeholder: string;
}[] = [
    {
        key: 'x_url',
        label: 'X',
        icon: FaXTwitter,
        tone: 'x',
        placeholder: 'https://x.com/yourhandle',
    },
    {
        key: 'discord_url',
        label: 'Discord',
        icon: FaDiscord,
        tone: 'discord',
        placeholder: 'https://discord.gg/invite',
    },
    {
        key: 'telegram_url',
        label: 'Telegram',
        icon: FaTelegram,
        tone: 'telegram',
        placeholder: 'https://t.me/yourgroup',
    },
    {
        key: 'website_url',
        label: 'Website',
        icon: FiGlobe,
        tone: 'website',
        placeholder: 'https://your-site.xyz',
    },
    {
        key: 'chart_url',
        label: 'Chart',
        icon: FaChartLine,
        tone: 'chart',
        placeholder: 'DexScreener, GeckoTerminal, any chart URL',
    },
];

// Labeled-chip styling for the co-branded "Presented by" row on the detail hero.
// Tonal, not saturated brand-color pills: a hairline chip with a tone-tinted icon
// and a plain-text action label. Chart stays out of Felt Green so it never
// competes with the green Register CTA (the one action that owns that color).
const SOCIAL_INK: Record<SocialTone, string> = {
    x: 'text.primary',
    discord: '#5865F2',
    telegram: '#229ED9',
    website: 'text.secondary',
    chart: 'brand.navy',
};
const SOCIAL_ACTION: Record<SocialTone, string> = {
    x: 'Follow',
    discord: 'Discord',
    telegram: 'Telegram',
    website: 'Website',
    chart: 'Chart',
};

// Host community link-outs (X, website, Discord, Telegram, and a provider-
// agnostic chart). Quiet monochrome chips for everyone; the host gets
// click-to-edit, with an "Add community links" prompt when empty. Frontend
// skeleton — a backend dev persists the URLs later.
function CommunityLinks({
    value,
    canEdit,
    onSave,
    labeled = false,
}: {
    value: CommunityLinkValues;
    canEdit: boolean;
    onSave: (links: CommunityLinkValues) => void;
    /** Co-brand hero row: render labeled chips (icon + "Follow"/"Discord"/…)
     *  instead of the compact icon-only chips used elsewhere. */
    labeled?: boolean;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState<CommunityLinkValues>(value);
    const chipBorder = useColorModeValue(
        'rgba(11, 20, 48, 0.08)',
        'rgba(255, 255, 255, 0.10)'
    );
    const editorBg = useColorModeValue(
        'rgba(11, 20, 48, 0.03)',
        'rgba(255, 255, 255, 0.04)'
    );
    const chipHover = useColorModeValue(
        'rgba(11, 20, 48, 0.06)',
        'rgba(255, 255, 255, 0.07)'
    );

    const present: {
        label: string;
        tone: SocialTone;
        href: string;
        icon: IconType;
    }[] = [];
    for (const f of LINK_FIELDS) {
        const href = value[f.key]?.trim();
        if (href)
            present.push({
                label: f.label,
                tone: f.tone,
                href,
                icon: f.icon,
            });
    }

    const begin = () => {
        setDraft(value);
        setEditing(true);
    };
    const save = () => {
        const next: CommunityLinkValues = {};
        for (const f of LINK_FIELDS) {
            const v = draft[f.key]?.trim();
            if (v) next[f.key] = v;
        }
        onSave(next);
        setEditing(false);
    };

    if (editing) {
        return (
            <Box
                w="full"
                mt={1}
                p={3}
                borderRadius="12px"
                borderWidth="1px"
                borderColor={chipBorder}
                bg={editorBg}
            >
                <VStack spacing={2} align="stretch">
                    {LINK_FIELDS.map((f) => (
                        <HStack key={f.key} spacing={2.5}>
                            <Icon
                                as={f.icon}
                                boxSize="16px"
                                color="text.muted"
                                flexShrink={0}
                                w="20px"
                            />
                            <Input
                                size="sm"
                                borderRadius="8px"
                                type="url"
                                inputMode="url"
                                value={draft[f.key] ?? ''}
                                placeholder={f.placeholder}
                                onChange={(e) =>
                                    setDraft((d) => ({
                                        ...d,
                                        [f.key]: e.target.value,
                                    }))
                                }
                            />
                        </HStack>
                    ))}
                </VStack>
                <HStack spacing={2} mt={3}>
                    <Button size="xs" variant="tactilePrimary" onClick={save}>
                        Save links
                    </Button>
                    <Button
                        size="xs"
                        variant="tactileGhost"
                        onClick={() => setEditing(false)}
                    >
                        Cancel
                    </Button>
                </HStack>
            </Box>
        );
    }

    if (present.length === 0) {
        if (!canEdit) return null;
        return (
            <Button
                size="xs"
                variant="tactileGhost"
                leftIcon={<Icon as={FiLink} boxSize="12px" />}
                onClick={begin}
                mt={0.5}
                color="text.muted"
            >
                Add community links
            </Button>
        );
    }

    if (labeled) {
        return (
            <HStack spacing={2} role="group" flexWrap="wrap">
                {present.map((f) => (
                    <Link
                        key={f.label}
                        href={f.href}
                        isExternal
                        aria-label={`${SOCIAL_ACTION[f.tone]} on ${f.label}`}
                        borderRadius="10px"
                        textDecoration="none !important"
                        _focusVisible={{
                            outline: '2px solid',
                            outlineColor: 'brand.green',
                            outlineOffset: '2px',
                        }}
                    >
                        <HStack
                            as="span"
                            spacing={2}
                            h="34px"
                            px={3}
                            borderRadius="10px"
                            borderWidth="1px"
                            borderColor={chipBorder}
                            bg={editorBg}
                            transition="background-color 120ms ease"
                            _hover={{ bg: chipHover }}
                        >
                            <Icon
                                as={f.icon}
                                boxSize="14px"
                                color={SOCIAL_INK[f.tone]}
                                flexShrink={0}
                            />
                            <Text
                                fontSize="sm"
                                fontWeight="bold"
                                color="text.primary"
                                whiteSpace="nowrap"
                            >
                                {SOCIAL_ACTION[f.tone]}
                            </Text>
                        </HStack>
                    </Link>
                ))}
                {canEdit && (
                    <IconButton
                        aria-label="Edit community links"
                        icon={<Icon as={FiEdit2} boxSize="14px" />}
                        size="sm"
                        variant="tactileGhost"
                        color="text.muted"
                        opacity={{ base: 1, md: 0 }}
                        _groupHover={{ opacity: 1 }}
                        onClick={begin}
                    />
                )}
            </HStack>
        );
    }

    return (
        <HStack spacing={2} pt={1.5} role="group" flexWrap="wrap">
            {present.map((f) => (
                <Link
                    key={f.label}
                    href={f.href}
                    isExternal
                    aria-label={f.label}
                    lineHeight={0}
                    borderRadius="10px"
                    _focusVisible={{
                        outline: '2px solid',
                        outlineColor: 'brand.green',
                        outlineOffset: '2px',
                    }}
                >
                    <SocialIconButton
                        tone={f.tone}
                        chipSize="md"
                        tabIndex={-1}
                        aria-label={f.label}
                    />
                </Link>
            ))}
            {canEdit && (
                <IconButton
                    aria-label="Edit community links"
                    icon={<Icon as={FiEdit2} boxSize="14px" />}
                    size="sm"
                    variant="tactileGhost"
                    color="text.muted"
                    opacity={{ base: 1, md: 0 }}
                    _groupHover={{ opacity: 1 }}
                    onClick={begin}
                />
            )}
        </HStack>
    );
}

export default function TournamentDetail({
    tournament: t,
    players,
    registrants = [],
    myWallet,
    isSignedIn = true,
    isRegistered = false,
    blindLevel = null,
    onBreak = false,
    actionLoading = false,
    actionLabel,
    goToTableLoading = false,
    hostRakeUsdc,
    rakeClaiming = false,
    refund,
    emergency,
    unclaimed,
    hostEmergencyRefundUsdc,
    hostRefundClaiming = false,
    onRegister,
    onUnregister,
    onGoToTable,
    onFundAndOpen,
    onClaimRake,
    onClaimRefund,
    onClaimPrize,
    onEnableEmergencyRefund,
    onClaimHostEmergencyRefund,
    onBack,
    onUpdateBranding,
    onUpdateDescription,
    onUpdateLinks,
    onUploadImage,
}: TournamentDetailProps) {
    const cardBg = useColorModeValue('white', 'card.darkNavy');
    const border = useColorModeValue(
        'rgba(11, 20, 48, 0.08)',
        'rgba(255, 255, 255, 0.08)'
    );
    const rowHover = useColorModeValue(
        'rgba(11, 20, 48, 0.04)',
        'rgba(255, 255, 255, 0.05)'
    );
    const meHighlight = useColorModeValue(
        'rgba(54, 163, 123, 0.08)',
        'rgba(54, 163, 123, 0.16)'
    );
    // Felt-green wash behind the elevated 24h-self-withdraw trust line.
    const trustBg = useColorModeValue(
        'rgba(54, 163, 123, 0.08)',
        'rgba(54, 163, 123, 0.13)'
    );
    const prefersReducedMotion = usePrefersReducedMotion();
    const yellowText = useColorModeValue('brand.yellowDark', 'brand.yellow');
    const linkColor = useColorModeValue('brand.navy', 'brand.lightGray');

    const freePlay = getIsFreePlay(t);
    const tableSize = t.table_size || 9;
    const blindLabel = t.metadata?.blind_structure
        ? String(t.metadata.blind_structure)
        : 'turbo';
    // Default branding (used when the host uploaded no logo/banner): the type's
    // icon avatar + a card-suit cover wallpaper in the type's accent color.
    const typeIdentity = identityFor(blindLabel);
    const avatarSize = useBreakpointValue({ base: 84, md: 96 }) ?? 96;

    const now = new Date();
    const lateRegCloseAt = new Date(t.late_reg_close_at);
    const scheduledStartAt = new Date(t.scheduled_start_at);
    const fiveMinBefore = new Date(scheduledStartAt.getTime() - 5 * 60 * 1000);
    const isLateRegOpen =
        t.status === 'running' &&
        (t.late_reg_levels ?? 0) > 0 &&
        now < lateRegCloseAt;
    const canRegister = t.status === 'registration' && !isRegistered;
    const canLateReg = isLateRegOpen && !isRegistered;
    const canUnregister =
        t.status === 'registration' &&
        isRegistered &&
        (freePlay || now < fiveMinBefore);

    const isHost =
        !!myWallet && t.host_wallet?.toLowerCase() === myWallet.toLowerCase();

    // Host inline editing. Optimistic local overrides so edits show immediately
    // (and the Storybook preview works without a parent handler); changes are
    // forwarded through the callbacks the parent uses to persist.
    // `undefined` = untouched (use the prop); `null` = explicitly cleared.
    const [logoOverride, setLogoOverride] = useState<string | null | undefined>(
        undefined
    );
    const [bannerOverride, setBannerOverride] = useState<
        string | null | undefined
    >(undefined);
    const [descOverride, setDescOverride] = useState<string | undefined>(
        undefined
    );
    const [logoUploading, setLogoUploading] = useState(false);
    const [bannerUploading, setBannerUploading] = useState(false);

    const logoUrl =
        logoOverride !== undefined ? logoOverride : (t.logo_url ?? null);
    const bannerUrl =
        bannerOverride !== undefined ? bannerOverride : (t.banner_url ?? null);
    const description =
        descOverride !== undefined ? descOverride : (t.description ?? '');

    // Clearing routes through onUpdateBranding (the parent PATCHes an empty
    // string); setting goes through uploadBranding below.
    const updateLogo = (url: string | null) => {
        setLogoOverride(url);
        onUpdateBranding?.({ logo_url: url });
    };
    const updateBanner = (url: string | null) => {
        setBannerOverride(url);
        onUpdateBranding?.({ banner_url: url });
    };

    // Upload a chosen branding image: show an instant object-URL preview, then
    // upload via the parent (which persists and refreshes the tournament prop).
    // On success we drop the override so the persisted URL shows; on failure we
    // revert to the last persisted value (the parent surfaces the error).
    const uploadBranding = async (
        kind: 'logo' | 'banner',
        file: File,
        setOverride: (v: string | null | undefined) => void,
        setUploading: (v: boolean) => void
    ) => {
        const preview = URL.createObjectURL(file);
        setOverride(preview);
        if (!onUploadImage) return; // no backend wired (e.g. Storybook): keep preview
        setUploading(true);
        try {
            await onUploadImage(kind, file);
            setOverride(undefined);
        } catch {
            setOverride(undefined);
        } finally {
            setUploading(false);
            URL.revokeObjectURL(preview);
        }
    };
    const updateDescription = (text: string) => {
        setDescOverride(text);
        onUpdateDescription?.(text);
    };

    const [linksOverride, setLinksOverride] = useState<
        CommunityLinkValues | undefined
    >(undefined);
    const links: CommunityLinkValues = linksOverride ?? {
        x_url: t.x_url,
        website_url: t.website_url,
        discord_url: t.discord_url,
        telegram_url: t.telegram_url,
        chart_url: t.chart_url,
    };
    const updateLinks = (next: CommunityLinkValues) => {
        setLinksOverride(next);
        onUpdateLinks?.(next);
    };

    const myPlayer = myWallet
        ? players.find((p) => p.wallet.toLowerCase() === myWallet.toLowerCase())
        : undefined;
    const isEliminated = myPlayer ? myPlayer.finish_pos > 0 : false;
    const bulletsUsed = myPlayer?.bullet_number ?? 1;
    const canReenter =
        isLateRegOpen &&
        isRegistered &&
        isEliminated &&
        t.reentry_allowed &&
        bulletsUsed <= t.reentry_max;

    const playersLeft = players.filter((p) => p.finish_pos === 0).length;
    const sortedPlayers = [...players].sort((a, b) => {
        if (a.finish_pos === 0 && b.finish_pos === 0) return b.stack - a.stack;
        if (a.finish_pos === 0) return -1;
        if (b.finish_pos === 0) return 1;
        return a.finish_pos - b.finish_pos;
    });
    const winner =
        t.status === 'completed'
            ? sortedPlayers.find((p) => p.finish_pos === 1)
            : undefined;

    const registeredCount = t.registered_count ?? players.length;

    // MoneyHero shows the buy-in as its headline only when there's nothing bigger to
    // show yet — no guarantee, no prize pool, and no settled prize pool. In that case
    // the separate "Buy-in" stat beside it is a duplicate ("buy in" twice before the
    // tournament starts), so hide it. Once the headline becomes a pool figure, the
    // Buy-in stat is meaningful again and reappears. A completed tournament with a
    // winner payout always has a settled pool, so that's the proxy used here.
    const heroShowsBuyIn =
        !freePlay &&
        (t.guarantee_usdc ?? 0) <= 0 &&
        (t.prize_pool_usdc ?? 0) <= 0 &&
        !(t.status === 'completed' && (winner?.prize_usdc ?? 0) > 0);

    // Your live/final place, to flag your row in the payout ladder.
    const myLadderPos =
        myPlayer && (t.status === 'running' || t.status === 'completed')
            ? myPlayer.finish_pos > 0
                ? myPlayer.finish_pos
                : sortedPlayers.findIndex(
                      (p) => p.wallet.toLowerCase() === myWallet?.toLowerCase()
                  ) + 1
            : null;

    // The three movable sections: two columns on desktop, three switchable tabs
    // on mobile. Defined once as elements, then rendered in both layouts (the
    // off-breakpoint copy is display:none — mounted but not painted).
    const standingsEl =
        sortedPlayers.length > 0 ? (
            <Standings
                tournament={t}
                freePlay={freePlay}
                players={sortedPlayers}
                myWallet={myWallet}
                cardBg={cardBg}
                border={border}
                rowHover={rowHover}
                meHighlight={meHighlight}
            />
        ) : t.status === 'registration' ? (
            registrants.length > 0 ? (
                <RegistrantsPanel
                    registrants={registrants}
                    registeredCount={registeredCount}
                    hostWallet={t.host_wallet}
                    myWallet={myWallet}
                    chain={t.chain}
                    cardBg={cardBg}
                    border={border}
                />
            ) : (
                <Box
                    bg={cardBg}
                    borderWidth="1px"
                    borderColor={border}
                    borderRadius="14px"
                    p={6}
                    textAlign="center"
                >
                    <Text color="text.muted" fontSize="sm">
                        No players registered yet. Be the first.
                    </Text>
                </Box>
            )
        ) : null;

    const showPayouts =
        t.status === 'registration' ||
        t.status === 'pending' ||
        t.status === 'running' ||
        t.status === 'completed';

    // For completed tournaments derive both the prize pool and the entrant count
    // from the actual on-chain data so the Payouts tab always matches Final Standings.
    //
    // Pool: sum of prize_usdc — the stored prize_pool_usdc can be stale (set before
    // re-entries / late registrations grew the pool).
    //
    // Entrant count: players.length can be larger than what the backend used for
    // defaultPayouts() when late regs inflated unique-player count after the payout
    // tier was locked. We reverse-engineer the correct tier by finding the minimum
    // entrant count that produces the same number of paid places as the actual
    // settlement (i.e. players with prize_usdc > 0).
    const settledPrizePool =
        t.status === 'completed'
            ? players.reduce((sum, p) => sum + (p.prize_usdc ?? 0), 0)
            : 0;

    const actualPaidPlaces =
        t.status === 'completed'
            ? players.filter((p) => (p.prize_usdc ?? 0) > 0).length
            : 0;
    const effectiveEntrants = (() => {
        if (t.status !== 'completed' || actualPaidPlaces === 0) {
            return players.length || registeredCount;
        }
        for (let n = 1; n <= 200; n++) {
            if (placesPaid(n) === actualPaidPlaces) return n;
        }
        return players.length || registeredCount;
    })();

    // Before start, prize_pool_usdc isn't frozen yet (the API sends 0), so a plain
    // max() against it would pin the projection to the guarantee. Mirror the
    // coordinator's pool math from the live field instead, so projected payouts
    // grow with entries and overtake the guarantee once buy-ins exceed it.
    //
    // The pool grows with PAID buy-ins only — free-ticket seats are bodies in the field
    // (they count toward places paid via effectiveEntrants) but put no money in the pool,
    // so project over paid_entries. Fall back to the full field when the API omits it.
    const projecting =
        t.status === 'registration' || t.status === 'pending';
    const effectivePaidEntrants = t.paid_entries ?? effectiveEntrants;
    const effectivePrizePool =
        settledPrizePool > 0
            ? settledPrizePool
            : projecting
              ? projectedPrizePoolUsdc(
                    effectivePaidEntrants,
                    t.buy_in_usdc,
                    t.fee_bps,
                    t.guarantee_usdc ?? 0
                )
              : Math.max(t.prize_pool_usdc ?? 0, t.guarantee_usdc ?? 0);

    const payoutsEl = showPayouts ? (
        <PayoutLadder
            entrants={effectiveEntrants}
            prizePoolUsdc={effectivePrizePool}
            isFreePlay={freePlay}
            status={t.status}
            highlightPosition={myLadderPos}
        />
    ) : null;

    const structureEl = (
        <StructureSheet
            blindStructure={blindLabel}
            startingStack={t.starting_stack}
            lateRegLevels={t.late_reg_levels}
            currentLevel={blindLevel}
            onBreak={onBreak}
            summary
            defaultOpen={false}
        />
    );

    // Hero-derived facts: the prize ladder summary line, the computed speed-feel
    // sentence (commas, no em dashes), and the host attribution handle.
    const heroPaidPlaces = placesPaid(effectiveEntrants);
    const heroItmPct =
        effectiveEntrants > 0
            ? Math.round((heroPaidPlaces / effectiveEntrants) * 100)
            : 0;
    const heroTopPrize = payoutForPosition(
        1,
        effectiveEntrants,
        effectivePrizePool
    );
    const heroProjecting =
        t.status === 'registration' || t.status === 'pending';
    const showPayline =
        !freePlay &&
        heroPaidPlaces > 0 &&
        (t.status === 'registration' ||
            t.status === 'pending' ||
            t.status === 'running' ||
            t.status === 'completed');
    const heroStartBB = startingBigBlinds(t.starting_stack, blindLabel);
    const heroLateRegValid = t.late_reg_levels > 0;
    const heroCloseBB = bbAtLateRegClose(
        t.starting_stack,
        blindLabel,
        t.late_reg_levels
    );
    const showTrust =
        !freePlay &&
        !!t.contract_address &&
        !!t.chain &&
        (t.status === 'registration' ||
            t.status === 'pending' ||
            t.status === 'running');
    const hostHandle = xHandle(t.x_url);

    // About card: the Host's (possibly tall, formatted) description, in its own
    // readable body card. Shown when there is content, or to the Host so they can
    // add it; a non-host viewing an empty tournament gets nothing.
    const aboutEl =
        description.trim() || isHost ? (
            <AboutPanel
                value={description}
                canEdit={isHost}
                onSave={updateDescription}
                cardBg={cardBg}
                border={border}
            />
        ) : null;
    const hasMainColumn = !!(aboutEl || standingsEl);

    // Live: is the viewer's current place in the money?
    const inMoney =
        myLadderPos != null &&
        heroPaidPlaces > 0 &&
        myLadderPos <= heroPaidPlaces;

    // Mobile sticky action bar: the phase decision, always reachable. Each state
    // carries a small status dot so it pops and reads differently at a glance;
    // the live state gets a breathing Neon Stake "on-air" pulse.
    let stickyFact: {
        label: string;
        value: string;
        dot: string;
        pulse: boolean;
    } | null = null;
    let stickyAction: {
        label: string;
        loading: boolean;
        onClick: () => void;
    } | null = null;
    if (canRegister || canLateReg) {
        stickyFact = freePlay
            ? {
                  label: 'Free Play',
                  value: 'No buy-in',
                  dot: 'brand.green',
                  pulse: false,
              }
            : {
                  label: canLateReg ? 'Late reg open' : 'Buy-in',
                  value: canLateReg
                      ? `$${formatUsdc(t.buy_in_usdc)} to join`
                      : `$${formatUsdc(t.buy_in_usdc)}`,
                  dot: canLateReg ? 'brand.yellow' : 'brand.green',
                  pulse: false,
              };
        stickyAction = {
            label: !isSignedIn
                ? 'Sign in'
                : canLateReg
                  ? 'Late register'
                  : freePlay
                    ? 'Join'
                    : 'Register',
            loading: actionLoading,
            onClick: () => onRegister?.(false),
        };
    } else if (t.status === 'running' && isRegistered && !isEliminated) {
        stickyFact = {
            label: 'Live',
            value: blindLevel != null ? `Level ${blindLevel}` : 'You’re in',
            dot: 'brand.pink',
            pulse: true,
        };
        stickyAction = {
            label: 'Go to my table',
            loading: goToTableLoading,
            onClick: () => onGoToTable?.(),
        };
    } else if (canReenter) {
        stickyFact = {
            label: 'Eliminated',
            value: 'Re-entry open',
            dot: 'brand.yellow',
            pulse: false,
        };
        stickyAction = {
            label: 'Re-enter',
            loading: actionLoading,
            onClick: () => onRegister?.(true),
        };
    }

    return (
        <Flex
            direction="column"
            minH="100vh"
            bg="card.lightGray"
            pb={{ base: '76px', lg: 0 }}
        >
            <Box
                flex="1"
                pt={{ base: 20, md: 24 }}
                pb={16}
                position="relative"
                overflow="hidden"
            >
                <Container
                    maxW="container.lg"
                    px={{ base: 3, md: 6 }}
                    position="relative"
                    zIndex={1}
                >
                    <VStack spacing={{ base: 4, md: 5 }} align="stretch">
                        <Button
                            variant="tactileGhost"
                            size="sm"
                            alignSelf="flex-start"
                            leftIcon={<Icon as={FiArrowLeft} />}
                            onClick={onBack}
                        >
                            All tournaments
                        </Button>

                        {/* Primary panel — X-profile-style: cover + overlapping avatar. */}
                        <Box
                            bg={cardBg}
                            borderWidth="1px"
                            borderColor={border}
                            borderRadius="16px"
                            boxShadow="card.lift"
                            overflow="hidden"
                        >
                            {/* Cover: uploaded banner, else a card-suit wallpaper in
                            the type's accent color over the neutral surface. */}
                            <Box
                                h={{ base: '118px', md: '150px' }}
                                position="relative"
                                overflow="hidden"
                            >
                                <HostImageEditor
                                    canEdit={isHost}
                                    hasImage={!!bannerUrl}
                                    label="banner"
                                    rounded="0"
                                    coverArea
                                    maxMb={5}
                                    uploading={bannerUploading}
                                    onSelectFile={(file) =>
                                        uploadBranding(
                                            'banner',
                                            file,
                                            setBannerOverride,
                                            setBannerUploading
                                        )
                                    }
                                    onPick={updateBanner}
                                    onRemove={() => updateBanner(null)}
                                >
                                    {bannerUrl ? (
                                        <Image
                                            src={bannerUrl}
                                            alt=""
                                            w="full"
                                            h="full"
                                            objectFit="cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <TournamentDefaultCover
                                            type={blindLabel}
                                        />
                                    )}
                                </HostImageEditor>
                            </Box>

                            <Box
                                px={{ base: 4, md: 6 }}
                                pb={{ base: 4, md: 5 }}
                                position="relative"
                                zIndex={1}
                            >
                                {/* Avatar (logo or initial) straddles the cover edge. */}
                                <Flex align="flex-start" gap={3}>
                                    <Box
                                        mt={{ base: '-54px', md: '-62px' }}
                                        borderRadius="22px"
                                        borderWidth="4px"
                                        borderColor={cardBg}
                                        bg={cardBg}
                                        overflow="hidden"
                                        lineHeight={0}
                                        boxShadow="0 0 0 1px rgba(11, 20, 48, 0.10), 0 8px 24px rgba(11, 20, 48, 0.18)"
                                        flexShrink={0}
                                    >
                                        <HostImageEditor
                                            canEdit={isHost}
                                            hasImage={!!logoUrl}
                                            label="logo"
                                            rounded="18px"
                                            maxMb={2}
                                            uploading={logoUploading}
                                            onSelectFile={(file) =>
                                                uploadBranding(
                                                    'logo',
                                                    file,
                                                    setLogoOverride,
                                                    setLogoUploading
                                                )
                                            }
                                            onPick={updateLogo}
                                            onRemove={() => updateLogo(null)}
                                        >
                                            {logoUrl ? (
                                                <Image
                                                    src={logoUrl}
                                                    alt=""
                                                    boxSize={`${avatarSize}px`}
                                                    objectFit="cover"
                                                />
                                            ) : (
                                                <TournamentDefaultAvatar
                                                    type={blindLabel}
                                                    size={avatarSize}
                                                    aria-label={`${typeIdentity.label} tournament`}
                                                />
                                            )}
                                        </HostImageEditor>
                                    </Box>
                                </Flex>

                                <VStack align="stretch" spacing={3} mt={0}>
                                    {/* Header in two tight rows: name | status, then
                                    host + link-outs | format + chain. Pairing the
                                    left and right content kills the dead space. */}
                                    <VStack align="stretch" spacing={1.5} minW={0}>
                                        <Flex
                                            justify="space-between"
                                            align="flex-start"
                                            gap={3}
                                            w="full"
                                        >
                                            <Text
                                                as="h1"
                                                fontWeight="bold"
                                                fontSize={{
                                                    base: 'xl',
                                                    md: '2xl',
                                                }}
                                                letterSpacing="-0.02em"
                                                color="text.primary"
                                                noOfLines={2}
                                                flex="1"
                                                minW={0}
                                            >
                                                {t.name ||
                                                    (freePlay
                                                        ? 'Free-play tournament'
                                                        : 'No-limit Hold’em')}
                                            </Text>
                                            <Box flexShrink={0}>
                                                <StatusPill status={t.status} />
                                            </Box>
                                        </Flex>
                                        <Flex
                                            direction={{
                                                base: 'column',
                                                md: 'row',
                                            }}
                                            justify="space-between"
                                            align={{
                                                base: 'start',
                                                md: 'flex-start',
                                            }}
                                            gap={{ base: 2, md: 4 }}
                                            rowGap={2}
                                            w="full"
                                        >
                                            {/* Presented by {host} + the community's
                                            link-outs: the co-branded billboard, one
                                            host credit (the footer one is removed). */}
                                            {t.host_wallet ? (
                                                <Flex
                                                    align="center"
                                                    gap={{ base: 2, md: 3 }}
                                                    flexWrap="wrap"
                                                    rowGap={2}
                                                    flex="1"
                                                    minW={0}
                                                >
                                                    <HStack
                                                        spacing={1.5}
                                                        fontSize="sm"
                                                        minW={0}
                                                    >
                                                    <Text
                                                        color="text.secondary"
                                                        fontWeight="medium"
                                                        whiteSpace="nowrap"
                                                    >
                                                        Presented by
                                                    </Text>
                                                    {hostHandle ? (
                                                        <Box
                                                            as="a"
                                                            href={t.x_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            display="inline-flex"
                                                            alignItems="center"
                                                            gap="4px"
                                                            fontWeight="bold"
                                                            color={linkColor}
                                                            _hover={{
                                                                color: 'brand.green',
                                                                textDecoration:
                                                                    'underline',
                                                            }}
                                                        >
                                                            <Icon
                                                                as={FaXTwitter}
                                                                boxSize="11px"
                                                            />
                                                            {hostHandle}
                                                        </Box>
                                                    ) : t.chain ? (
                                                        <Box
                                                            as="a"
                                                            href={`${explorerBase(t.chain)}/address/${t.host_wallet}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            fontFamily="mono"
                                                            fontWeight="bold"
                                                            color={linkColor}
                                                            _hover={{
                                                                color: 'brand.green',
                                                                textDecoration:
                                                                    'underline',
                                                            }}
                                                        >
                                                            {shortAddr(
                                                                t.host_wallet
                                                            )}
                                                        </Box>
                                                    ) : (
                                                        <Text
                                                            fontFamily="mono"
                                                            fontWeight="bold"
                                                            color="text.secondary"
                                                        >
                                                            {shortAddr(
                                                                t.host_wallet
                                                            )}
                                                        </Text>
                                                    )}
                                                    {isHost && (
                                                        <Text
                                                            fontSize="2xs"
                                                            fontWeight="bold"
                                                            color="brand.green"
                                                            textTransform="uppercase"
                                                            letterSpacing="0.05em"
                                                        >
                                                            you
                                                        </Text>
                                                    )}
                                                </HStack>
                                                <CommunityLinks
                                                    value={links}
                                                    canEdit={isHost}
                                                    onSave={updateLinks}
                                                    labeled
                                                    />
                                                </Flex>
                                            ) : (
                                                <Box flex="1" />
                                            )}
                                            <VStack
                                                align={{
                                                    base: 'start',
                                                    md: 'end',
                                                }}
                                                spacing={1}
                                                flexShrink={0}
                                            >
                                                <Text
                                                    fontSize="2xs"
                                                    color="text.muted"
                                                    textTransform="uppercase"
                                                    letterSpacing="0.08em"
                                                    fontWeight="semibold"
                                                    whiteSpace="nowrap"
                                                >
                                                    {blindLabel} · NLH ·{' '}
                                                    {tableSize}-max
                                                </Text>
                                                {!freePlay && t.chain && (
                                                    <ChainBadge
                                                        chain={t.chain}
                                                        size="sm"
                                                    />
                                                )}
                                            </VStack>
                                        </Flex>
                                    </VStack>

                                    {/* Hero: money + timing */}
                                    <Flex
                                        gap={{ base: 4, md: 8 }}
                                        flexWrap="wrap"
                                        align="flex-end"
                                    >
                                        <MoneyHero
                                            tournament={t}
                                            freePlay={freePlay}
                                            finalPrizePoolUsdc={effectivePrizePool}
                                        />
                                        <TimingHero
                                            status={t.status}
                                            startIso={t.scheduled_start_at}
                                            endIso={t.ended_at}
                                            blindLevel={blindLevel}
                                            playersLeft={playersLeft}
                                        />
                                    </Flex>

                                    {/* Payouts summary line: how many places pay,
                                    and the top prize (projected pre-start). */}
                                    {showPayline && (
                                        <Text
                                            fontSize="sm"
                                            color="text.secondary"
                                            fontWeight="semibold"
                                        >
                                            Pays top{' '}
                                            <Text
                                                as="span"
                                                color="text.primary"
                                                fontWeight="bold"
                                            >
                                                {heroPaidPlaces}
                                            </Text>{' '}
                                            (~{heroItmPct}% of field)
                                            {heroTopPrize > 0 && (
                                                <>
                                                    {' · top prize '}
                                                    <Text
                                                        as="span"
                                                        color="text.primary"
                                                        fontWeight="bold"
                                                        sx={{
                                                            fontVariantNumeric:
                                                                'tabular-nums',
                                                        }}
                                                    >
                                                        {heroProjecting
                                                            ? '~'
                                                            : ''}
                                                        $
                                                        {formatUsdcAuto(
                                                            heroTopPrize
                                                        )}
                                                    </Text>
                                                    {heroProjecting
                                                        ? ' projected'
                                                        : ''}
                                                </>
                                            )}
                                        </Text>
                                    )}

                                    {/* Speed-feel sentence (commas, no em dashes). */}
                                    <Text
                                        fontSize="sm"
                                        color="text.secondary"
                                        lineHeight="1.45"
                                    >
                                        <Text
                                            as="span"
                                            color="brand.green"
                                            fontWeight="semibold"
                                        >
                                            {templateLabel(blindLabel)} speed,{' '}
                                            {levelDurationMin(blindLabel)}-minute
                                            levels.
                                        </Text>{' '}
                                        {heroLateRegValid
                                            ? `About ${heroCloseBB} big blinds left when late registration closes.`
                                            : `You start with about ${heroStartBB} big blinds.`}
                                    </Text>

                                    {/* Ticket-stub fact strip (conditional cells). */}
                                    {(() => {
                                        const cells: {
                                            label: string;
                                            node: ReactNode;
                                        }[] = [];
                                        if (!freePlay && !heroShowsBuyIn) {
                                            cells.push({
                                                label: 'Buy-in',
                                                node: (
                                                    <HStack spacing={1}>
                                                        <Image
                                                            src={USDC_LOGO}
                                                            alt=""
                                                            boxSize="14px"
                                                            flexShrink={0}
                                                        />
                                                        <Text
                                                            fontWeight="bold"
                                                            color={USDC_BLUE}
                                                            sx={{
                                                                fontVariantNumeric:
                                                                    'tabular-nums',
                                                            }}
                                                        >
                                                            $
                                                            {formatUsdc(
                                                                t.buy_in_usdc
                                                            )}
                                                        </Text>
                                                    </HStack>
                                                ),
                                            });
                                        }
                                        cells.push({
                                            label: 'Starting stack',
                                            node: (
                                                <Text
                                                    fontWeight="bold"
                                                    color="text.primary"
                                                    sx={{
                                                        fontVariantNumeric:
                                                            'tabular-nums',
                                                    }}
                                                >
                                                    {heroStartBB} BB
                                                </Text>
                                            ),
                                        });
                                        if (t.reentry_allowed) {
                                            cells.push({
                                                label: 'Re-entry',
                                                node: (
                                                    <Text
                                                        fontWeight="bold"
                                                        color="text.primary"
                                                        sx={{
                                                            fontVariantNumeric:
                                                                'tabular-nums',
                                                        }}
                                                    >
                                                        up to {t.reentry_max}×
                                                    </Text>
                                                ),
                                            });
                                        }
                                        if (
                                            heroLateRegValid &&
                                            (heroProjecting ||
                                                t.status === 'running')
                                        ) {
                                            cells.push({
                                                label: 'Late reg',
                                                node: (
                                                    <Text
                                                        fontWeight="bold"
                                                        color="text.primary"
                                                        sx={{
                                                            fontVariantNumeric:
                                                                'tabular-nums',
                                                        }}
                                                    >
                                                        {t.late_reg_levels}{' '}
                                                        {t.late_reg_levels === 1
                                                            ? 'level'
                                                            : 'levels'}
                                                    </Text>
                                                ),
                                            });
                                        }
                                        return (
                                            <Flex
                                                borderWidth="1px"
                                                borderColor={border}
                                                borderRadius="12px"
                                                overflow="hidden"
                                                flexWrap="wrap"
                                            >
                                                {cells.map((c, i) => (
                                                    <Box
                                                        key={c.label}
                                                        flex="1 1 0"
                                                        minW="92px"
                                                        px={3}
                                                        py={2}
                                                        borderRightWidth={
                                                            i < cells.length - 1
                                                                ? '1px'
                                                                : 0
                                                        }
                                                        borderColor={border}
                                                    >
                                                        <Text
                                                            fontSize="2xs"
                                                            color="text.muted"
                                                            textTransform="uppercase"
                                                            letterSpacing="0.08em"
                                                            fontWeight="semibold"
                                                        >
                                                            {c.label}
                                                        </Text>
                                                        <Box
                                                            mt="2px"
                                                            fontSize="sm"
                                                        >
                                                            {c.node}
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </Flex>
                                        );
                                    })()}

                                    {/* Players fill */}
                                    <PlayersBar
                                        registered={registeredCount}
                                        max={t.max_entries}
                                        min={t.min_entries}
                                        status={t.status}
                                        playersLeft={playersLeft}
                                        isUsdc={!freePlay}
                                    />

                                    {isLateRegOpen && (
                                        <Text
                                            fontSize="xs"
                                            fontWeight="semibold"
                                            color={yellowText}
                                            sx={{
                                                fontVariantNumeric:
                                                    'tabular-nums',
                                            }}
                                        >
                                            Late registration closes{' '}
                                            {formatTournamentStart(
                                                t.late_reg_close_at
                                            )}
                                        </Text>
                                    )}

                                    {/* The trust story, led with (not a footer
                                    footnote): funds in the table's contract + the
                                    24-hour self-withdraw safety net. */}
                                    {showTrust && (
                                        <HStack
                                            align="flex-start"
                                            spacing={2.5}
                                            bg={trustBg}
                                            borderRadius="12px"
                                            px={3.5}
                                            py={3}
                                        >
                                            <Icon
                                                as={FiShield}
                                                boxSize="16px"
                                                color="brand.green"
                                                flexShrink={0}
                                                mt="1px"
                                            />
                                            <Text
                                                fontSize="sm"
                                                color="text.secondary"
                                                lineHeight="1.45"
                                            >
                                                <Text
                                                    as="span"
                                                    color="text.primary"
                                                    fontWeight="bold"
                                                >
                                                    Held in the table&apos;s
                                                    contract.
                                                </Text>{' '}
                                                If prizes aren&apos;t paid out,
                                                any player can withdraw their own
                                                funds 24 hours after the end, no
                                                permission needed.
                                            </Text>
                                        </HStack>
                                    )}

                                    {/* Footer: contract details (left), action or payout status (right) */}
                                    <Flex
                                        justify="space-between"
                                        align="center"
                                        gap={3}
                                        flexWrap="wrap"
                                    >
                                        <VStack
                                            align="start"
                                            spacing={1}
                                            minW={0}
                                        >
                                            {!freePlay &&
                                                t.contract_address &&
                                                t.chain && (
                                                    <HStack
                                                        spacing={2}
                                                        fontSize="xs"
                                                        color="text.muted"
                                                        minW={0}
                                                    >
                                                        <Icon
                                                            as={FiShield}
                                                            boxSize="12px"
                                                            flexShrink={0}
                                                        />
                                                        <Text
                                                            color="text.muted"
                                                            whiteSpace="nowrap"
                                                        >
                                                            Held by the table
                                                            contract
                                                        </Text>
                                                        <Box
                                                            as="a"
                                                            href={`${explorerBase(t.chain)}/address/${t.contract_address}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            fontFamily="mono"
                                                            display="inline-flex"
                                                            alignItems="center"
                                                            gap="3px"
                                                            color={linkColor}
                                                            _hover={{
                                                                color: 'brand.green',
                                                                textDecoration:
                                                                    'underline',
                                                            }}
                                                        >
                                                            {shortAddr(
                                                                t.contract_address
                                                            )}
                                                            <Icon
                                                                as={
                                                                    FiExternalLink
                                                                }
                                                                boxSize="10px"
                                                            />
                                                        </Box>
                                                    </HStack>
                                                )}
                                        </VStack>
                                        {t.status === 'completed' &&
                                        !freePlay &&
                                        t.contract_address ? (
                                            <PayoutsPanel
                                                tournament={t}
                                                linkColor={linkColor}
                                                myWallet={myWallet}
                                                unclaimed={unclaimed}
                                                onClaimPrize={onClaimPrize}
                                            />
                                        ) : (t.status === 'cancelled' ||
                                              t.status ===
                                                  'emergency_refund') &&
                                          !freePlay &&
                                          t.contract_address ? (
                                            <RefundPanel
                                                status={t.status}
                                                refund={refund}
                                                myWallet={myWallet}
                                                onClaimRefund={onClaimRefund}
                                            />
                                        ) : (
                                            <PrimaryActions
                                                status={t.status}
                                                isRegistered={isRegistered}
                                                isEliminated={isEliminated}
                                                canRegister={canRegister}
                                                canLateReg={canLateReg}
                                                canUnregister={canUnregister}
                                                canReenter={canReenter}
                                                freePlay={freePlay}
                                                myWallet={myWallet}
                                                isSignedIn={isSignedIn}
                                                actionLoading={actionLoading}
                                                actionLabel={actionLabel}
                                                goToTableLoading={goToTableLoading}
                                                bulletsUsed={bulletsUsed}
                                                reentryMax={t.reentry_max}
                                                buyInUsdc={t.buy_in_usdc}
                                                onRegister={onRegister}
                                                onUnregister={onUnregister}
                                                onGoToTable={onGoToTable}
                                            />
                                        )}
                                    </Flex>

                                    {/* Host controls — host-only, folded into the main
                                card instead of a separate panel below. */}
                                    {isHost && (
                                        <>
                                            <Divider borderColor={border} />
                                            <HostPanel
                                                tournament={t}
                                                freePlay={freePlay}
                                                registeredCount={
                                                    registeredCount
                                                }
                                                hostRakeUsdc={hostRakeUsdc}
                                                rakeClaiming={rakeClaiming}
                                                actionLoading={actionLoading}
                                                hostEmergencyRefundUsdc={
                                                    hostEmergencyRefundUsdc
                                                }
                                                hostRefundClaiming={
                                                    hostRefundClaiming
                                                }
                                                onFundAndOpen={onFundAndOpen}
                                                onClaimRake={onClaimRake}
                                                onClaimHostEmergencyRefund={
                                                    onClaimHostEmergencyRefund
                                                }
                                            />
                                            {t.free_tickets_enabled && (
                                                <>
                                                    <Divider
                                                        borderColor={border}
                                                    />
                                                    <FreeTicketsPanel
                                                        tournamentId={t.id}
                                                        rowBg={rowHover}
                                                    />
                                                </>
                                            )}
                                        </>
                                    )}
                                </VStack>
                            </Box>
                        </Box>

                        {/* Live: the player's own standing, pinned at the top of
                        the body (their actual question while a tournament runs). */}
                        {t.status === 'running' &&
                            myPlayer &&
                            !isEliminated && (
                                <Flex
                                    bg={meHighlight}
                                    borderRadius="14px"
                                    px={{ base: 4, md: 5 }}
                                    py={3}
                                    align="center"
                                    justify="space-between"
                                    gap={3}
                                    flexWrap="wrap"
                                >
                                    <HStack spacing={4} minW={0}>
                                        <VStack align="start" spacing={0}>
                                            <Text
                                                fontSize="2xs"
                                                color="text.muted"
                                                textTransform="uppercase"
                                                letterSpacing="0.08em"
                                                fontWeight="semibold"
                                            >
                                                Your position
                                            </Text>
                                            <Text
                                                fontWeight="bold"
                                                color="text.primary"
                                                sx={{
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                {myLadderPos
                                                    ? `${myLadderPos}${
                                                          playersLeft > 0
                                                              ? ` of ${playersLeft}`
                                                              : ''
                                                      }`
                                                    : 'In play'}
                                            </Text>
                                        </VStack>
                                        <VStack align="start" spacing={0}>
                                            <Text
                                                fontSize="2xs"
                                                color="text.muted"
                                                textTransform="uppercase"
                                                letterSpacing="0.08em"
                                                fontWeight="semibold"
                                            >
                                                Your stack
                                            </Text>
                                            <Text
                                                fontWeight="bold"
                                                color="text.primary"
                                                sx={{
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                {myPlayer.stack.toLocaleString(
                                                    'en-US'
                                                )}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                    <HStack
                                        spacing={2}
                                        color={
                                            inMoney
                                                ? 'brand.green'
                                                : 'text.secondary'
                                        }
                                    >
                                        <Icon
                                            as={inMoney ? FiCheck : FiClock}
                                            boxSize="14px"
                                        />
                                        <Text
                                            fontSize="sm"
                                            fontWeight="bold"
                                        >
                                            {inMoney
                                                ? 'In the money'
                                                : `${heroPaidPlaces} places paid`}
                                        </Text>
                                    </HStack>
                                </Flex>
                            )}

                        {/* Desktop (lg+): asymmetric two columns. Wide main = the
                        community narrative (About first, since hosts put extra
                        prizes / house rules there), then standings/registrants.
                        Narrow rail = the prize ladder over the blind structure. */}
                        <Flex
                            display={{ base: 'none', lg: 'flex' }}
                            direction="row"
                            align="flex-start"
                            gap={6}
                        >
                            {hasMainColumn && (
                                <VStack
                                    align="stretch"
                                    spacing={6}
                                    flex="1 1 0"
                                    minW={0}
                                >
                                    {aboutEl}
                                    {standingsEl}
                                </VStack>
                            )}
                            {/* Fixed 360px rail; grows to fill when there is no
                            main column (e.g. cancelled, empty field) so the rail
                            cards don't orphan left. */}
                            <VStack
                                align="stretch"
                                spacing={6}
                                w={hasMainColumn ? '360px' : 'full'}
                                flexShrink={hasMainColumn ? 0 : 1}
                            >
                                {payoutsEl}
                                {structureEl}
                            </VStack>
                        </Flex>

                        {/* Mobile (< lg): the same three sections as switchable tabs. */}
                        <Box display={{ base: 'block', lg: 'none' }}>
                            <MobileSectionTabs
                                about={aboutEl}
                                standings={standingsEl}
                                payouts={payoutsEl}
                                structure={structureEl}
                                cardBg={cardBg}
                                border={border}
                            />
                        </Box>

                        {/* Emergency safety net (running) */}
                        {t.status === 'running' &&
                            !freePlay &&
                            t.contract_address && (
                                <EmergencyPanel
                                    emergency={emergency}
                                    advertisedEnd={t.advertised_end_at}
                                    onEnable={onEnableEmergencyRefund}
                                    cardBg={cardBg}
                                    border={border}
                                    yellowText={yellowText}
                                />
                            )}
                    </VStack>
                </Container>
            </Box>

            {/* Mobile sticky action bar (graft from the "decision rail"): the
            phase fact + phase CTA, always reachable without scrolling. Hidden on
            desktop, where the hero CTA stays in view. */}
            {stickyFact && stickyAction && (
                <Flex
                    display={{ base: 'flex', lg: 'none' }}
                    position="fixed"
                    bottom={0}
                    left={0}
                    right={0}
                    zIndex={20}
                    align="center"
                    justify="space-between"
                    gap={3}
                    bg={cardBg}
                    borderTopWidth="1px"
                    borderColor={border}
                    px={4}
                    pt={3}
                    boxShadow="0 -6px 24px rgba(11, 20, 48, 0.12)"
                    sx={{
                        paddingBottom:
                            'max(0.75rem, env(safe-area-inset-bottom))',
                    }}
                >
                    <Box minW={0}>
                        <HStack spacing={1.5}>
                            <Box
                                w="8px"
                                h="8px"
                                borderRadius="full"
                                bg={stickyFact.dot}
                                flexShrink={0}
                                aria-hidden
                                animation={
                                    stickyFact.pulse && !prefersReducedMotion
                                        ? `${livePulseRed} 1.8s ease-in-out infinite`
                                        : undefined
                                }
                            />
                            <Text
                                fontSize="2xs"
                                color="text.muted"
                                textTransform="uppercase"
                                letterSpacing="0.08em"
                                fontWeight="semibold"
                            >
                                {stickyFact.label}
                            </Text>
                        </HStack>
                        <Text
                            fontWeight="bold"
                            color="text.primary"
                            noOfLines={1}
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            {stickyFact.value}
                        </Text>
                    </Box>
                    <Button
                        variant="tactilePrimary"
                        minH="44px"
                        flexShrink={0}
                        isLoading={stickyAction.loading}
                        onClick={stickyAction.onClick}
                    >
                        {stickyAction.label}
                    </Button>
                </Flex>
            )}
            <Footer />
        </Flex>
    );
}

// Registration-phase roster. Standings don't exist yet, so instead of a bare
// count we show who's in: an overlapping face pile (hover for a name) plus a
// readable "alice, bob and N others" summary. Your own entry is flagged; the
// host is tagged. Falls back to nothing when no list is available (count-only
// callers keep the empty-state copy upstream).
function RegistrantsPanel({
    registrants,
    registeredCount,
    hostWallet,
    myWallet,
    chain,
    cardBg,
    border,
}: {
    registrants: LeaderboardPlayer[];
    registeredCount: number;
    hostWallet?: string;
    myWallet?: string;
    chain?: string;
    cardBg: string;
    border: string;
}) {
    // The avatar ring punches each face out of the one behind it; match the
    // card surface so the cutout reads cleanly in both color modes.
    const ring = cardBg;
    const pileMax = useBreakpointValue({ base: 6, md: 8 }) ?? 8;

    const total = registrants.length;
    const shown = registrants.slice(0, pileMax);
    const pileOverflow = total - shown.length;

    const me = myWallet?.toLowerCase();
    const host = hostWallet?.toLowerCase();
    const isMe = (r: LeaderboardPlayer) =>
        !!me && r.wallet?.toLowerCase() === me;
    const isHost = (r: LeaderboardPlayer) =>
        !!host && r.wallet?.toLowerCase() === host;
    const labelOf = (r: LeaderboardPlayer) =>
        playerDisplayName(
            r.xUsername ? `@${r.xUsername}` : null,
            r.wallet,
            r.xDisplayName
        ) || shortAddr(r.wallet);

    // Lead with you, so a registered player always sees themselves first.
    const ordered = me
        ? [...registrants].sort((a, b) => Number(isMe(b)) - Number(isMe(a)))
        : registrants;
    const summary = ordered.slice(0, 3);
    const summaryRest = total - summary.length;

    const nameNode = (r: LeaderboardPlayer) => {
        const mine = isMe(r);
        return r.xUsername ? (
            <PlayerNameLink
                username={`@${r.xUsername}`}
                displayName={r.xDisplayName}
                fontSize="sm"
                fontWeight={mine ? 'bold' : 'semibold'}
                color={mine ? 'brand.green' : 'text.primary'}
            />
        ) : (
            <ExternalLink
                href={`${explorerBase(chain)}/address/${r.wallet}`}
                fontSize="sm"
                fontFamily="mono"
                color={mine ? 'brand.green' : 'text.primary'}
            >
                {shortAddr(r.wallet)}
            </ExternalLink>
        );
    };

    return (
        <Box
            bg={cardBg}
            borderWidth="1px"
            borderColor={border}
            borderRadius="14px"
            p={{ base: 4, md: 5 }}
        >
            <HStack spacing={2} mb={4} align="baseline">
                <Text
                    fontSize="xs"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="0.08em"
                    color="text.muted"
                >
                    Registered
                </Text>
                <Text fontSize="xs" color="text.muted" aria-hidden>
                    ·
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="text.primary">
                    {registeredCount}
                </Text>
            </HStack>

            <Flex align="center" pl="6px" mb={4}>
                {shown.map((r) => (
                    <Tooltip
                        key={r.uuid}
                        label={`${labelOf(r)}${isHost(r) ? ' · Host' : ''}${isMe(r) ? ' · you' : ''}`}
                        fontSize="xs"
                        hasArrow
                        openDelay={150}
                    >
                        <Box
                            boxSize={{ base: '38px', md: '42px' }}
                            ml="-6px"
                            borderRadius="full"
                            overflow="hidden"
                            boxShadow={`0 0 0 2px ${ring}`}
                            transition="box-shadow 140ms ease-out"
                            _hover={{
                                boxShadow: `0 0 0 2px ${ring}, 0 0 0 4px var(--chakra-colors-brand-green)`,
                                zIndex: 1,
                            }}
                            position="relative"
                        >
                            <PlayerAvatar
                                profileImageUrl={r.xProfileImageUrl}
                                address={r.wallet}
                                username={r.xUsername || r.wallet || r.uuid}
                                initialsFontSize="13px"
                            />
                        </Box>
                    </Tooltip>
                ))}
                {pileOverflow > 0 && (
                    <Flex
                        boxSize={{ base: '38px', md: '42px' }}
                        ml="-6px"
                        borderRadius="full"
                        boxShadow={`0 0 0 2px ${ring}`}
                        bg="btn.lightGray"
                        align="center"
                        justify="center"
                        position="relative"
                    >
                        <Text
                            fontSize="xs"
                            fontWeight="bold"
                            color="text.muted"
                        >
                            +{pileOverflow}
                        </Text>
                    </Flex>
                )}
            </Flex>

            <Text fontSize="sm" color="text.muted" lineHeight="tall">
                {summary.map((r, i) => (
                    <Fragment key={r.uuid}>
                        {i > 0 &&
                            (i === summary.length - 1 && summaryRest === 0
                                ? ' and '
                                : ', ')}
                        {nameNode(r)}
                    </Fragment>
                ))}
                {summaryRest > 0 &&
                    ` and ${summaryRest} other${summaryRest !== 1 ? 's' : ''}`}
                {`${total === 1 ? ' is' : ' are'} in. Standings appear once the tournament starts.`}
            </Text>
        </Box>
    );
}

function MobileSectionTabs({
    about,
    standings,
    payouts,
    structure,
    cardBg,
    border,
}: {
    about: React.ReactNode;
    standings: React.ReactNode;
    payouts: React.ReactNode;
    structure: React.ReactNode;
    cardBg: string;
    border: string;
}) {
    // Recessed track + an elevated, bordered pill for the active tab so the
    // selection reads clearly in both themes (a flat card-on-card was too faint).
    const trackBg = useColorModeValue(
        'rgba(11, 20, 48, 0.08)',
        'rgba(0, 0, 0, 0.28)'
    );
    const selectedBg = useColorModeValue('white', 'rgba(255, 255, 255, 0.16)');
    const selectedBorder = useColorModeValue(
        'rgba(11, 20, 48, 0.10)',
        'rgba(255, 255, 255, 0.20)'
    );
    const sections = [
        ...(about ? [{ label: 'About', content: about }] : []),
        { label: 'Players', content: standings },
        { label: 'Payouts', content: payouts },
        { label: 'Blinds', content: structure },
    ];

    return (
        <Tabs variant="unstyled" isLazy isFitted>
            <TabList bg={trackBg} p="4px" borderRadius="12px" gap="4px">
                {sections.map((s) => (
                    <Tab
                        key={s.label}
                        borderRadius="8px"
                        py={2}
                        fontSize="sm"
                        fontWeight="semibold"
                        color="text.secondary"
                        borderWidth="1px"
                        borderColor="transparent"
                        transition="background-color 120ms ease, color 120ms ease, box-shadow 120ms ease"
                        _selected={{
                            bg: selectedBg,
                            color: 'text.primary',
                            fontWeight: 'bold',
                            borderColor: selectedBorder,
                            boxShadow: 'card.lift',
                        }}
                        _focusVisible={{ boxShadow: 'outline' }}
                    >
                        {s.label}
                    </Tab>
                ))}
            </TabList>
            <TabPanels>
                {sections.map((s) => (
                    <TabPanel key={s.label} px={0} pt={4}>
                        {s.content ?? (
                            <Box
                                bg={cardBg}
                                borderWidth="1px"
                                borderColor={border}
                                borderRadius="14px"
                                p={6}
                                textAlign="center"
                            >
                                <Text color="text.muted" fontSize="sm">
                                    Nothing to show here yet.
                                </Text>
                            </Box>
                        )}
                    </TabPanel>
                ))}
            </TabPanels>
        </Tabs>
    );
}

function Stat({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <VStack align="start" spacing={0.5} minW={0}>
            <Text
                fontSize="2xs"
                color="text.muted"
                textTransform="uppercase"
                letterSpacing="0.08em"
                fontWeight="semibold"
            >
                {label}
            </Text>
            <Box fontSize="sm">{children}</Box>
        </VStack>
    );
}

function MoneyHero({
    tournament: t,
    freePlay,
    finalPrizePoolUsdc,
    scale = 'hero',
}: {
    tournament: Tournament;
    freePlay: boolean;
    finalPrizePoolUsdc?: number;
    /** 'hero' = the page's protagonist figure; 'stat' = a smaller secondary read
     *  (e.g. beside the live blind level). */
    scale?: 'hero' | 'stat';
}) {
    // The pool/prize leads in USDC blue to rhyme with the USDC coin mark and the
    // payout ladder (a lighter blue in dark mode so the big figure clears AA).
    const moneyColor = useColorModeValue(USDC_BLUE, '#5C9DEF');
    const projecting = t.status === 'registration' || t.status === 'pending';

    let label = 'Buy-in';
    let value = `$${formatUsdc(t.buy_in_usdc)}`;
    let caption: string | undefined;
    if (freePlay) {
        label = 'Entry';
        value = 'Free';
    } else if (t.guarantee_usdc > 0) {
        label = 'Guaranteed pool';
        value = `$${formatUsdcAuto(t.guarantee_usdc)}`;
        caption = 'Guaranteed by the host, grows with the field';
    } else if (t.prize_pool_usdc > 0) {
        label = 'Prize pool';
        value = `$${formatUsdcAuto(t.prize_pool_usdc)}`;
    }
    // Registration/pending: once the live field's projected pool overtakes the
    // guarantee floor, lead with the bigger projected number, in step with the
    // projected payout ladder. Plain-language caption, never bare "GTD".
    if (
        !freePlay &&
        projecting &&
        t.guarantee_usdc > 0 &&
        (finalPrizePoolUsdc ?? 0) > t.guarantee_usdc
    ) {
        label = 'Projected pool';
        value = `$${formatUsdcAuto(finalPrizePoolUsdc as number)}`;
        caption = 'Projected, grows as players register';
    }
    if (
        !freePlay &&
        t.status === 'running' &&
        (finalPrizePoolUsdc ?? 0) > t.guarantee_usdc
    ) {
        // Underway: entries are locked, so the pool is realized, not projected.
        label = 'Prize pool';
        value = `$${formatUsdcAuto(finalPrizePoolUsdc as number)}`;
        caption = undefined;
    }
    if (t.status === 'completed' && (finalPrizePoolUsdc ?? 0) > 0) {
        // Settled: lead with the realized pool that was paid out (sum of payouts).
        label = 'Prize pool';
        value = `$${formatUsdcAuto(finalPrizePoolUsdc as number)}`;
        caption = 'Paid out in full';
    }
    if (t.status === 'cancelled' || t.status === 'emergency_refund') {
        // No live present-tense framing once it's off: the pool never filled.
        caption =
            t.status === 'cancelled'
                ? 'Tournament cancelled, buy-ins refundable'
                : 'Refunds open, withdraw your buy-in';
    }
    const usdc = !freePlay;
    const isHero = scale === 'hero';

    return (
        <VStack align="start" spacing={1} minW={0}>
            <Text
                fontSize="2xs"
                color="text.muted"
                textTransform="uppercase"
                letterSpacing="0.08em"
                fontWeight="semibold"
            >
                {label}
            </Text>
            <HStack spacing={2} align="center" minW={0}>
                {usdc && (
                    <Image
                        src={USDC_LOGO}
                        alt=""
                        boxSize={
                            isHero ? { base: '22px', md: '26px' } : '18px'
                        }
                        flexShrink={0}
                    />
                )}
                <Text
                    fontWeight="bold"
                    fontSize={
                        isHero ? { base: '3xl', md: '4xl' } : { base: 'xl', md: '2xl' }
                    }
                    lineHeight="1"
                    letterSpacing="-0.02em"
                    color={usdc ? moneyColor : 'text.primary'}
                    noOfLines={1}
                    minW={0}
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {value}
                </Text>
            </HStack>
            {caption && isHero && (
                <Text fontSize="xs" color="text.secondary" fontWeight="medium">
                    {caption}
                </Text>
            )}
        </VStack>
    );
}

function TimingHero({
    status,
    startIso,
    endIso,
    blindLevel,
    playersLeft,
}: {
    status: string;
    startIso: string;
    endIso?: string;
    blindLevel: number | null;
    playersLeft: number;
}) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const countdown = useCountdown(startIso);

    if (status === 'registration' || status === 'pending') {
        return (
            <Stat label={status === 'pending' ? 'Scheduled' : 'Starts in'}>
                <HStack spacing={1.5}>
                    <Icon as={FiClock} boxSize="14px" color="text.muted" />
                    <Text
                        fontWeight="bold"
                        color="text.primary"
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        {status === 'pending'
                            ? formatTournamentStart(startIso)
                            : countdown.ready
                              ? countdown.isPast
                                  ? 'Starting now'
                                  : countdown.label
                              : formatTournamentStart(startIso)}
                    </Text>
                </HStack>
            </Stat>
        );
    }

    if (status === 'running') {
        return (
            <Stat label="Live now">
                <HStack spacing={2}>
                    <Box
                        w="7px"
                        h="7px"
                        borderRadius="full"
                        bg="brand.green"
                        animation={
                            prefersReducedMotion
                                ? undefined
                                : `${dotPulse} 2s ease-in-out infinite`
                        }
                        aria-hidden
                    />
                    <Text
                        fontWeight="bold"
                        color="text.primary"
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        {blindLevel !== null
                            ? `Level ${blindLevel}`
                            : 'In progress'}
                        {playersLeft > 0 && (
                            <Text
                                as="span"
                                color="text.muted"
                                fontWeight="normal"
                            >
                                {' '}
                                · {playersLeft} left
                            </Text>
                        )}
                    </Text>
                </HStack>
            </Stat>
        );
    }

    if (status === 'completed') {
        return (
            <Stat label="Ended">
                <Text
                    fontWeight="semibold"
                    color="text.primary"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {endIso ? formatTournamentStart(endIso) : 'Final'}
                </Text>
            </Stat>
        );
    }

    return (
        <Stat label="Status">
            <Text
                fontWeight="semibold"
                color="text.primary"
                textTransform="capitalize"
            >
                {status}
            </Text>
        </Stat>
    );
}

function PlayersBar({
    registered,
    max,
    min,
    status,
    playersLeft,
    isUsdc,
}: {
    registered: number;
    max: number;
    min: number;
    status: string;
    playersLeft: number;
    isUsdc: boolean;
}) {
    const trackBg = useColorModeValue(
        'rgba(11, 20, 48, 0.10)',
        'rgba(255, 255, 255, 0.10)'
    );
    const prefersReducedMotion = usePrefersReducedMotion();
    const isRunning = status === 'running';
    const isCompleted = status === 'completed';
    // "left" is only trustworthy once the live leaderboard has loaded (>0 alive).
    // Otherwise fall back to the locked field size so a not-yet-loaded leaderboard
    // never reads as "0 of N left".
    const liveRemaining = isRunning && playersLeft > 0;
    const entriesWord = registered === 1 ? 'entry' : 'entries';

    let label: string;
    let value: React.ReactNode;
    let fillRatio = 0;
    let showBar = false;

    if (liveRemaining) {
        // Running, live: how many are still in. Bar depletes as players bust.
        label = 'Players remaining';
        value = `${playersLeft} of ${registered} left`;
        fillRatio = registered > 0 ? Math.min(1, playersLeft / registered) : 0;
        showBar = true;
    } else if (isCompleted) {
        label = 'Final field';
        value = `${registered} ${entriesWord}`;
    } else if (isRunning) {
        // Running but no live count yet — show the locked field, not "0 left".
        label = 'Field';
        value = `${registered} ${entriesWord}`;
    } else {
        // Registration / pending: filling toward the cap.
        label = 'Players registered';
        value = (
            <>
                {registered} / {max}
                <Text as="span" color="text.muted" fontWeight="normal">
                    {' '}
                    · min {min}
                </Text>
            </>
        );
        fillRatio = max > 0 ? Math.min(1, registered / max) : 0;
        showBar = true;
    }

    return (
        <VStack align="stretch" spacing={1.5}>
            <Flex justify="space-between" align="baseline" gap={2}>
                <Text
                    fontSize="xs"
                    color="text.secondary"
                    fontWeight="semibold"
                >
                    {label}
                </Text>
                <Text
                    key={typeof value === 'string' ? value : label}
                    fontSize="xs"
                    color="text.secondary"
                    fontWeight="semibold"
                    transformOrigin="right center"
                    sx={{
                        fontVariantNumeric: 'tabular-nums',
                        animation: prefersReducedMotion
                            ? undefined
                            : `${valuePop} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)`,
                    }}
                >
                    {value}
                </Text>
            </Flex>
            {showBar && (
                <Box
                    position="relative"
                    w="full"
                    h="5px"
                    borderRadius="full"
                    bg={trackBg}
                    overflow="hidden"
                >
                    <Box
                        position="absolute"
                        top={0}
                        left={0}
                        h="5px"
                        w={`${fillRatio * 100}%`}
                        minW={fillRatio > 0 ? '5px' : '0'}
                        borderRadius="full"
                        bg={isUsdc ? USDC_BLUE : 'brand.green'}
                        opacity={0.9}
                        transformOrigin="left center"
                        transition="width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                        sx={{
                            // Grow-in only while the bar is FILLING toward the cap
                            // (registration). A running tournament's bar DEPLETES as
                            // players bust; growing from empty up to a low remaining
                            // fraction reads as "stuck partway", so render it at its
                            // level and let the width transition animate depletion.
                            animation:
                                prefersReducedMotion || liveRemaining
                                    ? undefined
                                    : `${fillGrow} 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both`,
                        }}
                    >
                        {!prefersReducedMotion && fillRatio > 0.04 && (
                            <Box
                                position="absolute"
                                top={0}
                                bottom={0}
                                left={0}
                                w="40%"
                                borderRadius="full"
                                aria-hidden
                                sx={{
                                    background:
                                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
                                    animation: `${fillShimmer} 2.6s ease-in-out 0.6s infinite`,
                                }}
                            />
                        )}
                    </Box>
                </Box>
            )}
        </VStack>
    );
}

function PrimaryActions({
    status,
    isRegistered,
    isEliminated,
    canRegister,
    canLateReg,
    canUnregister,
    canReenter,
    freePlay,
    myWallet,
    isSignedIn = true,
    actionLoading,
    actionLabel,
    goToTableLoading,
    bulletsUsed,
    reentryMax,
    buyInUsdc,
    onRegister,
    onUnregister,
    onGoToTable,
}: {
    status: string;
    isRegistered: boolean;
    isEliminated: boolean;
    canRegister: boolean;
    canLateReg: boolean;
    canUnregister: boolean;
    canReenter: boolean;
    freePlay: boolean;
    myWallet?: string;
    isSignedIn?: boolean;
    actionLoading: boolean;
    actionLabel?: string;
    goToTableLoading: boolean;
    bulletsUsed: number;
    reentryMax: number;
    buyInUsdc: number;
    onRegister?: (isReentry?: boolean) => void;
    onUnregister?: () => void;
    onGoToTable?: () => void;
}) {
    const buttons: React.ReactNode[] = [];

    if (canRegister || canLateReg) {
        buttons.push(
            <Button
                key="reg"
                variant="tactilePrimary"
                size="md"
                minH="44px"
                isLoading={actionLoading}
                loadingText={actionLabel ?? 'Joining…'}
                onClick={() => onRegister?.(false)}
            >
                {!isSignedIn
                    ? 'Sign in to register'
                    : canLateReg
                      ? 'Late register'
                      : freePlay
                        ? 'Join tournament'
                        : 'Register'}
            </Button>
        );
    }
    if (status === 'running' && isRegistered && !isEliminated) {
        buttons.push(
            <Button
                key="table"
                variant="tactilePrimary"
                size="md"
                minH="44px"
                isLoading={goToTableLoading}
                loadingText="Finding table…"
                onClick={onGoToTable}
            >
                Go to my table
            </Button>
        );
    }
    if (canReenter) {
        buttons.push(
            <Button
                key="reenter"
                variant="tactilePrimary"
                size="md"
                minH="44px"
                isLoading={actionLoading}
                loadingText={actionLabel ?? 'Re-entering…'}
                onClick={() => onRegister?.(true)}
            >
                {!isSignedIn ? (
                    'Sign in to re-enter'
                ) : (
                    <>Re-enter {!freePlay && `for $${formatUsdc(buyInUsdc)}`}</>
                )}
            </Button>
        );
    }
    if (canUnregister) {
        buttons.push(
            <Button
                key="unreg"
                variant="tactileDestructive"
                size="md"
                minH="44px"
                isLoading={actionLoading}
                onClick={onUnregister}
            >
                Unregister
            </Button>
        );
    }

    if (buttons.length === 0) {
        if (status === 'registration' && isRegistered) {
            return (
                <HStack spacing={2} fontWeight="semibold">
                    <Icon as={FiCheck} boxSize="18px" color="brand.green" />
                    <Text color="brand.green">
                        You’re registered, locked in for the start.
                    </Text>
                </HStack>
            );
        }
        if (
            status === 'running' &&
            isRegistered &&
            isEliminated &&
            !canReenter
        ) {
            const noBullets = bulletsUsed > reentryMax;
            return (
                <Text fontSize="sm" color="text.muted">
                    {noBullets
                        ? 'You’ve used all your bullets in this tournament.'
                        : 'You’ve been eliminated. Follow the standings below.'}
                </Text>
            );
        }
        if (status === 'registration' && !myWallet) {
            return (
                <Text fontSize="sm" color="text.muted">
                    Connect your wallet to register.
                </Text>
            );
        }
        return null;
    }

    return (
        <Flex gap={2} flexWrap="wrap" justify="flex-end">
            {buttons}
        </Flex>
    );
}

function HostPanel({
    tournament: t,
    freePlay,
    registeredCount,
    hostRakeUsdc,
    rakeClaiming,
    actionLoading,
    hostEmergencyRefundUsdc,
    hostRefundClaiming,
    onFundAndOpen,
    onClaimRake,
    onClaimHostEmergencyRefund,
}: {
    tournament: Tournament;
    freePlay: boolean;
    registeredCount: number;
    hostRakeUsdc?: number | null;
    rakeClaiming: boolean;
    actionLoading: boolean;
    hostEmergencyRefundUsdc?: number | null;
    hostRefundClaiming?: boolean;
    onFundAndOpen?: () => void;
    onClaimRake?: () => void;
    onClaimHostEmergencyRefund?: () => void;
}) {
    const accentBg = useColorModeValue(
        'rgba(253, 197, 29, 0.10)',
        'rgba(253, 197, 29, 0.14)'
    );
    const hostTagFg = useColorModeValue('brand.yellowDark', 'brand.yellow');
    const statBorder = useColorModeValue(
        'rgba(11, 20, 48, 0.10)',
        'rgba(255, 255, 255, 0.10)'
    );
    const statBg = useColorModeValue(
        'rgba(11, 20, 48, 0.02)',
        'rgba(255, 255, 255, 0.02)'
    );
    const needsFunding =
        t.status === 'pending' && t.guarantee_usdc > 0 && !!t.contract_address;
    // What the host still covers if buy-ins fall short of the guarantee. Free seats collect
    // no buy-in, so exposure/fees track paid_entries — not the full registered field.
    const buyInsCollected = (t.paid_entries ?? registeredCount) * t.buy_in_usdc;
    const exposure = Math.max(0, t.guarantee_usdc - buyInsCollected);
    // The host's projected take: 25% of the platform fee (fee_bps of every
    // buy-in), mirroring Tournament.sol's HOST_SHARE_BPS. Grows as the field
    // fills; an estimate until the entry count locks at start. Fee then share
    // (not one triple product) keeps every intermediate within safe-integer range.
    const projectedPlatformFee = Math.floor(
        (buyInsCollected * t.fee_bps) / 10_000
    );
    const projectedHostFee = Math.floor(
        (projectedPlatformFee * HOST_FEE_SHARE_BPS) / 10_000
    );

    return (
        <VStack align="stretch" spacing={3}>
            <HStack spacing={2}>
                <Text
                    fontSize="2xs"
                    fontWeight="bold"
                    color="text.muted"
                    textTransform="uppercase"
                    letterSpacing="0.08em"
                >
                    Host controls
                </Text>
                <Box
                    bg={accentBg}
                    color={hostTagFg}
                    fontSize="2xs"
                    fontWeight="bold"
                    px={2}
                    py="1px"
                    borderRadius="full"
                    textTransform="uppercase"
                    letterSpacing="0.06em"
                >
                    You host this
                </Box>
            </HStack>

            {needsFunding && (
                <VStack align="stretch" spacing={2}>
                    <Text fontSize="sm" color="text.secondary" lineHeight={1.5}>
                        Fund the ${formatUsdcAuto(t.guarantee_usdc)}{' '}
                        guaranteed pool to open registration. If buy-ins fall
                        short, your deposit covers the gap, and the unused
                        portion returns to you when the tournament starts.
                    </Text>
                    <Button
                        variant="tactilePrimary"
                        size="md"
                        minH="48px"
                        alignSelf="flex-start"
                        isLoading={actionLoading}
                        onClick={onFundAndOpen}
                    >
                        Fund ${formatUsdcAuto(t.guarantee_usdc)} guarantee &amp;
                        open registration
                    </Button>
                </VStack>
            )}

            {!freePlay && t.status === 'registration' && (
                <Flex
                    direction={{ base: 'column', sm: 'row' }}
                    gap={2.5}
                    align="stretch"
                >
                    {t.guarantee_usdc > 0 && (
                        <Box
                            flex="1"
                            minW={0}
                            p={3}
                            bg={statBg}
                            borderWidth="1px"
                            borderColor={statBorder}
                            borderRadius="12px"
                        >
                            <Stat label="On the hook for">
                                <HStack spacing={1}>
                                    <Image
                                        src={USDC_LOGO}
                                        alt=""
                                        boxSize="14px"
                                    />
                                    <Text
                                        fontWeight="bold"
                                        fontSize="md"
                                        color={USDC_BLUE}
                                        sx={{
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        ${formatUsdcAuto(exposure)}
                                    </Text>
                                </HStack>
                            </Stat>
                            <Text fontSize="2xs" color="text.muted" mt={1}>
                                Your top-up if no one else joins. Shrinks with
                                every buy-in.
                            </Text>
                        </Box>
                    )}
                    <Box
                        flex="1"
                        minW={0}
                        p={3}
                        bg={statBg}
                        borderWidth="1px"
                        borderColor={statBorder}
                        borderRadius="12px"
                    >
                        <Stat label="You earn so far">
                            <HStack spacing={1}>
                                <Image src={USDC_LOGO} alt="" boxSize="14px" />
                                <Text
                                    fontWeight="bold"
                                    fontSize="md"
                                    color={USDC_BLUE}
                                    sx={{
                                        fontVariantNumeric: 'tabular-nums',
                                    }}
                                >
                                    ${formatUsdcAuto(projectedHostFee)}
                                </Text>
                            </HStack>
                        </Stat>
                        <Text fontSize="2xs" color="text.muted" mt={1}>
                            Your 25% of the platform fee. Grows with every entry.
                        </Text>
                    </Box>
                </Flex>
            )}

            {t.status === 'completed' && !freePlay && (
                <HStack justify="space-between" flexWrap="wrap" gap={3}>
                    <Stat label="Your platform fee earnings">
                        {hostRakeUsdc === null || hostRakeUsdc === undefined ? (
                            <HStack spacing={2}>
                                <Spinner size="xs" />
                                <Text fontSize="sm" color="text.muted">
                                    Loading…
                                </Text>
                            </HStack>
                        ) : hostRakeUsdc > 0 ? (
                            <HStack spacing={1}>
                                <Image src={USDC_LOGO} alt="" boxSize="14px" />
                                <Text
                                    fontWeight="bold"
                                    color={USDC_BLUE}
                                    sx={{
                                        fontVariantNumeric: 'tabular-nums',
                                    }}
                                >
                                    ${formatUsdc(hostRakeUsdc)}
                                </Text>
                                <Text fontSize="xs" color="text.muted">
                                    claimable
                                </Text>
                            </HStack>
                        ) : (
                            <Text fontSize="sm" color="text.muted">
                                Nothing to claim, already withdrawn.
                            </Text>
                        )}
                    </Stat>
                    {(hostRakeUsdc ?? 0) > 0 && (
                        <Button
                            variant="tactilePrimary"
                            size="md"
                            minH="44px"
                            isLoading={rakeClaiming}
                            loadingText="Claiming…"
                            onClick={onClaimRake}
                        >
                            Claim fees
                        </Button>
                    )}
                </HStack>
            )}

            {t.status === 'emergency_refund' && !freePlay && (
                <VStack align="stretch" spacing={2}>
                    <Text fontSize="sm" color="text.secondary" lineHeight={1.5}>
                        This tournament stalled and went to emergency refunds.
                        Players are recovering their buy-ins, and the guarantee
                        you funded is reserved for you to reclaim.
                    </Text>
                    <HStack justify="space-between" flexWrap="wrap" gap={3}>
                        <Stat label="Your guarantee deposit">
                            {hostEmergencyRefundUsdc === null ||
                            hostEmergencyRefundUsdc === undefined ? (
                                <HStack spacing={2}>
                                    <Spinner size="xs" />
                                    <Text fontSize="sm" color="text.muted">
                                        Loading…
                                    </Text>
                                </HStack>
                            ) : hostEmergencyRefundUsdc > 0 ? (
                                <HStack spacing={1}>
                                    <Image
                                        src={USDC_LOGO}
                                        alt=""
                                        boxSize="14px"
                                    />
                                    <Text
                                        fontWeight="bold"
                                        color={USDC_BLUE}
                                        sx={{
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        ${formatUsdc(hostEmergencyRefundUsdc)}
                                    </Text>
                                    <Text fontSize="xs" color="text.muted">
                                        reclaimable
                                    </Text>
                                </HStack>
                            ) : (
                                <Text fontSize="sm" color="text.muted">
                                    Nothing to reclaim, already withdrawn.
                                </Text>
                            )}
                        </Stat>
                        {(hostEmergencyRefundUsdc ?? 0) > 0 && (
                            <Button
                                variant="tactilePrimary"
                                size="md"
                                minH="44px"
                                isLoading={hostRefundClaiming}
                                loadingText="Reclaiming…"
                                onClick={onClaimHostEmergencyRefund}
                            >
                                Reclaim deposit
                            </Button>
                        )}
                    </HStack>
                </VStack>
            )}
        </VStack>
    );
}

function Standings({
    tournament: t,
    freePlay,
    players,
    myWallet,
    cardBg,
    border,
    rowHover,
    meHighlight,
}: {
    tournament: Tournament;
    freePlay: boolean;
    players: LeaderboardPlayer[];
    myWallet?: string;
    cardBg: string;
    border: string;
    rowHover: string;
    meHighlight: string;
}) {
    const running = t.status === 'running';
    const completed = t.status === 'completed';
    const prefersReducedMotion = usePrefersReducedMotion();
    // Gold numeral for the live chip leader (running view; completed top three get
    // chip medals instead).
    const goldRank = useColorModeValue('brand.yellowDark', 'brand.yellow');
    // Podium dressing for the finished top three: the same gold/silver/bronze poker
    // chips as the payout ladder, a soft metal wash down each row, and a crown +
    // "Champion" tag on 1st. Washes and disc-ring mirror PayoutLadder so the two
    // surfaces read as one system.
    const goldWash = useColorModeValue(
        'rgba(253, 197, 29, 0.12)',
        'rgba(253, 197, 29, 0.14)'
    );
    const silverWash = useColorModeValue(
        'rgba(148, 163, 184, 0.14)',
        'rgba(148, 163, 184, 0.16)'
    );
    const bronzeWash = useColorModeValue(
        'rgba(205, 137, 78, 0.12)',
        'rgba(205, 137, 78, 0.18)'
    );
    const championPillBg = useColorModeValue(
        'rgba(253, 197, 29, 0.18)',
        'rgba(253, 197, 29, 0.16)'
    );
    const championPillFg = useColorModeValue('brand.yellowDark', 'brand.yellow');
    const podiumWash = (r: number) =>
        r === 1
            ? goldWash
            : r === 2
              ? silverWash
              : r === 3
                ? bronzeWash
                : undefined;
    // For completed tournaments the displayed field size is the highest finish
    // position, not players.length. A race condition can leave a gap (e.g. no
    // position 8 but position 9 exists), making players.length = 8 while the
    // real field was 9. Taking the max finish_pos surfaces the true count.
    const finishPositions = completed
        ? players.map((p) => p.finish_pos).filter((pos) => pos > 0)
        : [];
    const fieldCount =
        finishPositions.length > 0
            ? Math.max(...finishPositions)
            : players.length;
    return (
        <Box
            bg={cardBg}
            borderWidth="1px"
            borderColor={border}
            borderRadius="14px"
            overflow="hidden"
        >
            <Flex
                px={{ base: 4, md: 6 }}
                pt={4}
                pb={2}
                align="baseline"
                justify="space-between"
                gap={2}
            >
                <Text fontWeight="bold" fontSize="md" color="text.primary">
                    {completed ? 'Final standings' : 'Current standings'}
                </Text>
                <Text
                    fontSize="xs"
                    color="text.muted"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {fieldCount} player{fieldCount !== 1 ? 's' : ''}
                </Text>
            </Flex>
            <Box
                overflowX="auto"
                overflowY="auto"
                // Taller than a fixed cap so more rows show at once; grows with the
                // viewport on tall screens, with a floor that always beats ~11 rows.
                maxH={{ base: 'max(480px, 62vh)', lg: 'max(760px, 80vh)' }}
                tabIndex={0}
                role="region"
                aria-label={completed ? 'Final standings' : 'Current standings'}
                sx={HIDE_X_SCROLLBAR_SX}
            >
                <Table
                    size="sm"
                    variant="simple"
                    sx={{
                        'th, td': { borderColor: border, px: 2 },
                        'thead th': {
                            position: 'sticky',
                            top: 0,
                            bg: cardBg,
                            zIndex: 1,
                        },
                    }}
                >
                    <Thead>
                        <Tr>
                            <Th w="48px">#</Th>
                            <Th>Player</Th>
                            {running && t.reentry_allowed && (
                                <Th isNumeric>Bullets</Th>
                            )}
                            {running && <Th isNumeric>Chips</Th>}
                            {running && <Th isNumeric>Table</Th>}
                            {completed && !freePlay && <Th isNumeric>Prize</Th>}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {players.map((p, i) => {
                            const rank =
                                p.finish_pos === 0 ? i + 1 : p.finish_pos;
                            const isOut = p.finish_pos > 0;
                            const isMe =
                                myWallet &&
                                p.wallet.toLowerCase() ===
                                    myWallet.toLowerCase();
                            const isPodium = completed && rank <= 3;
                            const isChampion = completed && rank === 1;
                            const wash = isPodium
                                ? podiumWash(rank)
                                : undefined;
                            return (
                                <Tr
                                    key={p.uuid}
                                    bg={isMe ? meHighlight : wash}
                                    _hover={{
                                        bg: isMe
                                            ? meHighlight
                                            : (wash ?? rowHover),
                                    }}
                                    opacity={isOut && !completed ? 0.55 : 1}
                                >
                                    <Td fontWeight="bold" color="text.primary">
                                        {isPodium ? (
                                            <RankBadge
                                                place={rank}
                                                reduced={prefersReducedMotion}
                                                delayMs={(rank - 1) * 90}
                                                size={32}
                                            />
                                        ) : (
                                            <Text
                                                as="span"
                                                color={
                                                    running && rank === 1
                                                        ? goldRank
                                                        : 'text.primary'
                                                }
                                                sx={{
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                {rank}
                                            </Text>
                                        )}
                                    </Td>
                                    <Td>
                                        <HStack spacing={3} minW={0}>
                                            <Box boxSize="36px" flexShrink={0}>
                                                <PlayerAvatar
                                                    profileImageUrl={
                                                        p.xProfileImageUrl
                                                    }
                                                    address={p.wallet}
                                                    username={
                                                        p.xUsername
                                                            ? `@${p.xUsername}`
                                                            : p.wallet || p.uuid
                                                    }
                                                    initialsFontSize="13px"
                                                />
                                            </Box>
                                            <VStack
                                                align="start"
                                                spacing={0}
                                                minW={0}
                                            >
                                                <HStack spacing={1.5} minW={0}>
                                                    {p.xUsername ? (
                                                        <PlayerNameLink
                                                            username={`@${p.xUsername}`}
                                                            displayName={p.xDisplayName}
                                                            fontSize="sm"
                                                            fontWeight="semibold"
                                                            noOfLines={1}
                                                        />
                                                    ) : p.wallet ? (
                                                        <ExternalLink
                                                            href={`${explorerBase(t.chain)}/address/${p.wallet}`}
                                                            fontSize="sm"
                                                            fontFamily="mono"
                                                            color="text.primary"
                                                        >
                                                            {shortAddr(
                                                                p.wallet
                                                            )}
                                                        </ExternalLink>
                                                    ) : (
                                                        <Text
                                                            fontSize="sm"
                                                            color="text.muted"
                                                            fontFamily="mono"
                                                        >
                                                            {p.uuid.slice(0, 8)}
                                                        </Text>
                                                    )}
                                                    {isChampion && (
                                                        <Text
                                                            as="span"
                                                            fontSize="2xs"
                                                            fontWeight="bold"
                                                            color={
                                                                championPillFg
                                                            }
                                                            bg={championPillBg}
                                                            px={1.5}
                                                            py="1px"
                                                            borderRadius="full"
                                                            textTransform="uppercase"
                                                            letterSpacing="0.06em"
                                                            flexShrink={0}
                                                        >
                                                            Champion
                                                        </Text>
                                                    )}
                                                    {isMe && (
                                                        <Text
                                                            fontSize="2xs"
                                                            fontWeight="bold"
                                                            color="brand.green"
                                                            textTransform="uppercase"
                                                            letterSpacing="0.06em"
                                                        >
                                                            you
                                                        </Text>
                                                    )}
                                                    {isOut && running && (
                                                        <Text
                                                            fontSize="2xs"
                                                            color="text.muted"
                                                            textTransform="uppercase"
                                                            letterSpacing="0.06em"
                                                        >
                                                            out
                                                        </Text>
                                                    )}
                                                </HStack>
                                                {p.xUsername && p.wallet && (
                                                    <ExternalLink
                                                        href={`${explorerBase(t.chain)}/address/${p.wallet}`}
                                                        fontSize="2xs"
                                                        fontFamily="mono"
                                                        color="text.muted"
                                                        iconSize="9px"
                                                    >
                                                        {shortAddr(p.wallet)}
                                                    </ExternalLink>
                                                )}
                                            </VStack>
                                        </HStack>
                                    </Td>
                                    {running && t.reentry_allowed && (
                                        <Td isNumeric>
                                            <Text
                                                fontSize="xs"
                                                color="text.muted"
                                            >
                                                {p.bullet_number ?? 1}
                                            </Text>
                                        </Td>
                                    )}
                                    {running && (
                                        <Td isNumeric>
                                            <Text
                                                fontSize="xs"
                                                color={
                                                    isOut
                                                        ? 'text.muted'
                                                        : 'text.primary'
                                                }
                                                sx={{
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                {isOut
                                                    ? '—'
                                                    : p.stack.toLocaleString()}
                                            </Text>
                                        </Td>
                                    )}
                                    {running && (
                                        <Td isNumeric>
                                            {isOut && p.table_index < 0 ? (
                                                <Text
                                                    fontSize="xs"
                                                    color="text.muted"
                                                >
                                                    —
                                                </Text>
                                            ) : (
                                                <ExternalLink
                                                    href={`/table/tournament-${t.id}-table-${p.table_index + 1}`}
                                                    fontSize="xs"
                                                    color={isOut ? 'text.muted' : 'text.secondary'}
                                                    iconSize="9px"
                                                >
                                                    T{p.table_index + 1}
                                                </ExternalLink>
                                            )}
                                        </Td>
                                    )}
                                    {completed && !freePlay && (
                                        <Td isNumeric>
                                            <Text
                                                fontSize={
                                                    isPodium &&
                                                    (p.prize_usdc ?? 0) > 0
                                                        ? 'sm'
                                                        : 'xs'
                                                }
                                                fontWeight={
                                                    (p.prize_usdc ?? 0) > 0
                                                        ? 'bold'
                                                        : 'normal'
                                                }
                                                color={
                                                    (p.prize_usdc ?? 0) > 0
                                                        ? USDC_BLUE
                                                        : 'text.muted'
                                                }
                                                sx={{
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                {(p.prize_usdc ?? 0) > 0
                                                    ? `$${formatUsdc(p.prize_usdc as number)}`
                                                    : '—'}
                                            </Text>
                                        </Td>
                                    )}
                                </Tr>
                            );
                        })}
                    </Tbody>
                </Table>
            </Box>
        </Box>
    );
}

// Completed-state cashout, right-aligned inside the hero — no container, matches
// RefundPanel's geometry. Green once prizes settle on-chain, warm while settling.
function PayoutsPanel({
    tournament: t,
    linkColor,
    myWallet,
    unclaimed,
    onClaimPrize,
}: {
    tournament: Tournament;
    linkColor: string;
    myWallet?: string;
    unclaimed?: UnclaimedPrizeState;
    onClaimPrize?: () => void;
}) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const settled = !!t.settlement_tx_hash;
    const orangeFg = useColorModeValue('orange.600', 'orange.300');
    const enter = prefersReducedMotion
        ? undefined
        : `${cashoutIn} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both`;

    // Rare path: this viewer's auto-payout didn't land, so their prize is waiting
    // in the contract for a manual claim. Lead with the money + a one-tap claim,
    // mirroring RefundPanel's "money waiting" geometry.
    const u = unclaimed ?? {};
    if (
        myWallet &&
        !u.loading &&
        !u.claimed &&
        (u.claimableUsdc ?? 0) > 0
    ) {
        return (
            <Flex
                alignSelf="flex-end"
                align="center"
                gap={{ base: 3, md: 5 }}
                flexWrap="wrap"
                justify="flex-end"
                animation={enter}
            >
                <VStack align="end" spacing={0}>
                    <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        color="brand.green"
                        textTransform="uppercase"
                        letterSpacing="0.1em"
                    >
                        Your prize
                    </Text>
                    <HStack spacing={1.5}>
                        <Image
                            src={USDC_LOGO}
                            alt=""
                            boxSize="18px"
                            animation={
                                prefersReducedMotion
                                    ? undefined
                                    : `${coinFlip} 0.7s ease-out 0.2s both`
                            }
                        />
                        <Text
                            fontWeight="extrabold"
                            fontSize="xl"
                            color={USDC_BLUE}
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            ${formatUsdc(u.claimableUsdc!)}
                        </Text>
                        <Text fontSize="xs" color="text.muted">
                            waiting for you
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color="text.muted" textAlign="right" maxW="260px">
                        Your payout didn’t land automatically. It’s safe in the
                        table contract, claim it whenever you’re ready.
                    </Text>
                </VStack>
                <Button
                    variant="tactilePrimary"
                    size="md"
                    minH="44px"
                    isLoading={u.claiming}
                    loadingText="Claiming…"
                    onClick={onClaimPrize}
                >
                    Claim prize
                </Button>
            </Flex>
        );
    }

    return (
        <VStack alignSelf="flex-end" align="end" spacing={0.5} animation={enter}>
            <Text
                fontSize="2xs"
                fontWeight="bold"
                color={settled ? 'brand.green' : orangeFg}
                textTransform="uppercase"
                letterSpacing="0.1em"
            >
                Payouts
            </Text>
            {settled ? (
                <HStack spacing={2.5} justify="flex-end" flexWrap="wrap">
                    <HStack spacing={1.5}>
                        <Icon as={FiCheck} boxSize="15px" color="brand.green" />
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color="text.primary"
                        >
                            Prizes distributed
                        </Text>
                    </HStack>
                    <Box
                        as="a"
                        href={`${explorerBase(t.chain)}/tx/${t.settlement_tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        fontFamily="mono"
                        fontSize="xs"
                        display="inline-flex"
                        alignItems="center"
                        gap="3px"
                        color={linkColor}
                        _hover={{
                            color: 'brand.green',
                            textDecoration: 'underline',
                        }}
                    >
                        {t.settlement_tx_hash!.slice(0, 10)}…
                        {t.settlement_tx_hash!.slice(-8)}
                        <Icon as={FiExternalLink} boxSize="10px" />
                    </Box>
                </HStack>
            ) : (
                <Text
                    fontSize="sm"
                    color="text.muted"
                    textAlign="right"
                    maxW="320px"
                >
                    Prizes are being distributed on-chain, this usually takes a
                    moment.
                </Text>
            )}
        </VStack>
    );
}

// Terminal-state cashout, right-aligned inside the hero where the live-state
// action button lives — no container of its own; the green button anchors it.
// The hero's StatusPill already says CANCELLED, so we drop the redundant tag and
// lead with the money + claim action.
function RefundPanel({
    status,
    refund,
    myWallet,
    onClaimRefund,
}: {
    status: string;
    refund?: RefundState;
    myWallet?: string;
    onClaimRefund?: () => void;
}) {
    const r = refund ?? {};
    const prefersReducedMotion = usePrefersReducedMotion();
    const headFg = useColorModeValue('orange.600', 'orange.300');
    const heading =
        status === 'emergency_refund' ? 'Emergency refund' : 'Your refund';
    const enter = prefersReducedMotion
        ? undefined
        : `${cashoutIn} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both`;

    const kicker = (
        <Text
            fontSize="2xs"
            fontWeight="bold"
            color={headFg}
            textTransform="uppercase"
            letterSpacing="0.1em"
        >
            {heading}
        </Text>
    );

    // The main event: money waiting, with the claim CTA beside it.
    if (myWallet && !r.loading && !r.alreadyClaimed && r.eligible) {
        return (
            <Flex
                alignSelf="flex-end"
                align="center"
                gap={{ base: 3, md: 5 }}
                flexWrap="wrap"
                justify="flex-end"
                animation={enter}
            >
                <VStack align="end" spacing={0}>
                    {kicker}
                    <HStack spacing={1.5}>
                        <Image
                            src={USDC_LOGO}
                            alt=""
                            boxSize="18px"
                            animation={
                                prefersReducedMotion
                                    ? undefined
                                    : `${coinFlip} 0.7s ease-out 0.2s both`
                            }
                        />
                        <Text
                            fontWeight="extrabold"
                            fontSize="xl"
                            color={USDC_BLUE}
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            {r.estimatedUsdc != null
                                ? `$${formatUsdc(r.estimatedUsdc)}`
                                : 'Pro-rata'}
                        </Text>
                        <Text fontSize="xs" color="text.muted">
                            {r.estimatedUsdc != null ? 'refundable' : 'available'}
                        </Text>
                    </HStack>
                </VStack>
                <Button
                    variant="tactilePrimary"
                    size="md"
                    minH="44px"
                    isLoading={r.claiming}
                    loadingText="Claiming…"
                    onClick={onClaimRefund}
                >
                    Claim refund
                </Button>
            </Flex>
        );
    }

    // Quiet states (no wallet / loading / already claimed / not eligible): the
    // kicker over a single right-aligned line, still no container.
    return (
        <VStack alignSelf="flex-end" align="end" spacing={0.5} animation={enter}>
            {kicker}
            {r.loading ? (
                <HStack spacing={2}>
                    <Spinner size="xs" />
                    <Text fontSize="sm" color="text.muted">
                        Checking your refund…
                    </Text>
                </HStack>
            ) : r.alreadyClaimed ? (
                <HStack spacing={1.5}>
                    <Icon as={FiCheck} boxSize="15px" color="brand.green" />
                    <Text fontSize="sm" color="text.secondary">
                        Refund claimed.
                    </Text>
                </HStack>
            ) : (
                <Text fontSize="sm" color="text.muted" textAlign="right">
                    {!myWallet
                        ? 'Connect your wallet to check your refund.'
                        : 'You weren’t registered in this tournament.'}
                </Text>
            )}
        </VStack>
    );
}

function EmergencyPanel({
    emergency,
    advertisedEnd,
    onEnable,
    cardBg,
    border,
    yellowText,
}: {
    emergency?: EmergencyState;
    advertisedEnd: string;
    onEnable?: () => void;
    cardBg: string;
    border: string;
    yellowText: string;
}) {
    const e = emergency ?? {};
    return (
        <Box
            bg={cardBg}
            borderWidth="1px"
            borderColor={border}
            borderRadius="14px"
            p={{ base: 4, md: 5 }}
        >
            <VStack align="stretch" spacing={2}>
                <HStack spacing={2}>
                    <Icon as={FiShield} boxSize="13px" color="text.muted" />
                    <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        color="text.muted"
                        textTransform="uppercase"
                        letterSpacing="0.08em"
                    >
                        Your safety net
                    </Text>
                </HStack>
                {e.opened ? (
                    <Text fontSize="sm" color="text.secondary" lineHeight={1.5}>
                        Emergency refunds are open, any registered player can
                        recover their buy-in directly from the contract.
                    </Text>
                ) : e.available ? (
                    <VStack align="stretch" spacing={2}>
                        <Text
                            fontSize="sm"
                            color="text.secondary"
                            lineHeight={1.5}
                        >
                            This tournament has run past its advertised end
                            without settling. Any registered player can open
                            emergency refunds so everyone can recover their
                            buy-ins from the contract.
                        </Text>
                        <Button
                            variant="tactileOutline"
                            size="md"
                            minH="44px"
                            alignSelf="flex-start"
                            isLoading={e.opening}
                            loadingText="Opening…"
                            onClick={onEnable}
                        >
                            Open emergency refunds
                        </Button>
                    </VStack>
                ) : (
                    <Text fontSize="sm" color="text.secondary" lineHeight={1.5}>
                        Your buy-in is safe. If prizes aren&apos;t paid by{" "}
                        {formatTournamentStart(
                            new Date(
                                new Date(advertisedEnd).getTime() +
                                    24 * 60 * 60 * 1000
                            ).toISOString()
                        )}
                        , any player can open emergency refunds to recover
                        buy-ins from the contract
                        {e.msUntilAvailable != null &&
                            e.msUntilAvailable > 0 && (
                                <Text
                                    as="span"
                                    color={yellowText}
                                    fontWeight="semibold"
                                >
                                    {" "}
                                    · available in{" "}
                                    {formatDuration(e.msUntilAvailable)}
                                </Text>
                            )}
                        .
                    </Text>
                )}
            </VStack>
        </Box>
    );
}

function StatusPill({ status }: { status: string }) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const { label, tone } = getStatusDescriptor(status);
    const neutralBg = useColorModeValue(
        'rgba(11, 20, 48, 0.06)',
        'rgba(255, 255, 255, 0.08)'
    );
    const greenBg = useColorModeValue(
        'rgba(54, 163, 123, 0.10)',
        'rgba(54, 163, 123, 0.18)'
    );
    const yellowBg = useColorModeValue(
        'rgba(253, 197, 29, 0.16)',
        'rgba(253, 197, 29, 0.22)'
    );
    const yellowFg = useColorModeValue('brand.yellowDark', 'brand.yellow');

    const styles = {
        open: {
            bg: greenBg,
            fg: 'brand.green',
            dot: 'brand.green',
            pulse: false,
        },
        live: {
            bg: neutralBg,
            fg: 'text.primary',
            dot: 'brand.green',
            pulse: true,
        },
        done: { bg: neutralBg, fg: 'text.muted', dot: null, pulse: false },
        cancelled: { bg: neutralBg, fg: 'text.muted', dot: null, pulse: false },
        setup: { bg: neutralBg, fg: 'text.muted', dot: null, pulse: false },
        refund: { bg: yellowBg, fg: yellowFg, dot: yellowFg, pulse: false },
    }[tone];

    return (
        <HStack
            spacing={2}
            px={3}
            py={1.5}
            borderRadius="full"
            bg={styles.bg}
            flexShrink={0}
        >
            {styles.dot && (
                <Box
                    w="7px"
                    h="7px"
                    borderRadius="full"
                    bg={styles.dot}
                    animation={
                        styles.pulse && !prefersReducedMotion
                            ? `${dotPulse} 2s ease-in-out infinite`
                            : undefined
                    }
                    aria-hidden
                />
            )}
            <Text
                fontSize="xs"
                fontWeight="bold"
                letterSpacing="0.06em"
                textTransform="uppercase"
                color={styles.fg}
                lineHeight="1"
            >
                {label}
            </Text>
        </HStack>
    );
}
