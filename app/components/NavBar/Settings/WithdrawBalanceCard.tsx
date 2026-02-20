'use client';

import React, { useContext, useEffect, useCallback } from 'react';
import {
    Button,
    Flex,
    Text,
    HStack,
    VStack,
    Icon,
    Spinner,
    Image,
    Link,
    Divider,
    Tooltip,
} from '@chakra-ui/react';
import { FaCoins, FaCrown, FaInfoCircle } from 'react-icons/fa';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { useWithdraw } from '@/app/hooks/useWithdraw';
import { useHostRake } from '@/app/hooks/useHostRake';
import useIsTableOwner from '@/app/hooks/useIsTableOwner';
import { useActiveWallet } from 'thirdweb/react';
import useToastHelper from '@/app/hooks/useToastHelper';

const CHIPS_PER_USDC = 100;
const USDC_LOGO_URL = 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png';

const WithdrawBalanceCard = () => {
    const wallet = useActiveWallet();
    const address = wallet?.getAccount()?.address;
    const appStore = useContext(AppContext);
    const config = appStore.appState.game?.config;
    const isCryptoGame = Boolean(config?.crypto);
    const contractAddress = config?.contractAddress;
    const { success, error: toastError } = useToastHelper();
    const isOwner = useIsTableOwner();
    const settlementStatus = appStore.appState.settlementStatus;

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
    } = useWithdraw(contractAddress);

    // ── Host rake hook (only used when owner) ────────────────────────
    const {
        rakeBalance,
        rakeUsdcFormatted,
        status: rakeStatus,
        error: rakeError,
        isLoading: rakeLoading,
        withdraw: rakeWithdraw,
        refresh: rakeRefresh,
    } = useHostRake(contractAddress);

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
    }, [refreshWithdrawStatus]);

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
                'Withdrawal Successful',
                'Your chips have been converted back to USDC.'
            );
        } else if (error) {
            toastError('Withdrawal Failed', error);
        }
    };

    const handleCollectRake = async () => {
        const ok = await rakeWithdraw();
        if (ok) {
            success(
                'Rewards Collected',
                'Your host rewards have been transferred to your wallet.'
            );
        } else if (rakeError) {
            toastError('Collect Failed', rakeError);
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
            {/* Header + Balance */}
            <Flex
                justify="space-between"
                align="center"
                w="100%"
                gap={3}
            >
                <VStack spacing={0} align="flex-start">
                    <HStack spacing={1.5}>
                        <Icon
                            as={FaCoins}
                            color="brand.yellow"
                            boxSize={{ base: 3.5, md: 4 }}
                        />
                        <Text
                            fontSize={{ base: 'xs', md: 'sm' }}
                            fontWeight="semibold"
                            color="text.muted"
                            textTransform="uppercase"
                            letterSpacing="0.04em"
                        >
                            Withdrawable Balance
                        </Text>
                    </HStack>
                    {isLoading && status === 'checking' ? (
                        <HStack spacing={2} mt={1}>
                            <Spinner
                                size="xs"
                                color="brand.yellow"
                                thickness="2px"
                            />
                            <Text
                                fontSize="xs"
                                color="text.muted"
                                fontWeight="medium"
                            >
                                Checking...
                            </Text>
                        </HStack>
                    ) : (
                        <HStack spacing={2} align="baseline" mt={0.5}>
                            <Text
                                fontSize={{ base: 'lg', md: 'xl' }}
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
                                    boxSize="12px"
                                    loading="lazy"
                                />
                                <Text
                                    fontSize="xs"
                                    color="text.muted"
                                    fontWeight="medium"
                                >
                                    USDC
                                </Text>
                            </HStack>
                            <Text
                                fontSize="xs"
                                color="text.muted"
                                fontWeight="medium"
                                opacity={0.5}
                            >
                                {formattedChipBalance} chips
                            </Text>
                        </HStack>
                    )}
                </VStack>

                {/* Withdraw button */}
                <Tooltip
                    label="Leave the table first to withdraw"
                    isDisabled={!isUserSeated}
                    placement="top"
                    hasArrow
                    fontSize="xs"
                    bg="gray.800"
                    color="white"
                    borderRadius="md"
                    px={2}
                    py={1}
                >
                    <Button
                        size={{ base: 'sm', md: 'md' }}
                        px={{ base: 4, md: 5 }}
                        h={{ base: '34px', sm: '36px', md: '40px' }}
                        bg={isButtonDisabled ? 'gray.300' : 'brand.yellow'}
                        color={isButtonDisabled ? 'gray.500' : 'white'}
                        border="none"
                        borderRadius={{ base: '10px', md: '12px' }}
                        fontWeight="bold"
                        fontSize={{ base: 'xs', md: 'sm' }}
                        isDisabled={isButtonDisabled}
                        isLoading={isLoading && status === 'withdrawing'}
                        loadingText={getStatusMessage()}
                        onClick={handleWithdraw}
                        flexShrink={0}
                        _disabled={{
                            bg: 'gray.300',
                            color: 'gray.500',
                            cursor: 'not-allowed',
                            opacity: 0.6,
                        }}
                        _hover={
                            isButtonDisabled
                                ? {}
                                : { opacity: 0.85 }
                        }
                        _active={
                            isButtonDisabled
                                ? {}
                                : { opacity: 0.7 }
                        }
                        transition="opacity 0.15s ease"
                    >
                        Withdraw
                    </Button>
                </Tooltip>
            </Flex>

            {/* Seated warning — scoped to withdrawals */}
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
                    <Icon as={FaInfoCircle} boxSize={3.5} mt={0.5} />
                    <Text color="inherit">
                        Leave the table before withdrawing.
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
                    <Flex
                        justify="space-between"
                        align="center"
                        w="100%"
                        gap={3}
                    >
                        <VStack spacing={0} align="flex-start">
                            <HStack spacing={1.5}>
                                <Icon
                                    as={FaCrown}
                                    color="brand.yellow"
                                    boxSize={{ base: 3.5, md: 4 }}
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
                                        fontSize={{ base: 'xs', md: 'sm' }}
                                        fontWeight="semibold"
                                        color="text.muted"
                                        textTransform="uppercase"
                                        letterSpacing="0.04em"
                                        cursor="help"
                                        borderBottom="1px dashed"
                                        borderColor="text.muted"
                                    >
                                        Host Rewards
                                    </Text>
                                </Tooltip>
                            </HStack>
                            {rakeLoading && rakeStatus === 'loading' ? (
                                <HStack spacing={2} mt={1}>
                                    <Spinner
                                        size="xs"
                                        color="brand.yellow"
                                        thickness="2px"
                                    />
                                    <Text
                                        fontSize="xs"
                                        color="text.muted"
                                        fontWeight="medium"
                                    >
                                        Checking...
                                    </Text>
                                </HStack>
                            ) : (
                                <HStack spacing={2} align="baseline" mt={0.5}>
                                    <Text
                                        fontSize={{ base: 'lg', md: 'xl' }}
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
                                            boxSize="12px"
                                            loading="lazy"
                                        />
                                        <Text
                                            fontSize="xs"
                                            color="text.muted"
                                            fontWeight="medium"
                                        >
                                            USDC
                                        </Text>
                                    </HStack>
                                </HStack>
                            )}
                        </VStack>

                        <Button
                            size={{ base: 'sm', md: 'md' }}
                            px={{ base: 4, md: 5 }}
                            h={{ base: '34px', sm: '36px', md: '40px' }}
                            bg={!hasRakeBalance || rakeLoading ? 'gray.300' : 'brand.yellow'}
                            color={!hasRakeBalance || rakeLoading ? 'gray.500' : 'white'}
                            border="none"
                            borderRadius={{ base: '10px', md: '12px' }}
                            fontWeight="bold"
                            fontSize={{ base: 'xs', md: 'sm' }}
                            isDisabled={!hasRakeBalance || rakeLoading}
                            isLoading={rakeStatus === 'withdrawing'}
                            loadingText="Collecting..."
                            onClick={handleCollectRake}
                            flexShrink={0}
                            _disabled={{
                                bg: 'gray.300',
                                color: 'gray.500',
                                cursor: 'not-allowed',
                                opacity: 0.6,
                            }}
                            _hover={
                                !hasRakeBalance || rakeLoading
                                    ? {}
                                    : { opacity: 0.85 }
                            }
                            _active={
                                !hasRakeBalance || rakeLoading
                                    ? {}
                                    : { opacity: 0.7 }
                            }
                            transition="opacity 0.15s ease"
                        >
                            Collect
                        </Button>
                    </Flex>
                </>
            )}

            {/* Disclaimer */}
            <Text
                fontSize="2xs"
                color="text.muted"
                lineHeight="short"
                opacity={0.7}
            >
                Balance reflects the last settled hand. {CHIPS_PER_USDC}{' '}
                chips&nbsp;=&nbsp;1&nbsp;USDC.
                {contractAddress && (
                    <>
                        {' '}
                        <Link
                            href={`https://sepolia.basescan.org/address/${contractAddress}`}
                            isExternal
                            color="brand.navy"
                            _dark={{ color: 'brand.lightGray' }}
                            fontWeight="semibold"
                            textDecoration="underline"
                            textUnderlineOffset="2px"
                        >
                            View contract
                        </Link>
                    </>
                )}
            </Text>
        </Flex>
    );
};

export default WithdrawBalanceCard;
