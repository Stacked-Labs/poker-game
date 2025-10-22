'use client';
import {
    Button,
    Flex,
    Image,
    Text,
    IconButton,
    useDisclosure,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerBody,
    VStack,
} from '@chakra-ui/react';
import React from 'react';
import { RiMenu3Line } from 'react-icons/ri';
import WalletButton from '../WalletButton';
import { usePathname } from 'next/navigation';

const logoImage = '/logo.png';

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
                variant={'navButton'}
                as="a"
                href="https://docs.stackedpoker.io/docs/introduction"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Documentation"
            >
                Docs
            </Button>
            <Button
                variant={'navButton'}
                as="a"
                href="https://discord.gg/4evYx7F4"
                target="_blank"
                rel="noopener noreferrer"
            >
                Support
            </Button>
            <WalletButton width="200px" label="Sign In" />
        </>
    ));
    NavButtons.displayName = 'NavButtons';

    return (
        <Flex
            width={'100%'}
            paddingX={4}
            paddingY={2}
            justifyContent={'space-between'}
            alignItems={'center'}
            position={'fixed'}
            height={'80px'}
            zIndex={99}
            as="nav"
            bg={'gray.200'}
        >
            <Flex
                as="a"
                href="/"
                alignItems={'center'}
                gap={2}
                fontSize={'x-large'}
                textDecoration="none"
                _hover={{ textDecoration: 'none' }}
            >
                <Image
                    alt={`Logo Image`}
                    src={logoImage}
                    width={'100%'}
                    style={{ objectFit: 'contain' }}
                />
                <Text
                    color={'white'}
                    fontFamily="heading"
                    fontWeight="bold"
                    fontSize={'5xl'}
                >
                    Stacked
                </Text>
            </Flex>

            {/* Desktop Navigation */}
            <Flex
                display={{ base: 'none', lg: 'flex' }}
                bg={'gray.200'}
                textTransform={'uppercase'}
                gap={10}
                alignItems={'center'}
            >
                <NavButtons />
            </Flex>

            {/* Mobile Navigation */}
            <IconButton
                aria-label="Open menu"
                icon={<RiMenu3Line />}
                onClick={onOpen}
                display={{ base: 'flex', lg: 'none' }}
            />

            <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent bg="gray.200" top="60px">
                    <DrawerBody>
                        <VStack spacing={4} align="center" mt={8} height="100%">
                            <NavButtons />
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Flex>
    );
};

export default HomeNavBar;
