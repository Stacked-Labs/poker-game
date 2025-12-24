'use client';

import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    SimpleGrid,
    Icon,
    Badge,
    Wrap,
    WrapItem,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { MdStorage, MdSecurity } from 'react-icons/md';
import { SiEthereum } from 'react-icons/si';
import React from 'react';

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const YourTableVaultSection = () => {
    return (
        <Box bg="bg.default" py={{ base: 8, md: 12 }} width="100%">
            <Container maxW="container.xl">
                <Box
                    bg="card.white"
                    borderRadius="32px"
                    p={{ base: 8, md: 16 }}
                    border="1px solid"
                    borderColor="border.lightGray"
                    boxShadow="0 10px 40px rgba(0,0,0,0.04)"
                >
                    <VStack align="start" spacing={8}>
                        <HStack spacing={4}>
                            <Box
                                w="40px"
                                h="4px"
                                bg="orange.400"
                                borderRadius="full"
                            />
                            <Text
                                color="text.gray600"
                                fontSize="sm"
                                fontWeight="bold"
                                letterSpacing="0.1em"
                                textTransform="uppercase"
                            >
                                Why Onchain?
                            </Text>
                        </HStack>

                        <Heading
                            fontSize={{ base: '3xl', md: '4xl' }}
                            fontWeight="extrabold"
                            color="text.primary"
                        >
                            Your Table is Your Vault.
                        </Heading>

                        <VStack align="start" spacing={6} maxW="3xl">
                            <Text
                                fontSize="lg"
                                color="text.secondary"
                                lineHeight="tall"
                            >
                                We built the perfect compromise. Our
                                high-performance Go backend handles the
                                shuffling and game logic instantly—so
                                there&apos;s no lag between hands.
                                Meanwhile, Smart Contracts act as the
                                &quot;Banker,&quot; securing your funds
                                on-chain.
                            </Text>
                        </VStack>

                        {/* Split Diagram: Game Engine + The Banker */}
                        <Box width="100%" pt={{ base: 6, md: 8 }} pb={4}>
                            <Box
                                bg="linear-gradient(135deg, rgba(66, 153, 225, 0.05) 0%, rgba(54, 163, 123, 0.05) 100%)"
                                borderRadius="24px"
                                p={{ base: 4, md: 10 }}
                                border="1px solid"
                                borderColor="border.lightGray"
                                position="relative"
                                overflow="hidden"
                            >
                                <SimpleGrid
                                    columns={{ base: 1, lg: 2 }}
                                    spacing={{ base: 8, lg: 12 }}
                                    alignItems="center"
                                >
                                    {/* Left Side: Game Engine (Go) */}
                                    <VStack
                                        align="center"
                                        spacing={{ base: 4, md: 6 }}
                                        position="relative"
                                    >
                                        <Box
                                            position="relative"
                                            w={{ base: '96px', md: '120px' }}
                                            h={{ base: '96px', md: '120px' }}
                                            borderRadius={{ base: '20px', md: '24px' }}
                                            bgGradient="linear(135deg, blue.400, blue.600)"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            boxShadow="0 8px 24px rgba(66, 153, 225, 0.3)"
                                            _before={{
                                                content: '""',
                                                position: 'absolute',
                                                inset: '-2px',
                                                borderRadius: '24px',
                                                bgGradient:
                                                    'linear(135deg, blue.400, blue.600)',
                                                opacity: 0.3,
                                                filter: 'blur(8px)',
                                                zIndex: -1,
                                            }}
                                        >
                                            <Icon
                                                as={MdStorage}
                                                color="white"
                                                fontSize={{
                                                    base: '44px',
                                                    md: '56px',
                                                }}
                                            />
                                        </Box>
                                        <VStack spacing={2} align="center">
                                            <Heading
                                                fontSize={{ base: 'lg', md: 'xl' }}
                                                fontWeight="bold"
                                                color="text.primary"
                                            >
                                                Game Engine (Go)
                                            </Heading>
                                            <Wrap
                                                justify="center"
                                                spacing={{ base: 2, md: 3 }}
                                                mt={{ base: 1, md: 2 }}
                                            >
                                                <WrapItem>
                                                    <Badge
                                                        bg="blue.50"
                                                        color="blue.600"
                                                        px={{ base: 2, md: 3 }}
                                                        py={{ base: 0.5, md: 1 }}
                                                        borderRadius="full"
                                                        fontSize={{
                                                            base: '10px',
                                                            md: 'xs',
                                                        }}
                                                        fontWeight="semibold"
                                                        textAlign="center"
                                                    >
                                                        Whitelist Handling
                                                    </Badge>
                                                </WrapItem>
                                                <WrapItem>
                                                    <Badge
                                                        bg="blue.50"
                                                        color="blue.600"
                                                        px={{ base: 2, md: 3 }}
                                                        py={{ base: 0.5, md: 1 }}
                                                        borderRadius="full"
                                                        fontSize={{
                                                            base: '10px',
                                                            md: 'xs',
                                                        }}
                                                        fontWeight="semibold"
                                                        textAlign="center"
                                                    >
                                                        Shuffling
                                                    </Badge>
                                                </WrapItem>
                                                <WrapItem>
                                                    <Badge
                                                        bg="blue.50"
                                                        color="blue.600"
                                                        px={{ base: 2, md: 3 }}
                                                        py={{ base: 0.5, md: 1 }}
                                                        borderRadius="full"
                                                        fontSize={{
                                                            base: '10px',
                                                            md: 'xs',
                                                        }}
                                                        fontWeight="semibold"
                                                        textAlign="center"
                                                    >
                                                        Pot Calculation
                                                    </Badge>
                                                </WrapItem>
                                            </Wrap>
                                        </VStack>
                                    </VStack>

                                    {/* Connection Line */}
                                    <Box
                                        display={{
                                            base: 'none',
                                            lg: 'flex',
                                        }}
                                        position="absolute"
                                        left="50%"
                                        top="50%"
                                        transform="translate(-50%, -50%)"
                                        alignItems="center"
                                        zIndex={1}
                                        width="calc(100% - 240px)"
                                        justifyContent="center"
                                    >
                                        <Box
                                            flex="1"
                                            maxW="200px"
                                            h="2px"
                                            bgGradient="linear(to-r, blue.400, brand.green)"
                                            position="relative"
                                        >
                                            <Box
                                                position="absolute"
                                                right="-8px"
                                                top="50%"
                                                transform="translateY(-50%)"
                                                w="0"
                                                h="0"
                                                borderTop="6px solid transparent"
                                                borderBottom="6px solid transparent"
                                                borderLeft="8px solid"
                                                borderLeftColor="brand.green"
                                            />
                                        </Box>
                                        <Box
                                            position="absolute"
                                            left="50%"
                                            top="-20px"
                                            transform="translateX(-50%)"
                                            bg="card.white"
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                            border="1px solid"
                                            borderColor="border.lightGray"
                                            fontSize="xs"
                                            fontWeight="semibold"
                                            color="text.secondary"
                                            whiteSpace="nowrap"
                                            boxShadow="0 2px 8px rgba(0,0,0,0.05)"
                                        >
                                            State Updates
                                        </Box>
                                    </Box>

                                    {/* Right Side: The Banker (Contract) */}
                                    <VStack
                                        align="center"
                                        spacing={{ base: 4, md: 6 }}
                                        position="relative"
                                    >
                                        <Box
                                            position="relative"
                                            w={{ base: '96px', md: '120px' }}
                                            h={{ base: '96px', md: '120px' }}
                                            borderRadius={{ base: '20px', md: '24px' }}
                                            bgGradient="linear(135deg, brand.green, green.600)"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            boxShadow="0 8px 24px rgba(54, 163, 123, 0.3)"
                                            _before={{
                                                content: '""',
                                                position: 'absolute',
                                                inset: '-2px',
                                                borderRadius: '24px',
                                                bgGradient:
                                                    'linear(135deg, brand.green, green.600)',
                                                opacity: 0.3,
                                                filter: 'blur(8px)',
                                                zIndex: -1,
                                            }}
                                        >
                                            <Icon
                                                as={SiEthereum}
                                                color="white"
                                                fontSize={{
                                                    base: '44px',
                                                    md: '56px',
                                                }}
                                            />
                                        </Box>
                                        <VStack spacing={2} align="center">
                                            <Heading
                                                fontSize={{ base: 'lg', md: 'xl' }}
                                                fontWeight="bold"
                                                color="text.primary"
                                            >
                                                The Banker (Contract)
                                            </Heading>
                                            <Wrap
                                                justify="center"
                                                spacing={{ base: 2, md: 3 }}
                                                mt={{ base: 1, md: 2 }}
                                            >
                                                <WrapItem>
                                                    <Badge
                                                        bg="green.50"
                                                        color="brand.lightGray"
                                                        px={{ base: 2, md: 3 }}
                                                        py={{ base: 0.5, md: 1 }}
                                                        borderRadius="full"
                                                        fontSize={{
                                                            base: '10px',
                                                            md: 'xs',
                                                        }}
                                                        fontWeight="semibold"
                                                        textAlign="center"
                                                    >
                                                        Custody
                                                    </Badge>
                                                </WrapItem>
                                                <WrapItem>
                                                    <Badge
                                                        bg="green.50"
                                                        color="brand.lightGray"
                                                        px={{ base: 2, md: 3 }}
                                                        py={{ base: 0.5, md: 1 }}
                                                        borderRadius="full"
                                                        fontSize={{
                                                            base: '10px',
                                                            md: 'xs',
                                                        }}
                                                        fontWeight="semibold"
                                                        textAlign="center"
                                                    >
                                                        Payouts
                                                    </Badge>
                                                </WrapItem>
                                                <WrapItem>
                                                    <Badge
                                                        bg="green.50"
                                                        color="brand.lightGray"
                                                        px={{ base: 2, md: 3 }}
                                                        py={{ base: 0.5, md: 1 }}
                                                        borderRadius="full"
                                                        fontSize={{
                                                            base: '10px',
                                                            md: 'xs',
                                                        }}
                                                        fontWeight="semibold"
                                                        textAlign="center"
                                                    >
                                                        Settlement
                                                    </Badge>
                                                </WrapItem>
                                            </Wrap>
                                        </VStack>
                                    </VStack>
                                </SimpleGrid>
                            </Box>
                        </Box>

                        <SimpleGrid
                            columns={{ base: 1, md: 2 }}
                            spacing={8}
                            width="100%"
                            pt={4}
                        >
                            <Box
                                position="relative"
                                p="2px"
                                borderRadius="30px"
                                bgGradient="linear(to-r, blue.400, brand.navy, brand.yellow, blue.400)"
                                backgroundSize="300% 300%"
                                animation={`${gradientMove} 6s linear infinite`}
                                transition="all 0.3s"
                                _hover={{
                                    transform: 'translateY(-4px)',
                                    boxShadow:
                                        '0 12px 30px rgba(66, 153, 225, 0.2)',
                                }}
                            >
                                <Box
                                    bg="card.white"
                                    p={{ base: 6, md: 10 }}
                                    borderRadius="28px"
                                    height="100%"
                                >
                                    <HStack
                                        spacing={{ base: 3, md: 4 }}
                                        mb={{ base: 4, md: 5 }}
                                    >
                                        <Icon
                                            as={MdStorage}
                                            color="blue.400"
                                            fontSize={{
                                                base: '22px',
                                                md: '28px',
                                            }}
                                        />
                                        <Heading
                                            fontSize={{ base: 'lg', md: 'xl' }}
                                            fontWeight="bold"
                                            color="text.primary"
                                            letterSpacing="-0.01em"
                                        >
                                            Cryptographic Shuffling
                                        </Heading>
                                    </HStack>
                                    <Text
                                        color="text.secondary"
                                        lineHeight={{ base: 'taller', md: 'tall' }}
                                        fontSize={{ base: 'sm', md: 'md' }}
                                        fontWeight="medium"
                                    >
                                        No predictable seeds. We use
                                        crypto/rand with a Fisher-Yates
                                        shuffle for true entropy. It&apos;s
                                        industry-standard cryptographic
                                        randomness, ensuring every river is
                                        truly random.
                                    </Text>
                                </Box>
                            </Box>
                            <Box
                                position="relative"
                                p="2px"
                                borderRadius="30px"
                                bgGradient="linear(to-r, brand.green, brand.navy, brand.pink, brand.green)"
                                backgroundSize="300% 300%"
                                animation={`${gradientMove} 6s linear infinite`}
                                transition="all 0.3s"
                                _hover={{
                                    transform: 'translateY(-4px)',
                                    boxShadow:
                                        '0 12px 30px rgba(54, 163, 123, 0.2)',
                                }}
                            >
                                <Box
                                    bg="card.white"
                                    p={{ base: 6, md: 10 }}
                                    borderRadius="28px"
                                    height="100%"
                                >
                                    <HStack
                                        spacing={{ base: 3, md: 4 }}
                                        mb={{ base: 4, md: 5 }}
                                    >
                                        <Icon
                                            as={MdSecurity}
                                            color="brand.green"
                                            fontSize={{
                                                base: '22px',
                                                md: '28px',
                                            }}
                                        />
                                        <Heading
                                            fontSize={{ base: 'lg', md: 'xl' }}
                                            fontWeight="bold"
                                            color="text.primary"
                                            letterSpacing="-0.01em"
                                        >
                                            The Smart Contract Banker
                                        </Heading>
                                    </HStack>
                                    <Text
                                        color="text.secondary"
                                        lineHeight={{ base: 'taller', md: 'tall' }}
                                        fontSize={{ base: 'sm', md: 'md' }}
                                        fontWeight="medium"
                                    >
                                        Every table deploys its own
                                        dedicated Smart Contract (1-to-1).
                                        It acts as an automated escrow
                                        vault. We update the score, but the
                                        contract holds the cash.
                                    </Text>
                                </Box>
                            </Box>
                        </SimpleGrid>
                    </VStack>
                </Box>
            </Container>
        </Box>
    );
};

export default YourTableVaultSection;
