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
            <Heading size="md" mb={4} color="white" textAlign="center">
                <HStack spacing={2} justify="center">
                    <Icon as={FaCode} />
                    <Text>Referral Code</Text>
                </HStack>
            </Heading>
            <Box p={4} bgColor="charcoal.600" borderRadius="lg">
                <Text
                    color="gray.300"
                    mb={3}
                    data-testid="referral-code"
                    fontFamily="mono"
                    fontSize="sm"
                    textAlign="center"
                    wordBreak="break-all"
                >
                    {referralCode}
                </Text>
                <Button
                    size="sm"
                    onClick={handleCopy}
                    data-testid="copy-referral"
                    width="100%"
                    bg={copied ? 'green.500' : 'charcoal'}
                    color="white"
                    border="2px solid white"
                    _hover={{
                        bg: copied ? 'green.600' : '#2e2e2e',
                    }}
                    leftIcon={<Icon as={copied ? FaCheck : FaCopy} />}
                >
                    {copied ? 'Copied!' : 'Copy Code'}
                </Button>
            </Box>
        </Box>
    );
};

export default ReferralCodeSection;
