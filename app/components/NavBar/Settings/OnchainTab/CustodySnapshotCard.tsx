'use client';

import { Box, Flex, HStack, Icon, Image, Skeleton, Text } from '@chakra-ui/react';
import { FaCoins } from 'react-icons/fa';
import { FiCheck, FiAlertCircle } from 'react-icons/fi';
import SectionCard from './SectionCard';
import { chipsToUsdc, formatChips, formatUsdc } from './formatters';
import type { OnchainPlayer } from '@/app/hooks/useOnchainTableSnapshot';

interface CustodySnapshotCardProps {
    contractUsdcBalance: bigint | null;
    players: OnchainPlayer[] | null;
    loading: boolean;
}

const TOLERANCE_MICRO = BigInt(10_000);

const CustodySnapshotCard = ({
    contractUsdcBalance,
    players,
    loading,
}: CustodySnapshotCardProps) => {
    const chipsOnTable =
        players?.reduce((acc, p) => acc + p.chips, BigInt(0)) ?? null;
    const chipsAsMicroUsdc =
        chipsOnTable !== null ? chipsToUsdc(chipsOnTable) : null;

    const reconciled =
        contractUsdcBalance !== null &&
        chipsAsMicroUsdc !== null &&
        (contractUsdcBalance >= chipsAsMicroUsdc
            ? contractUsdcBalance - chipsAsMicroUsdc <= TOLERANCE_MICRO
            : chipsAsMicroUsdc - contractUsdcBalance <= TOLERANCE_MICRO);

    return (
        <SectionCard
            icon={FaCoins}
            title="Custody"
            subtitle="Every chip is backed 1:1 by USDC held in this contract."
            accent="green"
        >
            <Flex
                direction={{ base: 'column', md: 'row' }}
                gap={{ base: 3, md: 4 }}
            >
                <Stat
                    label="USDC held by contract"
                    value={
                        contractUsdcBalance === null ? null : (
                            <>
                                ${formatUsdc(contractUsdcBalance)}
                                <UsdcMark />
                            </>
                        )
                    }
                    loading={loading}
                />
                <Divider />
                <Stat
                    label="Chips in play"
                    value={
                        chipsOnTable === null ? null : (
                            <Text as="span">
                                {formatChips(chipsOnTable)}
                                <Text
                                    as="span"
                                    fontSize="xs"
                                    color="text.muted"
                                    ml={1.5}
                                    fontWeight="medium"
                                >
                                    chips · ≈ ${formatUsdc(chipsAsMicroUsdc)}
                                </Text>
                            </Text>
                        )
                    }
                    loading={loading}
                />
            </Flex>
            {contractUsdcBalance !== null && chipsAsMicroUsdc !== null && (
                <HStack
                    mt={3}
                    spacing={2}
                    bg={
                        reconciled
                            ? 'rgba(54, 163, 123, 0.10)'
                            : 'rgba(237, 137, 54, 0.12)'
                    }
                    color={reconciled ? 'brand.green' : 'orange.600'}
                    _dark={{
                        bg: reconciled
                            ? 'rgba(54, 163, 123, 0.18)'
                            : 'rgba(237, 137, 54, 0.15)',
                        color: reconciled ? 'brand.green' : 'orange.300',
                    }}
                    borderRadius="md"
                    px={3}
                    py={2}
                    fontSize="xs"
                    fontWeight="medium"
                    w="fit-content"
                >
                    <Icon
                        as={reconciled ? FiCheck : FiAlertCircle}
                        boxSize={3.5}
                    />
                    <Text color="inherit">
                        {reconciled
                            ? 'Chips on the table match USDC in the contract.'
                            : 'Chip count and contract USDC are reconciling — settlement may be in flight.'}
                    </Text>
                </HStack>
            )}
        </SectionCard>
    );
};

const Stat = ({
    label,
    value,
    loading,
}: {
    label: string;
    value: React.ReactNode;
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
            <Skeleton height="28px" maxW="160px" borderRadius="md" />
        ) : (
            <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="bold"
                color="text.secondary"
                lineHeight="1.1"
                opacity={loading ? 0.7 : 1}
            >
                {value}
            </Text>
        )}
    </Box>
);

const UsdcMark = () => (
    <HStack as="span" spacing={1} ml={2} opacity={0.7} display="inline-flex">
        <Image src="/usdc-logo.png" alt="USDC" boxSize="13px" loading="lazy" />
        <Text as="span" fontSize="xs" color="text.muted" fontWeight="medium">
            USDC
        </Text>
    </HStack>
);

const Divider = () => (
    <Box
        display={{ base: 'none', md: 'block' }}
        w="1px"
        bg="border.lightGray"
        alignSelf="stretch"
    />
);

export default CustodySnapshotCard;
