'use client';

import React, { useContext, useState } from 'react';
import { Box, Heading, Text, Button, HStack, Icon } from '@chakra-ui/react';
import { FaCode, FaCopy, FaCheck } from 'react-icons/fa';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import useToastHelper from '@/app/hooks/useToastHelper';

const ReferralCodeSection: React.FC = () => {
    const { appState } = useContext(AppContext);
    const [copied, setCopied] = useState(false);
    const toast = useToastHelper();
    const referralCode = appState.clientID || 'N/A';

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

    return (
        <Box width="100%">
            <Heading size="sm" mb={3} color="text.primary" textAlign="center">
                <HStack spacing={2} justify="center">
                    <Icon as={FaCode} />
                    <Text>Referral Code</Text>
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
                        {referralCode}
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
        </Box>
    );
};

export default ReferralCodeSection;
