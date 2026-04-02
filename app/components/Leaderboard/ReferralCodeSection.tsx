'use client';

import React, { useState } from 'react';
import {
    Box,
    Text,
    Button,
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
import { registerReferral } from '@/app/hooks/server_actions';

const MotionBox = motion(Box);

interface ReferralInfo {
    count: number;
    multiplier: number;
    nextTier: { required: number; multiplier: number } | null;
    hasReferrer?: boolean;
}

interface ReferralCodeSectionProps {
    referralInfo?: ReferralInfo;
}

const ReferralCodeSection: React.FC<ReferralCodeSectionProps> = ({ referralInfo }) => {
    const account = useActiveAccount();
    const [copied, setCopied] = useState(false);
    const [referralInput, setReferralInput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [showReferralInput, setShowReferralInput] = useState(false);
    const toast = useToastHelper();

    const referralCode = account?.address || 'N/A';
    const referralLoading = referralInfo === undefined;
    const info = referralInfo ?? { count: 0, multiplier: 1.0, nextTier: { required: 5, multiplier: 1.1 }, hasReferrer: false };
    const alreadyReferred = info.hasReferrer || submitted;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy referral code', err);
            toast.error('Error', 'Failed to copy referral code', 2000);
        }
    };

    const handleSubmitReferral = async () => {
        const code = referralInput.trim();
        if (!code || !account?.address) return;

        setSubmitting(true);
        try {
            const result = await registerReferral(account.address, code);
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

    const truncateAddress = (addr: string) =>
        `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    // Progress calculation
    const nextTarget = info.nextTier?.required ?? info.count;
    const progressPercent = nextTarget > 0 ? Math.min((info.count / nextTarget) * 100, 100) : 100;

    return (
        <VStack spacing={3} width="100%" align="stretch">
            {/* Referral code + copy */}
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
                <Text
                    color="text.secondary"
                    fontFamily="mono"
                    fontSize="sm"
                    data-testid="referral-code"
                    title={referralCode}
                >
                    {referralCode !== 'N/A' ? truncateAddress(referralCode) : referralCode}
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
            </HStack>

            {/* Multiplier info */}
            {!referralLoading && (
                <VStack spacing={1.5} align="stretch">
                    {info.multiplier > 1 && (
                        <Text
                            fontSize="xs"
                            color="brand.green"
                            fontWeight="semibold"
                            textAlign="center"
                        >
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
                                sx={{
                                    '& > div': {
                                        bg: 'brand.green',
                                        borderRadius: 'full',
                                    },
                                }}
                            />
                        </VStack>
                    )}
                </VStack>
            )}

            {/* Enter friend's referral code — collapsible */}
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
                                        placeholder="Paste wallet address"
                                        value={referralInput}
                                        onChange={(e) => setReferralInput(e.target.value)}
                                        fontFamily="mono"
                                        fontSize="xs"
                                        flex={1}
                                        _placeholder={{
                                            color: 'text.secondary',
                                            opacity: 0.5,
                                        }}
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
                                        _hover={
                                            !referralInput.trim() || !account?.address
                                                ? {}
                                                : { opacity: 0.7 }
                                        }
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
