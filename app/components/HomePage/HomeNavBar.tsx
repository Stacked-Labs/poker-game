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
    Tooltip,
    Badge,
} from '@chakra-ui/react';
import { Image } from '@chakra-ui/next-js';
import React from 'react';
import {
    RiMenu3Line,
    RiCloseLine,
    RiGamepadLine,
    RiGlobalLine,
    RiTrophyLine,
    RiBookOpenLine,
    RiExternalLinkLine,
    RiTwitterXLine,
    RiChat3Line,
} from 'react-icons/ri';
import { FaDiscord } from 'react-icons/fa';
import { SiFarcaster } from 'react-icons/si';
import WalletButton from '../WalletButton';
import { usePathname } from 'next/navigation';
import { keyframes } from '@emotion/react';
import { ColorModeButton } from '../ColorModeButton';

const logoImage = '/IconLogo.png';
const logoSizes = '(max-width: 48em) 56px, (max-width: 62em) 64px, 72px';

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const HomeNavBar: React.FC = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const pathname = usePathname();
    const showHomeNavBar = !pathname.startsWith('/table');
    if (!showHomeNavBar) {
        return null; // Do not render the navbar on /table pages
    }

    const NavButtons = React.memo(() => (
        <>
            <Tooltip
                label="Coming soon"
                hasArrow
                bg="brand.darkNavy"
                color="white"
                fontSize="xs"
                fontWeight="semibold"
                borderRadius="8px"
                px={3}
                py={1.5}
            >
                <Button
                    variant="navLink"
                    opacity={0.4}
                    cursor="default"
                    _hover={{
                        transform: 'none',
                        color: 'text.primary',
                    }}
                >
                    Leaderboard
                </Button>
            </Tooltip>
            <Button
                as="a"
                href="https://docs.stackedpoker.io/docs/introduction"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Documentation"
                variant="navLink"
            >
                Docs
            </Button>
            <Button
                as="a"
                href="https://discord.gg/347RBVcvpn"
                target="_blank"
                rel="noopener noreferrer"
                variant="navLink"
            >
                Support
            </Button>
            <Button
                as="a"
                href="https://discord.gg/347RBVcvpn"
                target="_blank"
                rel="noopener noreferrer"
                variant="navLink"
                leftIcon={<FaDiscord />}
            >
                Discord
            </Button>
            <WalletButton width="160px" height="52px" label="Sign In" />
        </>
    ));
    NavButtons.displayName = 'NavButtons';

    return (
        <Flex
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
            backdropFilter="blur(12px)"
            borderBottom="1px solid"
            borderColor="rgba(12, 21, 49, 0.08)"
            boxShadow="0 2px 12px rgba(0, 0, 0, 0.04)"
            animation={`${fadeIn} 0.6s ease-out`}
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
                gap={8}
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
                bg="transparent"
                color="text.secondary"
                borderRadius="12px"
                _hover={{
                    bg: 'rgba(12, 21, 49, 0.08)',
                }}
                _active={{
                    bg: 'rgba(12, 21, 49, 0.12)',
                }}
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
                    backdropFilter="blur(16px)"
                    borderLeft="1px solid"
                    borderColor="rgba(12, 21, 49, 0.08)"
                    boxShadow="-8px 0 32px rgba(0, 0, 0, 0.12)"
                    _dark={{
                        borderColor: 'rgba(255, 255, 255, 0.06)',
                        boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.4)',
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
                            bg="transparent"
                            color="text.muted"
                            border="none"
                            borderRadius="10px"
                            _hover={{
                                bg: 'rgba(12, 21, 49, 0.06)',
                                color: 'text.primary',
                            }}
                            _dark={{
                                _hover: {
                                    bg: 'rgba(255, 255, 255, 0.08)',
                                },
                            }}
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
                                        <Icon
                                            as={RiGamepadLine}
                                            boxSize={5}
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
                                    _hover={{
                                        bg: 'rgba(54, 163, 123, 0.08)',
                                        color: 'brand.green',
                                        transform: 'translateX(2px)',
                                    }}
                                    _dark={{
                                        _hover: {
                                            bg: 'rgba(54, 163, 123, 0.12)',
                                        },
                                    }}
                                    transition="all 0.2s ease"
                                >
                                    Create Game
                                </Button>
                                <Button
                                    as="a"
                                    href="/public-games"
                                    onClick={onClose}
                                    leftIcon={
                                        <Icon
                                            as={RiGlobalLine}
                                            boxSize={5}
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
                                    _hover={{
                                        bg: 'rgba(54, 163, 123, 0.08)',
                                        color: 'brand.green',
                                        transform: 'translateX(2px)',
                                    }}
                                    _dark={{
                                        _hover: {
                                            bg: 'rgba(54, 163, 123, 0.12)',
                                        },
                                    }}
                                    transition="all 0.2s ease"
                                >
                                    Public Games
                                </Button>
                                <Tooltip
                                    label="Coming soon"
                                    hasArrow
                                    placement="right"
                                    bg="brand.darkNavy"
                                    color="white"
                                    fontSize="xs"
                                    fontWeight="semibold"
                                    borderRadius="8px"
                                    px={3}
                                    py={1.5}
                                >
                                    <Button
                                        leftIcon={
                                            <Icon
                                                as={RiTrophyLine}
                                                boxSize={5}
                                            />
                                        }
                                        variant="ghost"
                                        justifyContent="flex-start"
                                        height="44px"
                                        px={3}
                                        borderRadius="12px"
                                        fontWeight="semibold"
                                        fontSize="sm"
                                        color="text.muted"
                                        bg="transparent"
                                        border="none"
                                        opacity={0.5}
                                        cursor="default"
                                        _hover={{
                                            bg: 'transparent',
                                            transform: 'none',
                                        }}
                                        transition="all 0.2s ease"
                                    >
                                        Leaderboard
                                        <Badge
                                            ml={2}
                                            fontSize="2xs"
                                            fontWeight="bold"
                                            bg="brand.yellow"
                                            color="brand.darkNavy"
                                            borderRadius="full"
                                            px={2}
                                            py={0.5}
                                            textTransform="uppercase"
                                            letterSpacing="0.05em"
                                        >
                                            Soon
                                        </Badge>
                                    </Button>
                                </Tooltip>
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
                                    href="https://docs.stackedpoker.io/docs/introduction"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={onClose}
                                    leftIcon={
                                        <Icon
                                            as={RiBookOpenLine}
                                            boxSize={5}
                                        />
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
                                    _hover={{
                                        bg: 'rgba(12, 21, 49, 0.05)',
                                        transform: 'translateX(2px)',
                                    }}
                                    _dark={{
                                        _hover: {
                                            bg: 'rgba(255, 255, 255, 0.06)',
                                        },
                                    }}
                                    transition="all 0.2s ease"
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
                                    href="https://discord.gg/347RBVcvpn"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={onClose}
                                    leftIcon={
                                        <Icon
                                            as={RiChat3Line}
                                            boxSize={5}
                                        />
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
                                    _hover={{
                                        bg: 'rgba(12, 21, 49, 0.05)',
                                        transform: 'translateX(2px)',
                                    }}
                                    _dark={{
                                        _hover: {
                                            bg: 'rgba(255, 255, 255, 0.06)',
                                        },
                                    }}
                                    transition="all 0.2s ease"
                                    sx={{
                                        '& > span:last-of-type': {
                                            ml: 'auto',
                                        },
                                    }}
                                >
                                    Support
                                </Button>
                                <Button
                                    as="a"
                                    href="https://discord.gg/347RBVcvpn"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={onClose}
                                    leftIcon={
                                        <Icon
                                            as={FaDiscord}
                                            boxSize={5}
                                        />
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
                                    _hover={{
                                        bg: 'rgba(12, 21, 49, 0.05)',
                                        transform: 'translateX(2px)',
                                    }}
                                    _dark={{
                                        _hover: {
                                            bg: 'rgba(255, 255, 255, 0.06)',
                                        },
                                    }}
                                    transition="all 0.2s ease"
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
                        <VStack spacing={4} align="stretch">
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

                            {/* Wallet */}
                            <WalletButton
                                width="100%"
                                height="48px"
                                label="Sign In"
                            />

                            {/* Social Row */}
                            <HStack
                                justify="center"
                                spacing={5}
                                pt={2}
                                pb={1}
                            >
                                <Link
                                    href="https://x.com/stacked_poker"
                                    isExternal
                                >
                                    <IconButton
                                        aria-label="X"
                                        icon={<RiTwitterXLine size={20} />}
                                        size="md"
                                        variant="ghost"
                                        color="text.muted"
                                        bg="transparent"
                                        border="none"
                                        borderRadius="12px"
                                        w="44px"
                                        h="44px"
                                        _hover={{
                                            bg: '#000',
                                            color: 'white',
                                            transform: 'translateY(-2px)',
                                        }}
                                        transition="all 0.2s ease"
                                    />
                                </Link>
                                <Link
                                    href="https://discord.gg/347RBVcvpn"
                                    isExternal
                                >
                                    <IconButton
                                        aria-label="Discord"
                                        icon={<FaDiscord size={20} />}
                                        size="md"
                                        variant="ghost"
                                        color="#5865F2"
                                        bg="transparent"
                                        border="none"
                                        borderRadius="12px"
                                        w="44px"
                                        h="44px"
                                        _hover={{
                                            bg: '#5865F2',
                                            color: 'white',
                                            transform: 'translateY(-2px)',
                                        }}
                                        transition="all 0.2s ease"
                                    />
                                </Link>
                                <Link
                                    href="https://warpcast.com/stackedpoker"
                                    isExternal
                                >
                                    <IconButton
                                        aria-label="Warpcast"
                                        icon={<SiFarcaster size={20} />}
                                        size="md"
                                        variant="ghost"
                                        color="#855DCD"
                                        bg="transparent"
                                        border="none"
                                        borderRadius="12px"
                                        w="44px"
                                        h="44px"
                                        _hover={{
                                            bg: '#855DCD',
                                            color: 'white',
                                            transform: 'translateY(-2px)',
                                        }}
                                        transition="all 0.2s ease"
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
        </Flex>
    );
};

export default HomeNavBar;
