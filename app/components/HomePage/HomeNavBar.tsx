'use client';
import {
    Button,
    Flex,
    Image,
    IconButton,
    useDisclosure,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerBody,
    VStack,
    Box,
    Text,
} from '@chakra-ui/react';
import React from 'react';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import WalletButton from '../WalletButton';
import { usePathname } from 'next/navigation';
import { keyframes } from '@emotion/react';
import { ColorModeButton } from '../ColorModeButton';

const logoImage = '/IconLogo.png';

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
                href="https://discord.gg/XMWfksjt"
                target="_blank"
                rel="noopener noreferrer"
                variant="navLink"
            >
                Support
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
                    <Image
                        alt="Stacked Logo"
                        src={logoImage}
                        width={{ base: '56px', md: '64px', lg: '72px' }}
                        height={{ base: '56px', md: '64px', lg: '72px' }}
                        style={{ objectFit: 'contain' }}
                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        _hover={{
                            transform: 'rotate(-8deg) scale(1.08)',
                        }}
                    />
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
                <DrawerOverlay
                    bg="rgba(0, 0, 0, 0.4)"
                    backdropFilter="blur(4px)"
                />
                <DrawerContent
                    bg="rgba(255, 255, 255, 0.98)"
                    backdropFilter="blur(12px)"
                    borderLeft="1px solid"
                    borderColor="rgba(12, 21, 49, 0.08)"
                    boxShadow="-4px 0 24px rgba(0, 0, 0, 0.08)"
                >
                    {/* Drawer Header */}
                    <Flex
                        justify="space-between"
                        align="center"
                        px={6}
                        py={4}
                        borderBottom="1px solid"
                        borderColor="rgba(12, 21, 49, 0.08)"
                    >
                        <Text
                            fontFamily="heading"
                            fontWeight="bold"
                            fontSize="xl"
                            color="text.secondary"
                        >
                            Menu
                        </Text>
                        <IconButton
                            aria-label="Close menu"
                            icon={<RiCloseLine size={24} />}
                            onClick={onClose}
                            bg="transparent"
                            color="text.secondary"
                            borderRadius="12px"
                            _hover={{
                                bg: 'rgba(12, 21, 49, 0.08)',
                            }}
                        />
                    </Flex>

                    {/* Drawer Body */}
                    <DrawerBody pt={8} px={6}>
                        <VStack spacing={4} align="stretch" width="100%">
                            <Button
                                as="a"
                                href="https://docs.stackedpoker.io/docs/introduction"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Documentation"
                                size="lg"
                                fontWeight="semibold"
                                bg="brand.lightGray"
                                color="text.secondary"
                                borderRadius="16px"
                                height="56px"
                                justifyContent="flex-start"
                                px={6}
                                _hover={{
                                    bg: 'rgba(12, 21, 49, 0.12)',
                                    transform: 'translateX(4px)',
                                }}
                                transition="all 0.2s ease"
                                onClick={onClose}
                            >
                                📚 Documentation
                            </Button>
                            <Button
                                as="a"
                                href="https://discord.gg/XMWfksjt"
                                target="_blank"
                                rel="noopener noreferrer"
                                size="lg"
                                fontWeight="semibold"
                                bg="brand.lightGray"
                                color="text.secondary"
                                borderRadius="16px"
                                height="56px"
                                justifyContent="flex-start"
                                px={6}
                                _hover={{
                                    bg: 'rgba(12, 21, 49, 0.12)',
                                    transform: 'translateX(4px)',
                                }}
                                transition="all 0.2s ease"
                                onClick={onClose}
                            >
                                💬 Support
                            </Button>
                            <WalletButton
                                width="100%"
                                height="56px"
                                label="Sign In"
                            />
                        </VStack>

                        {/* Decorative Gradient */}
                        <Box
                            position="absolute"
                            bottom="0"
                            left="0"
                            right="0"
                            height="200px"
                            bgGradient="linear(to-t, rgba(235, 11, 92, 0.08), transparent)"
                            pointerEvents="none"
                        />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Flex>
    );
};

export default HomeNavBar;
