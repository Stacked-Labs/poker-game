'use client';

import React from 'react';
import {
    Badge,
    Box,
    Button,
    Container,
    Flex,
    Heading,
    HStack,
    Icon,
    Link,
    SimpleGrid,
    Text,
    VStack,
    useClipboard,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { MdAutoGraph, MdContentCopy, MdShuffle } from 'react-icons/md';
import { motion, useReducedMotion } from 'framer-motion';
import FloatingDecor from './FloatingDecor';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const GO_SECURE_SHUFFLE_SNIPPET = `import (
    "crypto/rand"
    "encoding/binary"
)

func SecureShuffleDeck(d *Deck) error {
    *d = append([]Card{}, DefaultDeck...)
    n := len(*d)

    randomBytes := make([]byte, n*8)
    // crypto/rand pulls entropy from the OS CSPRNG, making shuffles unpredictable.
    _, err := rand.Read(randomBytes)
    if err != nil { return err }

    for i := n - 1; i > 0; i-- {
        offset := (n - 1 - i) * 8
        randVal := binary.BigEndian.Uint64(randomBytes[offset : offset+8])
        // Fisher–Yates: each swap index is chosen uniformly from the remaining range.
        j := int(randVal % uint64(i+1))
        (*d)[i], (*d)[j] = (*d)[j], (*d)[i]
    }
    return nil
}`;

function highlightGo(code: string): React.ReactNode {
    const colorize = (segment: string): React.ReactNode[] => {
        const tokenRegex =
            /("(?:\\.|[^"\\])*")|(\b(?:import|func|return|for|if|package|var|const|type|struct)\b)|(\b(?:error|int|uint64|byte|string|bool)\b)|(\b(?:rand|binary|BigEndian|Uint64|make|append|len)\b)|(\b\d+\b)/g;

        const nodes: React.ReactNode[] = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = tokenRegex.exec(segment)) !== null) {
            if (match.index > lastIndex) {
                nodes.push(segment.slice(lastIndex, match.index));
            }

            const [token, str, kw, prim, builtin, num] = match;
            const color = str
                ? '#36A37B'
                : kw
                  ? '#EB0B5C'
                  : prim
                    ? '#89DDFF'
                    : builtin
                      ? '#FDC51D'
                      : num
                        ? '#FDC51D'
                        : undefined;

            nodes.push(
                <Box as="span" key={`${match.index}-${token}`} color={color}>
                    {token}
                </Box>
            );
            lastIndex = match.index + token.length;
        }

        if (lastIndex < segment.length) {
            nodes.push(segment.slice(lastIndex));
        }

        return nodes;
    };

    const lines = code.split('\n');

    return lines.map((line, lineIndex) => {
        const commentIndex = line.indexOf('//');
        const hasComment = commentIndex >= 0;
        const beforeComment = hasComment ? line.slice(0, commentIndex) : line;
        const comment = hasComment ? line.slice(commentIndex) : '';

        return (
            <Box as="span" key={lineIndex}>
                <Box as="span" color="rgba(255,255,255,0.9)">
                    {colorize(beforeComment)}
                </Box>
                {comment ? (
                    <Box as="span" color="rgba(148, 163, 184, 0.85)">
                        {comment}
                    </Box>
                ) : null}
                {lineIndex < lines.length - 1 ? '\n' : null}
            </Box>
        );
    });
}

function CodeBlock({ code, label }: { code: string; label: string }) {
    const { hasCopied, onCopy } = useClipboard(code);

    return (
        <Box
            bg="brand.darkNavy"
            color="white"
            borderRadius="24px"
            border="1px solid"
            borderColor="rgba(51, 68, 121, 0.3)"
            overflow="hidden"
            boxShadow="0 20px 60px rgba(11, 20, 48, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
        >
            <Flex
                justify="space-between"
                align="center"
                px={{ base: 5, md: 6 }}
                py={3.5}
                borderBottom="1px solid"
                borderBottomColor="rgba(51, 68, 121, 0.3)"
                bg="rgba(51, 68, 121, 0.15)"
            >
                <HStack spacing={3} minW={0}>
                    <HStack spacing={1.5}>
                        <Box
                            w="10px"
                            h="10px"
                            borderRadius="full"
                            bg="brand.pink"
                            boxShadow="0 0 6px rgba(235, 11, 92, 0.4)"
                        />
                        <Box
                            w="10px"
                            h="10px"
                            borderRadius="full"
                            bg="brand.yellow"
                            opacity={0.7}
                        />
                        <Box
                            w="10px"
                            h="10px"
                            borderRadius="full"
                            bg="brand.green"
                            opacity={0.7}
                        />
                    </HStack>
                    <Text
                        fontSize="sm"
                        fontWeight="bold"
                        letterSpacing="0.06em"
                        textTransform="uppercase"
                        color="rgba(255,255,255,0.7)"
                        isTruncated
                    >
                        {label}
                    </Text>
                </HStack>
                <Button
                    onClick={onCopy}
                    size="sm"
                    leftIcon={<MdContentCopy />}
                    bg="rgba(51, 68, 121, 0.3)"
                    color="rgba(255,255,255,0.85)"
                    border="1px solid"
                    borderColor="rgba(51, 68, 121, 0.4)"
                    _hover={{
                        bg: 'rgba(51, 68, 121, 0.5)',
                        borderColor: 'rgba(51, 68, 121, 0.6)',
                    }}
                    _active={{ bg: 'rgba(51, 68, 121, 0.6)' }}
                    borderRadius="10px"
                    fontWeight="bold"
                    transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                >
                    {hasCopied ? 'Copied' : 'Copy'}
                </Button>
            </Flex>

            <Box px={{ base: 5, md: 6 }} py={{ base: 5, md: 6 }}>
                <Box
                    as="pre"
                    m={0}
                    p={0}
                    whiteSpace="pre"
                    overflowX="auto"
                    fontSize={{ base: 'xs', md: 'sm' }}
                    lineHeight="tall"
                    fontFamily='ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                >
                    <Box as="code" display="block">
                        {highlightGo(code)}
                    </Box>
                </Box>
                <Text
                    mt={5}
                    fontSize="sm"
                    color="rgba(255,255,255,0.55)"
                    lineHeight="tall"
                >
                    Fisher-Yates shuffle powered by OS entropy via Go&apos;s{' '}
                    <Box as="span" fontWeight="bold" color="rgba(255,255,255,0.85)">
                        crypto/rand
                    </Box>
                    .{' '}
                    <Link
                        href="https://pkg.go.dev/crypto/rand"
                        isExternal
                        color="brand.yellow"
                        fontWeight="bold"
                        _hover={{ textDecoration: 'underline', color: 'brand.yellow' }}
                    >
                        Read the docs
                    </Link>
                </Text>
            </Box>
        </Box>
    );
}

const OddsAndRandomnessSection = () => {
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
            as="section"
            py={{ base: 10, md: 14 }}
            bg="bg.default"
            w="100%"
            position="relative"
            overflow="hidden"
        >
            <FloatingDecor density="light" />
            <Container maxW="container.xl" position="relative" zIndex={1}>
                <MotionBox {...fadeUp(0)}>
                    <Box
                    position="relative"
                    p="2px"
                    borderRadius="36px"
                    bgGradient="linear(to-r, brand.pink, brand.green, brand.yellow, brand.pink)"
                    backgroundSize="300% 300%"
                    animation={`${gradientMove} 10s ease infinite`}
                    boxShadow="0 18px 60px rgba(0, 0, 0, 0.06)"
                >
                    <Box
                        bg="card.white"
                        borderRadius="34px"
                        p={{ base: 8, md: 14 }}
                        overflow="hidden"
                        position="relative"
                    >
                        <Box
                            position="absolute"
                            inset={0}
                            bgGradient="radial(circle at 20% 0%, rgba(235, 11, 92, 0.08) 0%, transparent 55%), radial(circle at 100% 30%, rgba(54, 163, 123, 0.08) 0%, transparent 55%)"
                            pointerEvents="none"
                        />
                        <MotionBox
                            position="absolute"
                            top={{ base: '14px', md: '20px' }}
                            right={{ base: '18px', md: '24px' }}
                            fontSize={{ base: '18px', md: '22px' }}
                            color="brand.pink"
                            opacity={0.18}
                            pointerEvents="none"
                            animate={
                                prefersReducedMotion
                                    ? undefined
                                    : { y: [0, -4, 0] }
                            }
                            transition={
                                prefersReducedMotion
                                    ? undefined
                                    : { duration: 5, repeat: Infinity, ease: 'easeInOut' }
                            }
                        >
                            ♥
                        </MotionBox>
                        <MotionBox
                            position="absolute"
                            bottom={{ base: '16px', md: '24px' }}
                            left={{ base: '20px', md: '28px' }}
                            fontSize={{ base: '18px', md: '22px' }}
                            color="brand.green"
                            opacity={0.18}
                            pointerEvents="none"
                            animate={
                                prefersReducedMotion
                                    ? undefined
                                    : { y: [0, 4, 0] }
                            }
                            transition={
                                prefersReducedMotion
                                    ? undefined
                                    : { duration: 5.5, repeat: Infinity, ease: 'easeInOut' }
                            }
                        >
                            ♣
                        </MotionBox>
                        <Box
                            position="absolute"
                            top={{ base: '40%', md: '46%' }}
                            left={{ base: '-4px', md: '12px' }}
                            bg="brand.yellow"
                            color="brand.darkNavy"
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="bold"
                            letterSpacing="0.12em"
                            textTransform="uppercase"
                            boxShadow="0 4px 12px rgba(253, 197, 29, 0.25)"
                            transform="rotate(-4deg)"
                            pointerEvents="none"
                        >
                            Fair Play
                        </Box>

                        <SimpleGrid
                            columns={{ base: 1, lg: 2 }}
                            spacing={{ base: 10, lg: 14 }}
                            alignItems="start"
                            position="relative"
                            zIndex={1}
                        >
                            <MotionVStack
                                align="start"
                                spacing={7}
                                alignSelf="start"
                                {...fadeUp(0.1)}
                            >
                                <Badge
                                    bg="rgba(12, 21, 49, 0.06)"
                                    color="text.gray600"
                                    px={4}
                                    py={1.5}
                                    borderRadius="full"
                                    fontSize="xs"
                                    fontWeight="extrabold"
                                    letterSpacing="0.08em"
                                >
                                    ODDS &amp; RANDOMNESS
                                </Badge>

                                <VStack align="start" spacing={4}>
                                    <Heading
                                        fontSize={{ base: '3xl', md: '4xl' }}
                                        fontWeight="extrabold"
                                        color="text.primary"
                                        letterSpacing="-0.02em"
                                        lineHeight="shorter"
                                    >
                                        How we calculate odds — and keep every
                                        shuffle fair.
                                    </Heading>
                                    <Text
                                        fontSize={{ base: 'lg', md: 'xl' }}
                                        color="text.secondary"
                                        lineHeight="tall"
                                        maxW="2xl"
                                        fontWeight="medium"
                                    >
                                        Every shuffle is powered by Go&apos;s{' '}
                                        <Box
                                            as="span"
                                            fontWeight="bold"
                                            color="text.primary"
                                        >
                                            crypto/rand
                                        </Box>
                                        —an industry-standard CSPRNG backed by
                                        OS entropy. That means shuffles are
                                        unpredictable, independent, and fair.
                                    </Text>
                                </VStack>

                                <SimpleGrid
                                    columns={{ base: 1, md: 2 }}
                                    spacing={5}
                                    w="100%"
                                >
                                    <Box
                                        p={6}
                                        borderRadius="20px"
                                        bg="bg.default"
                                        border="1px solid"
                                        borderColor="border.lightGray"
                                        boxShadow="glass"
                                        position="relative"
                                        overflow="hidden"
                                        transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                                        _hover={{
                                            boxShadow: 'glass-hover',
                                            transform: 'translateY(-2px)',
                                        }}
                                    >
                                        <Box
                                            position="absolute"
                                            inset={0}
                                            bgGradient="radial(circle at 0% 0%, rgba(51, 68, 121, 0.08) 0%, transparent 55%)"
                                            pointerEvents="none"
                                        />
                                        <Box
                                            position="absolute"
                                            top="12px"
                                            right="12px"
                                            fontSize="16px"
                                            color="brand.navy"
                                            opacity={0.2}
                                            pointerEvents="none"
                                        >
                                            ♠
                                        </Box>
                                        <HStack spacing={3} mb={3}>
                                            <Flex
                                                w="42px"
                                                h="42px"
                                                borderRadius="14px"
                                                align="center"
                                                justify="center"
                                                bg="rgba(51, 68, 121, 0.08)"
                                                color="brand.navy"
                                            >
                                                <Icon
                                                    as={MdAutoGraph}
                                                    fontSize="22px"
                                                />
                                            </Flex>
                                            <Heading
                                                fontSize="lg"
                                                fontWeight="bold"
                                                color="text.primary"
                                            >
                                                Odds Engine
                                            </Heading>
                                        </HStack>
                                        <Text
                                            color="text.secondary"
                                            fontSize="md"
                                            lineHeight="tall"
                                            fontWeight="medium"
                                        >
                                            Uses standard hand evaluation and
                                            repeated runouts to give fast,
                                            intuitive win/tie odds as the board
                                            develops.
                                        </Text>
                                    </Box>

                                    <Box
                                        p={6}
                                        borderRadius="20px"
                                        bg="bg.default"
                                        border="1px solid"
                                        borderColor="border.lightGray"
                                        boxShadow="glass"
                                        position="relative"
                                        overflow="hidden"
                                        transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                                        _hover={{
                                            boxShadow: 'glass-hover',
                                            transform: 'translateY(-2px)',
                                        }}
                                    >
                                        <Box
                                            position="absolute"
                                            inset={0}
                                            bgGradient="radial(circle at 100% 0%, rgba(235, 11, 92, 0.08) 0%, transparent 55%)"
                                            pointerEvents="none"
                                        />
                                        <Box
                                            position="absolute"
                                            top="12px"
                                            right="12px"
                                            fontSize="16px"
                                            color="brand.pink"
                                            opacity={0.2}
                                            pointerEvents="none"
                                        >
                                            ♦
                                        </Box>
                                        <HStack spacing={3} mb={3}>
                                            <Flex
                                                w="42px"
                                                h="42px"
                                                borderRadius="14px"
                                                align="center"
                                                justify="center"
                                                bg="rgba(235, 11, 92, 0.08)"
                                                color="brand.pink"
                                            >
                                                <Icon
                                                    as={MdShuffle}
                                                    fontSize="22px"
                                                />
                                            </Flex>
                                            <Heading
                                                fontSize="lg"
                                                fontWeight="bold"
                                                color="text.primary"
                                            >
                                                Secure Shuffle
                                            </Heading>
                                        </HStack>
                                        <Text
                                            color="text.secondary"
                                            fontSize="md"
                                            lineHeight="tall"
                                            fontWeight="medium"
                                        >
                                            No predictable seeds. We use OS
                                            entropy via{' '}
                                            <Box
                                                as="span"
                                                fontWeight="bold"
                                                color="text.primary"
                                            >
                                                crypto/rand
                                            </Box>{' '}
                                            with Fisher-Yates so each of the{' '}
                                            <Box
                                                as="span"
                                                fontWeight="bold"
                                                color="text.primary"
                                            >
                                                52!
                                            </Box>{' '}
                                            decks is equally likely.
                                        </Text>
                                    </Box>
                                </SimpleGrid>
                            </MotionVStack>

                            <MotionVStack
                                align="stretch"
                                spacing={5}
                                alignSelf="start"
                                {...fadeUp(0.2)}
                            >
                                <Box position="relative">
                                    <Box
                                        position="absolute"
                                        top="-12px"
                                        right="14px"
                                        bg="brand.green"
                                        color="white"
                                        px={3.5}
                                        py={1}
                                        borderRadius="full"
                                        fontSize="xs"
                                        fontWeight="bold"
                                        letterSpacing="0.1em"
                                        textTransform="uppercase"
                                        boxShadow="0 4px 14px rgba(54, 163, 123, 0.35)"
                                        zIndex={2}
                                        border="2px solid"
                                        borderColor="rgba(255, 255, 255, 0.2)"
                                    >
                                        Shuffle Seal
                                    </Box>
                                    <Box
                                        position="absolute"
                                        bottom="-14px"
                                        left="16px"
                                        bg="brand.pink"
                                        color="white"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                        fontSize="xs"
                                        fontWeight="bold"
                                        letterSpacing="0.1em"
                                        textTransform="uppercase"
                                        boxShadow="0 4px 14px rgba(235, 11, 92, 0.3)"
                                        transform="rotate(-3deg)"
                                        zIndex={2}
                                        border="2px solid"
                                        borderColor="rgba(255, 255, 255, 0.2)"
                                    >
                                        52! Decks
                                    </Box>
                                    <CodeBlock
                                        label="Secure Shuffle (Go)"
                                        code={GO_SECURE_SHUFFLE_SNIPPET}
                                    />
                                </Box>
                                <HStack
                                    spacing={2.5}
                                    flexWrap="wrap"
                                    pt={2}
                                >
                                    {[
                                        'OS CSPRNG',
                                        'Fisher-Yates',
                                        'Independent shuffles',
                                        'Auditable logic',
                                    ].map((label) => (
                                        <Badge
                                            key={label}
                                            bg="rgba(51, 68, 121, 0.06)"
                                            color="brand.navy"
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                            fontSize="xs"
                                            fontWeight="bold"
                                            letterSpacing="0.02em"
                                            border="1px solid"
                                            borderColor="rgba(51, 68, 121, 0.1)"
                                        >
                                            {label}
                                        </Badge>
                                    ))}
                                </HStack>
                            </MotionVStack>
                        </SimpleGrid>
                    </Box>
                </Box>
                </MotionBox>
            </Container>
        </Box>
    );
};

export default OddsAndRandomnessSection;
