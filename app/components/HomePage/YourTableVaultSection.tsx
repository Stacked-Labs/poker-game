'use client';

import React from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Flex,
    SimpleGrid,
    Icon,
    Button,
    useClipboard,
} from '@chakra-ui/react';
import { MdCheck, MdContentCopy } from 'react-icons/md';
import { motion, useReducedMotion } from 'framer-motion';

const MotionVStack = motion(VStack);

const GO_SECURE_SHUFFLE_SNIPPET = `import (
    "crypto/rand"
    "encoding/binary"
)

func SecureShuffleDeck(d *Deck) error {
    n := len(*d)
    bytes := make([]byte, n*8)
    // OS CSPRNG entropy — same primitives behind TLS.
    if _, err := rand.Read(bytes); err != nil { return err }

    for i := n - 1; i > 0; i-- {
        // Fisher-Yates: uniform over the remaining range.
        j := int(binary.BigEndian.Uint64(bytes[(n-1-i)*8:]) % uint64(i+1))
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

function ShuffleCodeReceipt() {
    const { hasCopied, onCopy } = useClipboard(GO_SECURE_SHUFFLE_SNIPPET);

    return (
        <Box
            border="1px solid"
            borderColor="border.lightGray"
            borderRadius="20px"
            overflow="hidden"
            bg="bg.default"
            display="flex"
            flexDirection="column"
            height="100%"
        >
            <Box
                bg="brand.darkNavy"
                _dark={{ bg: 'black' }}
                position="relative"
            >
                <Flex
                    justify="space-between"
                    align="center"
                    px={{ base: 4, md: 5 }}
                    py={3}
                    borderBottom="1px solid"
                    borderBottomColor="rgba(255,255,255,0.08)"
                >
                    <HStack spacing={2.5} minW={0}>
                        <Box
                            w="8px"
                            h="8px"
                            borderRadius="full"
                            bg="rgba(255,255,255,0.18)"
                        />
                        <Text
                            fontSize="2xs"
                            fontFamily="mono"
                            color="rgba(255,255,255,0.55)"
                            letterSpacing="0.04em"
                            isTruncated
                        >
                            shuffle.go
                        </Text>
                    </HStack>
                    <Button
                        onClick={onCopy}
                        size="xs"
                        leftIcon={<MdContentCopy />}
                        variant="unstyled"
                        color="rgba(255,255,255,0.7)"
                        fontFamily="mono"
                        fontSize="2xs"
                        fontWeight="semibold"
                        textTransform="uppercase"
                        letterSpacing="0.1em"
                        height="auto"
                        display="inline-flex"
                        alignItems="center"
                        px={2}
                        py={1}
                        borderRadius="6px"
                        transition="color 0.15s ease"
                        _hover={{ color: 'white' }}
                    >
                        {hasCopied ? 'Copied' : 'Copy'}
                    </Button>
                </Flex>
                <Box px={{ base: 4, md: 5 }} py={{ base: 4, md: 5 }}>
                    <Box
                        as="pre"
                        m={0}
                        p={0}
                        whiteSpace="pre"
                        overflowX="auto"
                        fontSize={{ base: '11px', md: 'xs' }}
                        lineHeight="1.85"
                        fontFamily='ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                    >
                        <Box as="code" display="block">
                            {highlightGo(GO_SECURE_SHUFFLE_SNIPPET)}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

function ContractReceipt() {
    return (
        <Box
            border="1px solid"
            borderColor="border.lightGray"
            borderRadius="20px"
            overflow="hidden"
            bg="bg.default"
            display="flex"
            flexDirection="column"
            height="100%"
        >
            <Box
                p={{ base: 5, md: 6 }}
                borderBottom="1px solid"
                borderColor="border.lightGray"
                bg="bg.greenSubtle"
            >
                <HStack justify="space-between" align="center" mb={4}>
                    <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        color="text.muted"
                        letterSpacing="0.22em"
                        textTransform="uppercase"
                    >
                        Contract · Base
                    </Text>
                    <HStack spacing={1.5} align="center">
                        <Box
                            w="6px"
                            h="6px"
                            borderRadius="full"
                            bg="brand.green"
                        />
                        <Text
                            fontSize="2xs"
                            fontWeight="bold"
                            color="brand.green"
                            letterSpacing="0.18em"
                            textTransform="uppercase"
                        >
                            Live
                        </Text>
                    </HStack>
                </HStack>
                <HStack spacing={2} align="center" mb={5}>
                    <Text
                        fontFamily="mono"
                        fontSize={{ base: 'sm', md: 'md' }}
                        color="text.primary"
                        fontWeight="semibold"
                        letterSpacing="0.02em"
                    >
                        0x7a2c…f91d
                    </Text>
                    <Text
                        fontFamily="mono"
                        fontSize="xs"
                        color="brand.green"
                        fontWeight="bold"
                        letterSpacing="0.04em"
                        title="Verify on BaseScan"
                    >
                        ↗ verify
                    </Text>
                </HStack>
                <VStack align="stretch" spacing={2.5}>
                    {[
                        { label: 'Custody', sub: 'USDC held by the contract' },
                        { label: 'Payouts', sub: 'Paid by the contract' },
                        {
                            label: 'Settlement',
                            sub: 'Onchain when the hand ends',
                        },
                    ].map((row) => (
                        <HStack key={row.label} spacing={3} align="center">
                            <Box
                                w="20px"
                                h="20px"
                                borderRadius="full"
                                bg="brand.green"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexShrink={0}
                            >
                                <Icon
                                    as={MdCheck}
                                    color="white"
                                    boxSize="13px"
                                />
                            </Box>
                            <HStack
                                spacing={2}
                                align="baseline"
                                flexWrap="wrap"
                            >
                                <Text
                                    fontSize="sm"
                                    fontWeight="bold"
                                    color="text.primary"
                                >
                                    {row.label}
                                </Text>
                                <Text
                                    fontSize="xs"
                                    color="text.secondary"
                                    fontWeight="medium"
                                >
                                    {row.sub}
                                </Text>
                            </HStack>
                        </HStack>
                    ))}
                </VStack>
            </Box>

            <Box
                p={{ base: 5, md: 6 }}
                flex={1}
                display="flex"
                flexDirection="column"
                gap={{ base: 5, md: 6 }}
            >
                <Box>
                    <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        color="brand.green"
                        letterSpacing="0.22em"
                        textTransform="uppercase"
                        mb={2}
                    >
                        Custody proof
                    </Text>
                    <Text
                        fontSize={{ base: 'lg', md: 'xl' }}
                        fontWeight="bold"
                        color="text.primary"
                        letterSpacing="-0.01em"
                        mb={2}
                    >
                        We never touch the cash.
                    </Text>
                    <Text
                        color="text.secondary"
                        fontSize="sm"
                        fontWeight="medium"
                        lineHeight="tall"
                    >
                        One smart contract per table. The contract pays the
                        winner, not us.
                    </Text>
                </Box>
                <Box>
                    <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        color="brand.navy"
                        _dark={{ color: 'brand.lightGray' }}
                        letterSpacing="0.22em"
                        textTransform="uppercase"
                        mb={2}
                    >
                        Shuffle proof
                    </Text>
                    <Text
                        fontSize={{ base: 'lg', md: 'xl' }}
                        fontWeight="bold"
                        color="text.primary"
                        letterSpacing="-0.01em"
                        mb={2}
                    >
                        The same primitives behind TLS keys.
                    </Text>
                    <Text
                        color="text.secondary"
                        fontSize="sm"
                        fontWeight="medium"
                        lineHeight="tall"
                    >
                        Real shuffle code. No predictable seeds, no insider
                        math.
                    </Text>
                </Box>
            </Box>
        </Box>
    );
}

const SUPPORT_STATS = [
    { value: 'OS CSPRNG', label: 'Entropy source' },
    { value: 'Fisher-Yates', label: 'Shuffle algo' },
    { value: '1-to-1', label: 'Contract per table' },
];

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
            as="section"
            id="under-the-hood"
            py={{ base: 10, md: 14 }}
            width="100%"
            position="relative"
        >
            <Container maxW="container.lg" position="relative" zIndex={1}>
                <MotionVStack
                    align="start"
                    spacing={{ base: 8, md: 10 }}
                    {...fadeUp(0)}
                >
                    <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        color="text.muted"
                        letterSpacing="0.22em"
                        textTransform="uppercase"
                    >
                        Under the hood
                    </Text>

                    <Heading
                        as="h2"
                        fontSize={{ base: '4xl', md: '6xl', lg: '7xl' }}
                        fontWeight="black"
                        color="text.primary"
                        letterSpacing="-0.03em"
                        lineHeight={0.95}
                        maxW="4xl"
                    >
                        Engine deals.{' '}
                        <Box
                            as="span"
                            color="brand.green"
                            position="relative"
                            display="inline-block"
                        >
                            Contract
                            <Box
                                as="span"
                                position="absolute"
                                left="-4px"
                                right="-4px"
                                bottom={{ base: '4px', md: '8px' }}
                                height={{ base: '10px', md: '14px' }}
                                bg="brand.green"
                                opacity={0.18}
                                borderRadius="full"
                                zIndex={-1}
                            />
                        </Box>{' '}
                        pays.
                    </Heading>

                    <Text
                        fontSize={{ base: 'md', md: 'lg' }}
                        color="text.secondary"
                        lineHeight="tall"
                        maxW="2xl"
                        fontWeight="medium"
                    >
                        Speed where it matters. Trust where it counts. The game
                        runs in real time on our engine. Every dollar lives in
                        a smart contract on Base. We deal the cards. The
                        contract holds the cash.
                    </Text>

                    {/* Engine → Banker — split */}
                    <Box
                        w="100%"
                        pt={{ base: 4, md: 6 }}
                        display="grid"
                        gridTemplateColumns={{
                            base: '1fr',
                            md: '1fr auto 1fr',
                        }}
                        gap={{ base: 4, md: 6 }}
                        alignItems="stretch"
                    >
                        <Box
                            border="1px solid"
                            borderColor="rgba(51, 68, 121, 0.20)"
                            _dark={{
                                borderColor: 'rgba(150, 170, 230, 0.28)',
                                bg: 'rgba(150, 170, 230, 0.06)',
                            }}
                            borderRadius="16px"
                            p={{ base: 6, md: 7 }}
                            bg="rgba(51, 68, 121, 0.04)"
                            position="relative"
                        >
                            <HStack
                                justify="space-between"
                                align="center"
                                mb={3}
                            >
                                <Text
                                    fontSize="2xs"
                                    fontWeight="bold"
                                    color="brand.navy"
                                    _dark={{ color: 'rgba(180, 195, 235, 0.95)' }}
                                    letterSpacing="0.22em"
                                    textTransform="uppercase"
                                >
                                    Engine · Go
                                </Text>
                                <Text
                                    fontFamily="mono"
                                    fontSize="2xs"
                                    color="brand.navy"
                                    _dark={{ color: 'rgba(180, 195, 235, 0.7)' }}
                                    opacity={0.7}
                                >
                                    {'// off-chain'}
                                </Text>
                            </HStack>
                            <Text
                                fontSize={{ base: 'xl', md: '2xl' }}
                                fontWeight="bold"
                                color="text.primary"
                                letterSpacing="-0.01em"
                                mb={2}
                            >
                                Deals the hand.
                            </Text>
                            <Text
                                fontSize="sm"
                                color="text.secondary"
                                fontWeight="medium"
                                lineHeight="tall"
                            >
                                Shuffle, deal, pot math. Real-time.
                            </Text>
                        </Box>

                        {/* Connector — md+ horizontal, mobile vertical */}
                        <Box
                            display={{ base: 'none', md: 'flex' }}
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            position="relative"
                            px={2}
                            aria-hidden="true"
                        >
                            <Text
                                fontFamily="mono"
                                fontSize="2xs"
                                color="text.muted"
                                letterSpacing="0.18em"
                                textTransform="uppercase"
                                mb={2}
                                whiteSpace="nowrap"
                            >
                                state →
                            </Text>
                            <Box
                                w="80px"
                                h="2px"
                                bgGradient="linear(to-r, brand.navy, brand.green)"
                                position="relative"
                                opacity={0.7}
                                _dark={{ opacity: 0.85 }}
                            >
                                <Box
                                    position="absolute"
                                    right="-1px"
                                    top="50%"
                                    transform="translateY(-50%)"
                                    w="0"
                                    h="0"
                                    borderTop="5px solid transparent"
                                    borderBottom="5px solid transparent"
                                    borderLeft="6px solid"
                                    borderLeftColor="brand.green"
                                />
                            </Box>
                        </Box>
                        <Box
                            display={{ base: 'flex', md: 'none' }}
                            flexDirection="column"
                            alignItems="center"
                            color="text.muted"
                            aria-hidden="true"
                        >
                            <Text
                                fontFamily="mono"
                                fontSize="2xs"
                                letterSpacing="0.18em"
                                textTransform="uppercase"
                                mb={1}
                            >
                                state ↓
                            </Text>
                            <Box
                                w="2px"
                                h="28px"
                                bgGradient="linear(to-b, brand.navy, brand.green)"
                                opacity={0.7}
                            />
                        </Box>

                        <Box
                            border="1px solid"
                            borderColor="border.greenStrong"
                            borderRadius="16px"
                            p={{ base: 6, md: 7 }}
                            bg="bg.greenSubtle"
                        >
                            <HStack
                                justify="space-between"
                                align="center"
                                mb={3}
                            >
                                <Text
                                    fontSize="2xs"
                                    fontWeight="bold"
                                    color="brand.green"
                                    letterSpacing="0.22em"
                                    textTransform="uppercase"
                                >
                                    Banker · Base
                                </Text>
                                <Text
                                    fontFamily="mono"
                                    fontSize="2xs"
                                    color="brand.green"
                                    opacity={0.7}
                                >
                                    {'// onchain'}
                                </Text>
                            </HStack>
                            <Text
                                fontSize={{ base: 'xl', md: '2xl' }}
                                fontWeight="bold"
                                color="text.primary"
                                letterSpacing="-0.01em"
                                mb={2}
                            >
                                Holds the cash.
                            </Text>
                            <Text
                                fontSize="sm"
                                color="text.secondary"
                                fontWeight="medium"
                                lineHeight="tall"
                            >
                                One smart contract per table. Custody, payouts,
                                settlement.
                            </Text>
                        </Box>
                    </Box>

                    <SimpleGrid
                        columns={{ base: 1, md: 2 }}
                        spacing={{ base: 5, md: 6 }}
                        w="100%"
                        pt={{ base: 4, md: 6 }}
                    >
                        <ShuffleCodeReceipt />
                        <ContractReceipt />
                    </SimpleGrid>

                    {/* Hero stat + supporting strip */}
                    <Box
                        w="100%"
                        pt={{ base: 2, md: 4 }}
                        borderTop="1px solid"
                        borderColor="border.lightGray"
                    >
                        <Flex
                            direction={{ base: 'column', md: 'row' }}
                            align={{ base: 'start', md: 'flex-end' }}
                            justify="space-between"
                            gap={{ base: 8, md: 6 }}
                            pt={{ base: 6, md: 8 }}
                            w="100%"
                        >
                            <VStack
                                align="start"
                                spacing={1}
                                flexShrink={0}
                            >
                                <Text
                                    fontSize="2xs"
                                    fontWeight="bold"
                                    color="text.muted"
                                    letterSpacing="0.22em"
                                    textTransform="uppercase"
                                    mb={1}
                                >
                                    Possible decks
                                </Text>
                                <HStack
                                    spacing={3}
                                    align="baseline"
                                    flexWrap="wrap"
                                >
                                    <Text
                                        fontSize={{
                                            base: '5xl',
                                            md: '6xl',
                                            lg: '7xl',
                                        }}
                                        fontWeight="black"
                                        color="brand.pink"
                                        letterSpacing="-0.04em"
                                        lineHeight={0.9}
                                    >
                                        8 × 10
                                        <Box
                                            as="sup"
                                            fontSize="0.55em"
                                            top="-0.6em"
                                            ml="0.05em"
                                        >
                                            67
                                        </Box>
                                    </Text>
                                </HStack>
                                <Text
                                    fontSize="sm"
                                    color="text.secondary"
                                    fontWeight="medium"
                                    pt={1}
                                >
                                    More than atoms in the observable universe.
                                </Text>
                            </VStack>

                            <SimpleGrid
                                columns={{ base: 1, sm: 3 }}
                                spacing={{ base: 4, md: 6 }}
                                w={{ base: '100%', md: 'auto' }}
                                minW={{ md: '380px' }}
                            >
                                {SUPPORT_STATS.map((stat) => (
                                    <VStack
                                        key={stat.label}
                                        align="start"
                                        spacing={0.5}
                                    >
                                        <Text
                                            fontSize={{ base: 'md', md: 'lg' }}
                                            fontWeight="bold"
                                            color="text.primary"
                                            letterSpacing="-0.01em"
                                            lineHeight={1.1}
                                        >
                                            {stat.value}
                                        </Text>
                                        <Text
                                            fontSize="2xs"
                                            fontWeight="bold"
                                            color="text.muted"
                                            letterSpacing="0.18em"
                                            textTransform="uppercase"
                                        >
                                            {stat.label}
                                        </Text>
                                    </VStack>
                                ))}
                            </SimpleGrid>
                        </Flex>
                    </Box>
                </MotionVStack>
            </Container>
        </Box>
    );
};

export default YourTableVaultSection;
