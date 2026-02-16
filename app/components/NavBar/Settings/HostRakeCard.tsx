'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    Image,
    Link,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { GiTwoCoins } from 'react-icons/gi';
import { FaCrown } from 'react-icons/fa';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { useHostRake } from '@/app/hooks/useHostRake';
import useIsTableOwner from '@/app/hooks/useIsTableOwner';
import { useActiveWallet } from 'thirdweb/react';
import useToastHelper from '@/app/hooks/useToastHelper';

const USDC_LOGO_URL = 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png';
const USDC_DECIMALS = 6;

// --- Emotion keyframes for ambient effects ---

const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

const glowPulse = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(253, 197, 29, 0.15), 0 0 40px rgba(253, 197, 29, 0.05); }
    50% { box-shadow: 0 0 30px rgba(253, 197, 29, 0.3), 0 0 60px rgba(253, 197, 29, 0.1); }
`;

const coinFloat = keyframes`
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-3px) rotate(5deg); }
`;

const subtleShine = keyframes`
    0% { opacity: 0; left: -30%; }
    50% { opacity: 0.3; }
    100% { opacity: 0; left: 130%; }
`;

// --- Animated counter that rolls up to the target value ---

function AnimatedUsdcValue({ value }: { value: number }) {
    const motionVal = useMotionValue(0);
    const displayed = useTransform(motionVal, (v) =>
        v.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    );
    const prevValue = useRef(0);
    const [displayText, setDisplayText] = useState('0.00');

    useEffect(() => {
        const controls = animate(motionVal, value, {
            duration: Math.min(2, Math.max(0.6, Math.abs(value - prevValue.current) * 0.5)),
            ease: [0.25, 0.46, 0.45, 0.94],
        });
        prevValue.current = value;

        const unsubscribe = displayed.on('change', (v) => setDisplayText(v));
        return () => {
            controls.stop();
            unsubscribe();
        };
    }, [value, motionVal, displayed]);

    return (
        <Text
            as="span"
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight="bold"
            bgGradient="linear(to-r, #FDC51D, #FFE066, #FDC51D)"
            bgClip="text"
            letterSpacing="-0.02em"
            fontFamily="var(--font-poppins), monospace"
        >
            ${displayText}
        </Text>
    );
}

// --- Particle burst on withdraw ---

function CoinParticle({ index, total }: { index: number; total: number }) {
    const angle = (index / total) * 360;
    const distance = 40 + Math.random() * 30;
    const x = Math.cos((angle * Math.PI) / 180) * distance;
    const y = Math.sin((angle * Math.PI) / 180) * distance;

    return (
        <Box
            as={motion.div}
            position="absolute"
            w="6px"
            h="6px"
            borderRadius="full"
            bg="brand.yellow"
            top="50%"
            left="50%"
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
                x: [0, x],
                y: [0, y],
                opacity: [1, 0],
                scale: [1, 0.3],
            }}
            // @ts-expect-error -- framer-motion transition prop
            transition={{ duration: 0.6, ease: 'easeOut' }}
        />
    );
}

const HostRakeCard = () => {
    const wallet = useActiveWallet();
    const address = wallet?.getAccount()?.address;
    const { appState } = useContext(AppContext);
    const config = appState.game?.config;
    const isCryptoGame = Boolean(config?.crypto);
    const contractAddress = config?.contractAddress;
    const isOwner = useIsTableOwner();
    const { success, error: toastError } = useToastHelper();

    const {
        rakeBalance,
        rakeUsdcFormatted,
        status,
        error,
        isLoading,
        withdraw,
        refresh,
    } = useHostRake(contractAddress);

    const [showParticles, setShowParticles] = useState(false);
    const settlementStatus = appState.settlementStatus;

    const usdcValue =
        rakeBalance !== null ? Number(rakeBalance) / 10 ** USDC_DECIMALS : 0;
    const hasBalance = rakeBalance !== null && rakeBalance > BigInt(0);

    // Refresh rake balance when a hand settles successfully
    useEffect(() => {
        if (settlementStatus === 'success' && isCryptoGame) {
            // Small delay to let the contract state finalize
            const timer = setTimeout(() => refresh(), 2000);
            return () => clearTimeout(timer);
        }
    }, [settlementStatus, isCryptoGame, refresh]);

    // Don't render for non-crypto games or disconnected wallets.
    // Show for owners (even with 0 balance) OR anyone with a positive rake balance
    // (fallback in case the backend ownership check fails).
    if (!isCryptoGame || !address) return null;
    if (!isOwner && !hasBalance) return null;

    const handleWithdraw = async () => {
        const ok = await withdraw();
        if (ok) {
            setShowParticles(true);
            setTimeout(() => setShowParticles(false), 700);
            success(
                'Rake Withdrawn',
                'Your rake earnings have been transferred to your wallet.'
            );
        } else if (error) {
            toastError('Withdraw Failed', error);
        }
    };

    return (
        <Box
            position="relative"
            borderRadius={{ base: '16px', md: '20px' }}
            overflow="hidden"
            animation={hasBalance ? `${glowPulse} 3s ease-in-out infinite` : undefined}
        >
            {/* Background gradient layer */}
            <Box
                position="absolute"
                inset={0}
                bgGradient="linear(135deg, #0B1430 0%, #1a2550 40%, #0B1430 70%, #162040 100%)"
                zIndex={0}
            />

            {/* Shimmer overlay */}
            <Box
                position="absolute"
                inset={0}
                zIndex={1}
                opacity={0.5}
                bgImage="linear-gradient(90deg, transparent 0%, rgba(253, 197, 29, 0.04) 40%, rgba(253, 197, 29, 0.08) 50%, rgba(253, 197, 29, 0.04) 60%, transparent 100%)"
                bgSize="200% 100%"
                animation={`${shimmer} 4s linear infinite`}
                pointerEvents="none"
            />

            {/* Ambient light sweep */}
            <Box
                position="absolute"
                inset={0}
                zIndex={1}
                overflow="hidden"
                pointerEvents="none"
                _after={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    width: '30%',
                    height: '100%',
                    background:
                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
                    animation: `${subtleShine} 5s ease-in-out infinite`,
                }}
            />

            {/* Content */}
            <Flex
                position="relative"
                zIndex={2}
                direction="column"
                gap={{ base: 3, md: 4 }}
                px={{ base: 4, sm: 5, md: 6 }}
                py={{ base: 4, sm: 4.5, md: 5 }}
            >
                {/* Header row */}
                <Flex justify="space-between" align="center">
                    <HStack spacing={2}>
                        <Flex
                            align="center"
                            justify="center"
                            w={{ base: '28px', md: '32px' }}
                            h={{ base: '28px', md: '32px' }}
                            borderRadius="8px"
                            bg="rgba(253, 197, 29, 0.15)"
                            animation={`${coinFloat} 3s ease-in-out infinite`}
                        >
                            <Icon
                                as={GiTwoCoins}
                                color="brand.yellow"
                                boxSize={{ base: 4, md: 5 }}
                            />
                        </Flex>
                        <VStack spacing={0} align="flex-start">
                            <HStack spacing={1}>
                                <Icon
                                    as={FaCrown}
                                    color="brand.yellow"
                                    boxSize={{ base: 2.5, md: 3 }}
                                />
                                <Text
                                    fontSize={{ base: '2xs', md: 'xs' }}
                                    fontWeight="bold"
                                    color="brand.yellow"
                                    textTransform="uppercase"
                                    letterSpacing="0.12em"
                                >
                                    Host
                                </Text>
                            </HStack>
                            <Text
                                fontSize={{ base: 'xs', md: 'sm' }}
                                fontWeight="semibold"
                                color="whiteAlpha.800"
                                textTransform="uppercase"
                                letterSpacing="0.06em"
                            >
                                Rake Earnings
                            </Text>
                        </VStack>
                    </HStack>

                    {/* Withdraw button */}
                    <Box position="relative">
                        {showParticles &&
                            Array.from({ length: 12 }).map((_, i) => (
                                <CoinParticle key={i} index={i} total={12} />
                            ))}
                        <Button
                            size={{ base: 'sm', md: 'md' }}
                            px={{ base: 5, md: 6 }}
                            h={{ base: '36px', sm: '40px', md: '44px' }}
                            bg={
                                hasBalance
                                    ? 'linear-gradient(135deg, #FDC51D 0%, #B78900 100%)'
                                    : 'whiteAlpha.100'
                            }
                            color={hasBalance ? 'brand.darkNavy' : 'whiteAlpha.400'}
                            border="none"
                            borderRadius={{ base: '10px', md: '12px' }}
                            fontWeight="bold"
                            fontSize={{ base: 'xs', md: 'sm' }}
                            textTransform="uppercase"
                            letterSpacing="0.05em"
                            isDisabled={!hasBalance || isLoading}
                            isLoading={status === 'withdrawing'}
                            loadingText="Withdrawing..."
                            onClick={handleWithdraw}
                            flexShrink={0}
                            _disabled={{
                                bg: 'whiteAlpha.100',
                                color: 'whiteAlpha.400',
                                cursor: 'not-allowed',
                                opacity: 0.7,
                            }}
                            _hover={
                                hasBalance
                                    ? {
                                          transform: 'translateY(-2px)',
                                          boxShadow:
                                              '0 8px 24px rgba(253, 197, 29, 0.4)',
                                      }
                                    : {}
                            }
                            _active={{
                                transform: hasBalance ? 'translateY(0)' : 'none',
                            }}
                            transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                        >
                            Collect
                        </Button>
                    </Box>
                </Flex>

                {/* Balance display */}
                {isLoading && status === 'loading' ? (
                    <HStack spacing={2}>
                        <Spinner
                            size="sm"
                            color="brand.yellow"
                            thickness="2px"
                        />
                        <Text
                            fontSize="xs"
                            color="whiteAlpha.600"
                            fontWeight="medium"
                        >
                            Reading contract...
                        </Text>
                    </HStack>
                ) : (
                    <Flex align="baseline" gap={3}>
                        <AnimatedUsdcValue value={usdcValue} />
                        <HStack spacing={1.5}>
                            <Image
                                src={USDC_LOGO_URL}
                                alt="USDC"
                                boxSize="16px"
                                loading="lazy"
                            />
                            <Text
                                fontSize={{ base: 'xs', md: 'sm' }}
                                color="whiteAlpha.600"
                                fontWeight="medium"
                            >
                                USDC
                            </Text>
                        </HStack>
                    </Flex>
                )}

                {/* Error state */}
                {error && status === 'error' && (
                    <Text
                        fontSize="xs"
                        color="red.300"
                        fontWeight="medium"
                    >
                        {error}
                    </Text>
                )}

                {/* Footer line */}
                <Flex
                    justify="space-between"
                    align="center"
                    borderTop="1px solid"
                    borderColor="whiteAlpha.100"
                    pt={{ base: 2, md: 3 }}
                >
                    <Text
                        fontSize="2xs"
                        color="whiteAlpha.400"
                        lineHeight="short"
                    >
                        Rake accumulates each settled hand.
                    </Text>
                    {contractAddress && (
                        <Link
                            href={`https://sepolia.basescan.org/address/${contractAddress}`}
                            isExternal
                            fontSize="2xs"
                            color="brand.yellow"
                            fontWeight="semibold"
                            opacity={0.7}
                            _hover={{ opacity: 1, textDecoration: 'underline' }}
                            textUnderlineOffset="2px"
                            flexShrink={0}
                        >
                            View contract
                        </Link>
                    )}
                </Flex>
            </Flex>
        </Box>
    );
};

export default HostRakeCard;
