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
import React from 'react';
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

const MotionFlex = motion(Flex);

const logoImage = '/IconLogo.png';
const logoSizes = '(max-width: 48em) 56px, (max-width: 62em) 64px, 72px';

// Group E (Tactile): shared snap transition for nav-link rows.
const TACTILE_TRANSITION =
    'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 120ms ease, color 120ms ease';

const HomeNavBar: React.FC = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const pathname = usePathname();
    const showHomeNavBar = !pathname.startsWith('/table');
    if (!showHomeNavBar) {
        return null; // Do not render the navbar on /table pages
    }

    const NavButtons = React.memo(() => (
        <>
            {/* Wayfinding links — one tight cluster so they read as a group,
                not isolated islands floating across the bar. */}
            <Flex gap={5} alignItems="center">
                <Button
                    as="a"
                    href="/leaderboard"
                    aria-label="Leaderboard"
                    variant="navLink"
                >
                    Leaderboard
                </Button>
                <Button
                    as="a"
                    href="/public-games?format=tournaments"
                    aria-label="Tournaments"
                    variant="navLink"
                >
                    Tournaments
                </Button>
                <Button
                    as="a"
                    href="https://docs.stackedpoker.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Documentation"
                    variant="navLink"
                >
                    Docs
                </Button>
                <Button
                    as="a"
                    href="https://discord.gg/xdaC5gRP4E"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="navLink"
                    leftIcon={<FaDiscord />}
                >
                    Discord
                </Button>
            </Flex>

            {/* Actions — a separate cluster. Browse Tables is a felt-green
                "chip" pill (rounded silhouette + spade glyph) so it reads as a
                distinct object from the solid-green Sign In CTA, not a competing
                green twin. It owns /public-games (no-wallet path to the lobby).
                Sign In stays the loud green CTA — we want sign-ins. */}
            <Flex gap={3} alignItems="center">
                <Button
                    as="a"
                    href="/public-games"
                    aria-label="Browse live tables"
                    variant="tactileOutline"
                    height="48px"
                    px={5}
                    fontSize="md"
                    borderRadius="full"
                    bg="rgba(54, 163, 123, 0.08)"
                    leftIcon={
                        <Box as="span" fontSize="lg" lineHeight={1} mt="-2px">
                            ♠
                        </Box>
                    }
                >
                    Browse Tables
                </Button>
                <WalletButton variant="cta" label="Sign In" height="48px" />
            </Flex>
        </>
    ));
    NavButtons.displayName = 'NavButtons';

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
            {/* Logo Section */}
            <Flex alignItems={'center'}>
                <Flex
                    as="a"
                    href="/"
                    alignItems="center"
                    textDecoration="none"
                    _hover={{ textDecoration: 'none' }}
                    transition="transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    _active={{
                        transform: 'scale(0.95)',
                    }}
                >
                    <Box
                        position="relative"
                        width={{ base: '56px', md: '64px', lg: '72px' }}
                        height={{ base: '56px', md: '64px', lg: '72px' }}
                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        _hover={{
                            transform: 'rotate(-8deg) scale(1.08)',
                        }}
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
                </Flex>
                <ColorModeButton />
            </Flex>

            {/* Desktop Navigation */}
            <Flex
                display={{ base: 'none', lg: 'flex' }}
                gap={6}
                alignItems="center"
            >
                <NavButtons />
            </Flex>

            {/* Mobile Menu Button */}
            <IconButton
                aria-label="Open menu"
                icon={<RiMenu3Line size={24} />}
                onClick={onOpen}
                display={{ base: 'flex', lg: 'none' }}
                variant="tactileChrome"
            />

            {/* Mobile Drawer */}
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
                        _dark={{
                            borderColor: 'rgba(255, 255, 255, 0.06)',
                        }}
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
                                <Button
                                    as="a"
                                    href="/create-game"
                                    onClick={onClose}
                                    leftIcon={
                                        <Icon as={RiGamepadLine} boxSize={5} />
                                    }
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
                                    _hover={{
                                        bg: 'rgba(54, 163, 123, 0.10)',
                                        color: 'brand.green',
                                    }}
                                    _active={{
                                        bg: 'rgba(54, 163, 123, 0.16)',
                                        transform: 'translateY(1px)',
                                        boxShadow:
                                            'inset 0 1px 2px rgba(0,0,0,0.10)',
                                    }}
                                    _dark={{
                                        _hover: {
                                            bg: 'rgba(54, 163, 123, 0.16)',
                                        },
                                        _active: {
                                            bg: 'rgba(54, 163, 123, 0.22)',
                                            transform: 'translateY(1px)',
                                            boxShadow:
                                                'inset 0 1px 2px rgba(0,0,0,0.20)',
                                        },
                                    }}
                                >
                                    Create Game
                                </Button>
                                <Button
                                    as="a"
                                    href="/public-games"
                                    onClick={onClose}
                                    leftIcon={
                                        <Icon as={RiGlobalLine} boxSize={5} />
                                    }
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
                                    _hover={{
                                        bg: 'rgba(54, 163, 123, 0.10)',
                                        color: 'brand.green',
                                    }}
                                    _active={{
                                        bg: 'rgba(54, 163, 123, 0.16)',
                                        transform: 'translateY(1px)',
                                        boxShadow:
                                            'inset 0 1px 2px rgba(0,0,0,0.10)',
                                    }}
                                    _dark={{
                                        _hover: {
                                            bg: 'rgba(54, 163, 123, 0.16)',
                                        },
                                        _active: {
                                            bg: 'rgba(54, 163, 123, 0.22)',
                                            transform: 'translateY(1px)',
                                            boxShadow:
                                                'inset 0 1px 2px rgba(0,0,0,0.20)',
                                        },
                                    }}
                                >
                                    Public Games
                                </Button>
                                <Button
                                    as="a"
                                    href="/leaderboard"
                                    onClick={onClose}
                                    leftIcon={
                                        <Icon as={RiTrophyLine} boxSize={5} />
                                    }
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
                                    _hover={{
                                        bg: 'rgba(54, 163, 123, 0.10)',
                                        color: 'brand.green',
                                    }}
                                    _active={{
                                        bg: 'rgba(54, 163, 123, 0.16)',
                                        transform: 'translateY(1px)',
                                        boxShadow:
                                            'inset 0 1px 2px rgba(0,0,0,0.10)',
                                    }}
                                    _dark={{
                                        _hover: {
                                            bg: 'rgba(54, 163, 123, 0.16)',
                                        },
                                        _active: {
                                            bg: 'rgba(54, 163, 123, 0.22)',
                                            transform: 'translateY(1px)',
                                            boxShadow:
                                                'inset 0 1px 2px rgba(0,0,0,0.20)',
                                        },
                                    }}
                                >
                                    Leaderboard
                                </Button>
                                <Button
                                    as="a"
                                    href="/public-games?format=tournaments"
                                    onClick={onClose}
                                    leftIcon={
                                        <Icon as={RiVipCrownLine} boxSize={5} />
                                    }
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
                                    _hover={{
                                        bg: 'rgba(54, 163, 123, 0.10)',
                                        color: 'brand.green',
                                    }}
                                    _active={{
                                        bg: 'rgba(54, 163, 123, 0.16)',
                                        transform: 'translateY(1px)',
                                        boxShadow:
                                            'inset 0 1px 2px rgba(0,0,0,0.10)',
                                    }}
                                    _dark={{
                                        _hover: {
                                            bg: 'rgba(54, 163, 123, 0.16)',
                                        },
                                        _active: {
                                            bg: 'rgba(54, 163, 123, 0.22)',
                                            transform: 'translateY(1px)',
                                            boxShadow:
                                                'inset 0 1px 2px rgba(0,0,0,0.20)',
                                        },
                                    }}
                                >
                                    Tournaments
                                </Button>
                            </VStack>
                        </Box>

                        <Divider
                            my={4}
                            borderColor="rgba(12, 21, 49, 0.06)"
                            _dark={{
                                borderColor: 'rgba(255, 255, 255, 0.06)',
                            }}
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
                                <Button
                                    as="a"
                                    href="https://docs.stackedpoker.io/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={onClose}
                                    leftIcon={
                                        <Icon as={RiBookOpenLine} boxSize={5} />
                                    }
                                    rightIcon={
                                        <Icon
                                            as={RiExternalLinkLine}
                                            boxSize={3.5}
                                            color="text.muted"
                                        />
                                    }
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
                                    _hover={{
                                        bg: 'rgba(12, 21, 49, 0.06)',
                                    }}
                                    _active={{
                                        bg: 'rgba(12, 21, 49, 0.10)',
                                        transform: 'translateY(1px)',
                                        boxShadow:
                                            'inset 0 1px 2px rgba(0,0,0,0.10)',
                                    }}
                                    _dark={{
                                        _hover: {
                                            bg: 'rgba(255, 255, 255, 0.08)',
                                        },
                                        _active: {
                                            bg: 'rgba(255, 255, 255, 0.14)',
                                            transform: 'translateY(1px)',
                                            boxShadow:
                                                'inset 0 1px 2px rgba(0,0,0,0.20)',
                                        },
                                    }}
                                    sx={{
                                        '& > span:last-of-type': {
                                            ml: 'auto',
                                        },
                                    }}
                                >
                                    Docs
                                </Button>
                                <Button
                                    as="a"
                                    href="https://discord.gg/xdaC5gRP4E"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={onClose}
                                    leftIcon={
                                        <Icon as={FaDiscord} boxSize={5} />
                                    }
                                    rightIcon={
                                        <Icon
                                            as={RiExternalLinkLine}
                                            boxSize={3.5}
                                            color="text.muted"
                                        />
                                    }
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
                                    _hover={{
                                        bg: 'rgba(12, 21, 49, 0.06)',
                                    }}
                                    _active={{
                                        bg: 'rgba(12, 21, 49, 0.10)',
                                        transform: 'translateY(1px)',
                                        boxShadow:
                                            'inset 0 1px 2px rgba(0,0,0,0.10)',
                                    }}
                                    _dark={{
                                        _hover: {
                                            bg: 'rgba(255, 255, 255, 0.08)',
                                        },
                                        _active: {
                                            bg: 'rgba(255, 255, 255, 0.14)',
                                            transform: 'translateY(1px)',
                                            boxShadow:
                                                'inset 0 1px 2px rgba(0,0,0,0.20)',
                                        },
                                    }}
                                    sx={{
                                        '& > span:last-of-type': {
                                            ml: 'auto',
                                        },
                                    }}
                                >
                                    Discord
                                </Button>
                            </VStack>
                        </Box>

                        {/* Spacer */}
                        <Box flex={1} minH={6} />

                        {/* Bottom Section */}
                        <VStack spacing={3} align="stretch">
                            {/* Primary action: sign in — the loud green CTA so
                                it's the obvious thing to tap (we want sign-ins). */}
                            <WalletButton
                                variant="cta"
                                label="Sign In"
                                width="100%"
                                height="52px"
                            />

                            {/* Secondary: a no-wallet path straight to the lobby. */}
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
