'use client';

import React, { useContext, useEffect, useCallback } from 'react';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { handleLeaveTable } from '@/app/hooks/useTableOptions';
import {
    Box,
    Button,
    Collapse,
    Flex,
    Text,
    HStack,
    Icon,
    Spinner,
    Image,
    Divider,
    Tooltip,
    useDisclosure,
} from '@chakra-ui/react';
import { FaCoins, FaCrown, FaInfoCircle } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { useWithdraw } from '@/app/hooks/useWithdraw';
import { useHostRake } from '@/app/hooks/useHostRake';
import { CHAIN_CONFIG, defaultChain } from '@/app/thirdwebclient';
import { useEmergencyWithdraw } from '@/app/hooks/useEmergencyWithdraw';
import useIsTableOwner from '@/app/hooks/useIsTableOwner';
import { useActiveWallet } from 'thirdweb/react';
import useToastHelper from '@/app/hooks/useToastHelper';
import {
    GAS_SHORTAGE_MESSAGE,
    GAS_SHORTAGE_TITLE,
    GAS_SHORTAGE_DESCRIPTION,
} from '@/app/utils/toastErrors';
import { useAuth } from '@/app/contexts/AuthContext';
import ExternalLink from '@/app/components/ExternalLink';
import LeaveSeatAction from './LeaveSeatAction';

const CHIPS_PER_USDC = 100;
const USDC_LOGO_URL = '/usdc-logo.png';
const WITHDRAW_POLL_INTERVAL_MS = 5000;

const WithdrawBalanceCard = () => {
    const wallet = useActiveWallet();
    const address = wallet?.getAccount()?.address;
    const { isAuthenticated, isAuthenticating } = useAuth();
    const appStore = useContext(AppContext);
    const config = appStore.appState.game?.config;
    const isCryptoGame = Boolean(config?.crypto);
    const contractAddress = config?.contractAddress;
    const tableChain = (CHAIN_CONFIG[config?.chain ?? ''] ?? { chain: defaultChain }).chain;
    const { success, error: toastError } = useToastHelper();
    const isOwner = useIsTableOwner();
    const settlementStatus = appStore.appState.settlementStatus;
    const { isOpen: isAdvancedOpen, onToggle: onAdvancedToggle } = useDisclosure();
    const socket = useContext(SocketContext);
    const { info: infoToast } = useToastHelper();
    const localPlayer = appStore.appState.game?.players?.find(
        (p) => p.uuid === appStore.appState.clientID
    );
    const leaveAfterHandRequested = Boolean(localPlayer?.leaveAfterHand);
    const settlementStuck = Boolean(appStore.appState.game?.settlementStuck);
    const onLeaveSeat = () =>
        handleLeaveTable(socket, infoToast, leaveAfterHandRequested);

    const isUserSeated = appStore.appState.game?.players?.some(
        (player) => player.uuid === appStore.appState.clientID
    );

    const {
        withdraw,
        checkCanWithdraw,
        canWithdraw,
        chipBalance,
        status,
        error,
        isLoading,
    } = useWithdraw(contractAddress, tableChain);

    // ── Host rake hook (only used when owner) ────────────────────────
    const {
        rakeBalance,
        rakeUsdcFormatted,
        status: rakeStatus,
        error: rakeError,
        isLoading: rakeLoading,
        withdraw: rakeWithdraw,
        refresh: rakeRefresh,
    } = useHostRake(contractAddress, tableChain);

    const {
        trigger: emergencyWithdraw,
        status: emergencyStatus,
        error: emergencyError,
        reset: emergencyReset,
    } = useEmergencyWithdraw(contractAddress, tableChain);

    const hasRakeBalance = rakeBalance !== null && rakeBalance > BigInt(0);

    // Refresh rake after settlement
    useEffect(() => {
        if (settlementStatus === 'success' && isCryptoGame) {
            const timer = setTimeout(() => rakeRefresh(), 2000);
            return () => clearTimeout(timer);
        }
    }, [settlementStatus, isCryptoGame, rakeRefresh]);

    const refreshWithdrawStatus = useCallback(() => {
        if (address && contractAddress) {
            checkCanWithdraw();
        }
    }, [address, contractAddress, checkCanWithdraw]);

    useEffect(() => {
        refreshWithdrawStatus();
    }, [refreshWithdrawStatus, isUserSeated]);

    useEffect(() => {
        if (isUserSeated) return;
        if (canWithdraw !== false) return;
        if (chipBalance === null || chipBalance === BigInt(0)) return;
        const id = setInterval(
            refreshWithdrawStatus,
            WITHDRAW_POLL_INTERVAL_MS
        );
        return () => clearInterval(id);
    }, [isUserSeated, canWithdraw, chipBalance, refreshWithdrawStatus]);

    if (!isCryptoGame || !address) return null;

    const formattedChipBalance =
        chipBalance !== null
            ? Number(chipBalance).toLocaleString('en-US')
            : '0';

    const formattedUsdcValue =
        chipBalance !== null
            ? (Number(chipBalance) / CHIPS_PER_USDC).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : '0.00';

    const handleWithdraw = async () => {
        const withdrawSuccess = await withdraw();
        if (withdrawSuccess) {
            success(
                'Withdrawal sent',
                'Your chips are converting back to USDC.'
            );
        } else if (error === GAS_SHORTAGE_MESSAGE) {
            toastError(GAS_SHORTAGE_TITLE, GAS_SHORTAGE_DESCRIPTION);
        } else if (error) {
            toastError('Withdrawal failed', 'Please try again.');
        }
    };

    const handleCollectRake = async () => {
        const ok = await rakeWithdraw();
        if (ok) {
            success(
                'Rewards collected',
                'Your host rewards are on their way to your wallet.'
            );
        } else if (rakeError) {
            toastError('Could not collect rewards', 'Please try again.');
        }
    };

    const isButtonDisabled =
        isUserSeated ||
        isLoading ||
        !canWithdraw ||
        chipBalance === BigInt(0);

    const getStatusMessage = () => {
        if (status === 'withdrawing') return 'Converting...';
        return 'Processing...';
    };

    return (
        <Flex
            direction="column"
            gap={{ base: 2, md: 2.5 }}
            w="100%"
            bg="card.white"
            borderRadius={{ base: '12px', md: '16px' }}
            border="2px solid"
            borderColor="border.lightGray"
            px={{ base: 3, sm: 4, md: 5 }}
            py={{ base: 2.5, sm: 3, md: 4 }}
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)"
        >
            {/* Withdrawable Balance row */}
            <Flex align="center" w="100%" gap={{ base: 2, md: 3 }}>
                <Icon
                    as={FaCoins}
                    color="brand.yellow"
                    boxSize={{ base: 3.5, md: 4 }}
                    flexShrink={0}
                />
                <Text
                    fontSize={{ base: '2xs', md: 'xs' }}
                    fontWeight="semibold"
                    color="text.muted"
                    textTransform="uppercase"
                    letterSpacing="0.04em"
                    flexShrink={0}
                >
                    Withdrawable
                </Text>
                {isLoading && status === 'checking' ? (
                    <HStack spacing={2} flex={1} minW={0}>
                        <Spinner size="xs" color="brand.yellow" thickness="2px" />
                        <Text fontSize="xs" color="text.muted" fontWeight="medium">
                            Checking…
                        </Text>
                    </HStack>
                ) : (
                    <HStack spacing={1.5} align="center" flex={1} minW={0}>
                        <Text
                            fontSize={{ base: 'md', md: 'lg' }}
                            fontWeight="bold"
                            color="text.secondary"
                            lineHeight="1"
                        >
                            ${formattedUsdcValue}
                        </Text>
                        <HStack spacing={1} opacity={0.7}>
                            <Image
                                src={USDC_LOGO_URL}
                                alt="USDC"
                                boxSize="11px"
                                loading="lazy"
                            />
                            <Text fontSize="2xs" color="text.muted" fontWeight="medium">
                                USDC
                            </Text>
                        </HStack>
                        <Text
                            fontSize="2xs"
                            color="text.muted"
                            opacity={0.5}
                            display={{ base: 'none', sm: 'inline' }}
                        >
                            · {formattedChipBalance} chips
                        </Text>
                    </HStack>
                )}

                {/* Action slot — Leave seat when seated, Withdraw otherwise */}
                {isUserSeated ? (
                    <LeaveSeatAction
                        onClick={onLeaveSeat}
                        isLeaveRequested={leaveAfterHandRequested}
                        settlementStuck={settlementStuck}
                    />
                ) : (
                    <Button
                        size={{ base: 'sm', md: 'md' }}
                        px={{ base: 4, md: 5 }}
                        h={{ base: '34px', sm: '36px', md: '40px' }}
                        bg="brand.yellow"
                        color="white"
                        border="none"
                        borderRadius={{ base: '10px', md: '12px' }}
                        fontWeight="bold"
                        fontSize={{ base: 'xs', md: 'sm' }}
                        letterSpacing="0.02em"
                        isDisabled={isButtonDisabled}
                        isLoading={isLoading && status === 'withdrawing'}
                        loadingText={getStatusMessage()}
                        onClick={handleWithdraw}
                        flexShrink={0}
                        boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 #B78900"
                        transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
                        _hover={{ bg: 'brand.yellow' }}
                        _active={{
                            bg: 'brand.yellowDark',
                            transform: 'translateY(2px)',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #B78900',
                        }}
                    >
                        Withdraw
                    </Button>
                )}
            </Flex>

            {!isAuthenticated && (
                <HStack
                    spacing={2}
                    alignItems="flex-start"
                    bg="rgba(54, 163, 123, 0.12)"
                    color="green.700"
                    borderRadius="md"
                    px={3}
                    py={2}
                    fontSize="xs"
                    fontWeight="medium"
                    w="fit-content"
                >
                    <Icon as={FaInfoCircle} boxSize={3.5} mt={0.5} />
                    <Text color="inherit">
                        {isAuthenticating
                            ? 'Check your wallet to sign the message…'
                            : 'Sign the message in your wallet to continue.'}
                    </Text>
                </HStack>
            )}
            {/* Seated hint — slim, the action lives in the row above */}
            {isUserSeated && (
                <HStack
                    spacing={2}
                    alignItems="flex-start"
                    bg="rgba(237, 137, 54, 0.12)"
                    color="orange.600"
                    _dark={{
                        bg: 'rgba(237, 137, 54, 0.15)',
                        color: 'orange.300',
                    }}
                    borderRadius="md"
                    px={3}
                    py={2}
                    fontSize="xs"
                    fontWeight="medium"
                    w="fit-content"
                >
                    <Icon as={FaInfoCircle} boxSize={3.5} mt={0.5} flexShrink={0} />
                    <Text color="inherit">
                        {settlementStuck
                            ? 'Settlement in progress — leave temporarily unavailable.'
                            : leaveAfterHandRequested
                              ? 'Leaving after this hand. Withdraw unlocks once you stand up.'
                              : 'Leave your seat to unlock withdraw.'}
                    </Text>
                </HStack>
            )}

            {!canWithdraw &&
                !isUserSeated &&
                chipBalance !== null &&
                chipBalance > BigInt(0) && (
                    <HStack
                        spacing={2}
                        alignItems="flex-start"
                        bg="rgba(237, 137, 54, 0.12)"
                        color="orange.600"
                        _dark={{
                            bg: 'rgba(237, 137, 54, 0.15)',
                            color: 'orange.300',
                        }}
                        borderRadius="md"
                        px={3}
                        py={2}
                        fontSize="xs"
                        fontWeight="medium"
                        w="fit-content"
                    >
                        <Icon as={FaInfoCircle} boxSize={3.5} mt={0.5} />
                        <Text color="inherit">
                            Wait for the current hand to settle.
                        </Text>
                    </HStack>
                )}

            {error && (
                <HStack
                    spacing={2}
                    alignItems="flex-start"
                    bg="rgba(254, 178, 178, 0.12)"
                    color="red.700"
                    _dark={{
                        bg: 'rgba(254, 178, 178, 0.12)',
                        color: 'red.300',
                    }}
                    borderRadius="md"
                    px={3}
                    py={2}
                    fontSize="xs"
                    fontWeight="medium"
                    w="fit-content"
                >
                    <Icon as={FaInfoCircle} boxSize={3.5} mt={0.5} />
                    <Text color="inherit" wordBreak="break-word">
                        {error}
                    </Text>
                </HStack>
            )}

            {/* ── Host Rake Row (owners only) ───────────────────────── */}
            {isOwner && (
                <>
                    <Divider borderColor="border.lightGray" />
                    <Flex align="center" w="100%" gap={{ base: 2, md: 3 }}>
                        <Icon
                            as={FaCrown}
                            color="brand.yellow"
                            boxSize={{ base: 3.5, md: 4 }}
                            flexShrink={0}
                        />
                        <Tooltip
                            label="Earned from table fees on each settled hand"
                            placement="top"
                            hasArrow
                            fontSize="xs"
                            bg="gray.800"
                            color="white"
                            borderRadius="md"
                            px={3}
                            py={1.5}
                        >
                            <Text
                                fontSize={{ base: '2xs', md: 'xs' }}
                                fontWeight="semibold"
                                color="text.muted"
                                textTransform="uppercase"
                                letterSpacing="0.04em"
                                cursor="help"
                                borderBottom="1px dashed"
                                borderColor="text.muted"
                                flexShrink={0}
                            >
                                Host Rewards
                            </Text>
                        </Tooltip>
                        {rakeLoading && rakeStatus === 'loading' ? (
                            <HStack spacing={2} flex={1} minW={0}>
                                <Spinner size="xs" color="brand.yellow" thickness="2px" />
                                <Text fontSize="xs" color="text.muted" fontWeight="medium">
                                    Checking…
                                </Text>
                            </HStack>
                        ) : (
                            <HStack spacing={1.5} align="center" flex={1} minW={0}>
                                <Text
                                    fontSize={{ base: 'md', md: 'lg' }}
                                    fontWeight="bold"
                                    color="text.secondary"
                                    lineHeight="1"
                                >
                                    ${rakeUsdcFormatted}
                                </Text>
                                <HStack spacing={1} opacity={0.7}>
                                    <Image
                                        src={USDC_LOGO_URL}
                                        alt="USDC"
                                        boxSize="11px"
                                        loading="lazy"
                                    />
                                    <Text fontSize="2xs" color="text.muted" fontWeight="medium">
                                        USDC
                                    </Text>
                                </HStack>
                            </HStack>
                        )}

                        <Button
                            data-testid="host-rake-collect-btn"
                            size={{ base: 'sm', md: 'md' }}
                            px={{ base: 4, md: 5 }}
                            h={{ base: '34px', sm: '36px', md: '40px' }}
                            bg="brand.yellow"
                            color="white"
                            border="none"
                            borderRadius={{ base: '10px', md: '12px' }}
                            fontWeight="bold"
                            fontSize={{ base: 'xs', md: 'sm' }}
                            letterSpacing="0.02em"
                            isDisabled={!hasRakeBalance || rakeLoading}
                            isLoading={rakeStatus === 'withdrawing'}
                            loadingText="Collecting..."
                            onClick={handleCollectRake}
                            flexShrink={0}
                            boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 #B78900"
                            transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
                            _hover={{ bg: 'brand.yellow' }}
                            _active={{
                                bg: 'brand.yellowDark',
                                transform: 'translateY(2px)',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #B78900',
                            }}
                        >
                            Collect
                        </Button>
                    </Flex>
                </>
            )}

            {/* Advanced disclosure → Emergency Withdraw */}
            <Divider borderColor="border.lightGray" />
            <Box>
                <Flex
                    as="button"
                    type="button"
                    onClick={onAdvancedToggle}
                    align="center"
                    justify="space-between"
                    w="100%"
                    py={1}
                    aria-expanded={isAdvancedOpen}
                    _hover={{ '& .advanced-label': { color: 'text.secondary' } }}
                >
                    <Text
                        className="advanced-label"
                        fontSize="2xs"
                        fontWeight="semibold"
                        color="text.muted"
                        textTransform="uppercase"
                        letterSpacing="0.06em"
                        transition="color 80ms ease"
                    >
                        Advanced
                    </Text>
                    <Icon
                        as={FiChevronDown}
                        boxSize={3.5}
                        color="text.muted"
                        transform={isAdvancedOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                        transition="transform 160ms ease"
                    />
                </Flex>
                <Collapse in={isAdvancedOpen} animateOpacity>
                    <Flex
                        align="center"
                        justify="space-between"
                        w="100%"
                        gap={3}
                        pt={2}
                    >
                        <Text
                            fontSize="2xs"
                            color="text.muted"
                            lineHeight="1.4"
                            opacity={0.85}
                            flex={1}
                            minW={0}
                        >
                            Escape hatch if normal withdraw is unavailable.
                            Only enabled <strong>before the first hand</strong>{' '}
                            or <strong>24 hours after the last settlement</strong>.
                            Pulls your last-settled balance directly from the
                            contract. {CHIPS_PER_USDC}&nbsp;chips&nbsp;=&nbsp;1&nbsp;USDC.
                            {contractAddress && (
                                <>
                                    {' '}
                                    <ExternalLink
                                        href={`https://sepolia.basescan.org/address/${contractAddress}`}
                                        fontWeight="semibold"
                                    >
                                        View contract
                                    </ExternalLink>
                                </>
                            )}
                        </Text>
                <Button
                    data-testid="emergency-withdraw-btn"
                    px={2.5}
                    py={1.5}
                    h="auto"
                    minH={0}
                    borderRadius="8px"
                    fontSize="2xs"
                    fontWeight={700}
                    lineHeight="1.05"
                    whiteSpace="pre-line"
                    letterSpacing="0.02em"
                    bg={emergencyStatus === 'success' ? 'brand.green' : 'brand.pink'}
                    color="white"
                    border="none"
                    flexShrink={0}
                    isLoading={emergencyStatus === 'pending'}
                    loadingText="Processing"
                    boxShadow={
                        emergencyStatus === 'success'
                            ? 'inset 0 1px 0 rgba(255,255,255,0.18), 0 1.5px 0 #22674E'
                            : 'inset 0 1px 0 rgba(255,255,255,0.18), 0 1.5px 0 #950839'
                    }
                    transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
                    _hover={{
                        bg: emergencyStatus === 'success' ? 'brand.green' : 'brand.pink',
                    }}
                    _active={{
                        bg:
                            emergencyStatus === 'success'
                                ? 'brand.greenDark'
                                : 'brand.pinkDark',
                        transform: 'translateY(1.5px)',
                        boxShadow:
                            emergencyStatus === 'success'
                                ? 'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #22674E'
                                : 'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #950839',
                    }}
                    onClick={() => {
                        if (emergencyStatus === 'pending') return;
                        if (emergencyStatus === 'error') emergencyReset();
                        emergencyWithdraw();
                    }}
                >
                    {emergencyStatus === 'success'
                        ? 'Done'
                        : emergencyStatus === 'error'
                        ? 'Retry'
                        : 'Emergency\nWithdraw'}
                </Button>
                    </Flex>
                </Collapse>
            </Box>

            {emergencyError && (
                <HStack
                    spacing={2}
                    alignItems="flex-start"
                    bg="rgba(254, 178, 178, 0.12)"
                    color="red.700"
                    _dark={{ bg: 'rgba(254, 178, 178, 0.12)', color: 'red.300' }}
                    borderRadius="md"
                    px={3}
                    py={2}
                    fontSize="xs"
                    fontWeight="medium"
                    w="fit-content"
                >
                    <Icon as={FaInfoCircle} boxSize={3.5} mt={0.5} />
                    <Text color="inherit" wordBreak="break-word">
                        {emergencyError}
                    </Text>
                </HStack>
            )}
        </Flex>
    );
};

export default WithdrawBalanceCard;
