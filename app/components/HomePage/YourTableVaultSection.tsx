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
import { motion, useReducedMotion } from 'framer-motion';
import FloatingDecor from './FloatingDecor';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const YourTableVaultSection = () => {
    const prefersReducedMotion = useReducedMotion();
    const fadeUp = (delay = 0) =>
        prefersReducedMotion
            ? {}
            : {
                  initial: { opacity: 0, y: 24 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, amount: 0.35 },
                  transition: { duration: 0.6, ease: 'easeOut', delay },
              };

    return (
        <Box
            bg="bg.default"
            py={{ base: 8, md: 12 }}
            width="100%"
            position="relative"
            overflow="hidden"
        >
            <FloatingDecor density="light" />
            <Container maxW="container.xl" position="relative" zIndex={1}>
                <Box
                    bg="card.white"
                    borderRadius="32px"
                    p={{ base: 8, md: 16 }}
                    border="1px solid"
                    borderColor="border.lightGray"
                    boxShadow="0 16px 50px rgba(0,0,0,0.08)"
                    position="relative"
                    overflow="hidden"
                >
                    <MotionBox
                        aria-hidden="true"
                        position="absolute"
                        top={{ base: '-50px', md: '-70px' }}
                        right={{ base: '-30px', md: '-40px' }}
                        w={{ base: '160px', md: '220px' }}
                        h={{ base: '160px', md: '220px' }}
                        bg="brand.yellow"
                        opacity={0.12}
                        borderRadius="40px"
                        transform="rotate(12deg)"
                        zIndex={0}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize={{ base: '32px', md: '40px' }}
                        color="brand.darkNavy"
                        animate={
                            prefersReducedMotion
                                ? undefined
                                : { y: [0, -8, 0], rotate: [12, 6, 12] }
                        }
                        transition={
                            prefersReducedMotion
                                ? undefined
                                : { duration: 5, repeat: Infinity, ease: 'easeInOut' }
                        }
                    >
                        ♦
                    </MotionBox>
                    <MotionBox
                        aria-hidden="true"
                        position="absolute"
                        bottom={{ base: '-80px', md: '-100px' }}
                        left={{ base: '-40px', md: '-60px' }}
                        w={{ base: '180px', md: '240px' }}
                        h={{ base: '180px', md: '240px' }}
                        bg="brand.pink"
                        opacity={0.08}
                        borderRadius="full"
                        zIndex={0}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize={{ base: '30px', md: '36px' }}
                        color="white"
                        animate={
                            prefersReducedMotion
                                ? undefined
                                : { y: [0, 10, 0], rotate: [0, -8, 0] }
                        }
                        transition={
                            prefersReducedMotion
                                ? undefined
                                : { duration: 6, repeat: Infinity, ease: 'easeInOut' }
                        }
                    >
                        ♠
                    </MotionBox>
                    <Box
                        aria-hidden="true"
                        position="absolute"
                        inset={0}
                        backgroundImage="radial-gradient(circle, rgba(51, 68, 121, 0.12) 1px, transparent 1px)"
                        backgroundSize="24px 24px"
                        opacity={0.25}
                        pointerEvents="none"
                        zIndex={0}
                    />
                    <MotionVStack
                        align="start"
                        spacing={8}
                        position="relative"
                        zIndex={1}
                        {...fadeUp(0)}
                    >
                        <HStack spacing={3} flexWrap="wrap">
                            <Badge
                                bg="brand.yellow"
                                color="brand.darkNavy"
                                px={3}
                                py={1}
                                borderRadius="full"
                                fontSize="xs"
                                fontWeight="bold"
                                letterSpacing="0.12em"
                                textTransform="uppercase"
                            >
                                Why Onchain?
                            </Badge>
                            <Badge
                                bg="brand.green"
                                color="white"
                                px={3}
                                py={1}
                                borderRadius="full"
                                fontSize="xs"
                                fontWeight="bold"
                                letterSpacing="0.12em"
                                textTransform="uppercase"
                            >
                                Vault Mode 🔐
                            </Badge>
                        </HStack>

                        <Heading
                            fontSize={{ base: '3xl', md: '4xl' }}
                            fontWeight="extrabold"
                            color="text.primary"
                        >
                            Your Table is Your{' '}
                            <Box
                                as="span"
                                color="brand.green"
                                position="relative"
                                display="inline-block"
                            >
                                Vault
                                <Box
                                    as="span"
                                    position="absolute"
                                    left="-4px"
                                    right="-4px"
                                    bottom="4px"
                                    height="12px"
                                    bg="brand.green"
                                    opacity={0.16}
                                    borderRadius="full"
                                    zIndex={-1}
                                />
                            </Box>
                            .
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
                                borderColor="rgba(51, 68, 121, 0.2)"
                                borderStyle="dashed"
                                boxShadow="inset 0 0 0 1px rgba(54, 163, 123, 0.18), 0 12px 24px rgba(12, 21, 49, 0.04)"
                                position="relative"
                                overflow="hidden"
                            >
                                <MotionBox
                                    position="absolute"
                                    top={{ base: '12px', md: '16px' }}
                                    left={{ base: '12px', md: '16px' }}
                                    bg="brand.navy"
                                    color="white"
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                    fontSize="xs"
                                    fontWeight="bold"
                                    letterSpacing="0.08em"
                                    textTransform="uppercase"
                                    boxShadow="0 6px 16px rgba(51, 68, 121, 0.25)"
                                    animate={
                                        prefersReducedMotion
                                            ? undefined
                                            : { y: [0, -4, 0], rotate: [-2, 2, -2] }
                                    }
                                    transition={
                                        prefersReducedMotion
                                            ? undefined
                                            : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                                    }
                                >
                                    Engine ↔ Banker
                                </MotionBox>
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
                                        <MotionBox
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
                                            animate={
                                                prefersReducedMotion
                                                    ? undefined
                                                    : { y: [0, -6, 0] }
                                            }
                                            transition={
                                                prefersReducedMotion
                                                    ? undefined
                                                    : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
                                            }
                                        >
                                            <Icon
                                                as={MdStorage}
                                                color="white"
                                                fontSize={{
                                                    base: '44px',
                                                    md: '56px',
                                                }}
                                            />
                                        </MotionBox>
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
                                            <MotionBox
                                                position="absolute"
                                                top="50%"
                                                left="0"
                                                w="10px"
                                                h="10px"
                                                bg="brand.yellow"
                                                borderRadius="full"
                                                transform="translate(-50%, -50%)"
                                                boxShadow="0 0 12px rgba(253, 197, 29, 0.7)"
                                                animate={
                                                    prefersReducedMotion
                                                        ? undefined
                                                        : { x: ['0%', '100%'] }
                                                }
                                                transition={
                                                    prefersReducedMotion
                                                        ? undefined
                                                        : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
                                                }
                                            />
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
                                        <MotionBox
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
                                            animate={
                                                prefersReducedMotion
                                                    ? undefined
                                                    : { y: [0, 6, 0] }
                                            }
                                            transition={
                                                prefersReducedMotion
                                                    ? undefined
                                                    : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
                                            }
                                        >
                                            <Icon
                                                as={SiEthereum}
                                                color="white"
                                                fontSize={{
                                                    base: '44px',
                                                    md: '56px',
                                                }}
                                            />
                                        </MotionBox>
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
                            <Box
                                position="absolute"
                                bottom={{ base: '10px', md: '16px' }}
                                left="50%"
                                transform="translateX(-50%)"
                                bg="card.white"
                                border="1px solid"
                                borderColor="border.lightGray"
                                w={{ base: '46px', md: '52px' }}
                                h={{ base: '46px', md: '52px' }}
                                borderRadius="full"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                fontWeight="bold"
                                color="brand.navy"
                                boxShadow="0 10px 20px rgba(12, 21, 49, 0.12)"
                            >
                                D
                            </Box>
                        </Box>

                        <SimpleGrid
                            columns={{ base: 1, md: 2 }}
                            spacing={8}
                            width="100%"
                            pt={4}
                        >
                            <MotionBox {...fadeUp(0.1)}>
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
                                        position="absolute"
                                        top="12px"
                                        left="14px"
                                        fontSize="18px"
                                        color="blue.400"
                                        opacity={0.7}
                                    >
                                        ♠
                                    </Box>
                                    <Box
                                        position="absolute"
                                        top="10px"
                                        right="12px"
                                        bg="card.white"
                                        border="1px solid"
                                        borderColor="border.lightGray"
                                        px={2}
                                        py={0.5}
                                        borderRadius="full"
                                        fontSize="xs"
                                        fontWeight="bold"
                                        color="blue.500"
                                        letterSpacing="0.08em"
                                    >
                                        Proof 01
                                    </Box>
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
                            </MotionBox>
                            <MotionBox {...fadeUp(0.2)}>
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
                                        position="absolute"
                                        top="12px"
                                        left="14px"
                                        fontSize="18px"
                                        color="brand.pink"
                                        opacity={0.7}
                                    >
                                        ♥
                                    </Box>
                                    <Box
                                        position="absolute"
                                        top="10px"
                                        right="12px"
                                        bg="card.white"
                                        border="1px solid"
                                        borderColor="border.lightGray"
                                        px={2}
                                        py={0.5}
                                        borderRadius="full"
                                        fontSize="xs"
                                        fontWeight="bold"
                                        color="brand.green"
                                        letterSpacing="0.08em"
                                    >
                                        Proof 02
                                    </Box>
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
                            </MotionBox>
                        </SimpleGrid>
                    </MotionVStack>
                </Box>
            </Container>
        </Box>
    );
};

export default YourTableVaultSection;
