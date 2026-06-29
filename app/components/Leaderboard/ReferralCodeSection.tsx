'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    Input,
    Link,
    Progress,
    Text,
    VStack,
    Divider,
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';
import { FiArrowRight, FiCopy, FiUserPlus, FiZap } from 'react-icons/fi';
import { useActiveAccount } from 'thirdweb/react';
import useToastHelper from '@/app/hooks/useToastHelper';
import { friendlyMessage } from '@/app/utils/toastErrors';
import { registerReferral, setMyReferralCode, getReferralStats } from '@/app/hooks/server_actions';
import { SocialIconButton } from '@/app/components/SocialIconButton';
import TooltipOrPopover from '@/app/components/TooltipOrPopover';

const MotionBox = motion(Box);
const X_HANDLE = 'stacked_poker';

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
    /** Render without the card panel (e.g. nested inside the leaderboard PlayerCard). */
    bare?: boolean;
}

const ReferralCodeSection: React.FC<ReferralCodeSectionProps> = ({ referralInfo, initialReferralCode, bare }) => {
    const account = useActiveAccount();
    const [copied, setCopied] = useState(false);
    const [referralInput, setReferralInput] = useState(initialReferralCode ?? '');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [showReferralInput, setShowReferralInput] = useState(!!initialReferralCode);
    const [codeInput, setCodeInput] = useState('');
    const [settingCode, setSettingCode] = useState(false);
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

    const origin =
        typeof window !== 'undefined' && window.location?.origin
            ? window.location.origin
            : 'https://stackedpoker.io';
    const refUrl = myCode
        ? `${origin}/leaderboard?referralCode=${encodeURIComponent(myCode)}`
        : origin;
    const shareText = 'Join me on Stacked. Onchain poker on Base.';
    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(refUrl)}&via=${X_HANDLE}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(refUrl)}&text=${encodeURIComponent(shareText)}`;

    const handleCopy = async () => {
        if (!myCode) return;
        try {
            await navigator.clipboard.writeText(refUrl);
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
            } else {
                const { title, description } = friendlyMessage(result.message, { title: 'Could not set code', description: 'Please try a different code.' });
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
                const { title, description } = friendlyMessage(result.message, { title: 'Referral failed', description: 'Check the code and try again.' });
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

    const panelProps = bare
        ? { w: 'full' as const }
        : {
              bg: 'card.white',
              border: '1px solid',
              borderColor: 'border.felt',
              borderRadius: '20px',
              p: { base: 4, md: 5 },
              h: 'full',
          };

    return (
        <Box {...panelProps}>
            <Flex justify="space-between" align="center" mb={3} gap={2} flexWrap="wrap">
                <HStack spacing={2}>
                    <Text as="h2" fontSize="sm" fontWeight={800} color="text.primary">
                        Invite players
                    </Text>
                    <HStack bg="bg.pillNeutral" borderRadius="full" px={2} py={0.5} spacing={1}>
                        <Icon as={FiUserPlus} color="text.secondary" boxSize="11px" aria-hidden />
                        <Text fontSize="2xs" fontWeight={700} color="text.secondary">
                            {invitedCount} invited
                        </Text>
                    </HStack>
                </HStack>
                {!referralLoading && info.multiplier > 1 && (
                    <TooltipOrPopover
                        label="Your multiplier boosts every point you earn — play, host, quests, all of it. It's status, not money. Invite more friends to raise it."
                        aria-label="About your multiplier"
                    >
                        <HStack bg="bg.greenTint" borderRadius="full" px={2.5} py={1} spacing={1}>
                            <Icon as={FiZap} color="brand.green" boxSize="11px" aria-hidden />
                            <Text fontSize="2xs" fontWeight={800} color="brand.green">
                                {info.multiplier}x points
                            </Text>
                        </HStack>
                    </TooltipOrPopover>
                )}
            </Flex>

            <Text fontSize="xs" color="text.secondary" mb={3}>
                Friends who join with your code climb with you.
            </Text>

            {myCode ? (
                <VStack align="stretch" spacing={3}>
                    {/* Share-first: the viral act is the share, not the multiplier. */}
                    <HStack spacing={2}>
                        <Button
                            onClick={handleCopy}
                            variant="tactilePrimary"
                            flex={1}
                            leftIcon={<Icon as={copied ? FaCheck : FiCopy} />}
                            _focusVisible={{ boxShadow: 'focus.ring' }}
                        >
                            {copied ? 'Copied' : 'Copy invite link'}
                        </Button>
                        <Link href={tweetUrl} isExternal _hover={{ textDecoration: 'none' }}>
                            <SocialIconButton tone="x" tabIndex={-1} aria-label="Share on X" />
                        </Link>
                        <Link href={telegramUrl} isExternal _hover={{ textDecoration: 'none' }}>
                            <SocialIconButton tone="telegram" tabIndex={-1} aria-label="Share on Telegram" />
                        </Link>
                    </HStack>

                    <HStack bg="bg.pillNeutral" borderRadius="10px" px={3} py={2} justify="space-between">
                        <Text fontFamily="mono" fontSize="sm" fontWeight={600} color="text.primary" data-testid="referral-code" noOfLines={1}>
                            {myCode}
                        </Text>
                        <Text fontSize="2xs" color="text.muted">
                            your code
                        </Text>
                    </HStack>

                    {info.nextTier && (
                        <Box>
                            <HStack justify="space-between" mb={1}>
                                <Text fontSize="2xs" color="text.secondary">
                                    {info.count}/{info.nextTier.required} to {info.nextTier.multiplier}x
                                </Text>
                            </HStack>
                            <Progress
                                value={progressPercent}
                                size="xs"
                                borderRadius="full"
                                bg="border.lightGray"
                                sx={{ '& > div': { bg: 'brand.green', borderRadius: 'full' } }}
                            />
                        </Box>
                    )}
                </VStack>
            ) : (
                <VStack align="stretch" spacing={2}>
                    <HStack spacing={2} align="stretch">
                        <Input
                            variant="unstyled"
                            placeholder="claim your code"
                            value={codeInput}
                            onChange={(e) => setCodeInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                            isDisabled={referralLoading}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSetCode(); }}
                            flex={1}
                            minW={0}
                            h="42px"
                            px={3.5}
                            bg="bg.pillNeutral"
                            border="1px solid"
                            borderColor="border.felt"
                            borderRadius="11px"
                            fontFamily="mono"
                            fontSize="sm"
                            fontWeight={600}
                            color="text.primary"
                            maxLength={20}
                            _placeholder={{ color: 'text.muted', fontWeight: 500 }}
                            _hover={{ borderColor: 'border.pillNeutral' }}
                            _focus={{ borderColor: 'brand.green', boxShadow: 'focus.ring' }}
                        />
                        <Button
                            onClick={handleSetCode}
                            variant="tactilePrimary"
                            h="42px"
                            px={5}
                            flexShrink={0}
                            isDisabled={!codeInput.trim() || settingCode || referralLoading}
                            isLoading={settingCode}
                            _focusVisible={{ boxShadow: 'focus.ring' }}
                        >
                            Set
                        </Button>
                    </HStack>
                    <Text fontSize="2xs" color="text.muted">
                        3–20 chars · letters, numbers, _ or - · set once, permanent
                    </Text>
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
                    mt={3}
                >
                    <HStack spacing={3} justify="center" align="center" flexWrap="wrap">
                        <Stat label="Invited" value={invitedCount} />
                        <Divider orientation="vertical" h="20px" />
                        <Stat label="Activated" value={activatedCount} accent />
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

            {/* Enter a friend's code */}
            {!referralLoading && !alreadyReferred && (
                <Box mt={3}>
                    <Button
                        onClick={() => setShowReferralInput(!showReferralInput)}
                        variant="tactileGhost"
                        size="sm"
                        _focusVisible={{ boxShadow: 'focus.ring' }}
                    >
                        Have a referral code?
                    </Button>
                    <AnimatePresence>
                        {showReferralInput && (
                            <MotionBox
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                overflow="hidden"
                            >
                                <HStack bg="bg.pillNeutral" borderRadius="10px" px={3} py={1} spacing={2} mt={2}>
                                    <Input
                                        variant="unstyled"
                                        placeholder="Enter code"
                                        value={referralInput}
                                        onChange={(e) => setReferralInput(e.target.value)}
                                        fontFamily="mono"
                                        fontSize="sm"
                                        _placeholder={{ color: 'text.muted' }}
                                    />
                                    <Button
                                        onClick={handleSubmitReferral}
                                        variant="tactilePrimary"
                                        size="sm"
                                        isDisabled={!referralInput.trim() || !account?.address || submitting}
                                        isLoading={submitting}
                                        _focusVisible={{ boxShadow: 'focus.ring' }}
                                    >
                                        Apply
                                    </Button>
                                </HStack>
                            </MotionBox>
                        )}
                    </AnimatePresence>
                </Box>
            )}

            {!referralLoading && alreadyReferred && (
                <HStack mt={3} spacing={1.5}>
                    <Icon as={FaCheck} color="brand.green" boxSize={3} />
                    <Text fontSize="xs" color="brand.green" fontWeight="medium">
                        Referral code applied
                    </Text>
                </HStack>
            )}
        </Box>
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
