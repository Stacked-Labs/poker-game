'use client';

import React, { useEffect, useState } from 'react';
import { Box, Container } from '@chakra-ui/react';
import { useActiveAccount } from 'thirdweb/react';
import FloatingDecor from '@/app/components/HomePage/FloatingDecor';
import Footer from '@/app/components/HomePage/Footer';
import { checkSBTEligibility, claimSBT } from '@/app/hooks/server_actions';
import useToastHelper from '@/app/hooks/useToastHelper';
import ClaimCard from './components/ClaimCard';

export default function ClaimPage() {
    const account = useActiveAccount();
    const toast = useToastHelper();
    const [eligibility, setEligibility] = useState<{ eligible: boolean; claimed: boolean } | null>(null);
    const [claiming, setClaiming] = useState(false);

    useEffect(() => {
        if (!account?.address) {
            setEligibility(null);
            return;
        }
        setEligibility(null);
        checkSBTEligibility(account.address).then(setEligibility);
    }, [account?.address]);

    const handleClaim = async () => {
        setClaiming(true);
        try {
            const result = await claimSBT();
            if (result.success) {
                if (account?.address) {
                    const updated = await checkSBTEligibility(account.address);
                    setEligibility(updated);
                }
            } else {
                toast.error('Claim failed', result.message ?? 'Something went wrong');
            }
        } catch {
            toast.error('Claim failed', 'Network error — please try again');
        } finally {
            setClaiming(false);
        }
    };

    return (
        <Box minH="100vh" bg="bg.default" position="relative" overflow="hidden">
            <FloatingDecor density="light" />

            <Box
                aria-hidden="true"
                position="absolute"
                top={{ base: '8%', md: '6%' }}
                right={{ base: '-15%', md: '5%' }}
                w={{ base: '220px', md: '320px' }}
                h={{ base: '220px', md: '320px' }}
                borderRadius="full"
                bg="brand.yellow"
                opacity={0.10}
                filter="blur(90px)"
                pointerEvents="none"
                _dark={{ opacity: 0.15 }}
            />
            <Box
                aria-hidden="true"
                position="absolute"
                bottom={{ base: '6%', md: '10%' }}
                left={{ base: '-10%', md: '6%' }}
                w={{ base: '200px', md: '280px' }}
                h={{ base: '200px', md: '280px' }}
                borderRadius="full"
                bg="brand.green"
                opacity={0.10}
                filter="blur(80px)"
                pointerEvents="none"
                _dark={{ opacity: 0.15 }}
            />

            <Container maxW="480px" pt={{ base: 24, md: 28 }} pb={16} px={{ base: 4, md: 6 }} position="relative" zIndex={1}>
                <ClaimCard
                    account={account}
                    eligibility={eligibility}
                    claiming={claiming}
                    onClaim={handleClaim}
                />
            </Container>

            <Box position="relative" zIndex={1}>
                <Footer />
            </Box>
        </Box>
    );
}
