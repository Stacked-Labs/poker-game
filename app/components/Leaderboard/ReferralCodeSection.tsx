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
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';
import { FiCopy, FiUserPlus, FiZap } from 'react-icons/fi';
import { useActiveAccount } from 'thirdweb/react';
import useToastHelper from '@/app/hooks/useToastHelper';
import { friendlyMessage } from '@/app/utils/toastErrors';
import { registerReferral, setMyReferralCode } from '@/app/hooks/server_actions';
import { SocialIconButton } from '@/app/components/SocialIconButton';
import TooltipOrPopover from '@/app/components/TooltipOrPopover';

const MotionBox = motion(Box);
const X_HANDLE = 'stacked_poker';

interface ReferralInfo {
    count: number;
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
    const [showSetCode, setShowSetCode] = useState(false);
    const [localCode, setLocalCode] = useState<string | null>(null);
    const toast = useToastHelper();

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
                setShowSetCode(false);
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
                            {info.count} invited
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
                    {!showSetCode ? (
                        <Button
                            onClick={() => setShowSetCode(true)}
                            variant="tactileOutline"
                            size="sm"
                            isDisabled={referralLoading}
                            _focusVisible={{ boxShadow: 'focus.ring' }}
                        >
                            {referralLoading ? '…' : 'Set your referral code'}
                        </Button>
                    ) : (
                        <>
                            <HStack
                                bg="bg.pillNeutral"
                                borderRadius="10px"
                                px={3}
                                py={1}
                                spacing={2}
                            >
                                <Input
                                    variant="unstyled"
                                    placeholder="pick a code"
                                    value={codeInput}
                                    onChange={(e) => setCodeInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                    fontFamily="mono"
                                    fontSize="sm"
                                    maxLength={20}
                                    _placeholder={{ color: 'text.muted' }}
                                />
                                <Button
                                    onClick={handleSetCode}
                                    variant="tactilePrimary"
                                    size="sm"
                                    isDisabled={!codeInput.trim() || settingCode}
                                    isLoading={settingCode}
                                    _focusVisible={{ boxShadow: 'focus.ring' }}
                                >
                                    Set
                                </Button>
                            </HStack>
                            <Text fontSize="2xs" color="text.muted">
                                3–20 chars · letters, numbers, _ or - · set once, permanent
                            </Text>
                        </>
                    )}
                </VStack>
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

export default ReferralCodeSection;
