'use client';

import React, { useEffect, useState } from 'react';
import { Box, Container } from '@chakra-ui/react';
import { useActiveAccount } from 'thirdweb/react';
import confetti from 'canvas-confetti';
import FloatingDecor from '@/app/components/HomePage/FloatingDecor';
import Footer from '@/app/components/HomePage/Footer';
import { checkSBTEligibility, claimSBT, getSBTInfo, type SBTInfo } from '@/app/hooks/server_actions';
import useToastHelper from '@/app/hooks/useToastHelper';
import ClaimCard from './components/ClaimCard';
import { track } from '@/app/utils/analytics';

const fireConfetti = () => {
    const reduced =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const colors = ['#FDC51D', '#36A37B', '#EB0B5C', '#FFFFFF'];
    const defaults = { startVelocity: 38, spread: 70, ticks: 90, gravity: 0.9, colors };

    confetti({ ...defaults, particleCount: 80, origin: { x: 0.5, y: 0.55 } });
    setTimeout(() => {
        confetti({ ...defaults, particleCount: 50, angle: 60, origin: { x: 0, y: 0.7 } });
        confetti({ ...defaults, particleCount: 50, angle: 120, origin: { x: 1, y: 0.7 } });
    }, 180);
};

export default function ClaimPage() {
    const account = useActiveAccount();
    const toast = useToastHelper();
    const [eligibility, setEligibility] = useState<{ eligible: boolean; claimed: boolean } | null>(null);
    const [claiming, setClaiming] = useState(false);
    const [justClaimed, setJustClaimed] = useState(false);
    const [sbtInfo, setSbtInfo] = useState<SBTInfo | null>(null);

    useEffect(() => {
        getSBTInfo().then(setSbtInfo);
    }, []);

    useEffect(() => {
        if (!account?.address) {
            setEligibility(null);
            return;
        }
        setEligibility(null);
        checkSBTEligibility(account.address).then(setEligibility);
    }, [account?.address]);

    const handleClaim = async () => {
        track('free_tokens_claim_started');
        setClaiming(true);
        try {
            const result = await claimSBT();
            if (result.success) {
                track('free_tokens_claimed');
                setJustClaimed(true);
                fireConfetti();
                if (account?.address) {
                    const updated = await checkSBTEligibility(account.address);
                    setEligibility(updated);
                }
            } else {
                toast.error('Claim failed', result.message ?? 'Something went wrong');
            }
        } catch {
            toast.error('Claim failed', 'Network error, please try again');
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
                top={{ base: '6%', md: '4%' }}
                right={{ base: '-20%', md: '-2%' }}
                w={{ base: '320px', md: '520px' }}
                h={{ base: '320px', md: '520px' }}
                borderRadius="full"
                bg="brand.yellow"
                opacity={0.1}
                filter="blur(110px)"
                pointerEvents="none"
                _dark={{ opacity: 0.18 }}
            />
            <Box
                aria-hidden="true"
                position="absolute"
                bottom={{ base: '4%', md: '8%' }}
                left={{ base: '-15%', md: '-2%' }}
                w={{ base: '300px', md: '460px' }}
                h={{ base: '300px', md: '460px' }}
                borderRadius="full"
                bg="brand.green"
                opacity={0.1}
                filter="blur(100px)"
                pointerEvents="none"
                _dark={{ opacity: 0.18 }}
            />

            <Container
                maxW={{ base: 'full', md: '1100px' }}
                pt={{ base: 28, md: 36 }}
                pb={{ base: 20, md: 28 }}
                px={{ base: 4, md: 8 }}
                position="relative"
                zIndex={1}
            >
                <ClaimCard
                    account={account}
                    eligibility={eligibility}
                    claiming={claiming}
                    onClaim={handleClaim}
                    sbtInfo={sbtInfo}
                    justClaimed={justClaimed}
                />
            </Container>

            <Box position="relative" zIndex={1}>
                <Footer />
            </Box>
        </Box>
    );
}
