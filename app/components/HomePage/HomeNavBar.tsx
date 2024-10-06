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
import Web3Button from '../Web3Button';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
    weight: ['700'],
    subsets: ['latin'],
    display: 'swap',
});

const logoImage = '/logo.png';

const HomeNavBar: React.FC = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const NavButtons = React.memo(() => (
        <>
            <Button
                variant={'navButton'}
                as="a"
                href="https://docs.stackedpoker.io"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Documentation"
            >
                <Text className={poppins.className}>Docs</Text>
            </Button>
            <Button
                variant={'navButton'}
                as="a"
                href="https://discord.gg/EeEHt8rWy6"
                target="_blank"
                rel="noopener noreferrer"
            >
                <Text className={poppins.className}>Support</Text>
            </Button>
            <Web3Button width="200px" />
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
            zIndex={99}
            position={'fixed'}
            top={0}
            as="nav"
            bg={'gray.200'}
        >
            <Flex alignItems={'center'} gap={2} fontSize={'x-large'}>
                <Image
                    alt={`Logo Image`}
                    src={logoImage}
                    width={'100%'}
                    style={{ objectFit: 'contain' }}
                />
                <Text
                    color={'white'}
                    className={poppins.className}
                    fontSize={'5xl'}
                >
                    Stacked
                </Text>
            </Flex>

            {/* Desktop Navigation */}
            <Flex
                display={{ base: 'none', md: 'flex' }}
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
                display={{ base: 'flex', md: 'none' }}
            />

            <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent bg="gray.200" top="60px">
                    {' '}
                    {/* Added top property */}
                    <DrawerBody>
                        <VStack spacing={4} align="stretch" mt={8}>
                            <NavButtons />
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Flex>
    );
};

export default HomeNavBar;
