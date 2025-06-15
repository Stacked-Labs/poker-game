'use client';

import React, { useContext } from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';

const ReferralCodeSection: React.FC = () => {
    const { appState } = useContext(AppContext);
    const referralCode = appState.clientID || 'N/A';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(referralCode);
        } catch (err) {
            console.error('Failed to copy referral code', err);
        }
    };

    return (
        <Box width="100%">
            <Heading size="md" mb={4} color="white">
                Referral Code
            </Heading>
            <Text color="white" mb={2} data-testid="referral-code">
                {referralCode}
            </Text>
            <Button size="sm" onClick={handleCopy} data-testid="copy-referral">
                Copy
            </Button>
        </Box>
    );
};

export default ReferralCodeSection;
