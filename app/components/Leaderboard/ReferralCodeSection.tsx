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
} from '@chakra-ui/react';
import { FaCheck, FaGift } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import { useActiveAccount } from 'thirdweb/react';
import useToastHelper from '@/app/hooks/useToastHelper';
import { registerReferral, setMyReferralCode } from '@/app/hooks/server_actions';

const MotionBox = motion(Box);

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
    const toast = useToastHelper();

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
            toast.error('Error', 'Failed to copy referral link', 2000);
        }
    };

    const handleSetCode = async () => {
        const code = codeInput.trim();
        if (!code || !account?.address) return;
        setSettingCode(true);
        try {
            const result = await setMyReferralCode(code);
            if (result.success) {
                toast.success('Code set!', result.message, 3000);
                setLocalCode(code);
                setShowSetCode(false);
            } else {
                toast.error('Could not set code', result.message, 3000);
            }
        } catch {
            toast.error('Error', 'Failed to set referral code', 3000);
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
                toast.success('Referral registered!', result.message, 3000);
                setSubmitted(true);
            } else {
                toast.error('Referral failed', result.message, 3000);
            }
        } catch {
            toast.error('Error', 'Failed to submit referral', 3000);
        } finally {
            setSubmitting(false);
        }
    };

    const nextTarget = info.nextTier?.required ?? info.count;
    const progressPercent = nextTarget > 0 ? Math.min((info.count / nextTarget) * 100, 100) : 100;

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

export default ReferralCodeSection;
