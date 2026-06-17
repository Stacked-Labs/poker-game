'use client';

import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    Image,
    Text,
    VStack,
    useColorModeValue,
    usePrefersReducedMotion,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';
import { FaTrophy } from 'react-icons/fa6';
import { FiArrowRight, FiExternalLink, FiRotateCcw } from 'react-icons/fi';
import { USDC_BLUE, USDC_LOGO } from '../PublicGames/types';
import {
    formatUsdc,
    formatUsdcCompact,
    isLargeUsdc,
    ordinal,
    useCountdown,
} from '../PublicGames/tournamentFormat';

// ── Keyframes ────────────────────────────────────────────────────────────────

const cardEnter = keyframes`
    from { opacity: 0; transform: translateY(24px) scale(0.94); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const trophyBounce = keyframes`
    0%   { opacity: 0; transform: scale(0.4) rotate(-20deg); }
    60%  { opacity: 1; transform: scale(1.15) rotate(6deg); }
    80%  { transform: scale(0.95) rotate(-2deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
`;

const trophyFloat = keyframes`
    0%, 100% { transform: translateY(0px) rotate(-2deg); }
    50%       { transform: translateY(-9px) rotate(2deg); }
`;

const borderGlow = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 rgba(253,197,29,0); }
    50%       { box-shadow: 0 0 28px 6px rgba(253,197,29,0.35), 0 0 60px 12px rgba(253,197,29,0.1); }
`;

const shimmerSweep = keyframes`
    from { transform: translateX(-100%); }
    to   { transform: translateX(400%); }
`;

const prizeReveal = keyframes`
    from { opacity: 0; transform: scale(0.65) translateY(10px); }
    60%  { transform: scale(1.07) translateY(-2px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
`;

const dotPulse = keyframes`
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.3; transform: scale(0.7); }
`;

const greenGlow = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 rgba(54,163,123,0); }
    50%       { box-shadow: 0 0 20px 4px rgba(54,163,123,0.25); }
`;

// ── Count-up hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, delay = 420, duration = 1300, skip = false) {
    const [value, setValue] = useState(skip ? target : 0);

    useEffect(() => {
        if (skip || target === 0) { setValue(target); return; }
        let raf = 0;
        const timer = window.setTimeout(() => {
            let start: number | null = null;
            const step = (ts: number) => {
                if (!start) start = ts;
                const t = Math.min((ts - start) / duration, 1);
                // Ease-out quart
                setValue(Math.round(target * (1 - Math.pow(1 - t, 4))));
                if (t < 1) raf = requestAnimationFrame(step);
                else setValue(target);
            };
            raf = requestAnimationFrame(step);
        }, delay);
        return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
    }, [target, delay, duration, skip]);

    return value;
}

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface ReentryOffer {
    buyInUsdc: number;
    closesAtIso: string;
    bulletsLeft: number;
}

export interface TournamentResultCardProps {
    kind: 'bust' | 'win';
    position: number;
    fieldSize: number;
    prizeUsdc: number;
    placesPaid: number;
    isFreePlay: boolean;
    tournamentName: string;
    tournamentId: number;
    settlementTxUrl?: string | null;
    reentry?: ReentryOffer;
    reentering?: boolean;
    onReenter?: () => void;
    onClose?: () => void;
}

// ── Root component ───────────────────────────────────────────────────────────

export default function TournamentResultCard(props: TournamentResultCardProps) {
    const {
        kind,
        position,
        fieldSize,
        prizeUsdc,
        placesPaid,
        isFreePlay,
        tournamentName,
        tournamentId,
        settlementTxUrl,
        reentry,
        reentering = false,
        onReenter,
        onClose,
    } = props;

    const prefersReducedMotion = usePrefersReducedMotion();
    const isWin = kind === 'win';
    const cashed = !isFreePlay && prizeUsdc > 0;
    // Compact (abbreviated) prizes show statically — their intermediate widths
    // would jitter during a count-up, so we skip the animation for those.
    const skipCountUp =
        prefersReducedMotion || prizeUsdc === 0 || isLargeUsdc(prizeUsdc);
    const animatedPrize = useCountUp(prizeUsdc, 480, 1300, skipCountUp);

    // Confetti on mount
    useEffect(() => {
        if (prefersReducedMotion) return;

        if (isWin) {
            const opts = {
                colors: ['#FDC51D', '#B78900', '#ffffff', '#36A37B', '#ffb347'],
                gravity: 0.88,
                ticks: 230,
                scalar: 1.1,
                disableForReducedMotion: true,
            };
            confetti({ ...opts, particleCount: 95, angle: 58, spread: 62, origin: { x: 0.08, y: 0.68 }, startVelocity: 52 });
            confetti({ ...opts, particleCount: 95, angle: 122, spread: 62, origin: { x: 0.92, y: 0.68 }, startVelocity: 52 });
            const t = setTimeout(() => confetti({
                ...opts,
                particleCount: 55,
                spread: 90,
                origin: { x: 0.5, y: 0.18 },
                startVelocity: 16,
                gravity: 1.15,
                ticks: 170,
            }), 480);
            return () => clearTimeout(t);
        }

        if (cashed) {
            confetti({
                particleCount: 42,
                spread: 52,
                origin: { x: 0.5, y: 0.38 },
                colors: ['#36A37B', '#2775CA', '#ffffff', '#36A37B', '#a8e6cf'],
                startVelocity: 22,
                gravity: 1.0,
                ticks: 140,
                scalar: 0.9,
                disableForReducedMotion: true,
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isWin) {
        return (
            <WinCard
                fieldSize={fieldSize}
                prizeUsdc={prizeUsdc}
                isFreePlay={isFreePlay}
                tournamentName={tournamentName}
                tournamentId={tournamentId}
                settlementTxUrl={settlementTxUrl}
                animatedPrize={animatedPrize}
                prefersReducedMotion={prefersReducedMotion}
                onClose={onClose}
            />
        );
    }

    return (
        <BustCard
            position={position}
            fieldSize={fieldSize}
            prizeUsdc={prizeUsdc}
            placesPaid={placesPaid}
            isFreePlay={isFreePlay}
            cashed={cashed}
            tournamentId={tournamentId}
            reentry={reentry}
            reentering={reentering}
            animatedPrize={animatedPrize}
            prefersReducedMotion={prefersReducedMotion}
            onReenter={onReenter}
            onClose={onClose}
        />
    );
}

// ── Win card ─────────────────────────────────────────────────────────────────

function WinCard({
    fieldSize,
    prizeUsdc,
    isFreePlay,
    tournamentName,
    tournamentId,
    settlementTxUrl,
    animatedPrize,
    prefersReducedMotion,
    onClose,
}: {
    fieldSize: number;
    prizeUsdc: number;
    isFreePlay: boolean;
    tournamentName: string;
    tournamentId: number;
    settlementTxUrl?: string | null;
    animatedPrize: number;
    prefersReducedMotion: boolean;
    onClose?: () => void;
}) {
    const hasPrize = !isFreePlay && prizeUsdc > 0;

    // Color mode tokens — light gets a warm cream, dark keeps deep navy
    const cardBg        = useColorModeValue('#FFFDF5', '#06091A');
    const headlineFg    = useColorModeValue('gray.900',              'white');
    const labelFg       = useColorModeValue('rgba(160,123,10,0.8)',  'rgba(253,197,29,0.65)');
    const settleBg      = useColorModeValue('rgba(11,20,48,0.04)',   'rgba(255,255,255,0.04)');
    const settleBorder  = useColorModeValue('rgba(11,20,48,0.08)',   'rgba(255,255,255,0.07)');
    const settleTextFg  = useColorModeValue('gray.500',              'rgba(255,255,255,0.38)');
    const linkFg        = useColorModeValue('gray.400',              'rgba(255,255,255,0.3)');
    const linkHoverFg   = useColorModeValue('gray.700',              'rgba(255,255,255,0.65)');
    const freePlayFg    = useColorModeValue('gray.400',              'rgba(255,255,255,0.35)');
    const radialGlow    = useColorModeValue(
        'radial-gradient(ellipse at 50% 0%, rgba(253,197,29,0.14) 0%, transparent 65%)',
        'radial-gradient(ellipse at 50% 0%, rgba(253,197,29,0.28) 0%, transparent 68%)',
    );

    return (
        <Box
            bg={cardBg}
            borderWidth="2px"
            borderColor="rgba(253,197,29,0.55)"
            borderRadius="22px"
            w="full"
            maxW={{ base: '340px', md: '390px' }}
            mx="auto"
            position="relative"
            sx={{
                animation: prefersReducedMotion
                    ? undefined
                    : `${cardEnter} 420ms cubic-bezier(0.22, 1, 0.36, 1) both, ${borderGlow} 3s ease-in-out infinite 600ms`,
            }}
        >
            {/* Radial glow at top */}
            <Box
                position="absolute"
                top="-60px"
                left="50%"
                transform="translateX(-50%)"
                w="300px"
                h="220px"
                pointerEvents="none"
                sx={{ background: radialGlow }}
            />

            {/* Moving shimmer line */}
            {!prefersReducedMotion && (
                <Box
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    h="2px"
                    overflow="hidden"
                    borderTopRadius="22px"
                    pointerEvents="none"
                >
                    <Box
                        position="absolute"
                        top="0"
                        left="0"
                        w="25%"
                        h="100%"
                        sx={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(253,197,29,0.9) 50%, transparent 100%)',
                            animation: `${shimmerSweep} 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite 800ms`,
                        }}
                    />
                </Box>
            )}

            <VStack spacing={0} align="stretch" textAlign="center" p={{ base: 6, md: 7 }} position="relative">
                {/* Trophy */}
                <Flex justify="center" mb={3} mt={1}>
                    <Box
                        display="inline-flex"
                        alignItems="center"
                        justifyContent="center"
                        boxSize={{ base: '76px', md: '84px' }}
                        borderRadius="full"
                        bg="rgba(253,197,29,0.12)"
                        borderWidth="1px"
                        borderColor="rgba(253,197,29,0.2)"
                        sx={
                            prefersReducedMotion
                                ? {}
                                : { animation: `${trophyBounce} 600ms cubic-bezier(0.22, 1, 0.36, 1) both 150ms, ${trophyFloat} 3.8s ease-in-out infinite 900ms` }
                        }
                    >
                        <Icon as={FaTrophy} boxSize={{ base: '36px', md: '40px' }} color="#FDC51D" aria-hidden />
                    </Box>
                </Flex>

                {/* Label */}
                <Text
                    fontSize="10px"
                    color={labelFg}
                    textTransform="uppercase"
                    letterSpacing="0.22em"
                    fontWeight="bold"
                    mb={1.5}
                >
                    Champion
                </Text>

                {/* Headline */}
                <Text
                    as="h2"
                    fontSize={{ base: '3xl', md: '4xl' }}
                    fontWeight="black"
                    letterSpacing="-0.04em"
                    color={headlineFg}
                    lineHeight={1}
                    mb={2.5}
                >
                    You won
                </Text>

                {/* Tournament pill */}
                <Flex justify="center" mb={hasPrize ? 4 : 5}>
                    <Box
                        display="inline-flex"
                        alignItems="center"
                        px={3}
                        py={1}
                        borderRadius="full"
                        bg="rgba(54,163,123,0.12)"
                        borderWidth="1px"
                        borderColor="rgba(54,163,123,0.28)"
                    >
                        <Text fontSize="xs" fontWeight="bold" color="brand.green" noOfLines={1}>
                            {tournamentName} · 1st of {fieldSize}
                        </Text>
                    </Box>
                </Flex>

                {/* Prize — fixed-width container prevents layout shift during count-up */}
                {hasPrize && (
                    <HStack
                        justify="center"
                        spacing={2}
                        mb={5}
                        maxW="full"
                        sx={
                            prefersReducedMotion
                                ? {}
                                : { animation: `${prizeReveal} 500ms cubic-bezier(0.22, 1, 0.36, 1) 440ms both` }
                        }
                    >
                        {/* Anchor to final value width; counting value sits on top */}
                        <Box position="relative" display="inline-flex" alignItems="center">
                            <Text
                                fontSize={{ base: '3xl', sm: '4xl', md: '5xl' }}
                                fontWeight="black"
                                lineHeight={1}
                                visibility="hidden"
                                aria-hidden
                                userSelect="none"
                                whiteSpace="nowrap"
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                +${isLargeUsdc(prizeUsdc) ? formatUsdcCompact(prizeUsdc) : formatUsdc(prizeUsdc, { decimals: 2 })}
                            </Text>
                            <Text
                                fontSize={{ base: '3xl', sm: '4xl', md: '5xl' }}
                                fontWeight="black"
                                color={USDC_BLUE}
                                lineHeight={1}
                                position="absolute"
                                top="50%"
                                left="50%"
                                transform="translate(-50%, -50%)"
                                whiteSpace="nowrap"
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                +${isLargeUsdc(prizeUsdc) ? formatUsdcCompact(prizeUsdc) : formatUsdc(animatedPrize, { decimals: 2 })}
                            </Text>
                        </Box>
                        <Image src={USDC_LOGO} alt="" boxSize={{ base: '24px', md: '28px' }} flexShrink={0} />
                    </HStack>
                )}

                {isFreePlay && (
                    <Text fontSize="sm" color={freePlayFg} mb={5}>
                        Free Play · bragging rights only
                    </Text>
                )}

                {/* Settlement */}
                {!isFreePlay && (
                    <Box
                        bg={settleBg}
                        borderWidth="1px"
                        borderColor={settleBorder}
                        borderRadius="12px"
                        px={4}
                        py={2.5}
                        mb={5}
                    >
                        {settlementTxUrl ? (
                            <Box
                                as="a"
                                href={settlementTxUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                display="inline-flex"
                                alignItems="center"
                                gap="4px"
                                fontSize="xs"
                                fontWeight="semibold"
                                color={USDC_BLUE}
                                _hover={{ textDecoration: 'underline' }}
                            >
                                Prizes settled on-chain
                                <Icon as={FiExternalLink} boxSize="11px" />
                            </Box>
                        ) : (
                            <Text fontSize="xs" color={settleTextFg}>
                                Settling on-chain · usually under 30s
                            </Text>
                        )}
                    </Box>
                )}

                {/* Actions */}
                <VStack spacing={2}>
                    <Button
                        variant="tactileGold"
                        size="md"
                        w="full"
                        minH="46px"
                        onClick={onClose}
                    >
                        View standings
                    </Button>

                    <Box
                        as="a"
                        href={`/tournament/${tournamentId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        display="inline-flex"
                        alignItems="center"
                        gap="5px"
                        fontSize="xs"
                        fontWeight="semibold"
                        color={linkFg}
                        py={1.5}
                        transition="color 150ms ease"
                        _hover={{ color: linkHoverFg }}
                    >
                        View tournament details
                        <Icon as={FiArrowRight} boxSize="12px" />
                    </Box>
                </VStack>
            </VStack>
        </Box>
    );
}

// ── Bust card ────────────────────────────────────────────────────────────────

function BustCard({
    position,
    fieldSize,
    prizeUsdc,
    placesPaid,
    isFreePlay,
    cashed,
    tournamentId,
    reentry,
    reentering,
    animatedPrize,
    prefersReducedMotion,
    onReenter,
    onClose,
}: {
    position: number;
    fieldSize: number;
    prizeUsdc: number;
    placesPaid: number;
    isFreePlay: boolean;
    cashed: boolean;
    tournamentId: number;
    reentry?: ReentryOffer;
    reentering: boolean;
    animatedPrize: number;
    prefersReducedMotion: boolean;
    onReenter?: () => void;
    onClose?: () => void;
}) {
    const countdown = useCountdown(reentry?.closesAtIso ?? '');

    const cardBg = useColorModeValue('white', '#0B1130');
    const borderColor = useColorModeValue(
        cashed ? 'rgba(54,163,123,0.45)' : 'rgba(11,20,48,0.1)',
        cashed ? 'rgba(54,163,123,0.35)' : 'rgba(255,255,255,0.09)'
    );
    const dividerColor = useColorModeValue('rgba(11,20,48,0.08)', 'rgba(255,255,255,0.08)');
    const mutedFg = useColorModeValue('gray.500', 'whiteAlpha.500');
    const primaryFg = useColorModeValue('gray.900', 'white');
    const linkFg = useColorModeValue('gray.400', 'whiteAlpha.400');
    const goldText = useColorModeValue('brand.yellowDark', 'brand.yellow');
    const greenTintBg = useColorModeValue(
        'linear-gradient(145deg, rgba(54,163,123,0.07) 0%, transparent 55%)',
        'linear-gradient(145deg, rgba(54,163,123,0.1) 0%, transparent 55%)'
    );

    const cardShadow = cashed
        ? '0 8px 40px rgba(54,163,123,0.14), 0 2px 8px rgba(0,0,0,0.08)'
        : '0 8px 36px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.06)';

    const cardAnim = prefersReducedMotion
        ? undefined
        : cashed
          ? `${cardEnter} 380ms cubic-bezier(0.22, 1, 0.36, 1) both, ${greenGlow} 2.8s ease-in-out infinite 400ms`
          : `${cardEnter} 380ms cubic-bezier(0.22, 1, 0.36, 1) both`;

    return (
        <Box
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="22px"
            w="full"
            maxW={{ base: '340px', md: '390px' }}
            mx="auto"
            position="relative"
            boxShadow={cardShadow}
            sx={{ animation: cardAnim }}
        >
            {/* Green tint wash for cashed state */}
            {cashed && (
                <Box
                    position="absolute"
                    inset={0}
                    pointerEvents="none"
                    sx={{ background: greenTintBg }}
                />
            )}

            <VStack spacing={0} align="stretch" textAlign="center" p={{ base: 6, md: 7 }} position="relative">
                {/* Status chip */}
                <Text
                    fontSize="10px"
                    textTransform="uppercase"
                    letterSpacing="0.18em"
                    fontWeight="bold"
                    color={cashed ? 'brand.green' : mutedFg}
                    mb={4}
                >
                    {isFreePlay ? 'Free Play' : cashed ? 'In the money' : 'You busted'}
                </Text>

                {/* Ordinal — the hero */}
                <Text
                    as="h2"
                    fontSize={{ base: '5xl', md: '6xl' }}
                    fontWeight="black"
                    letterSpacing="-0.05em"
                    color={primaryFg}
                    lineHeight={0.9}
                    mb={1.5}
                >
                    {ordinal(position)}
                </Text>
                <Text fontSize="sm" color={mutedFg} mb={cashed ? 4 : 3}>
                    of {fieldSize}
                </Text>

                {/* Prize for cashed bust */}
                {cashed && (
                    <HStack
                        justify="center"
                        spacing={2}
                        mb={5}
                        maxW="full"
                        sx={
                            prefersReducedMotion
                                ? {}
                                : { animation: `${prizeReveal} 500ms cubic-bezier(0.22, 1, 0.36, 1) 320ms both` }
                        }
                    >
                        {/* Anchor to final value width; counting value sits on top */}
                        <Box position="relative" display="inline-flex" alignItems="center">
                            <Text
                                fontSize={{ base: '2xl', sm: '3xl', md: '4xl' }}
                                fontWeight="black"
                                lineHeight={1}
                                visibility="hidden"
                                aria-hidden
                                userSelect="none"
                                whiteSpace="nowrap"
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                +${isLargeUsdc(prizeUsdc) ? formatUsdcCompact(prizeUsdc) : formatUsdc(prizeUsdc, { decimals: 2 })}
                            </Text>
                            <Text
                                fontSize={{ base: '2xl', sm: '3xl', md: '4xl' }}
                                fontWeight="black"
                                color={USDC_BLUE}
                                lineHeight={1}
                                position="absolute"
                                top="50%"
                                left="50%"
                                transform="translate(-50%, -50%)"
                                whiteSpace="nowrap"
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                +${isLargeUsdc(prizeUsdc) ? formatUsdcCompact(prizeUsdc) : formatUsdc(animatedPrize, { decimals: 2 })}
                            </Text>
                        </Box>
                        <Image src={USDC_LOGO} alt="" boxSize={{ base: '22px', md: '26px' }} flexShrink={0} />
                    </HStack>
                )}

                {/* Out-of-money label */}
                {!cashed && (
                    <Text fontSize="sm" color={mutedFg} mb={4}>
                        {isFreePlay
                            ? 'No real value · practice chips only'
                            : `Out of the money · top ${placesPaid} paid`}
                    </Text>
                )}

                {/* Re-entry block */}
                {reentry && (
                    <>
                        <Box h="1px" bg={dividerColor} mb={4} />
                        <VStack spacing={3} mb={4}>
                            <HStack spacing={2} justify="center">
                                <Box
                                    boxSize="7px"
                                    borderRadius="full"
                                    bg="brand.yellow"
                                    flexShrink={0}
                                    sx={
                                        prefersReducedMotion
                                            ? {}
                                            : { animation: `${dotPulse} 1.5s ease-in-out infinite` }
                                    }
                                />
                                <Text
                                    fontSize="xs"
                                    fontWeight="bold"
                                    color={goldText}
                                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                    Re-entry open
                                    {countdown.ready && !countdown.isPast
                                        ? ` · ${countdown.label} left`
                                        : ''}
                                    {reentry.bulletsLeft > 0
                                        ? ` · ${reentry.bulletsLeft} bullet${reentry.bulletsLeft !== 1 ? 's' : ''} left`
                                        : ''}
                                </Text>
                            </HStack>
                            <Button
                                variant="tactilePrimary"
                                size="md"
                                minH="48px"
                                w="full"
                                isLoading={reentering}
                                loadingText="Re-entering…"
                                leftIcon={<Icon as={FiRotateCcw} boxSize="14px" />}
                                onClick={onReenter}
                            >
                                Re-enter{!isFreePlay ? ` · $${formatUsdc(reentry.buyInUsdc)}` : ''}
                            </Button>
                        </VStack>
                    </>
                )}

                {/* Footer actions */}
                <VStack spacing={1} mt={reentry ? 0 : 1}>
                    <Button
                        variant={reentry ? 'tactileGhost' : 'tactileOutline'}
                        size="sm"
                        w="full"
                        minH="42px"
                        onClick={onClose}
                    >
                        {reentry ? 'Not now' : 'Close'}
                    </Button>
                    <Box
                        as="a"
                        href={`/tournament/${tournamentId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        display="inline-flex"
                        alignItems="center"
                        gap="5px"
                        fontSize="xs"
                        fontWeight="semibold"
                        color={linkFg}
                        py={2}
                        transition="color 150ms ease"
                        _hover={{ color: primaryFg }}
                    >
                        View tournament details
                        <Icon as={FiArrowRight} boxSize="12px" />
                    </Box>
                </VStack>
            </VStack>
        </Box>
    );
}
