'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    Progress,
    Text,
} from '@chakra-ui/react';
import { FiClock, FiUnlock, FiZap } from 'react-icons/fi';
import { type Chain } from 'thirdweb';
import SectionCard from './SectionCard';
import { useEmergencyWithdraw } from '@/app/hooks/useEmergencyWithdraw';
import useToastHelper from '@/app/hooks/useToastHelper';
import { formatDuration, formatRelativeTime } from './formatters';

const EMERGENCY_DELAY_SECONDS = 24 * 60 * 60;

interface SettlementHealthCardProps {
    lastSettlement: bigint | null;
    contractAddress: string;
    chain: Chain;
    isUserSeated: boolean;
}

const SettlementHealthCard = ({
    lastSettlement,
    contractAddress,
    chain,
    isUserSeated,
}: SettlementHealthCardProps) => {
    const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
    const {
        trigger,
        status,
        error,
        reset,
    } = useEmergencyWithdraw(contractAddress, chain);
    const { success, error: toastError } = useToastHelper();

    useEffect(() => {
        const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
        return () => clearInterval(id);
    }, []);

    const { unlocked, secondsLeft, lastSettlementMs } = useMemo(() => {
        if (lastSettlement === null) {
            return {
                unlocked: false,
                secondsLeft: EMERGENCY_DELAY_SECONDS,
                lastSettlementMs: null,
            };
        }
        const last = Number(lastSettlement);
        const secondsLeft = Math.max(0, last + EMERGENCY_DELAY_SECONDS - now);
        return {
            unlocked: last === 0 || secondsLeft === 0,
            secondsLeft,
            lastSettlementMs: last > 0 ? last * 1000 : null,
        };
    }, [lastSettlement, now]);

    const progressValue = useMemo(() => {
        if (unlocked) return 100;
        const elapsed = EMERGENCY_DELAY_SECONDS - secondsLeft;
        return Math.min(100, Math.max(0, (elapsed / EMERGENCY_DELAY_SECONDS) * 100));
    }, [secondsLeft, unlocked]);

    const handleEmergency = async () => {
        if (status === 'error') reset();
        const ok = await trigger();
        if (ok) {
            success(
                'Emergency withdraw submitted',
                'Your last-settled balance is on its way to your wallet.'
            );
        } else if (error) {
            toastError('Emergency withdraw failed', error);
        }
    };

    return (
        <SectionCard
            icon={FiZap}
            title="Settlement health"
            subtitle="If settlement stalls, you can pull your last-settled balance straight from the contract after 24 hours."
            accent="pink"
        >
            <Flex direction="column" gap={3}>
                <Flex
                    direction={{ base: 'column', sm: 'row' }}
                    align={{ base: 'flex-start', sm: 'center' }}
                    justify="space-between"
                    gap={3}
                >
                    <HStack spacing={2.5} minW={0}>
                        <Icon
                            as={FiClock}
                            boxSize={4}
                            color="text.muted"
                            flexShrink={0}
                        />
                        <Box minW={0}>
                            <Text
                                fontSize="2xs"
                                fontWeight="semibold"
                                color="text.muted"
                                textTransform="uppercase"
                                letterSpacing="0.04em"
                            >
                                Last settlement
                            </Text>
                            <Text
                                fontSize={{ base: 'sm', md: 'md' }}
                                fontWeight="bold"
                                color="text.secondary"
                                lineHeight="1.2"
                            >
                                {lastSettlementMs === null
                                    ? 'No hands settled yet'
                                    : formatRelativeTime(lastSettlementMs)}
                            </Text>
                        </Box>
                    </HStack>
                    <HStack spacing={2.5} minW={0}>
                        <Icon
                            as={unlocked ? FiUnlock : FiClock}
                            boxSize={4}
                            color={unlocked ? 'brand.green' : 'text.muted'}
                            flexShrink={0}
                        />
                        <Box minW={0}>
                            <Text
                                fontSize="2xs"
                                fontWeight="semibold"
                                color="text.muted"
                                textTransform="uppercase"
                                letterSpacing="0.04em"
                            >
                                Self-withdraw
                            </Text>
                            <Text
                                fontSize={{ base: 'sm', md: 'md' }}
                                fontWeight="bold"
                                color={
                                    unlocked ? 'brand.green' : 'text.secondary'
                                }
                                lineHeight="1.2"
                            >
                                {unlocked
                                    ? 'Available now'
                                    : `Unlocks in ${formatDuration(secondsLeft)}`}
                            </Text>
                        </Box>
                    </HStack>
                </Flex>
                <Progress
                    value={progressValue}
                    size="xs"
                    borderRadius="full"
                    bg="card.lightGray"
                    sx={{
                        '& > div': {
                            background: unlocked
                                ? 'var(--chakra-colors-brand-green)'
                                : 'var(--chakra-colors-brand-pink)',
                            transition: 'width 1s linear',
                        },
                    }}
                />
                {unlocked && isUserSeated && (
                    <Flex
                        align="center"
                        justify="space-between"
                        gap={3}
                        pt={1}
                    >
                        <Text fontSize="xs" color="text.muted" flex={1}>
                            You can pull your last-settled balance directly from the contract — no Stacked involvement required.
                        </Text>
                        <Button
                            size="sm"
                            bg="brand.pink"
                            color="white"
                            border="none"
                            borderRadius="10px"
                            fontWeight="bold"
                            fontSize="xs"
                            isLoading={status === 'pending'}
                            loadingText="Submitting"
                            onClick={handleEmergency}
                            flexShrink={0}
                            boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), 0 1.5px 0 #950839"
                            _hover={{ bg: 'brand.pink' }}
                            _active={{
                                bg: 'brand.pinkDark',
                                transform: 'translateY(1.5px)',
                                boxShadow:
                                    'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #950839',
                            }}
                        >
                            Self-withdraw
                        </Button>
                    </Flex>
                )}
                {unlocked && !isUserSeated && (
                    <Text fontSize="2xs" color="text.muted" pt={1}>
                        Available to seated players. Spectators have nothing to withdraw.
                    </Text>
                )}
            </Flex>
        </SectionCard>
    );
};

export default SettlementHealthCard;
