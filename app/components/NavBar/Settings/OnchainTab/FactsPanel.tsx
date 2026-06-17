'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Divider,
    Flex,
    HStack,
    Icon,
    Image,
    Progress,
    Skeleton,
    Text,
} from '@chakra-ui/react';
import { FaCoins } from 'react-icons/fa';
import {
    FiCheck,
    FiAlertCircle,
    FiClock,
    FiShield,
    FiUnlock,
    FiUser,
    FiZap,
} from 'react-icons/fi';
import { type Chain } from 'thirdweb';
import AddressChip from './AddressChip';
import {
    chipsToUsdc,
    formatChips,
    formatDuration,
    formatRelativeTime,
    formatUsdc,
} from './formatters';
import ChainBadge from '../../../ChainBadge';
import type { OnchainPlayer } from '@/app/hooks/useOnchainTableSnapshot';
import { useEmergencyWithdraw } from '@/app/hooks/useEmergencyWithdraw';
import useToastHelper from '@/app/hooks/useToastHelper';

const EMERGENCY_DELAY_SECONDS = 24 * 60 * 60;
const RECONCILE_TOLERANCE_MICRO = BigInt(10_000);

interface FactsPanelProps {
    contractAddress: string;
    chain: Chain;
    chainName: string | null | undefined;
    gameCreator: string | null;
    contractExplorerUrl: string | null;
    creatorExplorerUrl: string | null;
    contractUsdcBalance: bigint | null;
    hostWithdrawable: bigint | null;
    players: OnchainPlayer[] | null;
    lastSettlement: bigint | null;
    snapshotLoading: boolean;
    isUserSeated: boolean;
}

const FactsPanel = ({
    contractAddress,
    chain,
    chainName,
    gameCreator,
    contractExplorerUrl,
    creatorExplorerUrl,
    contractUsdcBalance,
    hostWithdrawable,
    players,
    lastSettlement,
    snapshotLoading,
    isUserSeated,
}: FactsPanelProps) => {
    return (
        <Box
            bg="card.white"
            borderRadius={{ base: '14px', md: '18px' }}
            border="2px solid"
            borderColor="border.lightGray"
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)"
            overflow="hidden"
        >
            <IdentitySection
                contractAddress={contractAddress}
                chainName={chainName}
                gameCreator={gameCreator}
                contractExplorerUrl={contractExplorerUrl}
                creatorExplorerUrl={creatorExplorerUrl}
            />
            <Divider borderColor="border.lightGray" />
            <CustodySection
                contractUsdcBalance={contractUsdcBalance}
                hostWithdrawable={hostWithdrawable}
                players={players}
                loading={snapshotLoading}
            />
            <Divider borderColor="border.lightGray" />
            <SettlementSection
                lastSettlement={lastSettlement}
                contractAddress={contractAddress}
                chain={chain}
                isUserSeated={isUserSeated}
            />
        </Box>
    );
};

const SectionHeader = ({
    icon,
    label,
    accent,
}: {
    icon: typeof FiShield;
    label: string;
    accent: string;
}) => (
    <HStack spacing={2} mb={2.5} align="center">
        <Icon as={icon} color={accent} boxSize={3.5} />
        <Text
            fontSize="2xs"
            fontWeight="bold"
            color="text.muted"
            textTransform="uppercase"
            letterSpacing="0.08em"
        >
            {label}
        </Text>
    </HStack>
);

const IdentitySection = ({
    contractAddress,
    chainName,
    gameCreator,
    contractExplorerUrl,
    creatorExplorerUrl,
}: {
    contractAddress: string;
    chainName: string | null | undefined;
    gameCreator: string | null;
    contractExplorerUrl: string | null;
    creatorExplorerUrl: string | null;
}) => {
    return (
        <Box px={{ base: 3.5, md: 4 }} py={{ base: 3, md: 3.5 }}>
            <Flex direction="column" gap={2}>
                {chainName && <ChainBadge chain={chainName} size="sm" />}
                <HStack spacing={2}>
                    <Icon
                        as={FiShield}
                        boxSize={3}
                        color="brand.navy"
                        _dark={{ color: 'rgba(180, 197, 245, 1)' }}
                    />
                    <Text
                        fontSize="2xs"
                        color="text.secondary"
                        fontWeight="semibold"
                        textTransform="uppercase"
                        letterSpacing="0.04em"
                    >
                        Contract
                    </Text>
                    <AddressChip
                        address={contractAddress}
                        explorerUrl={contractExplorerUrl}
                    />
                </HStack>
                {gameCreator && (
                    <HStack spacing={2}>
                        <Icon
                            as={FiUser}
                            boxSize={3}
                            color="text.secondary"
                            _dark={{ color: 'rgba(180, 197, 245, 1)' }}
                        />
                        <Text
                            fontSize="2xs"
                            color="text.secondary"
                            fontWeight="semibold"
                            textTransform="uppercase"
                            letterSpacing="0.04em"
                        >
                            Host
                        </Text>
                        <AddressChip
                            address={gameCreator}
                            explorerUrl={creatorExplorerUrl}
                            showCopy={false}
                        />
                    </HStack>
                )}
            </Flex>
            <Text fontSize="2xs" color="text.muted" mt={2.5} lineHeight="1.5">
                This table is its own contract. Stacked can&apos;t move funds — only you and the settlement logic can.
            </Text>
        </Box>
    );
};

const CustodySection = ({
    contractUsdcBalance,
    hostWithdrawable,
    players,
    loading,
}: {
    contractUsdcBalance: bigint | null;
    hostWithdrawable: bigint | null;
    players: OnchainPlayer[] | null;
    loading: boolean;
}) => {
    const chipsOnTable =
        players?.reduce((acc, p) => acc + p.chips, BigInt(0)) ?? null;
    const chipsAsMicroUsdc =
        chipsOnTable !== null ? chipsToUsdc(chipsOnTable) : null;
    const accountedMicroUsdc =
        chipsAsMicroUsdc !== null
            ? chipsAsMicroUsdc + (hostWithdrawable ?? BigInt(0))
            : null;
    const reconciled =
        contractUsdcBalance !== null &&
        accountedMicroUsdc !== null &&
        (contractUsdcBalance >= accountedMicroUsdc
            ? contractUsdcBalance - accountedMicroUsdc <= RECONCILE_TOLERANCE_MICRO
            : accountedMicroUsdc - contractUsdcBalance <= RECONCILE_TOLERANCE_MICRO);

    return (
        <Box px={{ base: 3.5, md: 4 }} py={{ base: 3, md: 3.5 }}>
            <SectionHeader icon={FaCoins} label="Custody" accent="brand.yellow" />
            <Flex direction="column" gap={2}>
                <Box>
                    <Text
                        fontSize="2xs"
                        color="text.muted"
                        fontWeight="semibold"
                        textTransform="uppercase"
                        letterSpacing="0.04em"
                    >
                        USDC held
                    </Text>
                    {contractUsdcBalance === null ? (
                        <Skeleton height="26px" maxW="140px" mt={0.5} borderRadius="md" />
                    ) : (
                        <HStack spacing={1.5} align="baseline" mt={0.5}>
                            <Text
                                fontSize="2xl"
                                fontWeight="bold"
                                color="text.secondary"
                                lineHeight="1.05"
                                opacity={loading ? 0.7 : 1}
                            >
                                ${formatUsdc(contractUsdcBalance)}
                            </Text>
                            <HStack spacing={1} opacity={0.7}>
                                <Image
                                    src="/usdc-logo.png"
                                    alt="USDC"
                                    boxSize="12px"
                                />
                                <Text
                                    fontSize="2xs"
                                    fontWeight="medium"
                                    color="text.muted"
                                >
                                    USDC
                                </Text>
                            </HStack>
                        </HStack>
                    )}
                </Box>
                <Box>
                    <Text
                        fontSize="2xs"
                        color="text.muted"
                        fontWeight="semibold"
                        textTransform="uppercase"
                        letterSpacing="0.04em"
                    >
                        Chips in play
                    </Text>
                    {chipsOnTable === null ? (
                        <Skeleton height="18px" maxW="120px" mt={0.5} borderRadius="md" />
                    ) : (
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color="text.secondary"
                            mt={0.5}
                        >
                            {formatChips(chipsOnTable)}
                            <Text as="span" fontSize="2xs" color="text.muted" ml={1.5}>
                                ≈ ${formatUsdc(chipsAsMicroUsdc)}
                            </Text>
                        </Text>
                    )}
                </Box>
                <Box>
                    <Text
                        fontSize="2xs"
                        color="text.muted"
                        fontWeight="semibold"
                        textTransform="uppercase"
                        letterSpacing="0.04em"
                    >
                        Host rewards
                    </Text>
                    {hostWithdrawable === null ? (
                        <Skeleton height="18px" maxW="120px" mt={0.5} borderRadius="md" />
                    ) : (
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color="text.secondary"
                            mt={0.5}
                        >
                            ${formatUsdc(hostWithdrawable, 4)}
                            <Text as="span" fontSize="2xs" color="text.muted" ml={1.5}>
                                claimable by host
                            </Text>
                        </Text>
                    )}
                </Box>
                {contractUsdcBalance !== null && accountedMicroUsdc !== null && (
                    <HStack
                        spacing={1.5}
                        bg={
                            reconciled
                                ? 'rgba(54, 163, 123, 0.10)'
                                : 'rgba(237, 137, 54, 0.12)'
                        }
                        _dark={{
                            bg: reconciled
                                ? 'rgba(54, 163, 123, 0.18)'
                                : 'rgba(237, 137, 54, 0.18)',
                        }}
                        borderRadius="md"
                        px={2}
                        py={1.5}
                        mt={0.5}
                        w="fit-content"
                    >
                        <Icon
                            as={reconciled ? FiCheck : FiAlertCircle}
                            boxSize={3}
                            color={reconciled ? 'brand.green' : 'orange.600'}
                        />
                        <Text
                            fontSize="2xs"
                            fontWeight="semibold"
                            color={reconciled ? 'brand.green' : 'orange.700'}
                            _dark={{ color: reconciled ? 'brand.green' : 'orange.200' }}
                        >
                            {reconciled ? 'Backed 1:1' : 'Reconciling…'}
                        </Text>
                    </HStack>
                )}
            </Flex>
        </Box>
    );
};

const SettlementSection = ({
    lastSettlement,
    contractAddress,
    chain,
    isUserSeated,
}: {
    lastSettlement: bigint | null;
    contractAddress: string;
    chain: Chain;
    isUserSeated: boolean;
}) => {
    const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
    const { trigger, status, error, reset } = useEmergencyWithdraw(
        contractAddress,
        chain
    );
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
        <Box px={{ base: 3.5, md: 4 }} py={{ base: 3, md: 3.5 }}>
            <SectionHeader icon={FiZap} label="Settlement" accent="brand.pink" />
            <Flex direction="column" gap={2.5}>
                <Flex justify="space-between" align="center" gap={2}>
                    <HStack spacing={2} minW={0}>
                        <Icon as={FiClock} boxSize={3} color="text.muted" />
                        <Text
                            fontSize="2xs"
                            color="text.muted"
                            fontWeight="semibold"
                            textTransform="uppercase"
                            letterSpacing="0.04em"
                        >
                            Last
                        </Text>
                    </HStack>
                    <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        color="text.secondary"
                        noOfLines={1}
                    >
                        {lastSettlementMs === null
                            ? 'No hands yet'
                            : formatRelativeTime(lastSettlementMs)}
                    </Text>
                </Flex>
                <Box>
                    <Flex justify="space-between" align="center" mb={1.5}>
                        <HStack spacing={2}>
                            <Icon
                                as={unlocked ? FiUnlock : FiClock}
                                boxSize={3}
                                color={unlocked ? 'brand.green' : 'text.muted'}
                            />
                            <Text
                                fontSize="2xs"
                                color="text.muted"
                                fontWeight="semibold"
                                textTransform="uppercase"
                                letterSpacing="0.04em"
                            >
                                Emergency withdraw
                            </Text>
                        </HStack>
                        <Text
                            fontSize="xs"
                            fontWeight="bold"
                            color={unlocked ? 'brand.green' : 'text.secondary'}
                        >
                            {unlocked ? 'Available' : formatDuration(secondsLeft)}
                        </Text>
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
                </Box>
                {unlocked && isUserSeated && (
                    <Button
                        size="xs"
                        bg="brand.pink"
                        color="white"
                        border="none"
                        borderRadius="8px"
                        fontWeight="bold"
                        isLoading={status === 'pending'}
                        loadingText="Submitting"
                        onClick={handleEmergency}
                        boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), 0 1.5px 0 #950839"
                        _hover={{ bg: 'brand.pink' }}
                        _active={{
                            bg: 'brand.pinkDark',
                            transform: 'translateY(1.5px)',
                            boxShadow:
                                'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #950839',
                        }}
                    >
                        <Text fontSize="xs" fontWeight="bold" color="white">
                            Emergency withdraw
                        </Text>
                    </Button>
                )}
                <Text fontSize="2xs" color="text.muted" lineHeight="1.5">
                    Emergency withdraw unlocks 24 hours after the last settlement, letting you pull your last-settled balance straight from the contract.
                </Text>
            </Flex>
        </Box>
    );
};

export default FactsPanel;
