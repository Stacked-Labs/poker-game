'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Text,
    HStack,
    VStack,
    Icon,
    Input,
    Progress,
    Link,
    Divider,
} from '@chakra-ui/react';
import { FaCheck, FaGift } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import { useActiveAccount } from 'thirdweb/react';
import useToastHelper from '@/app/hooks/useToastHelper';
import { friendlyMessage } from '@/app/utils/toastErrors';
import {
    registerReferral,
    setMyReferralCode,
    getReferralStats,
} from '@/app/hooks/server_actions';

const MotionBox = motion(Box);

interface ReferralInfo {
    count: number;
    // Invited = friends linked to you; activated = those who took a real-money action (§4).
    invited?: number;
    activated?: number;
    multiplier: number;
    nextTier: { required: number; multiplier: number } | null;
    hasReferrer?: boolean;
    myCode?: string | null;
}

interface ReferralCodeSectionProps {
    referralInfo?: ReferralInfo;
    initialReferralCode?: string;
}

const ReferralCodeSection: React.FC<ReferralCodeSectionProps> = ({ referralInfo, initialReferralCode }) => {
    const account = useActiveAccount();
    const [copied, setCopied] = useState(false);
    const [referralInput, setReferralInput] = useState(initialReferralCode ?? '');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [showReferralInput, setShowReferralInput] = useState(!!initialReferralCode);
    const [codeInput, setCodeInput] = useState('');
    const [settingCode, setSettingCode] = useState(false);
    const [showSetCode, setShowSetCode] = useState(false);
    const [localCode, setLocalCode] = useState<string | null>(null);
    // Invited-vs-Activated tracking + Most Referrals board position (§4 / #356).
    const [tracking, setTracking] = useState<{
        invited: number;
        activated: number;
        boardRank: number | null;
    } | null>(null);
    const toast = useToastHelper();

    useEffect(() => {
        let cancelled = false;
        if (!account?.address) {
            setTracking(null);
            return;
        }
        getReferralStats(account.address).then((s) => {
            if (!cancelled) {
                setTracking({
                    invited: s.invited,
                    activated: s.activated,
                    boardRank: s.board_rank,
                });
            }
        });
        return () => {
            cancelled = true;
        };
    }, [account?.address]);

    // If a code arrives via URL param after mount, open the input automatically
    useEffect(() => {
        if (initialReferralCode && !referralInput) {
            setReferralInput(initialReferralCode);
            setShowReferralInput(true);
        }
    }, [initialReferralCode]); // eslint-disable-line react-hooks/exhaustive-deps

    const referralLoading = referralInfo === undefined;
    const info = referralInfo ?? { count: 0, multiplier: 1.0, nextTier: { required: 5, multiplier: 1.1 }, hasReferrer: false, myCode: null };
    const alreadyReferred = info.hasReferrer || submitted;
    const myCode = localCode ?? info.myCode ?? null;

    const handleCopy = async () => {
         if (!myCode) return;
        const origin =
            typeof window !== 'undefined' && window.location?.origin
                ? window.location.origin
                : 'https://stackedpoker.io';
        const referralUrl = `${origin}/leaderboard?referralCode=${encodeURIComponent(myCode)}`;
        try {
            await navigator.clipboard.writeText(referralUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Could not copy', 'Failed to copy your referral link.');
        }
    };

    const handleSetCode = async () => {
        const code = codeInput.trim();
        if (!code || !account?.address) return;
        setSettingCode(true);
        try {
            const result = await setMyReferralCode(code);
            if (result.success) {
                toast.success('Code set', 'Your referral code is ready to share.');
                setLocalCode(code);
                setShowSetCode(false);
            } else {
                const { title, description } = friendlyMessage(result.message, {
                    title: 'Could not set code',
                    description: 'Please try a different code.',
                });
                toast.error(title, description);
            }
        } catch {
            toast.error('Could not set code', 'Please try again.');
        } finally {
            setSettingCode(false);
        }
    };

    const handleSubmitReferral = async () => {
        const code = referralInput.trim();
        if (!code || !account?.address) return;
        setSubmitting(true);
        try {
            const result = await registerReferral(code);
            if (result.success) {
                toast.success('Referral registered', 'Your bonus is now active.');
                setSubmitted(true);
            } else {
                const { title, description } = friendlyMessage(result.message, {
                    title: 'Referral failed',
                    description: 'Check the code and try again.',
                });
                toast.error(title, description);
            }
        } catch {
            toast.error('Referral failed', 'Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const nextTarget = info.nextTier?.required ?? info.count;
    const progressPercent = nextTarget > 0 ? Math.min((info.count / nextTarget) * 100, 100) : 100;

    // Invited vs Activated (§4): prefer the live tracking fetch, fall back to the passed referral
    // info, then to the legacy activated `count`. Activated never exceeds invited.
    const activatedCount = tracking?.activated ?? info.activated ?? info.count;
    const invitedCount = Math.max(tracking?.invited ?? info.invited ?? activatedCount, activatedCount);
    const boardRank = tracking?.boardRank ?? null;
    const hasReferred = invitedCount > 0 || activatedCount > 0;

    return (
        <VStack spacing={3} width="100%" align="stretch">
            {/* My referral code — or "claim your code" */}
            <HStack
                spacing={2}
                justify="center"
                align="center"
                border="1.5px dashed"
                borderColor="border.lightGray"
                _dark={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}
                borderRadius="12px"
                py={3}
                px={4}
            >
                <Icon as={FaGift} color="text.secondary" boxSize={3} flexShrink={0} />

                {myCode ? (
                    <>
                        <Text
                            color="text.primary"
                            fontFamily="mono"
                            fontSize="sm"
                            fontWeight={600}
                            data-testid="referral-code"
                            flex={1}
                            textAlign="center"
                        >
                            {myCode}
                        </Text>
                        <Text
                            as="button"
                            onClick={handleCopy}
                            data-testid="copy-referral"
                            fontSize="xs"
                            color={copied ? 'brand.green' : 'text.secondary'}
                            fontWeight="medium"
                            textDecoration="underline"
                            textDecorationColor={copied ? 'brand.green' : 'border.lightGray'}
                            textUnderlineOffset="3px"
                            cursor="pointer"
                            transition="all 0.2s ease"
                            _hover={{ color: 'brand.green' }}
                            flexShrink={0}
                        >
                            {copied ? (
                                <HStack spacing={1} as="span" display="inline-flex">
                                    <Icon as={FaCheck} boxSize="10px" />
                                    <span>Copied</span>
                                </HStack>
                            ) : (
                                'Copy'
                            )}
                        </Text>
                    </>
                ) : (
                    <Text
                        as="button"
                        onClick={() => setShowSetCode(!showSetCode)}
                        fontSize="xs"
                        color="text.secondary"
                        textDecoration="underline"
                        textDecorationColor="border.lightGray"
                        textUnderlineOffset="3px"
                        cursor="pointer"
                        transition="color 0.2s ease"
                        _hover={{ color: 'brand.green' }}
                        flex={1}
                        textAlign="center"
                    >
                        {referralLoading ? '…' : 'Set your referral code'}
                    </Text>
                )}
            </HStack>

            {/* Set code input — collapsible, only shown when no code yet */}
            {!myCode && !referralLoading && (
                <AnimatePresence>
                    {showSetCode && (
                        <MotionBox
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            overflow="hidden"
                        >
                            <HStack
                                spacing={0}
                                border="1.5px dashed"
                                borderColor="border.lightGray"
                                _dark={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}
                                borderRadius="12px"
                                px={3}
                                py={2}
                            >
                                <Input
                                    variant="unstyled"
                                    placeholder="pick a code"
                                    value={codeInput}
                                    onChange={(e) => setCodeInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                    fontFamily="mono"
                                    fontSize="xs"
                                    flex={1}
                                    maxLength={20}
                                    _placeholder={{ color: 'text.secondary', opacity: 0.5 }}
                                />
                                <Text
                                    as="button"
                                    onClick={handleSetCode}
                                    fontSize="xs"
                                    fontWeight="bold"
                                    color={!codeInput.trim() || settingCode ? 'text.secondary' : 'brand.green'}
                                    opacity={!codeInput.trim() || settingCode ? 0.4 : 1}
                                    cursor={!codeInput.trim() || settingCode ? 'default' : 'pointer'}
                                    transition="all 0.2s ease"
                                    _hover={!codeInput.trim() || settingCode ? {} : { opacity: 0.7 }}
                                    flexShrink={0}
                                    ml={2}
                                >
                                    {settingCode ? '...' : 'Set'}
                                </Text>
                            </HStack>
                            <Text fontSize="2xs" color="text.secondary" mt={1} px={1}>
                                3–20 chars · letters, numbers, _ or - · set once, permanent
                            </Text>
                        </MotionBox>
                    )}
                </AnimatePresence>
            )}

            {/* Multiplier info */}
            {!referralLoading && (
                <VStack spacing={1.5} align="stretch">
                    {info.multiplier > 1 && (
                        <Text fontSize="xs" color="brand.green" fontWeight="semibold" textAlign="center">
                            {info.nextTier
                                ? `${info.multiplier}x bonus active`
                                : `Max bonus active: ${info.multiplier}x on all points!`}
                        </Text>
                    )}

                    {info.nextTier && (
                        <VStack spacing={1} align="stretch">
                            <HStack justify="space-between">
                                <Text fontSize="2xs" color="text.secondary">
                                    {info.count}/{info.nextTier.required} referrals
                                </Text>
                                <Text
                                    fontSize="2xs"
                                    fontWeight="bold"
                                    color="brand.green"
                                    bg="rgba(54, 163, 123, 0.08)"
                                    _dark={{ bg: 'rgba(54, 163, 123, 0.15)' }}
                                    px={2}
                                    py={0.5}
                                    borderRadius="full"
                                >
                                    → {info.nextTier.multiplier}x
                                </Text>
                            </HStack>
                            <Progress
                                value={progressPercent}
                                size="xs"
                                borderRadius="full"
                                bg="border.lightGray"
                                sx={{ '& > div': { bg: 'brand.green', borderRadius: 'full' } }}
                            />
                        </VStack>
                    )}
                </VStack>
            )}

            {/* Your referrals — Invited vs Activated + Most Referrals board (§4 / #356) */}
            {!referralLoading && hasReferred && (
                <Box
                    border="1px solid"
                    borderColor="border.lightGray"
                    _dark={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}
                    borderRadius="12px"
                    px={3}
                    py={2.5}
                >
                    <HStack spacing={3} justify="center" align="center" flexWrap="wrap">
                        <Stat label="Invited" value={invitedCount} />
                        <Divider orientation="vertical" h="20px" />
                        <Stat label="Activated" value={activatedCount} accent />
                        <Divider orientation="vertical" h="20px" />
                        <Stat label="Multiplier" value={`${info.multiplier}x`} />
                    </HStack>
                    <Text fontSize="2xs" color="text.secondary" textAlign="center" mt={1.5}>
                        “Activated” = a friend who bought in or re-bought for real
                    </Text>
                    {boardRank != null && (
                        <Link
                            href="/leaderboard?board=referrals"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            gap={1}
                            mt={1.5}
                            fontSize="xs"
                            fontWeight={600}
                            color="brand.green"
                            _hover={{ textDecoration: 'underline' }}
                        >
                            You’re #{boardRank} on the Most Referrals board
                            <Icon as={FiArrowRight} boxSize="11px" />
                        </Link>
                    )}
                </Box>
            )}

            {/* Enter a friend's referral code — collapsible */}
            {!referralLoading && !alreadyReferred && (
                <Box>
                    <Text
                        as="button"
                        onClick={() => setShowReferralInput(!showReferralInput)}
                        fontSize="xs"
                        color="text.secondary"
                        textDecoration="underline"
                        textDecorationColor="border.lightGray"
                        textUnderlineOffset="3px"
                        cursor="pointer"
                        display="block"
                        mx="auto"
                        transition="color 0.2s ease"
                        _hover={{ color: 'brand.green' }}
                    >
                        Have a referral code?
                    </Text>

                    <AnimatePresence>
                        {showReferralInput && (
                            <MotionBox
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                overflow="hidden"
                            >
                                <HStack
                                    spacing={0}
                                    mt={3}
                                    border="1.5px dashed"
                                    borderColor="border.lightGray"
                                    _dark={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}
                                    borderRadius="12px"
                                    px={3}
                                    py={2}
                                >
                                    <Input
                                        variant="unstyled"
                                        placeholder="Enter code"
                                        value={referralInput}
                                        onChange={(e) => setReferralInput(e.target.value)}
                                        fontFamily="mono"
                                        fontSize="xs"
                                        flex={1}
                                        _placeholder={{ color: 'text.secondary', opacity: 0.5 }}
                                    />
                                    <Text
                                        as="button"
                                        onClick={handleSubmitReferral}
                                        fontSize="xs"
                                        fontWeight="bold"
                                        color={!referralInput.trim() || !account?.address ? 'text.secondary' : 'brand.green'}
                                        opacity={!referralInput.trim() || !account?.address ? 0.4 : 1}
                                        cursor={!referralInput.trim() || !account?.address ? 'default' : 'pointer'}
                                        transition="all 0.2s ease"
                                        _hover={!referralInput.trim() || !account?.address ? {} : { opacity: 0.7 }}
                                        flexShrink={0}
                                        ml={2}
                                    >
                                        {submitting ? '...' : 'Apply'}
                                    </Text>
                                </HStack>
                            </MotionBox>
                        )}
                    </AnimatePresence>
                </Box>
            )}

            {/* Already referred confirmation */}
            {!referralLoading && alreadyReferred && (
                <HStack justify="center" spacing={1.5}>
                    <Icon as={FaCheck} color="brand.green" boxSize={3} />
                    <Text fontSize="xs" color="brand.green" fontWeight="medium">
                        Referral code applied
                    </Text>
                </HStack>
            )}
        </VStack>
    );
};

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
    return (
        <VStack spacing={0} align="center" minW="56px">
            <Text
                fontSize="md"
                fontWeight={800}
                lineHeight={1.1}
                color={accent ? 'brand.green' : 'text.primary'}
                sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
                {value}
            </Text>
            <Text fontSize="2xs" color="text.secondary" textTransform="uppercase" letterSpacing="0.04em">
                {label}
            </Text>
        </VStack>
    );
}

export default ReferralCodeSection;
