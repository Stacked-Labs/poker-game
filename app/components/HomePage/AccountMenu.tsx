'use client';

/**
 * Signed-in account control for the marketing/lobby nav (HomeNavBar).
 *
 * Gives a logged-in player a clear path to their OWN profile (the gap the
 * thirdweb connect button left), the connected chain, and money actions:
 *  - Add funds -> thirdweb BuyWidget (buy / onramp)
 *  - Bridge    -> thirdweb BridgeWidget (cross-chain)
 *  - Send & receive / Network -> the full wallet details modal
 * (the Buy/Bridge widgets are lazy-loaded from ./FundsWidgets).
 *
 * `AccountMenu` is the desktop chip + dropdown; `MobileAccountCard` is the
 * drawer identity card. Both share `useAccountControls`.
 */

import {
    Box,
    Button,
    HStack,
    Icon,
    Link,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Text,
    VStack,
    useColorMode,
    useDisclosure,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
    FiUser,
    FiLogOut,
    FiCreditCard,
    FiChevronDown,
    FiChevronRight,
    FiArrowRight,
    FiArrowUpRight,
    FiPlus,
    FiRepeat,
    FiCopy,
    FiCheck,
} from 'react-icons/fi';
import { RiGamepadLine, RiTwitterXLine } from 'react-icons/ri';
import { SocialIconButton } from '../SocialIconButton';
import { useConnectX } from '@/app/hooks/useConnectX';
import {
    useActiveWallet,
    useActiveWalletChain,
    useDisconnect,
    useWalletBalance,
    useWalletDetailsModal,
} from 'thirdweb/react';
import { base, baseSepolia } from 'thirdweb/chains';
import {
    client,
    defaultChain,
    defaultUsdcAddress,
    supportedTokens,
} from '@/app/thirdwebclient';
import { useAuth } from '@/app/contexts/AuthContext';
import useCopyToClipboard from '@/app/hooks/useCopyToClipboard';
import PlayerAvatar from '../PlayerAvatar';
import type { FundsMode } from './FundsWidgets';

// Heavy thirdweb Bridge/Buy UI: only fetched when a player opens Add/Bridge.
const FundsModal = dynamic(
    () => import('./FundsWidgets').then((m) => m.FundsModal),
    { ssr: false }
);

const CHIP_SHADOW =
    'inset 0 1px 0 rgba(255,255,255,0.55), 0 1px 0 rgba(11,20,48,0.08)';
const MENU_SHADOW =
    '0 18px 44px rgba(11, 20, 48, 0.16), 0 0 0 1px rgba(11, 20, 48, 0.04)';
const DIVIDER = {
    borderColor: 'border.felt',
    _dark: { borderColor: 'rgba(255,255,255,0.12)' },
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
    const chain = useActiveWalletChain();
    const { disconnect } = useDisconnect();
    const { connectX, isConnecting: isLinkingX } = useConnectX();
    const detailsModal = useWalletDetailsModal();
    const { data: balance } = useWalletBalance({
        client,
        chain: defaultChain,
        address: address ?? undefined,
        tokenAddress: defaultUsdcAddress,
    });

    const hasHandle = Boolean(xUsername);
    const handle = hasHandle ? `@${xUsername}` : address ? shorten(address) : '';
    const shortAddress = address ? shorten(address) : '';
    // Secondary line: the address, but only when the primary line is the X
    // handle (otherwise the primary line already IS the address).
    const secondary = hasHandle ? shortAddress : null;
    const profileHref = address ? `/profile/${address}` : '/';
    const balanceLabel = balance
        ? `$${Number(balance.displayValue).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })}`
        : null;

    const chainName = chain?.name ?? defaultChain.name ?? 'Base';
    const chainIsBase = chain ? chain.id === base.id || chain.id === baseSepolia.id : true;

    const openWallet = () =>
        detailsModal.open({
            client,
            theme: colorMode === 'dark' ? 'dark' : 'light',
            supportedTokens,
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
        secondary,
        shortAddress,
        xUsername,
        profileHref,
        avatarUrl: xProfileImageUrl,
        balanceLabel,
        chainName,
        chainIsBase,
        openWallet,
        signOut,
        connectX,
        isLinkingX,
    };
}

// Small Buy/Bridge modal controller shared by desktop + mobile.
function useFunds() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [mode, setMode] = useState<FundsMode>('buy');
    return {
        open: (m: FundsMode) => {
            setMode(m);
            onOpen();
        },
        props: { isOpen, onClose, mode },
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

const ChainDot: React.FC<{ isBase: boolean }> = ({ isBase }) => (
    <Box
        w="8px"
        h="8px"
        borderRadius="full"
        bg={isBase ? 'brand.base' : 'text.muted'}
        flexShrink={0}
    />
);

const ChainLabel: React.FC<{ isBase: boolean; name: string }> = ({ isBase, name }) => (
    <HStack spacing={1.5} align="center">
        <ChainDot isBase={isBase} />
        <Text fontSize="12px" fontWeight="600" color="text.muted">
            {name}
        </Text>
    </HStack>
);

// Wallet address rendered as a single subtle "tap to copy" chip: the whole
// address + icon is one button with a quiet hover tint; the icon flips to a
// green check for ~1.5s. `primary` = the identity line (no X); else a subtext.
const AddressLine: React.FC<{
    address: string | null;
    short: string;
    primary?: boolean;
}> = ({ address, short, primary }) => {
    const { copy, copied } = useCopyToClipboard();
    const onCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!address) return;
        void copy(address);
    };
    return (
        <HStack
            as="button"
            type="button"
            onClick={onCopy}
            aria-label="Copy address"
            spacing={1.5}
            px={1}
            mx="-1"
            h="22px"
            borderRadius="6px"
            align="center"
            color={primary ? 'text.primary' : 'text.muted'}
            transition="background-color 120ms ease, color 120ms ease"
            outline="none"
            _hover={{ bg: 'bg.pillNeutral', color: primary ? 'text.primary' : 'text.secondary' }}
            // No focus ring on mouse click; keyboard focus shows the same quiet tint as hover.
            _focus={{ boxShadow: 'none' }}
            _focusVisible={{ bg: 'bg.pillNeutral', boxShadow: 'none' }}
        >
            <Text
                fontSize={primary ? 'sm' : '12px'}
                fontWeight={primary ? '700' : '500'}
                color="inherit"
                lineHeight="1"
            >
                {short}
            </Text>
            <Icon
                as={copied ? FiCheck : FiCopy}
                boxSize="12px"
                color={copied ? 'brand.green' : 'inherit'}
                opacity={copied ? 1 : 0.5}
            />
        </HStack>
    );
};

// @handle that links out to the player's X profile, with the X glyph.
const XHandleLink: React.FC<{ handle: string; username: string }> = ({ handle, username }) => (
    <Link
        href={`https://x.com/${username}`}
        isExternal
        display="inline-flex"
        alignItems="center"
        gap="5px"
        fontWeight="700"
        fontSize="sm"
        color="text.primary"
        _hover={{ color: 'brand.pink', textDecoration: 'none' }}
    >
        {handle}
        <Icon as={RiTwitterXLine} boxSize="11px" color="text.muted" />
    </Link>
);

// USDC balance with the coin mark to the RIGHT of the figure (the balance is
// the player's USDC, never ETH).
const BalanceTag: React.FC<{ label: string | null }> = ({ label }) =>
    label ? (
        <HStack spacing={1.5} align="center" flexShrink={0}>
            <Text fontWeight="700" fontSize="sm" color="brand.usdc">
                {label}
            </Text>
            <Box as="img" src="/usdc-logo.png" alt="" w="16px" h="16px" borderRadius="full" />
        </HStack>
    ) : null;

const RowItem: React.FC<{
    icon: React.ElementType;
    label: string;
    tone?: 'accent' | 'neutral' | 'muted';
    href?: string;
    onClick?: () => void;
    right?: React.ReactNode;
}> = ({ icon, label, tone = 'neutral', href, onClick, right }) => {
    const accent = tone === 'accent';
    const muted = tone === 'muted';
    const linkProps = href ? ({ as: 'a', href } as const) : ({ onClick } as const);
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
                    color={accent ? 'brand.green' : muted ? 'text.muted' : 'text.secondary'}
                />
                <Text
                    flex={1}
                    fontWeight="600"
                    fontSize="sm"
                    color={accent ? 'brand.greenDark' : muted ? 'text.muted' : 'text.primary'}
                >
                    {label}
                </Text>
                {right ?? (accent && <Icon as={FiArrowRight} boxSize={3.5} color="brand.green" />)}
            </HStack>
        </MenuItem>
    );
};

// Slim "complete your profile" nudge shown under the header when X isn't linked.
// The X-brand button gets a hairline in dark so it doesn't blend into the panel.
const LinkXBar: React.FC<{ onConnect: () => void; isConnecting: boolean }> = ({
    onConnect,
    isConnecting,
}) => (
    <HStack
        justify="space-between"
        gap={2}
        px={4}
        py={2.5}
        bg="rgba(15, 20, 25, 0.04)"
        borderBottom="1px solid"
        borderColor="border.felt"
        _dark={{ borderColor: 'rgba(255,255,255,0.12)', bg: 'rgba(255,255,255,0.04)' }}
    >
        <HStack spacing={2} minW={0}>
            <Icon as={RiTwitterXLine} boxSize={3.5} color="text.secondary" />
            <Text fontSize="12px" color="text.secondary" noOfLines={1}>
                Link X for your handle &amp; photo
            </Text>
        </HStack>
        <SocialIconButton
            tone="x"
            label="Link"
            chipSize="sm"
            onClick={onConnect}
            isLoading={isConnecting}
            flexShrink={0}
            _dark={{ border: '1px solid', borderColor: 'rgba(255,255,255,0.22)' }}
        />
    </HStack>
);

export const IdentityHeader: React.FC<{
    c: ReturnType<typeof useAccountControls>;
    size?: number;
    bg?: string;
}> = ({ c, size = 40, bg }) => (
    <HStack spacing={3} p={4} bg={bg} align="center">
        <AccountAvatar size={size} avatarUrl={c.avatarUrl} address={c.address} handle={c.handle} />
        <Box flex={1} minW={0}>
            {c.xUsername ? (
                <>
                    <XHandleLink handle={c.handle} username={c.xUsername} />
                    <AddressLine address={c.address} short={c.shortAddress} />
                </>
            ) : (
                <AddressLine address={c.address} short={c.shortAddress} primary />
            )}
        </Box>
        <BalanceTag label={c.balanceLabel} />
    </HStack>
);

export function AccountMenu({ defaultIsOpen }: { defaultIsOpen?: boolean } = {}) {
    const c = useAccountControls();
    const funds = useFunds();
    return (
        <>
            <Menu placement="bottom-end" autoSelect={false} isLazy defaultIsOpen={defaultIsOpen}>
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
                        <AccountAvatar size={30} avatarUrl={c.avatarUrl} address={c.address} handle={c.handle} />
                        <Text fontWeight="700" fontSize="sm" color="text.primary" noOfLines={1} maxW="140px">
                            {c.handle}
                        </Text>
                        <Icon as={FiChevronDown} boxSize="14px" color="text.gray600" />
                    </HStack>
                </MenuButton>
                <MenuList
                    p={0}
                    overflow="hidden"
                    minW="288px"
                    bg="card.white"
                    border="1px solid"
                    borderColor="border.felt"
                    borderRadius="16px"
                    boxShadow={MENU_SHADOW}
                >
                    <IdentityHeader c={c} bg="bg.pillNeutral" />
                    {c.xUsername ? (
                        <MenuDivider {...DIVIDER} my={0} />
                    ) : (
                        <LinkXBar onConnect={c.connectX} isConnecting={c.isLinkingX} />
                    )}
                    <Box py={2}>
                        <RowItem icon={FiUser} label="My profile" tone="accent" href={c.profileHref} />
                        <RowItem icon={FiPlus} label="Add funds" onClick={() => funds.open('buy')} />
                        <RowItem icon={FiRepeat} label="Bridge" onClick={() => funds.open('bridge')} />
                        <RowItem icon={FiArrowUpRight} label="Send & receive" onClick={c.openWallet} />
                        <RowItem icon={RiGamepadLine} label="Create Game" href="/create-game" />
                    </Box>
                    <MenuDivider {...DIVIDER} my={0} />
                    <Box py={2}>
                        <RowItem
                            icon={FiCreditCard}
                            label="Network"
                            onClick={c.openWallet}
                            right={
                                <HStack spacing={1.5} align="center">
                                    <ChainDot isBase={c.chainIsBase} />
                                    <Text fontSize="13px" fontWeight="600" color="text.secondary">
                                        {c.chainName}
                                    </Text>
                                    <Icon as={FiChevronRight} boxSize={4} color="text.muted" />
                                </HStack>
                            }
                        />
                        <RowItem icon={FiLogOut} label="Sign out" tone="muted" onClick={c.signOut} />
                    </Box>
                </MenuList>
            </Menu>
            {funds.props.isOpen && <FundsModal {...funds.props} />}
        </>
    );
}

export function MobileAccountCard({ onNavigate }: { onNavigate?: () => void }) {
    const c = useAccountControls();
    const funds = useFunds();
    return (
        <>
            <Box bg="card.white" border="1px solid" borderColor="border.felt" borderRadius="16px" p={4} mb={4}>
                <HStack spacing={3} mb={3} align="center">
                    <AccountAvatar size={44} avatarUrl={c.avatarUrl} address={c.address} handle={c.handle} />
                    <Box flex={1} minW={0}>
                        {c.xUsername ? (
                            <>
                                <XHandleLink handle={c.handle} username={c.xUsername} />
                                <AddressLine address={c.address} short={c.shortAddress} />
                            </>
                        ) : (
                            <AddressLine address={c.address} short={c.shortAddress} primary />
                        )}
                    </Box>
                    <VStack spacing={1} align="flex-end">
                        <BalanceTag label={c.balanceLabel} />
                        <ChainLabel isBase={c.chainIsBase} name={c.chainName} />
                    </VStack>
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
                {!c.xUsername && (
                    <SocialIconButton
                        tone="x"
                        label="Link X account"
                        chipSize="md"
                        w="full"
                        mt={2.5}
                        onClick={c.connectX}
                        isLoading={c.isLinkingX}
                    />
                )}
                <HStack spacing={3} mt={2.5}>
                    <Button
                        variant="tactileChrome"
                        flex={1}
                        height="44px"
                        leftIcon={<Icon as={FiRepeat} boxSize={4} />}
                        onClick={() => funds.open('bridge')}
                    >
                        Bridge
                    </Button>
                    <Button
                        variant="tactileChrome"
                        flex={1}
                        height="44px"
                        leftIcon={<Icon as={FiCreditCard} boxSize={4} />}
                        onClick={c.openWallet}
                    >
                        Wallet
                    </Button>
                </HStack>
                <Button
                    variant="tactileChrome"
                    w="full"
                    height="44px"
                    mt={3}
                    leftIcon={<Icon as={FiLogOut} boxSize={4} />}
                    onClick={c.signOut}
                >
                    Sign out
                </Button>
            </Box>
            {funds.props.isOpen && <FundsModal {...funds.props} />}
        </>
    );
}
