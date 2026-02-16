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
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Spinner,
    Text,
    VStack,
    useDisclosure,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { FaCrown } from 'react-icons/fa';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { useHostRake } from '@/app/hooks/useHostRake';
import { useActiveWallet } from 'thirdweb/react';
import useToastHelper from '@/app/hooks/useToastHelper';

const USDC_LOGO_URL = 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png';
const USDC_DECIMALS = 6;

// --- Keyframes ---

const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

const glowPulse = keyframes`
    0%, 100% { box-shadow: 0 0 8px rgba(253, 197, 29, 0.2), 0 0 20px rgba(253, 197, 29, 0.05); }
    50% { box-shadow: 0 0 14px rgba(253, 197, 29, 0.4), 0 0 30px rgba(253, 197, 29, 0.1); }
`;

const pillEntry = keyframes`
    from { opacity: 0; transform: translateY(8px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
`;

// --- Animated counter ---

function RollingValue({ value }: { value: number }) {
    const motionVal = useMotionValue(0);
    const displayed = useTransform(motionVal, (v) =>
        v.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    );
    const prevValue = useRef(0);
    const [text, setText] = useState('0.00');

    useEffect(() => {
        const controls = animate(motionVal, value, {
            duration: Math.min(2, Math.max(0.6, Math.abs(value - prevValue.current) * 0.8)),
            ease: [0.25, 0.46, 0.45, 0.94],
        });
        prevValue.current = value;
        const unsub = displayed.on('change', (v) => setText(v));
        return () => {
            controls.stop();
            unsub();
        };
    }, [value, motionVal, displayed]);

    return <>{text}</>;
}

// --- Particle burst ---

function Particle({ index, total }: { index: number; total: number }) {
    const angle = (index / total) * 360;
    const dist = 30 + Math.random() * 20;
    const x = Math.cos((angle * Math.PI) / 180) * dist;
    const y = Math.sin((angle * Math.PI) / 180) * dist;

    return (
        <Box
            as={motion.div}
            position="absolute"
            w="4px"
            h="4px"
            borderRadius="full"
            bg="brand.yellow"
            top="50%"
            left="50%"
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: [0, x], y: [0, y], opacity: [1, 0], scale: [1, 0.2] }}
            // @ts-expect-error -- framer-motion transition prop
            transition={{ duration: 0.5, ease: 'easeOut' }}
        />
    );
}

// --- Main component ---

const HostRakePill = () => {
    const wallet = useActiveWallet();
    const address = wallet?.getAccount()?.address;
    const { appState } = useContext(AppContext);
    const config = appState.game?.config;
    const isCryptoGame = Boolean(config?.crypto);
    const contractAddress = config?.contractAddress;
    const settlementStatus = appState.settlementStatus;
    const { success, error: toastError } = useToastHelper();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const {
        rakeBalance,
        status,
        error,
        isLoading,
        withdraw,
        refresh,
    } = useHostRake(contractAddress);

    const [showParticles, setShowParticles] = useState(false);

    const usdcValue =
        rakeBalance !== null ? Number(rakeBalance) / 10 ** USDC_DECIMALS : 0;
    const hasBalance = rakeBalance !== null && rakeBalance > BigInt(0);

    // Refresh when settlement completes
    useEffect(() => {
        if (settlementStatus === 'success' && isCryptoGame) {
            const timer = setTimeout(() => refresh(), 2000);
            return () => clearTimeout(timer);
        }
    }, [settlementStatus, isCryptoGame, refresh]);

    // Don't render for non-crypto games, no wallet, or no rake to show
    if (!isCryptoGame || !address) return null;
    if (!hasBalance && status !== 'loading') return null;

    const handleWithdraw = async () => {
        const ok = await withdraw();
        if (ok) {
            setShowParticles(true);
            setTimeout(() => setShowParticles(false), 600);
            success(
                'Rake Collected',
                'Your rake earnings have been transferred to your wallet.'
            );
            onClose();
        } else if (error) {
            toastError('Withdraw Failed', error);
        }
    };

    return (
        <Box
            position="absolute"
            bottom={{ base: 'calc(100% + 4px)', md: 'calc(100% + 8px)' }}
            right={0}
            px={{ base: 2, md: 4 }}
            zIndex={2}
            animation={`${pillEntry} 0.5s ease-out`}
        >
            <Popover
                isOpen={isOpen}
                onOpen={onOpen}
                onClose={onClose}
                placement="top-end"
                isLazy
            >
                <PopoverTrigger>
                    <Box
                        as="button"
                        position="relative"
                        display="flex"
                        alignItems="center"
                        gap={{ base: 1.5, md: 2 }}
                        px={{ base: 2.5, md: 3 }}
                        py={{ base: 1.5, md: 2 }}
                        borderRadius="full"
                        bg="brand.darkNavy"
                        border="1px solid"
                        borderColor="rgba(253, 197, 29, 0.25)"
                        cursor="pointer"
                        animation={hasBalance ? `${glowPulse} 3s ease-in-out infinite` : undefined}
                        transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                        _hover={{
                            transform: 'translateY(-2px)',
                            borderColor: 'rgba(253, 197, 29, 0.5)',
                        }}
                        _active={{ transform: 'translateY(0)' }}
                        overflow="hidden"
                    >
                        {/* Shimmer sweep */}
                        <Box
                            position="absolute"
                            inset={0}
                            borderRadius="full"
                            opacity={0.4}
                            bgImage="linear-gradient(90deg, transparent 0%, rgba(253, 197, 29, 0.06) 40%, rgba(253, 197, 29, 0.12) 50%, rgba(253, 197, 29, 0.06) 60%, transparent 100%)"
                            bgSize="200% 100%"
                            animation={`${shimmer} 3s linear infinite`}
                            pointerEvents="none"
                        />

                        {/* Crown icon */}
                        <Icon
                            as={FaCrown}
                            color="brand.yellow"
                            boxSize={{ base: 3, md: 3.5 }}
                            position="relative"
                        />

                        {/* Amount */}
                        {isLoading && status === 'loading' ? (
                            <Spinner size="xs" color="brand.yellow" thickness="2px" />
                        ) : (
                            <Text
                                position="relative"
                                fontSize={{ base: 'xs', md: 'sm' }}
                                fontWeight="bold"
                                bgGradient="linear(to-r, #FDC51D, #FFE066)"
                                bgClip="text"
                                fontFamily="var(--font-poppins), monospace"
                                lineHeight={1}
                            >
                                $<RollingValue value={usdcValue} />
                            </Text>
                        )}

                        {/* RAKE label */}
                        <Text
                            position="relative"
                            fontSize={{ base: '2xs', md: 'xs' }}
                            fontWeight="bold"
                            color="whiteAlpha.500"
                            textTransform="uppercase"
                            letterSpacing="0.08em"
                            lineHeight={1}
                        >
                            Rake
                        </Text>
                    </Box>
                </PopoverTrigger>

                <PopoverContent
                    bg="brand.darkNavy"
                    border="1px solid"
                    borderColor="rgba(253, 197, 29, 0.2)"
                    borderRadius="16px"
                    boxShadow="0 12px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(253, 197, 29, 0.08)"
                    width={{ base: '260px', md: '280px' }}
                    _focus={{ outline: 'none' }}
                >
                    <PopoverArrow bg="brand.darkNavy" />
                    <PopoverBody p={{ base: 4, md: 5 }}>
                        <VStack spacing={3} align="stretch">
                            {/* Header */}
                            <HStack spacing={2}>
                                <Icon
                                    as={FaCrown}
                                    color="brand.yellow"
                                    boxSize={4}
                                />
                                <Text
                                    fontSize="xs"
                                    fontWeight="bold"
                                    color="brand.yellow"
                                    textTransform="uppercase"
                                    letterSpacing="0.1em"
                                >
                                    Host Rake Earnings
                                </Text>
                            </HStack>

                            {/* Balance */}
                            <Flex align="baseline" gap={2}>
                                <Text
                                    fontSize={{ base: 'xl', md: '2xl' }}
                                    fontWeight="bold"
                                    bgGradient="linear(to-r, #FDC51D, #FFE066, #FDC51D)"
                                    bgClip="text"
                                    fontFamily="var(--font-poppins), monospace"
                                >
                                    $<RollingValue value={usdcValue} />
                                </Text>
                                <HStack spacing={1}>
                                    <Image
                                        src={USDC_LOGO_URL}
                                        alt="USDC"
                                        boxSize="14px"
                                        loading="lazy"
                                    />
                                    <Text
                                        fontSize="xs"
                                        color="whiteAlpha.500"
                                        fontWeight="medium"
                                    >
                                        USDC
                                    </Text>
                                </HStack>
                            </Flex>

                            {/* Error */}
                            {error && status === 'error' && (
                                <Text fontSize="xs" color="red.300">
                                    {error}
                                </Text>
                            )}

                            {/* Collect button */}
                            <Box position="relative">
                                {showParticles &&
                                    Array.from({ length: 10 }).map((_, i) => (
                                        <Particle key={i} index={i} total={10} />
                                    ))}
                                <Button
                                    w="100%"
                                    h="40px"
                                    bg={
                                        hasBalance
                                            ? 'linear-gradient(135deg, #FDC51D 0%, #B78900 100%)'
                                            : 'whiteAlpha.100'
                                    }
                                    color={hasBalance ? 'brand.darkNavy' : 'whiteAlpha.400'}
                                    border="none"
                                    borderRadius="10px"
                                    fontWeight="bold"
                                    fontSize="sm"
                                    textTransform="uppercase"
                                    letterSpacing="0.05em"
                                    isDisabled={!hasBalance || isLoading}
                                    isLoading={status === 'withdrawing'}
                                    loadingText="Collecting..."
                                    onClick={handleWithdraw}
                                    _disabled={{
                                        bg: 'whiteAlpha.100',
                                        color: 'whiteAlpha.400',
                                        cursor: 'not-allowed',
                                        opacity: 0.7,
                                    }}
                                    _hover={
                                        hasBalance
                                            ? {
                                                  transform: 'translateY(-1px)',
                                                  boxShadow: '0 6px 20px rgba(253, 197, 29, 0.4)',
                                              }
                                            : {}
                                    }
                                    _active={{
                                        transform: hasBalance ? 'translateY(0)' : 'none',
                                    }}
                                    transition="all 0.2s ease"
                                >
                                    Collect Rake
                                </Button>
                            </Box>

                            {/* Footer */}
                            <Flex justify="space-between" align="center">
                                <Text
                                    fontSize="2xs"
                                    color="whiteAlpha.300"
                                    lineHeight="short"
                                >
                                    Accumulates each hand
                                </Text>
                                {contractAddress && (
                                    <Link
                                        href={`https://sepolia.basescan.org/address/${contractAddress}`}
                                        isExternal
                                        fontSize="2xs"
                                        color="brand.yellow"
                                        fontWeight="semibold"
                                        opacity={0.5}
                                        _hover={{ opacity: 1, textDecoration: 'underline' }}
                                        textUnderlineOffset="2px"
                                    >
                                        Contract
                                    </Link>
                                )}
                            </Flex>
                        </VStack>
                    </PopoverBody>
                </PopoverContent>
            </Popover>
        </Box>
    );
};

export default HostRakePill;
