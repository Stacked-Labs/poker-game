'use client';

import React, { useMemo, useState } from 'react';
import {
    Box,
    Button,
    Collapse,
    Flex,
    HStack,
    Icon,
    Image,
    Input,
    Select,
    Spinner,
    Switch,
    Text,
    useColorModeValue,
    useDisclosure,
    VStack,
} from '@chakra-ui/react';
import { FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';
import ChainBadge from '@/app/components/ChainBadge';
import ModeChooser from './ModeChooser';
import { formatUsdc } from '@/app/components/PublicGames/tournamentFormat';
import { USDC_BLUE, USDC_LOGO } from '@/app/components/PublicGames/types';

const GREEN_HEX = '#36A37B';
const GREEN_EDGE = '#1F7A5C';
const USDC_BLUE_EDGE = '#1F5FA3';

export interface CreateTournamentFormValues {
    name: string;
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
    edge: string;
    ring: string;
    soft: string;
}

const GREEN_ACCENT: Accent = {
    color: GREEN_HEX,
    edge: GREEN_EDGE,
    ring: 'rgba(54,163,123,0.20)',
    soft: 'rgba(54,163,123,0.10)',
};

const BLUE_ACCENT: Accent = {
    color: USDC_BLUE,
    edge: USDC_BLUE_EDGE,
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

function FieldLabel({
    children,
    optional,
}: {
    children: React.ReactNode;
    optional?: boolean;
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

const CreateTournamentForm: React.FC<CreateTournamentFormProps> = ({
    onSubmit,
    isSubmitting = false,
    fundPhase = 'idle',
}) => {
    const [name, setName] = useState('');
    const [freePlay, setFreePlay] = useState(true);
    const [chain, setChain] = useState<'base' | 'base-sepolia'>('base');
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
    const [scheduledAt, setScheduledAt] = useState('');
    const [passwordCode, setPasswordCode] = useState('');

    const advanced = useDisclosure();

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

    // ── Validation ───────────────────────────────────────────────────────────
    const minN = parseInt(minPlayers, 10);
    const maxN = parseInt(maxPlayers, 10);

    const [showErrors, setShowErrors] = useState(false);

    const playersError = useMemo(() => {
        if (!Number.isFinite(minN) || !Number.isFinite(maxN)) {
            return 'Set how many players can join.';
        }
        if (minN < 2) return 'You need at least 2 players.';
        if (maxN < minN) return 'Max players must be at least the minimum.';
        return '';
    }, [minN, maxN]);

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
            maxPlayers,
            scheduledAt,
            passwordCode,
        });
    };

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
                            onSelect={(m) => setFreePlay(m === 'free')}
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
                    <VStack align="stretch" spacing={4}>
                        <Box>
                            <Flex
                                justify="space-between"
                                align="center"
                                mb={1.5}
                                gap={3}
                            >
                                <FieldLabel>Network</FieldLabel>
                                <ChainBadge chain={chain} />
                            </Flex>
                            <Select
                                {...inputProps}
                                value={chain}
                                onChange={(e) =>
                                    setChain(
                                        e.target.value as
                                            | 'base'
                                            | 'base-sepolia'
                                    )
                                }
                                height="48px"
                                icon={<FiChevronDown />}
                            >
                                <option value="base">Base (mainnet)</option>
                                <option value="base-sepolia">
                                    Base Sepolia (testnet)
                                </option>
                            </Select>
                        </Box>

                        <Flex direction={{ base: 'column', sm: 'row' }} gap={4}>
                            <Box flex={1}>
                                <FieldLabel>Buy-in (USDC)</FieldLabel>
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
                                />
                            </Box>
                            <Box flex={1}>
                                <FieldLabel optional>
                                    Guarantee (GTD)
                                </FieldLabel>
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
                                    placeholder="0"
                                    height="48px"
                                />
                            </Box>
                        </Flex>

                        {guaranteeNumber > 0 && (
                            <Box
                                bg={helperBg}
                                borderWidth="1px"
                                borderColor={helperBorder}
                                borderRadius="12px"
                                px={4}
                                py={3}
                            >
                                <HStack spacing={2} align="center" mb={1.5}>
                                    <Image
                                        src={USDC_LOGO}
                                        alt="USDC"
                                        boxSize="18px"
                                        loading="lazy"
                                        flexShrink={0}
                                    />
                                    <Text
                                        fontSize="sm"
                                        fontWeight="bold"
                                        color={USDC_BLUE}
                                        _dark={{ color: '#7FB4E0' }}
                                    >
                                        ${formatUsdc(guaranteeMicro)} USDC GTD
                                    </Text>
                                </HStack>
                                <Text
                                    fontSize="xs"
                                    color="text.secondary"
                                    lineHeight="1.5"
                                >
                                    If turnout is low you top up to the $
                                    {formatUsdc(guaranteeMicro)} guarantee — up
                                    to ${formatUsdc(guaranteeMicro)} out of
                                    pocket now; the unused part returns to you
                                    when the tournament starts.
                                </Text>
                                <Text
                                    fontSize="xs"
                                    color="text.muted"
                                    lineHeight="1.5"
                                    mt={2}
                                >
                                    As host you earn ~0.75% of winnings (your
                                    25% of the 3% rake).
                                </Text>
                            </Box>
                        )}

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
                        <Input
                            {...inputProps}
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            height="48px"
                        />
                        {showErrors && scheduleError && (
                            <FieldError message={scheduleError} mt={2} />
                        )}
                    </Box>

                    <Flex direction={{ base: 'column', sm: 'row' }} gap={4}>
                        <Box flex={1}>
                            <FieldLabel>Blind structure</FieldLabel>
                            <Select
                                {...inputProps}
                                value={blindStructure}
                                onChange={(e) =>
                                    setBlindStructure(
                                        e.target
                                            .value as CreateTournamentFormValues['blindStructure']
                                    )
                                }
                                height="48px"
                                icon={<FiChevronDown />}
                            >
                                <option value="hyper">
                                    Hyper (5-min levels)
                                </option>
                                <option value="turbo">
                                    Turbo (10-min levels)
                                </option>
                                <option value="regular">
                                    Regular (20-min levels)
                                </option>
                                <option value="deep">
                                    Deep stack (30-min levels)
                                </option>
                            </Select>
                        </Box>
                        <Box flex={1}>
                            <FieldLabel>Late registration</FieldLabel>
                            <Select
                                {...inputProps}
                                value={lateRegLevels}
                                onChange={(e) =>
                                    setLateRegLevels(
                                        parseInt(e.target.value, 10)
                                    )
                                }
                                height="48px"
                                icon={<FiChevronDown />}
                            >
                                <option value={0}>None</option>
                                <option value={1}>1 blind level</option>
                                <option value={2}>2 blind levels</option>
                                <option value={3}>3 blind levels</option>
                            </Select>
                        </Box>
                    </Flex>

                    <Flex direction={{ base: 'column', sm: 'row' }} gap={4}>
                        <Box flex={1}>
                            <FieldLabel>Min players</FieldLabel>
                            <Input
                                {...inputProps}
                                type="number"
                                inputMode="numeric"
                                min={2}
                                max={100}
                                value={minPlayers}
                                onChange={(e) => setMinPlayers(e.target.value)}
                                height="48px"
                            />
                        </Box>
                        <Box flex={1}>
                            <FieldLabel>Max players</FieldLabel>
                            <Input
                                {...inputProps}
                                type="number"
                                inputMode="numeric"
                                min={2}
                                max={1000}
                                value={maxPlayers}
                                onChange={(e) => setMaxPlayers(e.target.value)}
                                height="48px"
                            />
                        </Box>
                    </Flex>
                    {showErrors && playersError && (
                        <FieldError message={playersError} />
                    )}
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
