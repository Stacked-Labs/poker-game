'use client';
import {
    Button,
    Flex,
    IconButton,
    useDisclosure,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerBody,
    VStack,
    HStack,
    Box,
    Text,
    Divider,
    Link,
    Icon,
} from '@chakra-ui/react';
import { Image } from '@chakra-ui/next-js';
import React, { useEffect, useState } from 'react';
import {
    RiMenu3Line,
    RiCloseLine,
    RiGamepadLine,
    RiGlobalLine,
    RiTrophyLine,
    RiVipCrownLine,
    RiBookOpenLine,
    RiExternalLinkLine,
} from 'react-icons/ri';
import { FaDiscord } from 'react-icons/fa';
import WalletButton from '../WalletButton';
import { SocialIconButton } from '../SocialIconButton';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ColorModeButton } from '../ColorModeButton';
import { useAuth } from '@/app/contexts/AuthContext';
import { AccountMenu, MobileAccountCard } from './AccountMenu';

const MotionFlex = motion(Flex);

const logoImage = '/IconLogo.png';
const logoSizes = '(max-width: 48em) 56px, (max-width: 62em) 64px, 72px';

// Group E (Tactile): shared snap transition for nav-link rows.
const TACTILE_TRANSITION =
    'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 120ms ease, color 120ms ease';

// Desktop wayfinding link. The current page carries a Neon Stake underline —
// the documented lobby-nav signature, here used structurally (not just on hover).
const NavLink: React.FC<{
    href: string;
    active?: boolean;
    external?: boolean;
    children: React.ReactNode;
}> = ({ href, active, external, children }) => (
    <Box position="relative" display="inline-flex">
        <Button
            as="a"
            href={href}
            variant="navLink"
            fontSize="md"
            aria-label={typeof children === 'string' ? children : undefined}
            aria-current={active ? 'page' : undefined}
            fontWeight={active ? '800' : undefined}
            color={active ? 'text.primary' : undefined}
            {...(external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
        >
            {children}
        </Button>
        {active && (
            <Box
                position="absolute"
                bottom="-6px"
                left="8px"
                right="8px"
                h="2px"
                borderRadius="full"
                bg="brand.pink"
            />
        )}
    </Box>
);

// Drawer nav row — the tactile inset row used in the mobile menu. `green` tone
// tints toward Felt Green (primary destinations); `neutral` for resources.
const DrawerLink: React.FC<{
    href: string;
    icon: React.ElementType;
    label: string;
    tone?: 'green' | 'neutral';
    external?: boolean;
    onClose: () => void;
}> = ({ href, icon, label, tone = 'green', external, onClose }) => (
    <Button
        as="a"
        href={href}
        onClick={onClose}
        leftIcon={<Icon as={icon} boxSize={5} />}
        {...(external
            ? {
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  rightIcon: (
                      <Icon
                          as={RiExternalLinkLine}
                          boxSize={3.5}
                          color="text.muted"
                      />
                  ),
              }
            : {})}
        variant="ghost"
        justifyContent="flex-start"
        height="44px"
        px={3}
        borderRadius="12px"
        fontWeight="semibold"
        fontSize="sm"
        color="text.primary"
        bg="transparent"
        border="none"
        transition={TACTILE_TRANSITION}
        _hover={
            tone === 'green'
                ? { bg: 'rgba(54, 163, 123, 0.10)', color: 'brand.green' }
                : { bg: 'rgba(12, 21, 49, 0.06)' }
        }
        _active={{
            bg:
                tone === 'green'
                    ? 'rgba(54, 163, 123, 0.16)'
                    : 'rgba(12, 21, 49, 0.10)',
            transform: 'translateY(1px)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.10)',
        }}
        _dark={
            tone === 'green'
                ? {
                      _hover: { bg: 'rgba(54, 163, 123, 0.16)' },
                      _active: {
                          bg: 'rgba(54, 163, 123, 0.22)',
                          transform: 'translateY(1px)',
                          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.20)',
                      },
                  }
                : {
                      _hover: { bg: 'rgba(255, 255, 255, 0.08)' },
                      _active: {
                          bg: 'rgba(255, 255, 255, 0.14)',
                          transform: 'translateY(1px)',
                          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.20)',
                      },
                  }
        }
        sx={external ? { '& > span:last-of-type': { ml: 'auto' } } : undefined}
    >
        {label}
    </Button>
);

const HomeNavBar: React.FC = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();

    // Active-route key. Read the query client-side (nav links are full-reload
    // anchors, so this resolves correctly on mount) to avoid pulling
    // useSearchParams into this layout-level component.
    const [activeKey, setActiveKey] = useState<string | null>(null);
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const fmt = new URLSearchParams(window.location.search).get('format');
        if (pathname.startsWith('/leaderboard')) setActiveKey('leaderboard');
        else if (pathname === '/public-games')
            setActiveKey(fmt === 'tournaments' ? 'tournaments' : 'lobby');
        else setActiveKey(null);
    }, [pathname]);

    const showHomeNavBar = !pathname.startsWith('/table');
    if (!showHomeNavBar) {
        return null; // Do not render the navbar on /table pages
    }

    return (
        <MotionFlex
            width="100%"
            paddingX={{ base: 2, md: 3, lg: 4 }}
            paddingY={2}
            justifyContent="space-between"
            alignItems="center"
            position="fixed"
            height={{ base: '68px', md: '76px' }}
            zIndex={99}
            as="nav"
            bg="bg.navbar"
            color="text.navbar"
            backdropFilter="blur(16px)"
            borderBottom="1px solid"
            borderColor="rgba(12, 21, 49, 0.06)"
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.03), inset 0 -1px 0 rgba(255, 255, 255, 0.1)"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                type: 'spring',
                stiffness: 200,
                damping: 20,
                delay: 0.1,
            }}
        >
            {/* Logo + wordmark lockup */}
            <Flex
                as="a"
                href="/"
                alignItems="center"
                gap={2.5}
                textDecoration="none"
                _hover={{ textDecoration: 'none' }}
                _active={{ transform: 'scale(0.97)' }}
                transition="transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            >
                <Box
                    position="relative"
                    width={{ base: '52px', md: '60px', lg: '64px' }}
                    height={{ base: '52px', md: '60px', lg: '64px' }}
                    flexShrink={0}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={{ transform: 'rotate(-8deg) scale(1.08)' }}
                >
                    <Image
                        alt="Stacked Logo"
                        src={logoImage}
                        fill
                        sizes={logoSizes}
                        quality={60}
                        style={{ objectFit: 'contain' }}
                    />
                </Box>
                <Text
                    display={{ base: 'none', sm: 'block' }}
                    fontFamily="heading"
                    fontWeight="900"
                    fontSize={{ sm: '20px', lg: '22px' }}
                    letterSpacing="-0.03em"
                    color="text.primary"
                    lineHeight="1"
                >
                    STACKED
                </Text>
            </Flex>

            {/* Desktop navigation */}
            <Flex
                display={{ base: 'none', lg: 'flex' }}
                gap={6}
                alignItems="center"
            >
                <HStack spacing={5} alignItems="center">
                    <NavLink href="/public-games" active={activeKey === 'lobby'}>
                        Lobby
                    </NavLink>
                    <NavLink
                        href="/public-games?format=tournaments"
                        active={activeKey === 'tournaments'}
                    >
                        Tournaments
                    </NavLink>
                    <NavLink
                        href="/leaderboard"
                        active={activeKey === 'leaderboard'}
                    >
                        Leaderboard
                    </NavLink>
                    <NavLink href="https://docs.stackedpoker.io/" external>
                        Docs
                    </NavLink>
                </HStack>
                <HStack spacing={3} alignItems="center">
                    <ColorModeButton />
                    {isAuthenticated ? (
                        <AccountMenu />
                    ) : (
                        <WalletButton
                            variant="cta"
                            label="Sign In"
                            height="48px"
                        />
                    )}
                </HStack>
            </Flex>

            {/* Mobile menu button */}
            <IconButton
                aria-label="Open menu"
                icon={<RiMenu3Line size={24} />}
                onClick={onOpen}
                display={{ base: 'flex', lg: 'none' }}
                variant="tactileChrome"
            />

            {/* Mobile drawer */}
            <Drawer
                placement="right"
                onClose={onClose}
                isOpen={isOpen}
                size="xs"
            >
                <DrawerOverlay backdropFilter="blur(4px)" />
                <DrawerContent
                    bg="bg.navbar"
                    backdropFilter="blur(24px)"
                    borderLeft="1px solid"
                    borderColor="rgba(12, 21, 49, 0.06)"
                    boxShadow="-12px 0 48px rgba(0, 0, 0, 0.15), inset 1px 0 0 rgba(255, 255, 255, 0.08)"
                    _dark={{
                        borderColor: 'rgba(255, 255, 255, 0.06)',
                        boxShadow:
                            '-12px 0 48px rgba(0, 0, 0, 0.5), inset 1px 0 0 rgba(255, 255, 255, 0.04)',
                    }}
                >
                    {/* Header — Logo + Close */}
                    <Flex
                        justify="space-between"
                        align="center"
                        px={5}
                        py={4}
                        borderBottom="1px solid"
                        borderColor="rgba(12, 21, 49, 0.06)"
                        _dark={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
                    >
                        <Flex align="center" gap={2}>
                            <Box
                                position="relative"
                                width="36px"
                                height="36px"
                                flexShrink={0}
                            >
                                <Image
                                    alt="Stacked"
                                    src={logoImage}
                                    fill
                                    sizes="36px"
                                    quality={60}
                                    style={{ objectFit: 'contain' }}
                                />
                            </Box>
                            <Text
                                fontFamily="heading"
                                fontWeight="900"
                                fontSize="lg"
                                color="text.primary"
                                letterSpacing="-0.02em"
                            >
                                STACKED
                            </Text>
                        </Flex>
                        <IconButton
                            aria-label="Close menu"
                            icon={<RiCloseLine size={22} />}
                            onClick={onClose}
                            size="sm"
                            variant="tactileChrome"
                            borderRadius="10px"
                        />
                    </Flex>

                    {/* Body */}
                    <DrawerBody
                        px={5}
                        pt={5}
                        pb={6}
                        display="flex"
                        flexDirection="column"
                    >
                        {/* Signed-in identity — profile + wallet at the top */}
                        {isAuthenticated && (
                            <MobileAccountCard onNavigate={onClose} />
                        )}

                        {/* Play Section */}
                        <Box>
                            <Text
                                fontSize="xs"
                                fontWeight="bold"
                                color="text.muted"
                                textTransform="uppercase"
                                letterSpacing="0.1em"
                                mb={2.5}
                                px={1}
                            >
                                Play
                            </Text>
                            <VStack spacing={1} align="stretch">
                                <DrawerLink
                                    href="/create-game"
                                    icon={RiGamepadLine}
                                    label="Create Game"
                                    onClose={onClose}
                                />
                                <DrawerLink
                                    href="/public-games"
                                    icon={RiGlobalLine}
                                    label="Lobby"
                                    onClose={onClose}
                                />
                                <DrawerLink
                                    href="/leaderboard"
                                    icon={RiTrophyLine}
                                    label="Leaderboard"
                                    onClose={onClose}
                                />
                                <DrawerLink
                                    href="/public-games?format=tournaments"
                                    icon={RiVipCrownLine}
                                    label="Tournaments"
                                    onClose={onClose}
                                />
                            </VStack>
                        </Box>

                        <Divider
                            my={4}
                            borderColor="rgba(12, 21, 49, 0.06)"
                            _dark={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
                        />

                        {/* Resources Section */}
                        <Box>
                            <Text
                                fontSize="xs"
                                fontWeight="bold"
                                color="text.muted"
                                textTransform="uppercase"
                                letterSpacing="0.1em"
                                mb={2.5}
                                px={1}
                            >
                                Resources
                            </Text>
                            <VStack spacing={1} align="stretch">
                                <DrawerLink
                                    href="https://docs.stackedpoker.io/"
                                    icon={RiBookOpenLine}
                                    label="Docs"
                                    tone="neutral"
                                    external
                                    onClose={onClose}
                                />
                                <DrawerLink
                                    href="https://discord.gg/xdaC5gRP4E"
                                    icon={FaDiscord}
                                    label="Discord"
                                    tone="neutral"
                                    external
                                    onClose={onClose}
                                />
                            </VStack>
                        </Box>

                        {/* Spacer */}
                        <Box flex={1} minH={6} />

                        {/* Bottom Section */}
                        <VStack spacing={3} align="stretch">
                            {/* Signed-out: the loud green CTA + a no-wallet path to the lobby. */}
                            {!isAuthenticated && (
                                <>
                                    <WalletButton
                                        variant="cta"
                                        label="Sign In"
                                        width="100%"
                                        height="52px"
                                    />
                                    <Button
                                        as="a"
                                        href="/public-games"
                                        onClick={onClose}
                                        variant="tactileOutline"
                                        height="48px"
                                        w="100%"
                                        fontSize="md"
                                    >
                                        Browse Tables
                                    </Button>
                                </>
                            )}

                            {/* Theme Toggle */}
                            <HStack spacing={2} px={1}>
                                <ColorModeButton />
                                <Text
                                    fontSize="xs"
                                    fontWeight="semibold"
                                    color="text.muted"
                                >
                                    Theme
                                </Text>
                            </HStack>

                            {/* Social Row */}
                            <HStack justify="center" spacing={5} pt={2} pb={1}>
                                <Link
                                    href="https://x.com/stacked_poker"
                                    isExternal
                                >
                                    <SocialIconButton tone="x" chipSize="lg" />
                                </Link>
                                <Link
                                    href="https://discord.gg/xdaC5gRP4E"
                                    isExternal
                                >
                                    <SocialIconButton
                                        tone="discord"
                                        chipSize="lg"
                                    />
                                </Link>
                                <Link
                                    href="https://t.me/stackedpoker"
                                    isExternal
                                >
                                    <SocialIconButton
                                        tone="telegram"
                                        chipSize="lg"
                                    />
                                </Link>
                            </HStack>
                        </VStack>

                        {/* Decorative Gradient */}
                        <Box
                            position="absolute"
                            bottom="0"
                            left="0"
                            right="0"
                            height="180px"
                            bgGradient="linear(to-t, rgba(235, 11, 92, 0.06), transparent)"
                            pointerEvents="none"
                        />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </MotionFlex>
    );
};

export default HomeNavBar;
