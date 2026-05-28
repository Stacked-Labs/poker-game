'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    Text,
    VStack,
    HStack,
    Icon,
    Image,
    Spinner,
} from '@chakra-ui/react';
import type { ElementType } from 'react';
import { FaCoins, FaCrown } from 'react-icons/fa';
import { useActiveAccount } from 'thirdweb/react';
import { AppContext } from '../contexts/AppStoreProvider';
import { useWithdraw } from '../hooks/useWithdraw';
import { useHostRake } from '../hooks/useHostRake';
import useIsTableOwner from '../hooks/useIsTableOwner';
import useToastHelper from '../hooks/useToastHelper';
import { CHAIN_CONFIG, defaultChain } from '../thirdwebclient';

const CHIPS_PER_USDC = 100;
const USDC_LOGO_URL = '/usdc-logo.png';
const ELIGIBILITY_POLL_MS = 15_000;

export type WithdrawPromptRow = {
    icon: ElementType;
    iconColor: string;
    label: string;
    primaryValue: string;
    secondary?: string;
    actionLabel: string;
    isLoading: boolean;
    onClick: () => void;
    testId: string;
    // When true, the action button is replaced with a spinner + message —
    // used for the chip row while the last hand is still settling on-chain.
    pending?: boolean;
    pendingMessage?: string;
};

export type WithdrawPromptModalViewProps = {
    isOpen: boolean;
    onClose: () => void;
    heading: string;
    rows: WithdrawPromptRow[];
};

const WithdrawPromptModal = () => {
    const { appState } = useContext(AppContext);
    const account = useActiveAccount();
    const isOwner = useIsTableOwner();
    const { success, error: errorToast } = useToastHelper();

    // Per product call: prompt on every page-load if balance > 0; dismissal
    // is local to this mount only.
    const [dismissed, setDismissed] = useState(false);

    const config = appState.game?.config;
    const isCryptoGame = Boolean(config?.crypto);
    const contractAddress = config?.contractAddress;
    const tableChain =
        CHAIN_CONFIG[config?.chain ?? '']?.chain ?? defaultChain;

    const isUserSeated = useMemo(
        () =>
            Boolean(
                appState.game?.players?.some(
                    (p) => p.uuid === appState.clientID
                )
            ),
        [appState.game?.players, appState.clientID]
    );

    const walletReady = Boolean(account?.address);
    const eligible =
        isCryptoGame &&
        walletReady &&
        !isUserSeated &&
        Boolean(contractAddress);

    const {
        checkCanWithdraw,
        withdraw: withdrawChips,
        canWithdraw,
        chipBalance,
        status: chipStatus,
    } = useWithdraw(contractAddress, tableChain);

    const {
        rakeBalance,
        rakeUsdcFormatted,
        status: rakeStatus,
        withdraw: withdrawRake,
        refresh: refreshRake,
    } = useHostRake(contractAddress, tableChain);

    // useWithdraw has no internal poll loop (unlike useHostRake). Drive
    // checkCanWithdraw ourselves so the prompt opens the moment the last
    // hand settles on-chain.
    useEffect(() => {
        if (!eligible) return;
        void checkCanWithdraw();
        const id = setInterval(() => {
            void checkCanWithdraw();
        }, ELIGIBILITY_POLL_MS);
        return () => clearInterval(id);
    }, [eligible, checkCanWithdraw]);

    const hasChipBalance =
        chipBalance !== null && chipBalance > BigInt(0);
    // Only surface the chip row once we know the on-chain eligibility — avoids
    // a "Settling…" flicker on first paint while the read is still in flight.
    const chipRowVisible = hasChipBalance && canWithdraw !== null;
    const chipIsSettling = chipRowVisible && canWithdraw === false;
    const hasHostRewards =
        isOwner && rakeBalance !== null && rakeBalance > BigInt(0);

    const shouldShow =
        eligible && !dismissed && (chipRowVisible || hasHostRewards);

    if (!shouldShow) return null;

    const formattedChipsUSDC =
        chipBalance !== null
            ? (Number(chipBalance) / CHIPS_PER_USDC).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : '0.00';
    const formattedChipsCount =
        chipBalance !== null
            ? Number(chipBalance).toLocaleString('en-US')
            : '0';

    const handleWithdrawChips = async () => {
        const ok = await withdrawChips();
        if (ok) {
            success(
                'USDC sent to your wallet',
                `${formattedChipsUSDC} USDC withdrawn from the table contract.`
            );
        } else {
            errorToast(
                'Withdraw failed',
                'Check your wallet and try again.'
            );
        }
    };

    const handleCollectRake = async () => {
        const ok = await withdrawRake();
        if (ok) {
            success(
                'Host rewards collected',
                `$${rakeUsdcFormatted} USDC sent to your wallet.`
            );
            void refreshRake();
        } else {
            errorToast(
                'Collection failed',
                'Check your wallet and try again.'
            );
        }
    };

    const rows: WithdrawPromptRow[] = [];
    if (chipRowVisible) {
        rows.push({
            icon: FaCoins,
            iconColor: 'brand.yellow',
            label: 'Chip Balance',
            primaryValue: `$${formattedChipsUSDC}`,
            secondary: `${formattedChipsCount} chips`,
            actionLabel: 'Withdraw',
            isLoading: chipStatus === 'withdrawing',
            onClick: handleWithdrawChips,
            testId: 'prompt-withdraw-chips-btn',
            pending: chipIsSettling,
            pendingMessage: 'Settling on-chain…',
        });
    }
    if (hasHostRewards) {
        rows.push({
            icon: FaCrown,
            iconColor: 'brand.yellow',
            label: 'Host Rewards',
            primaryValue: `$${rakeUsdcFormatted}`,
            actionLabel: 'Collect',
            isLoading: rakeStatus === 'withdrawing',
            onClick: handleCollectRake,
            testId: 'prompt-collect-rake-btn',
        });
    }

    const heading =
        chipRowVisible && hasHostRewards
            ? 'You have funds to collect'
            : chipRowVisible
              ? chipIsSettling
                  ? 'Your USDC is settling on-chain'
                  : 'You have USDC to withdraw'
              : 'You have host rewards to collect';

    return (
        <WithdrawPromptModalView
            isOpen={true}
            onClose={() => setDismissed(true)}
            heading={heading}
            rows={rows}
        />
    );
};

export const WithdrawPromptModalView = ({
    isOpen,
    onClose,
    heading,
    rows,
}: WithdrawPromptModalViewProps) => (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.700" />
        <ModalContent
            bg="card.heroBg"
            backdropFilter="blur(12px)"
            border="1px solid"
            borderColor="border.lightGray"
            boxShadow="0 0 32px rgba(54, 163, 123, 0.20)"
            borderRadius="xl"
            mx={4}
        >
            <ModalCloseButton color="text.muted" size="lg" top={2} right={2} />
            <ModalHeader pb={1} px={{ base: 10, md: 6 }}>
                <VStack spacing={1.5} pt={2} align="stretch">
                    <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color="text.secondary"
                        textAlign="center"
                        lineHeight="1.2"
                    >
                        {heading}
                    </Text>
                    <Text
                        fontSize={{ base: 'sm', md: 'xs' }}
                        fontWeight="medium"
                        color="text.muted"
                        textAlign="center"
                        lineHeight="1.5"
                    >
                        Your USDC is parked in the table contract. Pull it
                        back to your wallet whenever.
                    </Text>
                </VStack>
            </ModalHeader>

            <ModalBody pb={3}>
                <VStack spacing={2.5} align="stretch">
                    {rows.map((row) => (
                        <BalanceRow key={row.testId} {...row} />
                    ))}
                </VStack>
            </ModalBody>

            <ModalFooter justifyContent="center" pt={1} pb={4}>
                <Button
                    size={{ base: 'md', md: 'sm' }}
                    minH={{ base: '44px', md: '32px' }}
                    bg="transparent"
                    border="none"
                    color="text.muted"
                    onClick={onClose}
                    fontWeight="medium"
                    fontSize={{ base: 'sm', md: 'xs' }}
                    _hover={{ bg: 'transparent', color: 'text.secondary' }}
                    _active={{ bg: 'transparent', transform: 'none' }}
                >
                    Maybe later
                </Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
);

const BalanceRow = ({
    icon,
    iconColor,
    label,
    primaryValue,
    secondary,
    actionLabel,
    isLoading,
    onClick,
    testId,
    pending,
    pendingMessage,
}: WithdrawPromptRow) => (
    <HStack
        spacing={3}
        align="center"
        bg="card.lightGray"
        border="1px solid"
        borderColor="border.lightGray"
        borderRadius="lg"
        px={3}
        py={2.5}
    >
        <Icon as={icon} color={iconColor} boxSize={5} flexShrink={0} />
        <VStack spacing={0.5} align="stretch" flex={1} minW={0}>
            <Text
                fontSize="2xs"
                fontWeight="semibold"
                color="text.muted"
                textTransform="uppercase"
                letterSpacing="0.04em"
                lineHeight="1"
            >
                {label}
            </Text>
            <HStack spacing={1.5} align="baseline" flexWrap="nowrap" minW={0}>
                <Text
                    fontSize="md"
                    fontWeight="bold"
                    color="text.secondary"
                    lineHeight="1"
                >
                    {primaryValue}
                </Text>
                <Image
                    src={USDC_LOGO_URL}
                    alt="USDC"
                    boxSize="11px"
                    loading="lazy"
                />
                <Text fontSize="2xs" color="text.muted" fontWeight="medium">
                    USDC
                </Text>
                {secondary && (
                    <Text
                        fontSize="2xs"
                        color="text.muted"
                        opacity={0.5}
                        display={{ base: 'none', sm: 'inline' }}
                        whiteSpace="nowrap"
                    >
                        · {secondary}
                    </Text>
                )}
            </HStack>
        </VStack>
        {pending ? (
            <HStack
                spacing={1.5}
                px={3}
                h={{ base: '40px', md: '34px' }}
                align="center"
                flexShrink={0}
                bg="bg.greenSubtle"
                borderRadius="10px"
                border="1px solid"
                borderColor="border.greenSubtle"
                data-testid={`${testId}-pending`}
                aria-live="polite"
            >
                <Spinner
                    size="xs"
                    color="brand.yellow"
                    thickness="2px"
                    speed="0.8s"
                />
                <Text
                    fontSize="2xs"
                    fontWeight="semibold"
                    color="text.muted"
                    whiteSpace="nowrap"
                >
                    {pendingMessage ?? 'Checking on-chain…'}
                </Text>
            </HStack>
        ) : (
            <Button
                data-testid={testId}
                size={{ base: 'md', md: 'sm' }}
                px={4}
                h={{ base: '40px', md: '34px' }}
                bg="brand.yellow"
                color="white"
                border="none"
                borderRadius="10px"
                fontWeight="bold"
                fontSize="xs"
                letterSpacing="0.02em"
                isLoading={isLoading}
                loadingText="…"
                onClick={onClick}
                flexShrink={0}
                boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 #B78900"
                transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
                _hover={{ bg: 'brand.yellow' }}
                _active={{
                    bg: 'brand.yellowDark',
                    transform: 'translateY(2px)',
                    boxShadow:
                        'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #B78900',
                }}
            >
                {actionLabel}
            </Button>
        )}
    </HStack>
);

export default WithdrawPromptModal;
