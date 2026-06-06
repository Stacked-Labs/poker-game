'use client';

import {
    Box,
    Button,
    Divider,
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
import { FaTrophy } from 'react-icons/fa6';
import { FiExternalLink } from 'react-icons/fi';
import { USDC_BLUE, USDC_LOGO } from '../PublicGames/types';
import {
    formatUsdc,
    ordinal,
    useCountdown,
} from '../PublicGames/tournamentFormat';

// Gentle ease-out pop for the winner's trophy (no bounce, reduced-motion-safe).
const trophyPop = keyframes`
    from { opacity: 0; transform: scale(0.8); }
    to   { opacity: 1; transform: scale(1); }
`;

export interface ReentryOffer {
    buyInUsdc: number;
    /** ISO timestamp when late registration (and thus re-entry) closes. */
    closesAtIso: string;
    /** Remaining bullets, for display. */
    bulletsLeft: number;
}

export interface TournamentResultCardProps {
    kind: 'bust' | 'win';
    /** Finishing place (1 for a win). */
    position: number;
    /** Total entries in the field. */
    fieldSize: number;
    /** Prize won in micro-USDC (0 if none). Ignored for Free Play. */
    prizeUsdc: number;
    placesPaid: number;
    isFreePlay: boolean;
    tournamentName: string;
    /** Win only: link to the on-chain settlement tx, once available. */
    settlementTxUrl?: string | null;
    /** Bust only: present when re-entry is still possible. */
    reentry?: ReentryOffer;
    reentering?: boolean;
    onReenter?: () => void;
    onClose?: () => void;
}

export default function TournamentResultCard({
    kind,
    position,
    fieldSize,
    prizeUsdc,
    placesPaid,
    isFreePlay,
    tournamentName,
    settlementTxUrl,
    reentry,
    reentering = false,
    onReenter,
    onClose,
}: TournamentResultCardProps) {
    const cardBg = useColorModeValue('white', 'card.darkNavy');
    const border = useColorModeValue(
        'rgba(11, 20, 48, 0.08)',
        'rgba(255, 255, 255, 0.08)'
    );
    const gold = useColorModeValue('brand.yellowDark', 'brand.yellow');
    const goldDisc = useColorModeValue(
        'rgba(253, 197, 29, 0.14)',
        'rgba(253, 197, 29, 0.18)'
    );
    const prefersReducedMotion = usePrefersReducedMotion();
    const countdown = useCountdown(reentry?.closesAtIso ?? '');
    const isWin = kind === 'win';
    const cashed = !isFreePlay && prizeUsdc > 0;

    return (
        <Box
            bg={cardBg}
            borderWidth="1px"
            borderColor={isWin ? gold : border}
            borderRadius="16px"
            boxShadow="card.lift"
            p={{ base: 5, md: 6 }}
            w="full"
            maxW="380px"
            textAlign="center"
        >
            <VStack spacing={isWin ? 2 : 1.5} align="stretch">
                {isWin && (
                    <Flex
                        alignSelf="center"
                        align="center"
                        justify="center"
                        boxSize="58px"
                        borderRadius="full"
                        bg={goldDisc}
                        mb={1}
                        animation={
                            prefersReducedMotion
                                ? undefined
                                : `${trophyPop} 420ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both`
                        }
                    >
                        <Icon
                            as={FaTrophy}
                            boxSize="28px"
                            color={gold}
                            aria-hidden
                        />
                    </Flex>
                )}

                <Text
                    fontSize="2xs"
                    color="text.muted"
                    textTransform="uppercase"
                    letterSpacing="0.1em"
                    fontWeight="bold"
                >
                    {isWin ? 'Champion' : 'You busted'}
                </Text>

                <Text
                    as="h2"
                    fontSize={{ base: 'xl', md: '2xl' }}
                    fontWeight="bold"
                    letterSpacing="-0.02em"
                    color="text.primary"
                    lineHeight={1.1}
                >
                    {isWin
                        ? `You won ${tournamentName}`
                        : `You finished ${ordinal(position)} of ${fieldSize}`}
                </Text>

                {isWin && (
                    <Text fontWeight="semibold" color="text.secondary">
                        1st of {fieldSize}
                    </Text>
                )}

                {/* Money / outcome line */}
                {isFreePlay ? (
                    <Text fontSize="sm" color="text.muted">
                        Free Play · no real value
                    </Text>
                ) : cashed ? (
                    <HStack justify="center" spacing={1.5} pt={1}>
                        <Image src={USDC_LOGO} alt="" boxSize="20px" />
                        <Text
                            fontSize={{ base: '2xl', md: '3xl' }}
                            fontWeight="bold"
                            color={USDC_BLUE}
                            lineHeight={1}
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            +${formatUsdc(prizeUsdc)}
                        </Text>
                    </HStack>
                ) : (
                    <Text fontSize="sm" color="text.muted">
                        Out of the money · top {placesPaid} paid
                    </Text>
                )}

                {/* Win: settlement reassurance + proof */}
                {isWin && !isFreePlay && (
                    <VStack spacing={1} pt={1}>
                        <Text fontSize="xs" color="text.muted">
                            Settling on-chain, usually within ~30s.
                        </Text>
                        {settlementTxUrl && (
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
                                View payout transaction
                                <Icon as={FiExternalLink} boxSize="11px" />
                            </Box>
                        )}
                    </VStack>
                )}

                {/* Bust: re-entry offer */}
                {!isWin && reentry && (
                    <>
                        <Divider borderColor={border} my={1} />
                        <VStack spacing={2}>
                            <Text
                                fontSize="xs"
                                fontWeight="semibold"
                                color={gold}
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                Re-entry open
                                {countdown.ready && !countdown.isPast
                                    ? ` · closes in ${countdown.label}`
                                    : ''}
                                {reentry.bulletsLeft > 0
                                    ? ` · ${reentry.bulletsLeft} bullet${
                                          reentry.bulletsLeft !== 1 ? 's' : ''
                                      } left`
                                    : ''}
                            </Text>
                            <Button
                                variant="tactilePrimary"
                                size="md"
                                minH="44px"
                                w="full"
                                isLoading={reentering}
                                loadingText="Re-entering…"
                                onClick={onReenter}
                            >
                                Re-enter
                                {!isFreePlay
                                    ? ` for $${formatUsdc(reentry.buyInUsdc)}`
                                    : ''}
                            </Button>
                        </VStack>
                    </>
                )}

                <Button
                    variant="tactileGhost"
                    size="sm"
                    mt={1}
                    onClick={onClose}
                >
                    {isWin ? 'View standings' : reentry ? 'Not now' : 'Close'}
                </Button>
            </VStack>
        </Box>
    );
}
