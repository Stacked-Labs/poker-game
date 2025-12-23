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
                ? '#C3E88D'
                : kw
                  ? '#C792EA'
                  : prim
                    ? '#89DDFF'
                    : builtin
                      ? '#FFCB6B'
                      : num
                        ? '#F78C6C'
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
            bg="#0B1220"
            color="white"
            borderRadius="24px"
            border="1px solid"
            borderColor="rgba(255,255,255,0.12)"
            overflow="hidden"
            boxShadow="0 18px 55px rgba(11, 18, 32, 0.35)"
        >
            <Flex
                justify="space-between"
                align="center"
                px={{ base: 5, md: 6 }}
                py={4}
                borderBottom="1px solid"
                borderBottomColor="rgba(255,255,255,0.10)"
                bg="linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)"
            >
                <HStack spacing={3} minW={0}>
                    <Box
                        w="10px"
                        h="10px"
                        borderRadius="full"
                        bg="brand.pink"
                        boxShadow="0 0 0 4px rgba(235, 11, 92, 0.18)"
                    />
                    <Text
                        fontSize="sm"
                        fontWeight="bold"
                        letterSpacing="0.06em"
                        textTransform="uppercase"
                        color="rgba(255,255,255,0.85)"
                        isTruncated
                    >
                        {label}
                    </Text>
                </HStack>
                <Button
                    onClick={onCopy}
                    size="sm"
                    leftIcon={<MdContentCopy />}
                    bg="rgba(255,255,255,0.08)"
                    color="rgba(255,255,255,0.92)"
                    _hover={{ bg: 'rgba(255,255,255,0.12)' }}
                    _active={{ bg: 'rgba(255,255,255,0.16)' }}
                    borderRadius="12px"
                    fontWeight="bold"
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
                    fontSize={{ base: 'sm', md: 'sm' }}
                    lineHeight="tall"
                    fontFamily='ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                >
                    <Box as="code" display="block">
                        {highlightGo(code)}
                    </Box>
                </Box>
                <Text
                    mt={4}
                    fontSize="sm"
                    color="rgba(255,255,255,0.7)"
                    lineHeight="tall"
                >
                    Fisher–Yates shuffle powered by OS entropy via Go&apos;s{' '}
                    <Box as="span" fontWeight="bold" color="white">
                        crypto/rand
                    </Box>
                    .{' '}
                    <Link
                        href="https://pkg.go.dev/crypto/rand"
                        isExternal
                        color="brand.yellow"
                        fontWeight="bold"
                        _hover={{ textDecoration: 'underline' }}
                    >
                        Read the docs
                    </Link>
                </Text>
            </Box>
        </Box>
    );
}

const OddsAndRandomnessSection = () => {
    return (
        <Box as="section" py={{ base: 10, md: 14 }} bg="bg.default" w="100%">
            <Container maxW="container.xl">
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

                        <SimpleGrid
                            columns={{ base: 1, lg: 2 }}
                            spacing={{ base: 10, lg: 14 }}
                            alignItems="start"
                            position="relative"
                            zIndex={1}
                        >
                            <VStack align="start" spacing={7} alignSelf="start">
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
                                        borderRadius="24px"
                                        bg="bg.default"
                                        border="1px solid"
                                        borderColor="border.lightGray"
                                        boxShadow="0 10px 30px rgba(0,0,0,0.03)"
                                    >
                                        <HStack spacing={3} mb={3}>
                                            <Flex
                                                w="44px"
                                                h="44px"
                                                borderRadius="16px"
                                                align="center"
                                                justify="center"
                                                bg="rgba(66, 153, 225, 0.10)"
                                                color="blue.500"
                                            >
                                                <Icon
                                                    as={MdAutoGraph}
                                                    fontSize="24px"
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
                                        borderRadius="24px"
                                        bg="bg.default"
                                        border="1px solid"
                                        borderColor="border.lightGray"
                                        boxShadow="0 10px 30px rgba(0,0,0,0.03)"
                                    >
                                        <HStack spacing={3} mb={3}>
                                            <Flex
                                                w="44px"
                                                h="44px"
                                                borderRadius="16px"
                                                align="center"
                                                justify="center"
                                                bg="rgba(235, 11, 92, 0.10)"
                                                color="brand.pink"
                                            >
                                                <Icon
                                                    as={MdShuffle}
                                                    fontSize="24px"
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
                                            with Fisher–Yates so each of the{' '}
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
                            </VStack>

                            <VStack
                                align="stretch"
                                spacing={5}
                                alignSelf="start"
                            >
                                <CodeBlock
                                    label="Secure Shuffle (Go)"
                                    code={GO_SECURE_SHUFFLE_SNIPPET}
                                />
                                <HStack
                                    spacing={3}
                                    flexWrap="wrap"
                                    color="text.secondary"
                                >
                                    {[
                                        'OS CSPRNG (crypto/rand)',
                                        'Fisher–Yates / Knuth',
                                        'Independent shuffles',
                                        'Auditable logic',
                                    ].map((label) => (
                                        <Badge
                                            key={label}
                                            bg="rgba(12, 21, 49, 0.06)"
                                            color="text.gray600"
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                            fontSize="xs"
                                            fontWeight="bold"
                                        >
                                            {label}
                                        </Badge>
                                    ))}
                                </HStack>
                            </VStack>
                        </SimpleGrid>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default OddsAndRandomnessSection;
