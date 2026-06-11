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
import PayoutLadder from './PayoutLadder';
import AboutPanel from './AboutPanel';
import { USDC_BLUE, USDC_LOGO } from '../PublicGames/types';
import {
    formatTournamentStart,
    formatUsdc,
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
import { placesPaid } from '../PublicGames/payouts';

// LeaderboardPlayer now lives in app/interfaces (shared with the live-tournament
// state slice). Re-exported here so existing `from './TournamentDetail'` imports
// (page.tsx, stories) keep working.
export type { LeaderboardPlayer };

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
    isRegistered?: boolean;
    blindLevel?: number | null;
    actionLoading?: boolean;
    actionLabel?: string;
    goToTableLoading?: boolean;
    /** Host-only: claimable rake in micro-USDC (null = loading). */
    hostRakeUsdc?: number | null;
    rakeClaiming?: boolean;
    refund?: RefundState;
    emergency?: EmergencyState;
    onRegister?: (isReentry?: boolean) => void;
    onUnregister?: () => void;
    onGoToTable?: () => void;
    onFundAndOpen?: () => void;
    onClaimRake?: () => void;
    onClaimRefund?: () => void;
    onEnableEmergencyRefund?: () => void;
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

function shortAddr(a: string): string {
    return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '';
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

// Host community link-outs (X, website, Discord, Telegram, and a provider-
// agnostic chart). Quiet monochrome chips for everyone; the host gets
// click-to-edit, with an "Add community links" prompt when empty. Frontend
// skeleton — a backend dev persists the URLs later.
function CommunityLinks({
    value,
    canEdit,
    onSave,
}: {
    value: CommunityLinkValues;
    canEdit: boolean;
    onSave: (links: CommunityLinkValues) => void;
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

    const present: { label: string; tone: SocialTone; href: string }[] = [];
    for (const f of LINK_FIELDS) {
        const href = value[f.key]?.trim();
        if (href) present.push({ label: f.label, tone: f.tone, href });
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
    isRegistered = false,
    blindLevel = null,
    actionLoading = false,
    actionLabel,
    goToTableLoading = false,
    hostRakeUsdc,
    rakeClaiming = false,
    refund,
    emergency,
    onRegister,
    onUnregister,
    onGoToTable,
    onFundAndOpen,
    onClaimRake,
    onClaimRefund,
    onEnableEmergencyRefund,
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
    const yellowText = useColorModeValue('brand.yellowDark', 'brand.yellow');
    const linkColor = useColorModeValue('brand.navy', 'brand.lightGray');
    // Faint chip behind the back button so it stays legible over the ambient wash.
    const navBackdrop = useColorModeValue(
        'rgba(255, 255, 255, 0.6)',
        'rgba(11, 20, 48, 0.4)'
    );
    // Page-bg-colored wash over the blurred banner. Tuned so the page clearly
    // takes on the tournament's colors while text on the surface stays legible
    // (cards are opaque on top). Lighter scrim = more of the image shows through.
    const ambientScrim = useColorModeValue(
        'rgba(236, 238, 245, 0.58)',
        'rgba(25, 20, 20, 0.62)'
    );

    const freePlay = getIsFreePlay(t);
    const tableSize = t.table_size || 9;
    const blindLabel = t.metadata?.blind_structure
        ? String(t.metadata.blind_structure)
        : 'turbo';
    // Default branding (used when the host uploaded no logo/banner): the type's
    // icon avatar + a card-suit cover wallpaper in the type's accent color.
    const typeIdentity = identityFor(blindLabel);
    const avatarSize = useBreakpointValue({ base: 96, md: 112 }) ?? 112;

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
    // show yet — no guarantee, no prize pool, and no final top prize. In that case
    // the separate "Buy-in" stat beside it is a duplicate ("buy in" twice before the
    // tournament starts), so hide it. Once the headline becomes a pool/top-prize
    // figure, the Buy-in stat is meaningful again and reappears.
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
    const effectivePrizePool =
        settledPrizePool > 0
            ? settledPrizePool
            : Math.max(t.prize_pool_usdc ?? 0, t.guarantee_usdc ?? 0);

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
        />
    );

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
    const hasLeftColumn = !!(aboutEl || standingsEl);

    return (
        <Flex direction="column" minH="100vh" bg="card.lightGray">
            <Box
                flex="1"
                pt={{ base: 20, md: 24 }}
                pb={16}
                position="relative"
                overflow="hidden"
            >
                {/* Ambient background — a blurred wash of the uploaded banner so the
                whole page takes on the tournament's vibe. Generated tournaments
                keep the neutral page color. Cards stay opaque on top. */}
                {bannerUrl && (
                    <Box
                        aria-hidden
                        position="absolute"
                        inset={0}
                        zIndex={0}
                        pointerEvents="none"
                        overflow="hidden"
                    >
                        <Box
                            position="absolute"
                            inset={0}
                            bgImage={`url(${bannerUrl})`}
                            bgSize="cover"
                            bgPosition="center"
                            transform="scale(1.1)"
                            filter="blur(32px) saturate(1.2)"
                        />
                        <Box position="absolute" inset={0} bg={ambientScrim} />
                    </Box>
                )}
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
                            bg={navBackdrop}
                            backdropFilter="blur(8px)"
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
                                h={{ base: '140px', md: '184px' }}
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
                                        mt={{ base: '-50px', md: '-58px' }}
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

                                <VStack align="stretch" spacing={4} mt={3}>
                                    {/* Name + format */}
                                    <VStack align="start" spacing={2} minW={0}>
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
                                            gap={{ base: 1.5, md: 4 }}
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
                                            <VStack
                                                align={{
                                                    base: 'start',
                                                    md: 'end',
                                                }}
                                                spacing={1.5}
                                                flexShrink={0}
                                            >
                                                <StatusPill status={t.status} />
                                                <Text
                                                    fontSize="2xs"
                                                    color="text.muted"
                                                    textTransform="uppercase"
                                                    letterSpacing="0.08em"
                                                    fontWeight="semibold"
                                                    whiteSpace="nowrap"
                                                >
                                                    {blindLabel} · NLH ·{' '}
                                                    {tableSize}
                                                    -max
                                                </Text>
                                                {!freePlay && t.chain && (
                                                    <ChainBadge
                                                        chain={t.chain}
                                                        size="sm"
                                                    />
                                                )}
                                            </VStack>
                                        </Flex>
                                        <CommunityLinks
                                            value={links}
                                            canEdit={isHost}
                                            onSave={updateLinks}
                                        />
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
                                            winnerPrizeUsdc={winner?.prize_usdc}
                                        />
                                        <TimingHero
                                            status={t.status}
                                            startIso={t.scheduled_start_at}
                                            endIso={t.ended_at}
                                            blindLevel={blindLevel}
                                            playersLeft={playersLeft}
                                        />
                                        {!freePlay && !heroShowsBuyIn && (
                                            <Stat label="Buy-in">
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
                                            </Stat>
                                        )}
                                        {t.reentry_allowed && (
                                            <Stat label="Re-entry">
                                                <Text
                                                    fontWeight="semibold"
                                                    color="text.primary"
                                                >
                                                    up to {t.reentry_max}×
                                                </Text>
                                            </Stat>
                                        )}
                                    </Flex>

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

                                    {/* Footer: contract details (left), action (right) */}
                                    <Flex
                                        justify="space-between"
                                        align="center"
                                        gap={3}
                                        flexWrap="wrap"
                                    >
                                        {!freePlay &&
                                        t.contract_address &&
                                        t.chain ? (
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
                                                    Held by the table contract
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
                                                        as={FiExternalLink}
                                                        boxSize="10px"
                                                    />
                                                </Box>
                                            </HStack>
                                        ) : (
                                            <Box />
                                        )}
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
                                    </Flex>

                                    {/* Terminal-state strip — claim your refund
                                    (cancelled / emergency) or see where the prizes
                                    went (completed). Lives in the hero so it's the
                                    first thing a returning player sees, not buried
                                    under the blind structure at the bottom. */}
                                    {(t.status === 'cancelled' ||
                                        t.status === 'emergency_refund') &&
                                        !freePlay &&
                                        t.contract_address && (
                                            <RefundPanel
                                                status={t.status}
                                                refund={refund}
                                                myWallet={myWallet}
                                                onClaimRefund={onClaimRefund}
                                            />
                                        )}
                                    {t.status === 'completed' &&
                                        !freePlay &&
                                        t.contract_address && (
                                            <PayoutsPanel
                                                tournament={t}
                                                linkColor={linkColor}
                                            />
                                        )}

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
                                                onFundAndOpen={onFundAndOpen}
                                                onClaimRake={onClaimRake}
                                            />
                                        </>
                                    )}
                                </VStack>
                            </Box>
                        </Box>

                        {/* Desktop (lg+): two columns — standings (left) · payouts
                        over structure (right). */}
                        <Flex
                            display={{ base: 'none', lg: 'flex' }}
                            direction="row"
                            align="flex-start"
                            gap={6}
                        >
                            {hasLeftColumn && (
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
                            {/* Fixed 360px beside the left column; grows to fill when
                            there is no left column (e.g. cancelled, empty field,
                            no description) so the cards don't orphan left. */}
                            <VStack
                                align="stretch"
                                spacing={6}
                                w={hasLeftColumn ? '360px' : 'full'}
                                flexShrink={hasLeftColumn ? 0 : 1}
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
        r.xUsername ? `@${r.xUsername}` : shortAddr(r.wallet);

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
                            boxShadow={`0 0 0 2px ${ring}`}
                            transition="transform 140ms ease-out"
                            _hover={{
                                transform: 'translateY(-3px)',
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
    winnerPrizeUsdc,
}: {
    tournament: Tournament;
    freePlay: boolean;
    winnerPrizeUsdc?: number;
}) {
    let label = 'Buy-in';
    let value = `$${formatUsdc(t.buy_in_usdc)}`;
    let suffix: string | undefined;
    if (freePlay) {
        label = 'Entry';
        value = 'Free';
    } else if (t.guarantee_usdc > 0) {
        label = 'Guaranteed pool';
        value = `$${formatUsdc(t.guarantee_usdc, { decimals: t.guarantee_usdc < 5_000_000 ? 2 : 0 })}`;
        suffix = 'GTD';
    } else if (t.prize_pool_usdc > 0) {
        label = 'Prize pool';
        value = `$${formatUsdc(t.prize_pool_usdc, { decimals: t.prize_pool_usdc < 5_000_000 ? 2 : 0 })}`;
    }
    if (t.status === 'completed' && (winnerPrizeUsdc ?? 0) > 0) {
        label = 'Top prize';
        const w = winnerPrizeUsdc as number;
        value = `$${formatUsdc(w, { decimals: w < 5_000_000 ? 2 : 0 })}`;
        suffix = undefined;
    }
    const usdc = !freePlay;

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
            <HStack spacing={2} align="center" minW={0}>
                {usdc && (
                    <Image
                        src={USDC_LOGO}
                        alt=""
                        boxSize={{ base: '22px', md: '26px' }}
                        flexShrink={0}
                    />
                )}
                <Text
                    fontWeight="bold"
                    fontSize={{ base: '3xl', md: '4xl' }}
                    lineHeight="1"
                    letterSpacing="-0.02em"
                    color={usdc ? USDC_BLUE : 'text.primary'}
                    noOfLines={1}
                    minW={0}
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {value}
                </Text>
                {suffix && (
                    <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={USDC_BLUE}
                        letterSpacing="0.06em"
                        flexShrink={0}
                    >
                        {suffix}
                    </Text>
                )}
            </HStack>
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
                {canLateReg
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
                Re-enter {!freePlay && `for $${formatUsdc(buyInUsdc)}`}
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
    onFundAndOpen,
    onClaimRake,
}: {
    tournament: Tournament;
    freePlay: boolean;
    registeredCount: number;
    hostRakeUsdc?: number | null;
    rakeClaiming: boolean;
    actionLoading: boolean;
    onFundAndOpen?: () => void;
    onClaimRake?: () => void;
}) {
    const accentBg = useColorModeValue(
        'rgba(253, 197, 29, 0.10)',
        'rgba(253, 197, 29, 0.14)'
    );
    const hostTagFg = useColorModeValue('brand.yellowDark', 'brand.yellow');
    const needsFunding =
        t.status === 'pending' && t.guarantee_usdc > 0 && !!t.contract_address;
    // What the host still covers if buy-ins fall short of the guarantee.
    const buyInsCollected = registeredCount * t.buy_in_usdc;
    const exposure = Math.max(0, t.guarantee_usdc - buyInsCollected);

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
                        Fund the $
                        {formatUsdc(t.guarantee_usdc, { decimals: 0 })}{' '}
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
                        Fund ${formatUsdc(t.guarantee_usdc, { decimals: 0 })}{' '}
                        GTD &amp; open registration
                    </Button>
                </VStack>
            )}

            {!freePlay &&
                t.guarantee_usdc > 0 &&
                t.status === 'registration' && (
                    <Stat label="Your current exposure">
                        <HStack spacing={1}>
                            <Image src={USDC_LOGO} alt="" boxSize="14px" />
                            <Text
                                fontWeight="bold"
                                color={USDC_BLUE}
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                ${formatUsdc(exposure)}
                            </Text>
                            <Text fontSize="xs" color="text.muted">
                                covered if no one else joins
                            </Text>
                        </HStack>
                    </Stat>
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
                            Claim rake
                        </Button>
                    )}
                </HStack>
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
    const goldRank = useColorModeValue('brand.yellowDark', 'brand.yellow');
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
                            return (
                                <Tr
                                    key={p.uuid}
                                    bg={isMe ? meHighlight : undefined}
                                    _hover={{
                                        bg: isMe ? meHighlight : rowHover,
                                    }}
                                    opacity={isOut && !completed ? 0.55 : 1}
                                >
                                    <Td
                                        fontWeight="bold"
                                        color={
                                            rank === 1
                                                ? goldRank
                                                : 'text.primary'
                                        }
                                    >
                                        {rank}
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
                                                fontSize="xs"
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
}: {
    tournament: Tournament;
    linkColor: string;
}) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const settled = !!t.settlement_tx_hash;
    const orangeFg = useColorModeValue('orange.600', 'orange.300');
    const enter = prefersReducedMotion
        ? undefined
        : `${cashoutIn} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both`;

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
