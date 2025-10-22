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

const logoImage = '/IconLogo.svg';

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
                variant="unstyled"
                fontWeight="black"
                fontSize={{ base: '2xl', md: '2xl' }}
                color="brand.darkNavy"
                textTransform="uppercase"
                border="none"
                outline="none"
                boxShadow="none"
                _hover={{
                    transform: 'translateY(-3px)',
                    color: 'brand.pink',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                }}
                _focus={{
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                }}
                _active={{
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                }}
                transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            >
                Docs
            </Button>
            <Button
                as="a"
                href="https://discord.com/invite/vWBtE88R"
                target="_blank"
                rel="noopener noreferrer"
                variant="unstyled"
                fontWeight="black"
                fontSize={{ base: '2xl', md: '2xl' }}
                color="brand.darkNavy"
                textTransform="uppercase"
                border="none"
                outline="none"
                boxShadow="none"
                _hover={{
                    transform: 'translateY(-3px)',
                    color: 'brand.pink',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                }}
                _focus={{
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                }}
                _active={{
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                }}
                transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            >
                Support
            </Button>
            <Box
                as={WalletButton}
                width={{ base: '140px', md: '180px' }}
                label="Sign In"
                height="52px"
                borderRadius="14px"
                bg="brand.pink"
                color="white"
                fontWeight="extrabold"
                fontSize={{ base: 'md', md: 'lg' }}
                border="none"
                boxShadow="0 4px 16px rgba(235, 11, 92, 0.3)"
                _hover={{
                    bg: 'brand.pink',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 24px rgba(235, 11, 92, 0.45)',
                }}
                transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            />
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
            bg="rgba(255, 255, 255, 0.85)"
            backdropFilter="blur(12px)"
            borderBottom="1px solid"
            borderColor="rgba(12, 21, 49, 0.08)"
            boxShadow="0 2px 12px rgba(0, 0, 0, 0.04)"
            animation={`${fadeIn} 0.6s ease-out`}
        >
            {/* Logo Section */}
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
                color="brand.navy"
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
                            color="brand.navy"
                        >
                            Menu
                        </Text>
                        <IconButton
                            aria-label="Close menu"
                            icon={<RiCloseLine size={24} />}
                            onClick={onClose}
                            bg="transparent"
                            color="brand.navy"
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
                                color="brand.navy"
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
                                href="https://discord.gg/4evYx7F4"
                                target="_blank"
                                rel="noopener noreferrer"
                                size="lg"
                                fontWeight="semibold"
                                bg="brand.lightGray"
                                color="brand.navy"
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
                            <Box
                                as={WalletButton}
                                width="100%"
                                label="Sign In"
                                height="56px"
                                borderRadius="16px"
                                bg="brand.pink"
                                color="white"
                                fontWeight="bold"
                                fontSize="md"
                                border="none"
                                boxShadow="0 4px 16px rgba(235, 11, 92, 0.3)"
                                _hover={{
                                    bg: 'brand.pink',
                                    transform: 'translateY(-2px)',
                                    boxShadow:
                                        '0 6px 20px rgba(235, 11, 92, 0.4)',
                                }}
                                transition="all 0.2s ease"
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
