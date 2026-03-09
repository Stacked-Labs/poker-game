'use client';

import React, { useState } from 'react';
import {
    Box,
    Heading,
    Text,
    Button,
    HStack,
    VStack,
    Icon,
    Input,
    Progress,
    Badge,
    Spinner,
} from '@chakra-ui/react';
import { FaCopy, FaCheck, FaUserPlus, FaGift } from 'react-icons/fa';
import { useActiveAccount } from 'thirdweb/react';
import useToastHelper from '@/app/hooks/useToastHelper';
import { registerReferral } from '@/app/hooks/server_actions';

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
    const toast = useToastHelper();

    const referralCode = account?.address || 'N/A';
    const referralLoading = referralInfo === undefined;
    const info = referralInfo ?? { count: 0, multiplier: 1.0, nextTier: { required: 5, multiplier: 1.1 }, hasReferrer: false };
    const alreadyReferred = info.hasReferrer || submitted;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(referralCode);
            setCopied(true);
            toast.success('Copied!', 'Referral code copied to clipboard', 2000);
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
        <Box width="100%">
            {/* Your Referral Code */}
            <Heading size="sm" mb={3} color="text.primary" textAlign="center">
                <HStack spacing={2} justify="center">
                    <Icon as={FaGift} />
                    <Text>Your Referral Code</Text>
                </HStack>
            </Heading>
            <Box
                p={3}
                bg="card.lightGray"
                borderRadius="14px"
                border="1px solid"
                borderColor="border.lightGray"
            >
                <HStack spacing={3} align="center">
                    <Text
                        color="text.gray600"
                        data-testid="referral-code"
                        fontFamily="mono"
                        fontSize="sm"
                        textAlign="left"
                        isTruncated
                        flex={1}
                        minW={0}
                        title={referralCode}
                    >
                        {referralCode !== 'N/A' ? truncateAddress(referralCode) : referralCode}
                    </Text>
                    <Button
                        size="xs"
                        onClick={handleCopy}
                        data-testid="copy-referral"
                        bg={copied ? 'brand.green' : 'brand.darkNavy'}
                        color="white"
                        border="1px solid"
                        borderColor="rgba(12, 21, 49, 0.15)"
                        height="32px"
                        px={3}
                        fontSize="xs"
                        borderRadius="10px"
                        _hover={{
                            bg: copied ? 'green.600' : 'brand.navy',
                        }}
                        _dark={{
                            bg: copied
                                ? 'brand.green'
                                : 'legacy.grayDarkest',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            _hover: {
                                bg: copied ? 'green.600' : 'legacy.grayDark',
                            },
                        }}
                        leftIcon={<Icon as={copied ? FaCheck : FaCopy} />}
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </Button>
                </HStack>
            </Box>

            {/* Multiplier Explanation + Progress */}
            <Box mt={3} p={3} bg="card.lightGray" borderRadius="14px" border="1px solid" borderColor="border.lightGray">
                <VStack spacing={2} align="stretch">
                    <Text fontSize="xs" color="text.secondary" textAlign="center">
                        Share your code with friends to earn bonus points
                    </Text>
                    <HStack justify="center" spacing={2} flexWrap="wrap">
                        <Badge
                            bg={info.multiplier >= 1.1 ? 'brand.green' : 'card.lightGray'}
                            color={info.multiplier >= 1.1 ? 'white' : 'text.secondary'}
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            fontSize="2xs"
                            border="1px solid"
                            borderColor={info.multiplier >= 1.1 ? 'brand.green' : 'border.lightGray'}
                        >
                            1.1x at 5 refs
                        </Badge>
                        <Badge
                            bg={info.multiplier >= 1.2 ? 'brand.green' : 'card.lightGray'}
                            color={info.multiplier >= 1.2 ? 'white' : 'text.secondary'}
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            fontSize="2xs"
                            border="1px solid"
                            borderColor={info.multiplier >= 1.2 ? 'brand.green' : 'border.lightGray'}
                        >
                            1.2x at 20 refs
                        </Badge>
                    </HStack>

                    {/* Progress bar toward next tier */}
                    {info.nextTier && (
                        <VStack spacing={1} align="stretch">
                            <HStack justify="space-between">
                                <Text fontSize="2xs" color="text.secondary" fontWeight="medium">
                                    Progress to {info.nextTier.multiplier}x
                                </Text>
                                <Text fontSize="2xs" color="text.secondary" fontWeight="bold">
                                    {info.count}/{info.nextTier.required}
                                </Text>
                            </HStack>
                            <Progress
                                value={progressPercent}
                                size="sm"
                                borderRadius="full"
                                bg="border.lightGray"
                                sx={{
                                    '& > div': {
                                        bg: 'brand.green',
                                    },
                                }}
                            />
                        </VStack>
                    )}

                    {/* Active multiplier display */}
                    {info.multiplier > 1 && !info.nextTier && (
                        <Text fontSize="xs" color="brand.green" fontWeight="bold" textAlign="center">
                            Max bonus active: {info.multiplier}x on all points!
                        </Text>
                    )}
                    {info.multiplier > 1 && info.nextTier && (
                        <Text fontSize="2xs" color="brand.green" fontWeight="medium" textAlign="center">
                            Current bonus: {info.multiplier}x active
                        </Text>
                    )}
                </VStack>
            </Box>

            {/* Enter Friend's Referral Code */}
            <Box mt={3} p={3} bg="card.lightGray" borderRadius="14px" border="1px solid" borderColor="border.lightGray">
                <VStack spacing={2} align="stretch">
                    <HStack spacing={2} justify="center">
                        <Icon as={FaUserPlus} color="text.secondary" boxSize={3} />
                        <Text fontSize="xs" color="text.secondary" fontWeight="medium">
                            Have a friend&apos;s referral code?
                        </Text>
                    </HStack>
                    {referralLoading ? (
                        <HStack justify="center" py={1}>
                            <Spinner size="sm" color="text.secondary" />
                        </HStack>
                    ) : alreadyReferred ? (
                        <HStack justify="center" spacing={2}>
                            <Icon as={FaCheck} color="brand.green" />
                            <Text fontSize="xs" color="brand.green" fontWeight="medium">
                                Referral code applied!
                            </Text>
                        </HStack>
                    ) : (
                        <HStack spacing={2}>
                            <Input
                                size="sm"
                                placeholder="Paste wallet address"
                                value={referralInput}
                                onChange={(e) => setReferralInput(e.target.value)}
                                fontFamily="mono"
                                fontSize="xs"
                                borderRadius="10px"
                                bg="card.white"
                                borderColor="border.lightGray"
                                _dark={{ bg: 'legacy.grayDarkest' }}
                            />
                            <Button
                                size="sm"
                                onClick={handleSubmitReferral}
                                isLoading={submitting}
                                isDisabled={!referralInput.trim() || !account?.address}
                                bg="brand.darkNavy"
                                color="white"
                                fontSize="xs"
                                borderRadius="10px"
                                px={4}
                                _hover={{ bg: 'brand.navy' }}
                                _dark={{
                                    bg: 'legacy.grayDarkest',
                                    _hover: { bg: 'legacy.grayDark' },
                                }}
                            >
                                Apply
                            </Button>
                        </HStack>
                    )}
                </VStack>
            </Box>
        </Box>
    );
};

export default ReferralCodeSection;
