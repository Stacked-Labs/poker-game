'use client';

import { useMemo } from 'react';
import { Box, Flex, HStack, Image, Skeleton, Text } from '@chakra-ui/react';
import { FaCrown } from 'react-icons/fa';
import SectionCard from './SectionCard';
import { formatUsdc } from './formatters';
import type { OnchainEventRow } from '@/app/hooks/useOnchainTableEvents';

interface RakeSummaryCardProps {
    hostWithdrawable: bigint | null;
    events: OnchainEventRow[];
    loading: boolean;
}

const RakeSummaryCard = ({
    hostWithdrawable,
    events,
    loading,
}: RakeSummaryCardProps) => {
    const { platformTotal, hostTotal } = useMemo(() => {
        let platformTotal = BigInt(0);
        let hostTotal = BigInt(0);
        for (const ev of events) {
            if (ev.eventName === 'RakeDistributed') {
                const platformRake = ev.args.platformRake as bigint | undefined;
                const hostRake = ev.args.hostRake as bigint | undefined;
                if (platformRake) platformTotal += platformRake;
                if (hostRake) hostTotal += hostRake;
            }
        }
        return { platformTotal, hostTotal };
    }, [events]);

    const grandTotal = platformTotal + hostTotal;
    const hostPct = grandTotal === BigInt(0) ? 25 : Number((hostTotal * BigInt(1000)) / grandTotal) / 10;
    const platformPct = grandTotal === BigInt(0) ? 75 : 100 - hostPct;

    return (
        <SectionCard
            icon={FaCrown}
            title="Rake transparency"
            subtitle="Stacked takes 3% of each pot. 25% of that goes to the player who hosts the table."
            accent="yellow"
        >
            <Flex direction="column" gap={3}>
                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    gap={{ base: 3, md: 4 }}
                >
                    <Stat
                        label="Host unwithdrawn"
                        value={
                            hostWithdrawable === null ? null : `$${formatUsdc(hostWithdrawable)}`
                        }
                        loading={loading}
                    />
                    <Divider />
                    <Stat
                        label="Total rake (table lifetime)"
                        value={`$${formatUsdc(grandTotal)}`}
                        loading={loading && events.length === 0}
                    />
                </Flex>
                <Box>
                    <Flex
                        justify="space-between"
                        fontSize="2xs"
                        color="text.muted"
                        fontWeight="semibold"
                        textTransform="uppercase"
                        letterSpacing="0.04em"
                        mb={1.5}
                    >
                        <Text>Platform · ${formatUsdc(platformTotal)}</Text>
                        <Text>Host · ${formatUsdc(hostTotal)}</Text>
                    </Flex>
                    <Flex
                        h="8px"
                        borderRadius="full"
                        overflow="hidden"
                        bg="card.lightGray"
                    >
                        <Box
                            flex={`${platformPct} 0 0`}
                            bg="brand.navy"
                            transition="flex 240ms ease"
                        />
                        <Box
                            flex={`${hostPct} 0 0`}
                            bg="brand.yellow"
                            transition="flex 240ms ease"
                        />
                    </Flex>
                </Box>
            </Flex>
        </SectionCard>
    );
};

const Stat = ({
    label,
    value,
    loading,
}: {
    label: string;
    value: string | null;
    loading: boolean;
}) => (
    <Box flex={1} minW={0}>
        <Text
            fontSize="2xs"
            fontWeight="semibold"
            color="text.muted"
            textTransform="uppercase"
            letterSpacing="0.04em"
            mb={1}
        >
            {label}
        </Text>
        {value === null ? (
            <Skeleton height="24px" maxW="120px" borderRadius="md" />
        ) : (
            <HStack spacing={1.5} align="baseline">
                <Text
                    fontSize={{ base: 'lg', md: 'xl' }}
                    fontWeight="bold"
                    color="text.secondary"
                    lineHeight="1.1"
                    opacity={loading ? 0.7 : 1}
                >
                    {value}
                </Text>
                <HStack spacing={1} opacity={0.7}>
                    <Image src="/usdc-logo.png" alt="USDC" boxSize="11px" />
                    <Text fontSize="2xs" color="text.muted" fontWeight="medium">
                        USDC
                    </Text>
                </HStack>
            </HStack>
        )}
    </Box>
);

const Divider = () => (
    <Box
        display={{ base: 'none', md: 'block' }}
        w="1px"
        bg="border.lightGray"
        alignSelf="stretch"
    />
);

export default RakeSummaryCard;
