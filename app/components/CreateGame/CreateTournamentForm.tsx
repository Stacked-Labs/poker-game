'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Collapse,
    Flex,
    HStack,
    Icon,
    Image,
    Input,
    InputGroup,
    InputLeftElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Select,
    SimpleGrid,
    Spinner,
    Switch,
    Table,
    Tbody,
    Td,
    Text,
    Textarea,
    Th,
    Thead,
    Tooltip,
    Tr,
    useColorModeValue,
    useDisclosure,
    VStack,
} from '@chakra-ui/react';
import {
    FaBolt,
    FaCheckCircle,
    FaClock,
    FaFire,
    FaInfoCircle,
    FaLayerGroup,
} from 'react-icons/fa';
import {
    FiCalendar,
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight,
    FiClock,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import ModeChooser from './ModeChooser';
import {
    formatUsdc,
    formatTournamentStart,
    formatCountdown,
} from '@/app/components/PublicGames/tournamentFormat';
import { USDC_BLUE, USDC_LOGO } from '@/app/components/PublicGames/types';
import {
    BLINDS_KEEP_RISING_NOTE,
    bbAtLateRegClose,
    getStructure,
    startingBigBlinds,
    templateLabel,
} from '@/app/components/PublicGames/blindStructures';

// Backend default tournament starting stack (200 BB at the 25/50 level). The
// create form doesn't expose it yet, so the structure preview uses this.
const DEFAULT_STARTING_STACK = 10_000;

// Cumulative elapsed time when a level begins (levels are a fixed length each).
function formatElapsed(mins: number): string {
    if (mins <= 0) return 'Start';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

const GREEN_HEX = '#36A37B';
const USDC_BLUE_EDGE = '#1F5FA3';

export interface CreateTournamentFormValues {
    name: string;
    description: string;
    freePlay: boolean;
    chain: 'base' | 'base-sepolia';
    buyInUsdc: string;
    guaranteeUsdc: string;
    blindStructure: 'hyper' | 'turbo' | 'regular' | 'deep';
    lateRegLevels: number;
    tableSize: number;
    reentryAllowed: boolean;
    reentryMax: number;
    minPlayers: string;
    maxPlayers: string;
    scheduledAt: string;
    passwordCode: string;
}

export interface CreateTournamentFormProps {
    onSubmit?: (values: CreateTournamentFormValues) => void;
    isSubmitting?: boolean;
    fundPhase?: 'idle' | 'approving' | 'depositing' | 'opening';
}

interface Accent {
    color: string;
    ring: string;
    soft: string;
}

const GREEN_ACCENT: Accent = {
    color: GREEN_HEX,
    ring: 'rgba(54,163,123,0.20)',
    soft: 'rgba(54,163,123,0.10)',
};

const BLUE_ACCENT: Accent = {
    color: USDC_BLUE,
    ring: 'rgba(39,117,202,0.20)',
    soft: 'rgba(39,117,202,0.10)',
};

const FUND_PHASE_LABEL: Record<
    NonNullable<CreateTournamentFormProps['fundPhase']>,
    string
> = {
    idle: '',
    approving: 'Approving USDC…',
    depositing: 'Depositing guarantee…',
    opening: 'Opening registration…',
};

function SectionCard({ children }: { children: React.ReactNode }) {
    const bg = useColorModeValue('card.white', 'card.darkNavy');
    const borderColor = useColorModeValue(
        'rgba(11,20,48,0.08)',
        'rgba(255,255,255,0.08)'
    );
    const edge = useColorModeValue(
        '0 2px 0 rgba(0,0,0,0.06)',
        '0 2px 0 rgba(0,0,0,0.35)'
    );
    return (
        <Box
            width="100%"
            bg={bg}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="16px"
            boxShadow={edge}
            px={{ base: 4, md: 5 }}
            py={{ base: 4, md: 5 }}
        >
            {children}
        </Box>
    );
}

function SectionHeader({ title, hint }: { title: string; hint?: string }) {
    return (
        <VStack align="stretch" spacing={0.5} mb={4}>
            <Text fontWeight="bold" fontSize="md" color="text.primary">
                {title}
            </Text>
            {hint && (
                <Text fontSize="xs" color="text.muted">
                    {hint}
                </Text>
            )}
        </VStack>
    );
}

function InfoHint({ label }: { label: string }) {
    return (
        <Tooltip
            label={label}
            hasArrow
            placement="top"
            borderRadius="10px"
            px={3}
            py={2}
            fontSize="xs"
            fontWeight="normal"
            lineHeight="1.45"
            maxW="240px"
        >
            <Box
                as="span"
                role="button"
                tabIndex={0}
                aria-label={label}
                ml={1.5}
                display="inline-flex"
                alignItems="center"
                verticalAlign="-0.125em"
                color="text.muted"
                cursor="help"
                transition="color 120ms ease"
                _hover={{ color: 'text.secondary' }}
                _focusVisible={{
                    outline: '2px solid',
                    outlineColor: 'text.primary',
                    outlineOffset: '2px',
                    borderRadius: 'full',
                }}
            >
                <Icon as={FaInfoCircle} boxSize="12px" aria-hidden />
            </Box>
        </Tooltip>
    );
}

function FieldLabel({
    children,
    optional,
    hint,
}: {
    children: React.ReactNode;
    optional?: boolean;
    hint?: string;
}) {
    return (
        <Text
            fontSize="sm"
            fontWeight="semibold"
            color="text.secondary"
            mb={1.5}
        >
            {children}
            {optional && (
                <Text as="span" color="text.muted" fontWeight="normal" ml={1}>
                    (optional)
                </Text>
            )}
            {hint && <InfoHint label={hint} />}
        </Text>
    );
}

function accentInput(accent: Accent) {
    return {
        bg: 'input.white',
        borderWidth: '1px',
        borderColor: 'border.lightGray',
        borderRadius: '12px',
        color: 'text.primary',
        fontWeight: 'medium',
        _placeholder: { color: 'text.muted' },
        _hover: { borderColor: accent.color },
        _focusVisible: {
            borderColor: accent.color,
            boxShadow: `0 0 0 2px ${accent.ring}`,
            outline: 'none',
        },
    } as const;
}

const MIN_PER_LEVEL: Record<
    CreateTournamentFormValues['blindStructure'],
    number
> = { hyper: 5, turbo: 10, regular: 20, deep: 30 };

// `color` drives the icon + border (vivid hue; graphical, only needs 3:1).
// The selected LABEL text uses `textLight` / `textDark` — darker/lighter
// variants of the hue that clear WCAG AA 4.5:1 on the tint in each mode.
const BLIND_OPTIONS: {
    value: CreateTournamentFormValues['blindStructure'];
    label: string;
    color: string;
    tint: string;
    textLight: string;
    textDark: string;
    icon: IconType;
}[] = [
    {
        value: 'hyper',
        label: 'Hyper',
        color: 'brand.pink',
        tint: 'rgba(235,11,92,0.10)',
        textLight: '#950839',
        textDark: '#FF7DA8',
        icon: FaBolt,
    },
    {
        value: 'turbo',
        label: 'Turbo',
        color: 'brand.yellowDark',
        tint: 'rgba(253,197,29,0.16)',
        textLight: '#705400',
        textDark: '#FDC51D',
        icon: FaFire,
    },
    {
        value: 'regular',
        label: 'Regular',
        color: 'brand.green',
        tint: 'rgba(54,163,123,0.12)',
        textLight: '#22674E',
        textDark: '#5FD0A8',
        icon: FaClock,
    },
    {
        value: 'deep',
        label: 'Deep',
        color: USDC_BLUE,
        tint: 'rgba(39,117,202,0.12)',
        textLight: '#1F5FA3',
        textDark: '#7FB4E0',
        icon: FaLayerGroup,
    },
];
const LATE_REG_OPTIONS = [
    { value: 0, label: 'Off' },
    { value: 1, label: '1 level' },
    { value: 2, label: '2 levels' },
    { value: 3, label: '3 levels' },
];

const NETWORK_OPTIONS: {
    value: 'base' | 'base-sepolia';
    label: string;
    sub: string;
    testnet?: boolean;
}[] = [
    { value: 'base', label: 'Base', sub: 'Mainnet' },
    {
        value: 'base-sepolia',
        label: 'Base Sepolia',
        sub: 'Testnet',
        testnet: true,
    },
];

// Only offer the chains this deployment enables (mirrors GameSettingLeftSide /
// thirdwebclient), so a testnet-only build can't default to or submit mainnet.
const ENABLED_CHAIN_IDS = (
    process.env.NEXT_PUBLIC_ENABLED_CHAINS ?? 'base-sepolia'
)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
const ENABLED_NETWORK_OPTIONS = NETWORK_OPTIONS.filter((o) =>
    ENABLED_CHAIN_IDS.includes(o.value)
);
const DEFAULT_CHAIN: 'base' | 'base-sepolia' =
    ENABLED_CHAIN_IDS[0] === 'base' || ENABLED_CHAIN_IDS[0] === 'base-sepolia'
        ? ENABLED_CHAIN_IDS[0]
        : (ENABLED_NETWORK_OPTIONS[0]?.value ?? 'base-sepolia');

const BUYIN_PRESETS = ['1', '5', '10', '25', '100'];

// Remembers the host's Free Play vs Real Money preference across visits, the
// same way the cash-game form persists its mode (see GameSettingLeftSide).
const FREEPLAY_STORAGE_KEY = 'stacked:create-tournament:mode';

// datetime-local wants "YYYY-MM-DDTHH:mm" in local time.
function toLocalInputValue(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function StartChip({
    active,
    accent,
    idleBg,
    onClick,
    children,
}: {
    active: boolean;
    accent: Accent;
    idleBg: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <Box
            as="button"
            type="button"
            onClick={onClick}
            px={3}
            py={1.5}
            borderRadius="full"
            borderWidth="1.5px"
            fontSize="xs"
            fontWeight="semibold"
            bg={active ? accent.soft : idleBg}
            color={active ? accent.color : 'text.secondary'}
            borderColor={active ? accent.color : 'transparent'}
            transition="background-color 120ms ease, color 120ms ease, border-color 120ms ease"
            _hover={active ? {} : { color: 'text.primary' }}
            _focusVisible={{
                outline: '2px solid',
                outlineColor: accent.color,
                outlineOffset: '2px',
            }}
        >
            {children}
        </Box>
    );
}

const START_PRESETS: {
    key: 'in1h' | 'in6h' | 'in12h' | 'in24h';
    label: string;
    hours: number;
}[] = [
    { key: 'in1h', label: 'In 1 hour', hours: 1 },
    { key: 'in6h', label: 'In 6 hours', hours: 6 },
    { key: 'in12h', label: 'In 12 hours', hours: 12 },
    { key: 'in24h', label: 'In 24 hours', hours: 24 },
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];
const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function StartCalendar({
    value,
    onChange,
    accent,
}: {
    value: Date;
    onChange: (d: Date) => void;
    accent: Accent;
}) {
    const panelBg = useColorModeValue(
        'rgba(11,20,48,0.02)',
        'rgba(255,255,255,0.03)'
    );
    const panelBorder = useColorModeValue(
        'rgba(11,20,48,0.08)',
        'rgba(255,255,255,0.08)'
    );
    const navBg = useColorModeValue(
        'rgba(11,20,48,0.05)',
        'rgba(255,255,255,0.06)'
    );
    const cellHoverBg = useColorModeValue(
        'rgba(11,20,48,0.06)',
        'rgba(255,255,255,0.08)'
    );

    const now = new Date();
    const todayMid = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    ).getTime();

    const [view, setView] = useState(
        () => new Date(value.getFullYear(), value.getMonth(), 1)
    );
    const year = view.getFullYear();
    const month = view.getMonth();
    const startWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const canGoPrev =
        new Date(year, month, 1).getTime() >
        new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const selDay =
        value.getFullYear() === year && value.getMonth() === month
            ? value.getDate()
            : null;
    const todayDay =
        now.getFullYear() === year && now.getMonth() === month
            ? now.getDate()
            : null;

    const goPrev = () => setView(new Date(year, month - 1, 1));
    const goNext = () => setView(new Date(year, month + 1, 1));
    const pickDay = (day: number) =>
        onChange(
            new Date(year, month, day, value.getHours(), value.getMinutes())
        );

    const h24 = value.getHours();
    const hour12 = h24 % 12 || 12;
    const ampm: 'AM' | 'PM' = h24 < 12 ? 'AM' : 'PM';
    const minute = value.getMinutes();
    const setTime = (nh12: number, nmin: number, nap: 'AM' | 'PM') => {
        const h = (nh12 % 12) + (nap === 'PM' ? 12 : 0);
        const d = new Date(value);
        d.setHours(h, nmin, 0, 0);
        onChange(d);
    };

    const cells: (number | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const navBtn = {
        as: 'button' as const,
        type: 'button' as const,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSize: '32px',
        borderRadius: '10px',
        bg: navBg,
        color: 'text.secondary',
        transition: 'background-color 120ms ease, color 120ms ease',
        _hover: { color: 'text.primary' },
        _disabled: { opacity: 0.35, cursor: 'not-allowed', _hover: {} },
        _focusVisible: {
            outline: '2px solid',
            outlineColor: accent.color,
            outlineOffset: '2px',
        },
    };

    const timeSelect = {
        ...accentInput(accent),
        height: '40px',
        flex: 1,
        icon: <FiChevronDown />,
    };

    return (
        <Box
            mt={3}
            maxW="380px"
            mx="auto"
            bg={panelBg}
            borderWidth="1px"
            borderColor={panelBorder}
            borderRadius="16px"
            p={{ base: 3, sm: 4 }}
        >
            <Flex align="center" justify="space-between" mb={3}>
                <Box {...navBtn} onClick={goPrev} disabled={!canGoPrev}>
                    <Icon as={FiChevronLeft} boxSize="16px" />
                </Box>
                <Text fontSize="sm" fontWeight="bold" color="text.primary">
                    {MONTH_NAMES[month]} {year}
                </Text>
                <Box {...navBtn} onClick={goNext}>
                    <Icon as={FiChevronRight} boxSize="16px" />
                </Box>
            </Flex>

            <SimpleGrid columns={7} spacingY={1} mb={1}>
                {WEEKDAYS.map((w) => (
                    <Text
                        key={w}
                        fontSize="2xs"
                        fontWeight="semibold"
                        textAlign="center"
                        color="text.muted"
                        textTransform="uppercase"
                        letterSpacing="0.04em"
                    >
                        {w}
                    </Text>
                ))}
            </SimpleGrid>

            <SimpleGrid columns={7} spacing={1}>
                {cells.map((day, i) => {
                    if (day === null)
                        return <Box key={`b${i}`} aspectRatio={1} />;
                    const isPast =
                        new Date(year, month, day).getTime() < todayMid;
                    const isSel = day === selDay;
                    const isToday = day === todayDay;
                    return (
                        <Box
                            key={day}
                            as="button"
                            type="button"
                            onClick={() => pickDay(day)}
                            disabled={isPast}
                            aspectRatio={1}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            borderRadius="full"
                            fontSize="sm"
                            fontWeight={isSel || isToday ? 'bold' : 'medium'}
                            bg={isSel ? accent.color : 'transparent'}
                            color={
                                isSel
                                    ? 'white'
                                    : isPast
                                      ? 'text.muted'
                                      : isToday
                                        ? accent.color
                                        : 'text.primary'
                            }
                            borderWidth={isToday && !isSel ? '1.5px' : '0'}
                            borderColor={
                                isToday && !isSel ? accent.color : 'transparent'
                            }
                            opacity={isPast ? 0.4 : 1}
                            cursor={isPast ? 'not-allowed' : 'pointer'}
                            transition="background-color 120ms ease, color 120ms ease"
                            _hover={isPast || isSel ? {} : { bg: cellHoverBg }}
                            _focusVisible={{
                                outline: '2px solid',
                                outlineColor: accent.color,
                                outlineOffset: '1px',
                            }}
                        >
                            {day}
                        </Box>
                    );
                })}
            </SimpleGrid>

            <Flex
                align="center"
                gap={2}
                mt={4}
                pt={3}
                borderTopWidth="1px"
                borderColor={panelBorder}
            >
                <Icon as={FaClock} boxSize="13px" color="text.muted" />
                <Text
                    fontSize="xs"
                    fontWeight="semibold"
                    color="text.secondary"
                    mr={1}
                >
                    Start time
                </Text>
                <Select
                    {...timeSelect}
                    aria-label="Hour"
                    value={hour12}
                    onChange={(e) =>
                        setTime(parseInt(e.target.value, 10), minute, ampm)
                    }
                >
                    {HOURS_12.map((h) => (
                        <option key={h} value={h}>
                            {h}
                        </option>
                    ))}
                </Select>
                <Select
                    {...timeSelect}
                    aria-label="Minute"
                    value={minute}
                    onChange={(e) =>
                        setTime(hour12, parseInt(e.target.value, 10), ampm)
                    }
                >
                    {MINUTES.map((m) => (
                        <option key={m} value={m}>
                            {String(m).padStart(2, '0')}
                        </option>
                    ))}
                </Select>
                <Select
                    {...timeSelect}
                    aria-label="AM or PM"
                    value={ampm}
                    onChange={(e) =>
                        setTime(hour12, minute, e.target.value as 'AM' | 'PM')
                    }
                >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                </Select>
            </Flex>
        </Box>
    );
}

const CreateTournamentForm: React.FC<CreateTournamentFormProps> = ({
    onSubmit,
    isSubmitting = false,
    fundPhase = 'idle',
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [freePlay, setFreePlay] = useState(true);
    const [chain, setChain] = useState<'base' | 'base-sepolia'>(DEFAULT_CHAIN);
    const [buyInUsdc, setBuyInUsdc] = useState('10');
    const [guaranteeUsdc, setGuaranteeUsdc] = useState('');
    const [blindStructure, setBlindStructure] =
        useState<CreateTournamentFormValues['blindStructure']>('turbo');
    const [lateRegLevels, setLateRegLevels] = useState(0);
    const [tableSize, setTableSize] = useState(9);
    const [reentryAllowed, setReentryAllowed] = useState(false);
    const [reentryMax, setReentryMax] = useState(1);
    const [minPlayers, setMinPlayers] = useState('2');
    const [maxPlayers, setMaxPlayers] = useState('9');
    const [capped, setCapped] = useState(true);
    const [gtdOn, setGtdOn] = useState(false);
    const [scheduledAt, setScheduledAt] = useState('');
    const [passwordCode, setPasswordCode] = useState('');
    const [startPreset, setStartPreset] = useState<
        'in1h' | 'in6h' | 'in12h' | 'in24h' | 'custom' | null
    >(null);

    const advanced = useDisclosure();

    // Hydrate the saved Free / Real preference on mount (initial render stays
    // 'free' to avoid an SSR mismatch, then flips to the stored choice).
    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(FREEPLAY_STORAGE_KEY);
            if (stored === 'free' || stored === 'real') {
                setFreePlay(stored === 'free');
            }
        } catch {
            // localStorage unavailable; keep the default.
        }
    }, []);

    const chooseMode = (mode: 'free' | 'real') => {
        setFreePlay(mode === 'free');
        try {
            window.localStorage.setItem(FREEPLAY_STORAGE_KEY, mode);
        } catch {
            // localStorage unavailable; ignore.
        }
    };

    const accent = freePlay ? GREEN_ACCENT : BLUE_ACCENT;
    const inputProps = accentInput(accent);

    const guaranteeNumber = parseFloat(guaranteeUsdc) || 0;
    const buyInNumber = parseFloat(buyInUsdc) || 0;
    const guaranteeMicro = Math.round(guaranteeNumber * 1_000_000);

    const helperBg = useColorModeValue(
        'rgba(39,117,202,0.06)',
        'rgba(39,117,202,0.12)'
    );
    const helperBorder = useColorModeValue(
        'rgba(39,117,202,0.18)',
        'rgba(39,117,202,0.28)'
    );
    const chipIdleBg = useColorModeValue(
        'rgba(11,20,48,0.05)',
        'rgba(255,255,255,0.06)'
    );
    const dividerColor = useColorModeValue(
        'rgba(11,20,48,0.08)',
        'rgba(255,255,255,0.08)'
    );
    const idleIconColor = useColorModeValue(
        'rgba(11,20,48,0.45)',
        'rgba(255,255,255,0.5)'
    );
    // Pick the AA-safe per-tier label shade for the active blind tile.
    const isDark = useColorModeValue(false, true);
    const structureModal = useDisclosure();
    const viewLinkColor = useColorModeValue('brand.greenDark', 'brand.green');
    const zebraRow = useColorModeValue(
        'rgba(11,20,48,0.025)',
        'rgba(255,255,255,0.025)'
    );
    const lateWash = useColorModeValue(
        'rgba(253,197,29,0.12)',
        'rgba(253,197,29,0.14)'
    );
    const lateTagColor = useColorModeValue('brand.yellowEdge', 'brand.yellow');
    const segActiveBg = useColorModeValue(
        'card.white',
        'rgba(255,255,255,0.1)'
    );
    const netPillBg = useColorModeValue('card.white', 'rgba(255,255,255,0.04)');
    // The Base square symbol is always the blue version in both modes; only the
    // lockup wordmark stays theme-adaptive.
    const baseSquareSrc = '/networkLogos/base-square-blue.svg';
    const badgeRing = useColorModeValue('card.white', 'card.darkNavy');
    const testnetBg = useColorModeValue(
        'rgba(237,137,54,0.14)',
        'rgba(237,137,54,0.22)'
    );
    const testnetFg = useColorModeValue('orange.600', 'orange.300');

    const pickOffset = (
        key: 'in1h' | 'in6h' | 'in12h' | 'in24h',
        hours: number
    ) => {
        const d = new Date(Date.now() + hours * 60 * 60 * 1000);
        d.setMinutes(0, 0, 0);
        setScheduledAt(toLocalInputValue(d));
        setStartPreset(key);
    };
    const pickCustom = () => {
        if (!scheduledAt) {
            const d = new Date(Date.now() + 60 * 60 * 1000);
            d.setMinutes(0, 0, 0);
            setScheduledAt(toLocalInputValue(d));
        }
        setStartPreset('custom');
    };
    const onCalendarChange = (d: Date) => {
        setScheduledAt(toLocalInputValue(d));
        setStartPreset('custom');
    };

    const startMs = scheduledAt ? new Date(scheduledAt).getTime() : NaN;
    const startPreview =
        scheduledAt && !Number.isNaN(startMs)
            ? `Starts ${formatTournamentStart(scheduledAt)}${
                  startMs > Date.now()
                      ? ` · in ${formatCountdown(startMs - Date.now())}`
                      : ''
              }`
            : null;
    const lateRegMins = lateRegLevels * MIN_PER_LEVEL[blindStructure];
    const blindLabel =
        blindStructure[0].toUpperCase() + blindStructure.slice(1);
    const setupSummary = [
        `${blindLabel} NLH`,
        `${tableSize}-max`,
        freePlay ? 'Free play' : `$${buyInUsdc || '0'} buy-in`,
        scheduledAt && !Number.isNaN(startMs)
            ? formatTournamentStart(scheduledAt)
            : 'start TBD',
        lateRegLevels > 0
            ? `late reg ${lateRegLevels} ${lateRegLevels === 1 ? 'level' : 'levels'}`
            : 'no late reg',
        capped ? null : 'unlimited field',
    ]
        .filter(Boolean)
        .join('  ·  ');

    // ── Validation ───────────────────────────────────────────────────────────
    const minN = parseInt(minPlayers, 10);
    const maxN = parseInt(maxPlayers, 10);

    const [showErrors, setShowErrors] = useState(false);

    const playersError = useMemo(() => {
        if (!Number.isFinite(minN)) return 'Set how many players can join.';
        if (minN < 2) return 'You need at least 2 players.';
        if (capped) {
            if (!Number.isFinite(maxN)) {
                return 'Set a maximum, or switch to Unlimited.';
            }
            if (maxN < minN) {
                return 'Max players must be at least the minimum.';
            }
        }
        return '';
    }, [minN, maxN, capped]);

    const scheduleError = useMemo(() => {
        if (!scheduledAt) return 'Pick a start time.';
        const startMs = new Date(scheduledAt).getTime();
        if (Number.isNaN(startMs)) return 'Pick a valid start time.';
        if (startMs < Date.now() + 3 * 60 * 1000) {
            return 'Start time must be a few minutes in the future.';
        }
        return '';
    }, [scheduledAt]);

    const stakesError = useMemo(() => {
        if (freePlay) return '';
        if (buyInNumber <= 0 && guaranteeNumber <= 0) {
            return 'Set a buy-in or a guaranteed prize pool.';
        }
        return '';
    }, [freePlay, buyInNumber, guaranteeNumber]);

    const isValid =
        !playersError && !scheduleError && !stakesError && !isSubmitting;

    const submitLabel =
        !freePlay && guaranteeNumber > 0
            ? 'Create & fund guarantee'
            : 'Create tournament';

    const isFunding = fundPhase !== 'idle';
    const fundingLabel = FUND_PHASE_LABEL[fundPhase];

    const handleSubmit = () => {
        if (!isValid) {
            setShowErrors(true);
            return;
        }
        onSubmit?.({
            name,
            description,
            freePlay,
            chain,
            buyInUsdc,
            guaranteeUsdc,
            blindStructure,
            lateRegLevels,
            tableSize,
            reentryAllowed: reentryAllowed && lateRegLevels > 0,
            reentryMax,
            minPlayers,
            // Empty string signals "no cap". The backend has no real unlimited
            // sentinel yet, so the consumer maps this to a large effective cap.
            maxPlayers: capped ? maxPlayers : '',
            scheduledAt,
            passwordCode,
        });
    };

    // Blind-structure preview (modal): reflects the selected speed + the chosen
    // late-reg window against the default 200 BB start.
    const previewLevels = getStructure(blindStructure);
    const previewStartBB = startingBigBlinds(
        DEFAULT_STARTING_STACK,
        blindStructure
    );
    const previewLevelMin = MIN_PER_LEVEL[blindStructure];
    const previewLateValid =
        lateRegLevels > 0 && lateRegLevels <= previewLevels.length;
    const previewCloseBB = bbAtLateRegClose(
        DEFAULT_STARTING_STACK,
        blindStructure,
        lateRegLevels
    );

    return (
        <VStack
            as="form"
            align="stretch"
            spacing={4}
            width="100%"
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
        >
            {/* ── Basics ──────────────────────────────────────────────────── */}
            <SectionCard>
                <SectionHeader title="Basics" />
                <VStack align="stretch" spacing={4}>
                    <Box>
                        <FieldLabel optional>Tournament name</FieldLabel>
                        <Input
                            {...inputProps}
                            value={name}
                            maxLength={80}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Friday Night Penthouse"
                            height="48px"
                        />
                    </Box>
                    <Box>
                        <FieldLabel>Play mode</FieldLabel>
                        <ModeChooser
                            selectedMode={freePlay ? 'free' : 'real'}
                            onSelect={chooseMode}
                        />
                    </Box>
                    <Box>
                        <FieldLabel optional hint="A short blurb shown on your tournament's lobby card and details page. You can edit it later, and add a logo and banner, from your tournament page.">
                            Description
                        </FieldLabel>
                        <Textarea
                            {...inputProps}
                            value={description}
                            maxLength={500}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tell players what to expect — format, vibe, prizes…"
                            rows={3}
                            resize="vertical"
                        />
                    </Box>
                </VStack>
            </SectionCard>

            {/* ── Stakes & Guarantee (real money only) ────────────────────── */}
            {!freePlay && (
                <SectionCard>
                    <SectionHeader
                        title="Stakes & Guarantee"
                        hint="Buy-ins and prizes settle on-chain in USDC."
                    />
                    <VStack align="stretch" spacing={5}>
                        <Box>
                            <FieldLabel>Network</FieldLabel>
                            <SimpleGrid columns={2} spacing={2}>
                                {ENABLED_NETWORK_OPTIONS.map((opt) => {
                                    const active = chain === opt.value;
                                    return (
                                        <Flex
                                            key={opt.value}
                                            as="button"
                                            type="button"
                                            onClick={() => setChain(opt.value)}
                                            align="center"
                                            gap={2.5}
                                            px={3}
                                            py={2.5}
                                            borderRadius="14px"
                                            borderWidth="2px"
                                            bg={netPillBg}
                                            borderColor={
                                                active
                                                    ? USDC_BLUE
                                                    : 'border.lightGray'
                                            }
                                            boxShadow={
                                                active
                                                    ? `inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 0 ${USDC_BLUE_EDGE}`
                                                    : '0 1.5px 0 rgba(0,0,0,0.06)'
                                            }
                                            transition="transform 80ms cubic-bezier(0.2,0.8,0.2,1), box-shadow 80ms ease, border-color 80ms ease, background-color 80ms ease"
                                            _hover={
                                                active
                                                    ? {}
                                                    : {
                                                          borderColor:
                                                              USDC_BLUE,
                                                          bg: 'rgba(39,117,202,0.05)',
                                                      }
                                            }
                                            _active={{
                                                transform: 'translateY(2px)',
                                                boxShadow: active
                                                    ? `inset 0 2px 4px rgba(0,0,0,0.14), 0 0 0 ${USDC_BLUE_EDGE}`
                                                    : 'inset 0 1px 2px rgba(0,0,0,0.10)',
                                            }}
                                            _focusVisible={{
                                                outline: '2px solid',
                                                outlineColor: USDC_BLUE,
                                                outlineOffset: '2px',
                                            }}
                                        >
                                            <Box
                                                position="relative"
                                                boxSize="30px"
                                                flexShrink={0}
                                            >
                                                <Image
                                                    src={USDC_LOGO}
                                                    alt="USDC"
                                                    boxSize="30px"
                                                    loading="lazy"
                                                />
                                                <Box
                                                    position="absolute"
                                                    bottom="-3px"
                                                    right="-3px"
                                                    boxSize="15px"
                                                    borderRadius="5px"
                                                    bg={badgeRing}
                                                    p="1.5px"
                                                    boxShadow="0 1px 2px rgba(0,0,0,0.10)"
                                                >
                                                    <Image
                                                        src={baseSquareSrc}
                                                        alt="Base"
                                                        w="100%"
                                                        h="100%"
                                                    />
                                                </Box>
                                            </Box>
                                            <Box textAlign="left" minW={0}>
                                                <Text
                                                    fontSize="sm"
                                                    fontWeight="bold"
                                                    color="text.primary"
                                                    noOfLines={1}
                                                >
                                                    {opt.label}
                                                </Text>
                                                {opt.testnet ? (
                                                    <Text
                                                        as="span"
                                                        display="inline-block"
                                                        mt={0.5}
                                                        bg={testnetBg}
                                                        color={testnetFg}
                                                        fontSize="2xs"
                                                        fontWeight="bold"
                                                        letterSpacing="0.06em"
                                                        textTransform="uppercase"
                                                        px={1.5}
                                                        borderRadius="full"
                                                    >
                                                        Testnet
                                                    </Text>
                                                ) : (
                                                    <Text
                                                        fontSize="xs"
                                                        color="text.muted"
                                                    >
                                                        {opt.sub}
                                                    </Text>
                                                )}
                                            </Box>
                                        </Flex>
                                    );
                                })}
                            </SimpleGrid>
                        </Box>

                        <Box>
                            <FieldLabel>Buy-in</FieldLabel>
                            <InputGroup>
                                <InputLeftElement
                                    h="48px"
                                    w="44px"
                                    pointerEvents="none"
                                    justifyContent="center"
                                >
                                    <Image
                                        src={USDC_LOGO}
                                        alt="USDC"
                                        boxSize="20px"
                                    />
                                </InputLeftElement>
                                <Input
                                    {...inputProps}
                                    type="number"
                                    inputMode="decimal"
                                    min={0}
                                    step={0.01}
                                    value={buyInUsdc}
                                    onChange={(e) =>
                                        setBuyInUsdc(e.target.value)
                                    }
                                    placeholder="10.00"
                                    height="48px"
                                    pl="44px"
                                    fontWeight="bold"
                                />
                            </InputGroup>
                            <HStack spacing={2} mt={2} flexWrap="wrap">
                                {BUYIN_PRESETS.map((p) => (
                                    <StartChip
                                        key={p}
                                        active={buyInUsdc === p}
                                        accent={accent}
                                        idleBg={chipIdleBg}
                                        onClick={() => setBuyInUsdc(p)}
                                    >
                                        ${p}
                                    </StartChip>
                                ))}
                            </HStack>
                            <Text mt={2} fontSize="xs" color="text.muted">
                                All-inclusive — players pay exactly this, no
                                fees shown on top.
                            </Text>
                        </Box>

                        <Box
                            borderTopWidth="1px"
                            borderColor={dividerColor}
                            pt={4}
                        >
                            <Flex
                                align="center"
                                justify="space-between"
                                gap={3}
                            >
                                <Box>
                                    <Text
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color="text.secondary"
                                    >
                                        Guarantee a prize pool
                                    </Text>
                                    <Text fontSize="xs" color="text.muted">
                                        Promise a minimum pool; you cover any
                                        shortfall.
                                    </Text>
                                </Box>
                                <Switch
                                    isChecked={gtdOn}
                                    onChange={(e) => {
                                        const on = e.target.checked;
                                        setGtdOn(on);
                                        if (!on) setGuaranteeUsdc('');
                                    }}
                                    sx={{
                                        '& span[data-checked]': {
                                            background: accent.color,
                                        },
                                    }}
                                />
                            </Flex>

                            {gtdOn && (
                                <VStack align="stretch" spacing={3} mt={3}>
                                    <InputGroup>
                                        <InputLeftElement
                                            h="48px"
                                            w="44px"
                                            pointerEvents="none"
                                            justifyContent="center"
                                        >
                                            <Image
                                                src={USDC_LOGO}
                                                alt="USDC"
                                                boxSize="20px"
                                            />
                                        </InputLeftElement>
                                        <Input
                                            {...inputProps}
                                            type="number"
                                            inputMode="decimal"
                                            min={0}
                                            step={1}
                                            value={guaranteeUsdc}
                                            onChange={(e) =>
                                                setGuaranteeUsdc(e.target.value)
                                            }
                                            placeholder="500"
                                            height="48px"
                                            pl="44px"
                                            fontWeight="bold"
                                        />
                                    </InputGroup>

                                    <Text
                                        fontSize="xs"
                                        color="text.muted"
                                        lineHeight="1.5"
                                    >
                                        Guarantees pull in bigger fields — a
                                        posted minimum prize makes a tournament
                                        look worth joining, so more players
                                        register (and turnout often covers the
                                        guarantee on its own).
                                    </Text>

                                    {guaranteeNumber > 0 && (
                                        <Box
                                            bg={helperBg}
                                            borderWidth="1px"
                                            borderColor={helperBorder}
                                            borderRadius="12px"
                                            px={4}
                                            py={3}
                                        >
                                            <Text
                                                fontSize="sm"
                                                fontWeight="bold"
                                                color={USDC_BLUE}
                                                _dark={{ color: '#7FB4E0' }}
                                                mb={1.5}
                                            >
                                                ${formatUsdc(guaranteeMicro)}{' '}
                                                USDC guaranteed
                                            </Text>
                                            <Text
                                                fontSize="xs"
                                                color="text.secondary"
                                                lineHeight="1.5"
                                            >
                                                If turnout is low you top up to
                                                the $
                                                {formatUsdc(guaranteeMicro)}{' '}
                                                guarantee — up to $
                                                {formatUsdc(guaranteeMicro)} out
                                                of pocket now; the unused part
                                                returns to you when the
                                                tournament starts.
                                            </Text>
                                        </Box>
                                    )}
                                </VStack>
                            )}
                        </Box>

                        {showErrors && stakesError && (
                            <FieldError message={stakesError} />
                        )}
                    </VStack>
                </SectionCard>
            )}

            {/* ── Schedule & Structure ────────────────────────────────────── */}
            <SectionCard>
                <SectionHeader title="Schedule & Structure" />
                <VStack align="stretch" spacing={4}>
                    <Box>
                        <FieldLabel>Scheduled start</FieldLabel>
                        <HStack spacing={2} flexWrap="wrap">
                            {START_PRESETS.map((p) => (
                                <StartChip
                                    key={p.key}
                                    active={startPreset === p.key}
                                    accent={accent}
                                    idleBg={chipIdleBg}
                                    onClick={() => pickOffset(p.key, p.hours)}
                                >
                                    {p.label}
                                </StartChip>
                            ))}
                            <Box
                                as="button"
                                type="button"
                                onClick={pickCustom}
                                display="inline-flex"
                                alignItems="center"
                                gap={1.5}
                                px={3}
                                py={1.5}
                                borderRadius="full"
                                borderWidth="1.5px"
                                fontSize="xs"
                                fontWeight="bold"
                                bg={
                                    startPreset === 'custom'
                                        ? accent.color
                                        : accent.soft
                                }
                                color={
                                    startPreset === 'custom'
                                        ? 'white'
                                        : accent.color
                                }
                                borderColor={accent.color}
                                transition="background-color 120ms ease, color 120ms ease"
                                _hover={
                                    startPreset === 'custom'
                                        ? {}
                                        : { bg: accent.color, color: 'white' }
                                }
                                _focusVisible={{
                                    outline: '2px solid',
                                    outlineColor: accent.color,
                                    outlineOffset: '2px',
                                }}
                            >
                                <Icon as={FiCalendar} boxSize="13px" />
                                Pick date &amp; time
                            </Box>
                        </HStack>

                        {startPreset === 'custom' && scheduledAt && (
                            <StartCalendar
                                value={new Date(scheduledAt)}
                                onChange={onCalendarChange}
                                accent={accent}
                            />
                        )}

                        {startPreview && (
                            <Text
                                mt={2}
                                fontSize="sm"
                                fontWeight="medium"
                                color={accent.color}
                            >
                                {startPreview}
                            </Text>
                        )}
                        {showErrors && scheduleError && (
                            <FieldError message={scheduleError} mt={2} />
                        )}
                    </Box>

                    <Box>
                        <Flex align="center" justify="space-between" gap={2}>
                            <FieldLabel hint="How fast the blinds climb. Faster speeds (Hyper, Turbo) mean shorter games and quicker all-ins; Deep stacks play out longer.">
                                Blind structure
                            </FieldLabel>
                            <Box
                                as="button"
                                type="button"
                                onClick={structureModal.onOpen}
                                display="inline-flex"
                                alignItems="center"
                                gap="5px"
                                mb={1.5}
                                fontSize="sm"
                                fontWeight="semibold"
                                color={viewLinkColor}
                                _hover={{ textDecoration: 'underline' }}
                            >
                                <Icon as={FiClock} boxSize="13px" />
                                View structure
                            </Box>
                        </Flex>
                        <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={2}>
                            {BLIND_OPTIONS.map((opt) => {
                                const active = blindStructure === opt.value;
                                return (
                                    <Box
                                        key={opt.value}
                                        as="button"
                                        type="button"
                                        onClick={() =>
                                            setBlindStructure(opt.value)
                                        }
                                        textAlign="left"
                                        px={3}
                                        py={2.5}
                                        borderRadius="12px"
                                        borderWidth="1.5px"
                                        bg={active ? opt.tint : chipIdleBg}
                                        borderColor={
                                            active ? opt.color : 'transparent'
                                        }
                                        transition="background-color 140ms ease, border-color 140ms ease"
                                        _hover={
                                            active
                                                ? {}
                                                : { borderColor: opt.color }
                                        }
                                        _focusVisible={{
                                            outline: '2px solid',
                                            outlineColor: opt.color,
                                            outlineOffset: '2px',
                                        }}
                                    >
                                        <Icon
                                            as={opt.icon}
                                            boxSize="15px"
                                            mb={1.5}
                                            color={
                                                active
                                                    ? opt.color
                                                    : idleIconColor
                                            }
                                        />
                                        <Text
                                            fontSize="sm"
                                            fontWeight="bold"
                                            color={
                                                active
                                                    ? isDark
                                                        ? opt.textDark
                                                        : opt.textLight
                                                    : 'text.primary'
                                            }
                                        >
                                            {opt.label}
                                        </Text>
                                        <Text
                                            fontSize="xs"
                                            color="text.muted"
                                            mt={0.5}
                                        >
                                            {MIN_PER_LEVEL[opt.value]}-min
                                            levels
                                        </Text>
                                    </Box>
                                );
                            })}
                        </SimpleGrid>
                    </Box>

                    <Modal
                        isOpen={structureModal.isOpen}
                        onClose={structureModal.onClose}
                        isCentered
                        scrollBehavior="inside"
                        size={{ base: 'full', sm: 'lg' }}
                    >
                        <ModalOverlay
                            bg="rgba(11, 20, 48, 0.6)"
                            backdropFilter="blur(6px)"
                        />
                        <ModalContent borderRadius={{ base: 0, sm: '16px' }}>
                            <ModalHeader pb={2}>
                                <Text
                                    fontWeight="bold"
                                    fontSize="lg"
                                    color="text.primary"
                                >
                                    Blind structure
                                </Text>
                                <Text
                                    fontSize="xs"
                                    color="text.muted"
                                    fontWeight="normal"
                                >
                                    {templateLabel(blindStructure)} ·{' '}
                                    {previewLevelMin}-min levels ·{' '}
                                    {DEFAULT_STARTING_STACK.toLocaleString(
                                        'en-US'
                                    )}{' '}
                                    start ({previewStartBB} BB)
                                </Text>
                            </ModalHeader>
                            <ModalCloseButton />
                            <ModalBody pb={6}>
                                <VStack align="stretch" spacing={4}>
                                    <SimpleGrid columns={4} spacing={2}>
                                        {BLIND_OPTIONS.map((opt) => {
                                            const active =
                                                blindStructure === opt.value;
                                            return (
                                                <Box
                                                    key={opt.value}
                                                    as="button"
                                                    type="button"
                                                    onClick={() =>
                                                        setBlindStructure(
                                                            opt.value
                                                        )
                                                    }
                                                    textAlign="center"
                                                    py={2}
                                                    borderRadius="10px"
                                                    borderWidth="1.5px"
                                                    bg={
                                                        active
                                                            ? opt.tint
                                                            : chipIdleBg
                                                    }
                                                    borderColor={
                                                        active
                                                            ? opt.color
                                                            : 'transparent'
                                                    }
                                                    transition="background-color 140ms ease, border-color 140ms ease"
                                                    _hover={
                                                        active
                                                            ? {}
                                                            : {
                                                                  borderColor:
                                                                      opt.color,
                                                              }
                                                    }
                                                    _focusVisible={{
                                                        outline: '2px solid',
                                                        outlineColor: opt.color,
                                                        outlineOffset: '2px',
                                                    }}
                                                >
                                                    <Text
                                                        fontSize="sm"
                                                        fontWeight="bold"
                                                        color={
                                                            active
                                                                ? isDark
                                                                    ? opt.textDark
                                                                    : opt.textLight
                                                                : 'text.primary'
                                                        }
                                                    >
                                                        {opt.label}
                                                    </Text>
                                                </Box>
                                            );
                                        })}
                                    </SimpleGrid>

                                    <Text
                                        fontSize="xs"
                                        color="text.secondary"
                                        lineHeight={1.5}
                                    >
                                        {previewLateValid
                                            ? `Late registration closes after level ${lateRegLevels} — about ${
                                                  lateRegLevels * previewLevelMin
                                              } min in (~${previewCloseBB} BB).`
                                            : 'Late registration is off — the field locks at the start.'}
                                    </Text>

                                    <Box overflowX="auto">
                                        <Table
                                            size="sm"
                                            variant="simple"
                                            sx={{
                                                'th, td': {
                                                    borderColor: dividerColor,
                                                },
                                            }}
                                        >
                                            <Thead>
                                                <Tr>
                                                    <Th>Level</Th>
                                                    <Th isNumeric>Blinds</Th>
                                                    <Th isNumeric>Ante</Th>
                                                    <Th isNumeric>Elapsed</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {previewLevels.map((l, i) => {
                                                    const isLateClose =
                                                        previewLateValid &&
                                                        l.level === lateRegLevels;
                                                    return (
                                                        <Tr
                                                            key={l.level}
                                                            bg={
                                                                isLateClose
                                                                    ? lateWash
                                                                    : i % 2 === 1
                                                                      ? zebraRow
                                                                      : undefined
                                                            }
                                                        >
                                                            <Td color="text.primary">
                                                                <HStack
                                                                    spacing={2}
                                                                >
                                                                    <Text
                                                                        as="span"
                                                                        color="text.primary"
                                                                        sx={{
                                                                            fontVariantNumeric:
                                                                                'tabular-nums',
                                                                        }}
                                                                    >
                                                                        {l.level}
                                                                    </Text>
                                                                    {isLateClose && (
                                                                        <Text
                                                                            as="span"
                                                                            fontSize="2xs"
                                                                            fontWeight="bold"
                                                                            color={
                                                                                lateTagColor
                                                                            }
                                                                            textTransform="uppercase"
                                                                            letterSpacing="0.05em"
                                                                        >
                                                                            late
                                                                            reg
                                                                            ends
                                                                        </Text>
                                                                    )}
                                                                </HStack>
                                                            </Td>
                                                            <Td
                                                                isNumeric
                                                                color="text.primary"
                                                                sx={{
                                                                    fontVariantNumeric:
                                                                        'tabular-nums',
                                                                }}
                                                            >
                                                                {l.sb.toLocaleString(
                                                                    'en-US'
                                                                )}
                                                                /
                                                                {l.bb.toLocaleString(
                                                                    'en-US'
                                                                )}
                                                            </Td>
                                                            <Td
                                                                isNumeric
                                                                color="text.muted"
                                                                sx={{
                                                                    fontVariantNumeric:
                                                                        'tabular-nums',
                                                                }}
                                                            >
                                                                {l.ante === 0
                                                                    ? '—'
                                                                    : l.ante.toLocaleString(
                                                                          'en-US'
                                                                      )}
                                                            </Td>
                                                            <Td
                                                                isNumeric
                                                                color="text.secondary"
                                                                sx={{
                                                                    fontVariantNumeric:
                                                                        'tabular-nums',
                                                                }}
                                                            >
                                                                {formatElapsed(
                                                                    i *
                                                                        previewLevelMin
                                                                )}
                                                            </Td>
                                                        </Tr>
                                                    );
                                                })}
                                            </Tbody>
                                        </Table>
                                    </Box>

                                    <Text fontSize="2xs" color="text.muted">
                                        {BLINDS_KEEP_RISING_NOTE}
                                    </Text>
                                </VStack>
                            </ModalBody>
                        </ModalContent>
                    </Modal>

                    <Box>
                        <FieldLabel hint="A grace window after the start where players can still join with a full stack. Re-entries (in Advanced) use this same window.">
                            Late registration
                        </FieldLabel>
                        <SimpleGrid columns={4} spacing={2}>
                            {LATE_REG_OPTIONS.map((o) => {
                                const active = lateRegLevels === o.value;
                                return (
                                    <Box
                                        key={o.value}
                                        as="button"
                                        type="button"
                                        onClick={() =>
                                            setLateRegLevels(o.value)
                                        }
                                        py={2.5}
                                        borderRadius="12px"
                                        borderWidth="1.5px"
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        textAlign="center"
                                        bg={active ? accent.soft : chipIdleBg}
                                        color={
                                            active
                                                ? accent.color
                                                : 'text.secondary'
                                        }
                                        borderColor={
                                            active
                                                ? accent.color
                                                : 'transparent'
                                        }
                                        transition="background-color 120ms ease, color 120ms ease, border-color 120ms ease"
                                        _hover={
                                            active
                                                ? {}
                                                : { color: 'text.primary' }
                                        }
                                        _focusVisible={{
                                            outline: '2px solid',
                                            outlineColor: accent.color,
                                            outlineOffset: '2px',
                                        }}
                                    >
                                        {o.label}
                                    </Box>
                                );
                            })}
                        </SimpleGrid>
                        <Text mt={2} fontSize="xs" color="text.muted">
                            {lateRegLevels > 0
                                ? `Latecomers can join with a full stack for ~${lateRegMins} min after the start, then the field locks.`
                                : 'No late entry — the field locks the moment play begins.'}
                        </Text>
                    </Box>

                    <Box>
                        <FieldLabel>Players</FieldLabel>
                        <Flex
                            align="center"
                            gap={2.5}
                            flexWrap="wrap"
                            fontSize="sm"
                            fontWeight="medium"
                        >
                            <Text color="text.secondary">Join between</Text>
                            <Input
                                {...inputProps}
                                type="number"
                                inputMode="numeric"
                                min={2}
                                max={1000}
                                aria-label="Minimum players"
                                value={minPlayers}
                                onChange={(e) => setMinPlayers(e.target.value)}
                                height="44px"
                                w="72px"
                                textAlign="center"
                                fontWeight="bold"
                            />
                            <Text color="text.secondary">and</Text>
                            {capped ? (
                                <Input
                                    {...inputProps}
                                    type="number"
                                    inputMode="numeric"
                                    min={2}
                                    max={1000}
                                    aria-label="Maximum players"
                                    value={maxPlayers}
                                    onChange={(e) =>
                                        setMaxPlayers(e.target.value)
                                    }
                                    height="44px"
                                    w="72px"
                                    textAlign="center"
                                    fontWeight="bold"
                                />
                            ) : (
                                <Text color="text.primary" fontWeight="bold">
                                    no cap
                                </Text>
                            )}
                            <Text color="text.secondary">players</Text>
                        </Flex>

                        <Flex align="center" gap={2} mt={3}>
                            <Text
                                fontSize="sm"
                                fontWeight="semibold"
                                color="text.secondary"
                            >
                                Field size
                            </Text>
                            <InfoHint label="Capped sets a hard ceiling on total entries. Unlimited lets the field grow as large as it wants." />
                            <HStack
                                spacing={1}
                                p={1}
                                ml={1}
                                borderRadius="full"
                                bg={chipIdleBg}
                            >
                                {[
                                    { v: true, label: 'Capped' },
                                    { v: false, label: 'Unlimited' },
                                ].map((o) => {
                                    const active = capped === o.v;
                                    return (
                                        <Box
                                            key={o.label}
                                            as="button"
                                            type="button"
                                            onClick={() => setCapped(o.v)}
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                            fontSize="xs"
                                            fontWeight="bold"
                                            bg={
                                                active
                                                    ? segActiveBg
                                                    : 'transparent'
                                            }
                                            color={
                                                active
                                                    ? 'text.primary'
                                                    : 'text.muted'
                                            }
                                            boxShadow={
                                                active
                                                    ? '0 1px 2px rgba(0,0,0,0.12)'
                                                    : 'none'
                                            }
                                            transition="background-color 120ms ease, color 120ms ease"
                                            _focusVisible={{
                                                outline: '2px solid',
                                                outlineColor: accent.color,
                                                outlineOffset: '2px',
                                            }}
                                        >
                                            {o.label}
                                        </Box>
                                    );
                                })}
                            </HStack>
                        </Flex>

                        {showErrors && playersError && (
                            <FieldError message={playersError} mt={2} />
                        )}
                        <VStack align="stretch" spacing={1} mt={2}>
                            <Text fontSize="xs" color="text.muted">
                                <Text
                                    as="span"
                                    fontWeight="bold"
                                    color="text.secondary"
                                >
                                    Min {minN >= 2 ? minN : 2}:
                                </Text>{' '}
                                if fewer join by the start time, the tournament
                                auto-cancels and every buy-in is refunded.
                            </Text>
                            <Text fontSize="xs" color="text.muted">
                                <Text
                                    as="span"
                                    fontWeight="bold"
                                    color="text.secondary"
                                >
                                    {capped
                                        ? `Max ${maxN >= 2 ? maxN : ''}:`
                                        : 'Unlimited:'}
                                </Text>{' '}
                                {capped
                                    ? 'caps the total entries — registration closes once it fills.'
                                    : 'no ceiling on entries; the field grows until late reg closes.'}
                            </Text>
                        </VStack>
                    </Box>

                    <Box borderTopWidth="1px" borderColor={dividerColor} pt={3}>
                        <Text
                            fontSize="xs"
                            fontWeight="semibold"
                            textTransform="uppercase"
                            letterSpacing="0.06em"
                            color="text.muted"
                        >
                            You&apos;re creating
                        </Text>
                        <Text
                            mt={1}
                            fontSize="sm"
                            fontWeight="medium"
                            color="text.secondary"
                        >
                            {setupSummary}
                        </Text>
                    </Box>
                </VStack>
            </SectionCard>

            {/* ── Advanced (collapsed) ────────────────────────────────────── */}
            <SectionCard>
                <Box
                    as="button"
                    type="button"
                    width="100%"
                    onClick={advanced.onToggle}
                    aria-expanded={advanced.isOpen}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    _focusVisible={{
                        outline: '2px solid',
                        outlineColor: accent.color,
                        outlineOffset: '2px',
                        borderRadius: '8px',
                    }}
                >
                    <VStack align="stretch" spacing={0.5}>
                        <Text
                            fontWeight="bold"
                            fontSize="md"
                            color="text.primary"
                            textAlign="left"
                        >
                            Advanced
                        </Text>
                        <Text fontSize="xs" color="text.muted" textAlign="left">
                            {freePlay
                                ? 'Table size, re-entries, and a private access code.'
                                : 'Table size and re-entries.'}
                        </Text>
                    </VStack>
                    <Icon
                        as={FiChevronDown}
                        color="text.muted"
                        boxSize="18px"
                        transform={
                            advanced.isOpen ? 'rotate(180deg)' : 'rotate(0)'
                        }
                        transition="transform 160ms ease"
                        sx={{
                            '@media (prefers-reduced-motion: reduce)': {
                                transition: 'none',
                            },
                        }}
                        flexShrink={0}
                    />
                </Box>
                <Collapse in={advanced.isOpen} animateOpacity>
                    <VStack align="stretch" spacing={4} pt={4}>
                        <Box>
                            <FieldLabel>Table size</FieldLabel>
                            <Select
                                {...inputProps}
                                value={tableSize}
                                onChange={(e) =>
                                    setTableSize(parseInt(e.target.value, 10))
                                }
                                height="48px"
                                icon={<FiChevronDown />}
                            >
                                <option value={9}>9-max</option>
                                <option value={8}>8-max</option>
                                <option value={6}>6-max</option>
                            </Select>
                        </Box>

                        <Flex justify="space-between" align="center" gap={3}>
                            <VStack align="stretch" spacing={0.5} pr={3}>
                                <Text
                                    fontSize="sm"
                                    fontWeight="semibold"
                                    color="text.secondary"
                                >
                                    Allow re-entries
                                </Text>
                                <Text fontSize="xs" color="text.muted">
                                    {lateRegLevels === 0
                                        ? 'Requires late registration.'
                                        : 'Players can re-buy during late reg.'}
                                </Text>
                            </VStack>
                            <Switch
                                isChecked={reentryAllowed && lateRegLevels > 0}
                                onChange={(e) =>
                                    setReentryAllowed(e.target.checked)
                                }
                                colorScheme={freePlay ? 'green' : 'blue'}
                                size="lg"
                                isDisabled={lateRegLevels === 0}
                                flexShrink={0}
                            />
                        </Flex>

                        {reentryAllowed && lateRegLevels > 0 && (
                            <Box>
                                <FieldLabel>Max re-entries</FieldLabel>
                                <Select
                                    {...inputProps}
                                    value={reentryMax}
                                    onChange={(e) =>
                                        setReentryMax(
                                            parseInt(e.target.value, 10)
                                        )
                                    }
                                    height="48px"
                                    icon={<FiChevronDown />}
                                >
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                </Select>
                            </Box>
                        )}

                        {freePlay && (
                            <Box>
                                <FieldLabel optional>Access code</FieldLabel>
                                <Input
                                    {...inputProps}
                                    type="text"
                                    value={passwordCode}
                                    onChange={(e) =>
                                        setPasswordCode(e.target.value)
                                    }
                                    placeholder="Leave blank for open registration"
                                    height="48px"
                                />
                                {passwordCode.trim() && (
                                    <Text
                                        fontSize="xs"
                                        color="text.muted"
                                        mt={1.5}
                                    >
                                        With an access code set, this tournament
                                        is private — only players with the code
                                        can join.
                                    </Text>
                                )}
                            </Box>
                        )}
                    </VStack>
                </Collapse>
            </SectionCard>

            {/* ── Submit ──────────────────────────────────────────────────── */}
            <Button
                type="submit"
                variant="tactilePrimary"
                width="100%"
                height="56px"
                fontSize="md"
                fontWeight="bold"
                borderRadius="16px"
                isLoading={isSubmitting}
                loadingText={isFunding ? fundingLabel : 'Creating…'}
                spinner={<Spinner size="md" color="white" />}
                isDisabled={isSubmitting}
                onClick={handleSubmit}
            >
                {submitLabel}
            </Button>

            {isFunding && (
                <HStack spacing={2} justify="center">
                    <Icon as={FaCheckCircle} color={USDC_BLUE} boxSize={3.5} />
                    <Text fontSize="xs" color="text.secondary">
                        {fundingLabel}
                    </Text>
                </HStack>
            )}
        </VStack>
    );
};

function FieldError({ message, mt }: { message: string; mt?: number }) {
    return (
        <Flex mt={mt ?? 2} align="center" gap={1.5}>
            <Icon as={FaInfoCircle} color="brand.pink" boxSize={3.5} />
            <Text
                fontSize="sm"
                color="brand.pink"
                fontWeight="medium"
                lineHeight="short"
            >
                {message}
            </Text>
        </Flex>
    );
}

export default CreateTournamentForm;
