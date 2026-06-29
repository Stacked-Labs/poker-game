'use client';

/**
 * Signed-in account control for the marketing/lobby nav (HomeNavBar).
 *
 * Gives a logged-in player a clear path to their OWN profile (the gap the
 * thirdweb connect button left), while preserving the full thirdweb wallet
 * modal: the "Wallet" row and "Add" both open `useWalletDetailsModal()`,
 * the same send / receive / bridge / buy / history / disconnect surface the
 * old ConnectButton details modal showed.
 *
 * `AccountMenu` is the desktop chip + dropdown; `MobileAccountCard` is the
 * drawer identity card. Both share `useAccountControls`.
 */

import {
    Box,
    Button,
    HStack,
    Icon,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Text,
    useColorMode,
} from '@chakra-ui/react';
import React from 'react';
import {
    FiUser,
    FiLogOut,
    FiCreditCard,
    FiChevronDown,
    FiArrowRight,
    FiPlus,
} from 'react-icons/fi';
import { RiGamepadLine } from 'react-icons/ri';
import {
    useActiveWallet,
    useDisconnect,
    useWalletBalance,
    useWalletDetailsModal,
} from 'thirdweb/react';
import {
    client,
    defaultChain,
    defaultUsdcAddress,
    supportedTokens,
} from '@/app/thirdwebclient';
import { useAuth } from '@/app/contexts/AuthContext';
import PlayerAvatar from '../PlayerAvatar';

const CHIP_SHADOW =
    'inset 0 1px 0 rgba(255,255,255,0.55), 0 1px 0 rgba(11,20,48,0.08)';
const MENU_SHADOW =
    '0 18px 44px rgba(11, 20, 48, 0.16), 0 0 0 1px rgba(11, 20, 48, 0.04)';

// Prefill the thirdweb Buy/onramp flow with USDC on the chain the app transacts on.
const BUY_OPTIONS = {
    prefillBuy: {
        token: {
            address: defaultUsdcAddress,
            name: 'USD Coin',
            symbol: 'USDC',
            icon: '/usdc-logo.png',
        },
        chain: defaultChain,
        allowEdits: { amount: true, token: false, chain: false },
    },
} as const;

const shorten = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export function useAccountControls() {
    const { userAddress, sessionWallet, xUsername, xProfileImageUrl, logout } =
        useAuth();
    // Prefer the wallet the SIWE session is bound to (server truth); fall back to
    // the connected wallet before the cookie has been read.
    const address = sessionWallet ?? userAddress ?? null;

    const { colorMode } = useColorMode();
    const wallet = useActiveWallet();
    const { disconnect } = useDisconnect();
    const detailsModal = useWalletDetailsModal();
    const { data: balance } = useWalletBalance({
        client,
        chain: defaultChain,
        address: address ?? undefined,
        tokenAddress: defaultUsdcAddress,
    });

    const handle = xUsername ? `@${xUsername}` : address ? shorten(address) : '';
    const shortAddress = address ? shorten(address) : '';
    const profileHref = address ? `/profile/${address}` : '/';
    const balanceLabel = balance
        ? `$${Number(balance.displayValue).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })}`
        : null;

    const openWallet = (withBuy = false) =>
        detailsModal.open({
            client,
            theme: colorMode === 'dark' ? 'dark' : 'light',
            supportedTokens,
            ...(withBuy ? { payOptions: BUY_OPTIONS } : {}),
        });

    // Mirror the ConnectButton's deliberate-disconnect: drop the wallet AND the
    // SIWE session so the cookie can't outlive the wallet on a shared browser.
    const signOut = async () => {
        try {
            if (wallet) await disconnect(wallet);
        } finally {
            await logout();
        }
    };

    return {
        address,
        handle,
        shortAddress,
        profileHref,
        avatarUrl: xProfileImageUrl,
        balanceLabel,
        openWallet,
        signOut,
    };
}

const AccountAvatar: React.FC<{
    size: number;
    avatarUrl?: string | null;
    address?: string | null;
    handle: string;
}> = ({ size, avatarUrl, address, handle }) => (
    <Box
        w={`${size}px`}
        h={`${size}px`}
        borderRadius="full"
        overflow="hidden"
        flexShrink={0}
    >
        <PlayerAvatar
            profileImageUrl={avatarUrl}
            address={address}
            username={handle || address || 'player'}
        />
    </Box>
);

const RowItem: React.FC<{
    icon: React.ElementType;
    label: string;
    sub?: string;
    tone?: 'accent' | 'neutral' | 'muted';
    href?: string;
    onClick?: () => void;
}> = ({ icon, label, sub, tone = 'neutral', href, onClick }) => {
    const accent = tone === 'accent';
    const muted = tone === 'muted';
    const linkProps = href
        ? ({ as: 'a', href } as const)
        : ({ onClick } as const);
    return (
        <MenuItem
            {...linkProps}
            mx={2}
            my="2px"
            px={3}
            py={2.5}
            borderRadius="10px"
            w="auto"
            bg={accent ? 'bg.greenTint' : 'transparent'}
            _hover={{ bg: accent ? 'bg.greenTint' : 'bg.pillNeutral' }}
            _focus={{ bg: accent ? 'bg.greenTint' : 'bg.pillNeutral' }}
        >
            <HStack spacing={3} w="full" align="center">
                <Icon
                    as={icon}
                    boxSize={4}
                    color={
                        accent
                            ? 'brand.green'
                            : muted
                              ? 'text.muted'
                              : 'text.secondary'
                    }
                />
                <Box flex={1}>
                    <Text
                        fontWeight="600"
                        fontSize="sm"
                        lineHeight="1.25"
                        color={
                            accent
                                ? 'brand.greenDark'
                                : muted
                                  ? 'text.muted'
                                  : 'text.primary'
                        }
                    >
                        {label}
                    </Text>
                    {sub && (
                        <Text fontSize="11px" color="text.muted" lineHeight="1.25">
                            {sub}
                        </Text>
                    )}
                </Box>
                {accent && (
                    <Icon as={FiArrowRight} boxSize={3.5} color="brand.green" />
                )}
            </HStack>
        </MenuItem>
    );
};

export function AccountMenu({ defaultIsOpen }: { defaultIsOpen?: boolean } = {}) {
    const c = useAccountControls();
    return (
        <Menu
            placement="bottom-end"
            autoSelect={false}
            isLazy
            defaultIsOpen={defaultIsOpen}
        >
            <MenuButton
                h="44px"
                pl={2}
                pr={3}
                borderRadius="full"
                bg="card.white"
                border="1px solid"
                borderColor="border.felt"
                boxShadow={CHIP_SHADOW}
                transition="border-color 120ms ease"
                _hover={{ borderColor: 'border.pillNeutral' }}
                _dark={{ boxShadow: 'none' }}
            >
                <HStack spacing={2.5} align="center">
                    <AccountAvatar
                        size={30}
                        avatarUrl={c.avatarUrl}
                        address={c.address}
                        handle={c.handle}
                    />
                    <Text
                        fontWeight="700"
                        fontSize="sm"
                        color="text.primary"
                        noOfLines={1}
                        maxW="140px"
                    >
                        {c.handle}
                    </Text>
                    <Icon as={FiChevronDown} boxSize="14px" color="text.gray600" />
                </HStack>
            </MenuButton>
            <MenuList
                p={0}
                overflow="hidden"
                minW="284px"
                bg="card.white"
                border="1px solid"
                borderColor="border.felt"
                borderRadius="16px"
                boxShadow={MENU_SHADOW}
            >
                <HStack spacing={3} p={4} bg="bg.pillNeutral" align="center">
                    <AccountAvatar
                        size={40}
                        avatarUrl={c.avatarUrl}
                        address={c.address}
                        handle={c.handle}
                    />
                    <Box minW={0}>
                        <Text
                            fontWeight="700"
                            fontSize="sm"
                            color="text.primary"
                            noOfLines={1}
                        >
                            {c.handle}
                        </Text>
                        <Text fontSize="12px" color="text.muted">
                            {c.shortAddress}
                        </Text>
                    </Box>
                </HStack>
                <HStack
                    justify="space-between"
                    px={4}
                    py={3}
                    borderBottom="1px solid"
                    borderColor="border.felt"
                    _dark={{ borderColor: 'rgba(255,255,255,0.12)' }}
                >
                    <Box>
                        <Text
                            fontSize="10px"
                            fontWeight="700"
                            letterSpacing="0.06em"
                            color="text.muted"
                        >
                            BALANCE
                        </Text>
                        <Text
                            fontWeight="700"
                            fontSize="16px"
                            color="brand.usdc"
                            lineHeight="1.2"
                        >
                            {c.balanceLabel ?? '…'}
                        </Text>
                    </Box>
                    <Button
                        variant="tactileOutline"
                        size="sm"
                        height="32px"
                        leftIcon={<Icon as={FiPlus} boxSize={3.5} />}
                        onClick={() => c.openWallet(true)}
                    >
                        Add
                    </Button>
                </HStack>
                <Box py={2}>
                    <RowItem
                        icon={FiUser}
                        label="My profile"
                        sub="stats, results, hosting"
                        tone="accent"
                        href={c.profileHref}
                    />
                    <RowItem
                        icon={FiCreditCard}
                        label="Wallet"
                        sub="send, receive, bridge, buy"
                        onClick={() => c.openWallet()}
                    />
                    <RowItem
                        icon={RiGamepadLine}
                        label="Create Game"
                        href="/create-game"
                    />
                </Box>
                <MenuDivider
                    borderColor="border.felt"
                    _dark={{ borderColor: 'rgba(255,255,255,0.12)' }}
                    my={0}
                />
                <Box py={2}>
                    <RowItem
                        icon={FiLogOut}
                        label="Sign out"
                        tone="muted"
                        onClick={c.signOut}
                    />
                </Box>
            </MenuList>
        </Menu>
    );
}

export function MobileAccountCard({ onNavigate }: { onNavigate?: () => void }) {
    const c = useAccountControls();
    return (
        <Box
            bg="card.white"
            border="1px solid"
            borderColor="border.felt"
            borderRadius="16px"
            p={4}
            mb={4}
        >
            <HStack spacing={3} mb={3}>
                <AccountAvatar
                    size={44}
                    avatarUrl={c.avatarUrl}
                    address={c.address}
                    handle={c.handle}
                />
                <Box flex={1} minW={0}>
                    <Text
                        fontWeight="700"
                        fontSize="sm"
                        color="text.primary"
                        noOfLines={1}
                    >
                        {c.handle}
                    </Text>
                    <Text fontSize="12px" color="text.muted">
                        {c.shortAddress}
                    </Text>
                </Box>
                {c.balanceLabel && (
                    <Text fontWeight="700" fontSize="sm" color="brand.usdc">
                        {c.balanceLabel}
                    </Text>
                )}
            </HStack>
            <Button
                as="a"
                href={c.profileHref}
                onClick={onNavigate}
                variant="tactileOutline"
                w="full"
                height="44px"
                leftIcon={<Icon as={FiUser} boxSize={4} />}
                rightIcon={<Icon as={FiArrowRight} boxSize={4} />}
            >
                My profile
            </Button>
            <HStack spacing={3} mt={2.5}>
                <Button
                    variant="tactileChrome"
                    flex={1}
                    height="44px"
                    leftIcon={<Icon as={FiCreditCard} boxSize={4} />}
                    onClick={() => c.openWallet()}
                >
                    Wallet
                </Button>
                <Button
                    variant="tactileChrome"
                    flex={1}
                    height="44px"
                    leftIcon={<Icon as={FiLogOut} boxSize={4} />}
                    onClick={c.signOut}
                >
                    Sign out
                </Button>
            </HStack>
        </Box>
    );
}
