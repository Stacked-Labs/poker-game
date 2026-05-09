'use client';

import {
    Box,
    Container,
    Flex,
    VStack,
    HStack,
    Text,
    Heading,
    Link,
    Icon,
    List,
    ListItem,
    ListIcon,
    Badge,
} from '@chakra-ui/react';
import { Image } from '@chakra-ui/next-js';
import { useActiveAccount, useActiveWalletChain } from 'thirdweb/react';
import { baseSepolia } from 'thirdweb/chains';
import {
    FiAlertTriangle,
    FiCheckCircle,
    FiInfo,
    FiZap,
} from 'react-icons/fi';
import Footer from '../components/HomePage/Footer';
import ExternalLink from '../components/ExternalLink';

const imgWidth = 1200;
const imgHeight = 800;

/* Tinted highlighter underline behind a colored word. */
const Highlight = ({
    children,
    color = 'pink',
}: {
    children: React.ReactNode;
    color?: 'pink' | 'green' | 'yellow';
}) => {
    const map = {
        pink: 'brand.pink',
        green: 'brand.green',
        yellow: 'brand.yellow',
    };
    const c = map[color];
    return (
        <Box
            as="span"
            color={c}
            fontWeight="bold"
            position="relative"
            whiteSpace="nowrap"
        >
            {children}
            <Box
                as="span"
                position="absolute"
                bottom="1px"
                left="-2px"
                right="-2px"
                height="35%"
                bg={c}
                opacity={0.1}
                zIndex={-1}
                borderRadius="sm"
            />
        </Box>
    );
};

const stepColors = [
    {
        bg: 'brand.green',
        labelBg: 'rgba(54, 163, 123, 0.1)',
        labelColor: 'brand.green',
        labelDark: 'green.300',
    },
    {
        bg: 'blue.500',
        labelBg: 'rgba(66, 153, 225, 0.1)',
        labelColor: 'blue.600',
        labelDark: 'blue.300',
    },
    {
        bg: 'brand.pink',
        labelBg: 'rgba(235, 11, 92, 0.08)',
        labelColor: 'brand.pink',
        labelDark: 'pink.300',
    },
    {
        bg: 'brand.yellow',
        labelBg: 'rgba(253, 197, 29, 0.12)',
        labelColor: 'brand.yellowDark',
        labelDark: 'yellow.300',
    },
];

const StepBadge = ({ number }: { number: number }) => {
    const colors = stepColors[(number - 1) % stepColors.length];
    return (
        <Flex
            align="center"
            justify="center"
            w={{ base: '32px', md: '40px' }}
            h={{ base: '32px', md: '40px' }}
            borderRadius={{ base: '10px', md: '14px' }}
            bg={colors.bg}
            color="white"
            fontWeight="bold"
            fontSize={{ base: 'sm', md: 'md' }}
            flexShrink={0}
        >
            {number}
        </Flex>
    );
};

const StepLabel = ({ number }: { number: number }) => {
    const colors = stepColors[(number - 1) % stepColors.length];
    return (
        <Badge
            bg={colors.labelBg}
            color={colors.labelColor}
            _dark={{ color: colors.labelDark }}
            px={{ base: 2, md: 3 }}
            py={{ base: 0.5, md: 1 }}
            borderRadius="full"
            fontSize={{ base: '2xs', md: 'xs' }}
            fontWeight="bold"
            letterSpacing="0.16em"
            textTransform="uppercase"
        >
            Step {String(number).padStart(2, '0')}
        </Badge>
    );
};

const FaucetLink = ({
    label,
    href,
    note,
}: {
    label: string;
    href: string;
    note?: string;
}) => (
    <VStack align="start" spacing={1}>
        <Text fontWeight="bold" color="text.primary" fontSize="sm">
            {label}
        </Text>
        <ExternalLink href={href} fontSize="sm" wordBreak="break-all">
            {href}
        </ExternalLink>
        {note ? (
            <Text fontSize="xs" color="text.muted" mt={0.5}>
                {note}
            </Text>
        ) : null}
    </VStack>
);

const SubStepBadge = ({ label }: { label: string }) => (
    <Badge
        bg="rgba(66, 153, 225, 0.1)"
        color="blue.600"
        _dark={{ color: 'blue.300', bg: 'rgba(66, 153, 225, 0.15)' }}
        px={2.5}
        py={0.5}
        borderRadius="full"
        fontSize="xs"
        fontWeight="bold"
        flexShrink={0}
        mt={0.5}
    >
        {label}
    </Badge>
);

const StepCard = ({
    number,
    title,
    children,
}: {
    number: number;
    title: React.ReactNode;
    children: React.ReactNode;
}) => {
    return (
        <Box
            w="full"
            bg="card.white"
            borderRadius={{ base: '20px', md: '28px' }}
            p={{ base: 4, sm: 5, md: 7 }}
            border="1px solid"
            borderColor="border.lightGray"
        >
            <VStack align="start" spacing={{ base: 3, md: 4 }} w="full">
                <VStack align="start" spacing={{ base: 2, md: 3 }}>
                    <StepLabel number={number} />
                    <HStack spacing={{ base: 2, md: 3 }} align="center">
                        <StepBadge number={number} />
                        <Heading
                            fontSize={{ base: 'md', sm: 'lg', md: 'xl' }}
                            fontWeight="bold"
                            color="text.primary"
                            lineHeight="short"
                            letterSpacing="-0.02em"
                        >
                            {title}
                        </Heading>
                    </HStack>
                </VStack>

                <VStack
                    align="start"
                    spacing={{ base: 3, md: 4 }}
                    pl={{ base: 0, md: '52px' }}
                    w="full"
                >
                    {children}
                </VStack>
            </VStack>
        </Box>
    );
};

const ChainWarningBanner = () => {
    const account = useActiveAccount();
    const chain = useActiveWalletChain();

    if (!account || !chain) return null;
    if (chain.id === baseSepolia.id) return null;

    return (
        <Flex
            w="full"
            bg="rgba(235, 11, 92, 0.06)"
            border="1px solid"
            borderColor="rgba(235, 11, 92, 0.2)"
            borderRadius={{ base: '14px', md: '20px' }}
            p={{ base: 3, sm: 4, md: 5 }}
            align="flex-start"
            gap={{ base: 2, md: 3 }}
            _dark={{
                bg: 'rgba(235, 11, 92, 0.12)',
                borderColor: 'rgba(235, 11, 92, 0.3)',
            }}
        >
            <Icon
                as={FiAlertTriangle}
                color="brand.pink"
                boxSize={{ base: '18px', md: '20px' }}
                mt={0.5}
                flexShrink={0}
            />
            <VStack align="start" spacing={1}>
                <Text fontWeight="bold" color="brand.pink" fontSize="sm">
                    Wrong network
                </Text>
                <Text
                    fontSize="sm"
                    color="text.secondary"
                    fontWeight="medium"
                >
                    Switch your wallet to{' '}
                    <Text as="span" fontWeight="bold" color="text.primary">
                        Base Sepolia
                    </Text>{' '}
                    to use testnet tokens on Stacked.
                </Text>
            </VStack>
        </Flex>
    );
};

const FreeTokensPage = () => {
    return (
        <Flex
            direction="column"
            minH="100vh"
            bg="card.lightGray"
            position="relative"
            overflow="hidden"
        >
            {/* Soft tonal wash (single, restrained) */}
            <Box
                aria-hidden="true"
                position="absolute"
                top={{ base: '160px', md: '120px' }}
                right={{ base: '-120px', md: '-80px' }}
                w={{ base: '240px', md: '320px' }}
                h={{ base: '240px', md: '320px' }}
                bg="brand.green"
                opacity={0.06}
                borderRadius="full"
                pointerEvents="none"
            />

            {/* Main content */}
            <Box
                pt={{ base: 16, sm: 20, md: 24 }}
                pb={{ base: 8, sm: 10, md: 16 }}
                position="relative"
                zIndex={1}
            >
                <Container
                    maxW="container.md"
                    px={{ base: 4, sm: 5, md: 6, lg: 8 }}
                >
                    <VStack spacing={{ base: 4, sm: 5, md: 8 }} w="full">
                        {/* Page header */}
                        <Box
                            w="full"
                            bg="card.white"
                            borderRadius={{ base: '24px', md: '32px' }}
                            p={{ base: 5, sm: 6, md: 10 }}
                            border="1px solid"
                            borderColor="border.lightGray"
                        >
                            <VStack
                                align="start"
                                spacing={{ base: 4, md: 5 }}
                            >
                                <HStack spacing={2} flexWrap="wrap">
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
                                        Testnet
                                    </Badge>
                                    <Badge
                                        bg="rgba(54, 163, 123, 0.1)"
                                        color="brand.green"
                                        _dark={{
                                            bg: 'rgba(54, 163, 123, 0.15)',
                                            color: 'green.300',
                                        }}
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                        fontSize="xs"
                                        fontWeight="bold"
                                        letterSpacing="0.08em"
                                    >
                                        ~ 2 min
                                    </Badge>
                                </HStack>

                                <Heading
                                    as="h1"
                                    fontSize={{
                                        base: 'clamp(1.75rem, 7vw, 2.25rem)',
                                        md: 'clamp(2.25rem, 5vw, 3.25rem)',
                                    }}
                                    fontWeight="extrabold"
                                    color="text.primary"
                                    lineHeight={1.1}
                                    letterSpacing="-0.03em"
                                >
                                    Free testnet{' '}
                                    <Highlight color="green">tokens</Highlight>
                                    , in two minutes.
                                </Heading>

                                <Text
                                    color="text.secondary"
                                    fontSize={{
                                        base: 'sm',
                                        md: 'md',
                                        lg: 'lg',
                                    }}
                                    lineHeight="tall"
                                    fontWeight="medium"
                                    maxW="xl"
                                >
                                    Grab Base Sepolia ETH and USDC, then sit
                                    down at a table on Stacked. No account,
                                    no signup.
                                </Text>

                                <HStack
                                    spacing={2}
                                    color="text.muted"
                                    fontSize="xs"
                                    fontWeight="semibold"
                                    letterSpacing="0.06em"
                                    textTransform="uppercase"
                                >
                                    <Icon as={FiZap} boxSize="12px" />
                                    <Text color="text.muted">
                                        Testnet only. No real value.
                                    </Text>
                                </HStack>
                            </VStack>
                        </Box>

                        <ChainWarningBanner />

                        {/* What you need */}
                        <Box
                            w="full"
                            bg="card.white"
                            borderRadius={{ base: '18px', md: '24px' }}
                            p={{ base: 4, sm: 5, md: 6 }}
                            border="1px solid"
                            borderColor="border.lightGray"
                        >
                            <HStack align="flex-start" spacing={3}>
                                <Icon
                                    as={FiInfo}
                                    color="brand.navy"
                                    _dark={{ color: 'blue.300' }}
                                    boxSize="20px"
                                    mt={0.5}
                                    flexShrink={0}
                                />
                                <VStack align="start" spacing={2}>
                                    <Text
                                        fontWeight="bold"
                                        color="text.primary"
                                        fontSize={{ base: 'sm', md: 'md' }}
                                    >
                                        You need both ETH and USDC
                                    </Text>
                                    <Text
                                        fontSize="sm"
                                        color="text.secondary"
                                        fontWeight="medium"
                                    >
                                        To play on Stacked, you need:
                                    </Text>
                                    <List spacing={2}>
                                        <ListItem
                                            fontSize="sm"
                                            color="text.secondary"
                                            display="flex"
                                            alignItems="center"
                                        >
                                            <ListIcon
                                                as={FiCheckCircle}
                                                color="brand.green"
                                            />
                                            <Text
                                                as="span"
                                                fontWeight="medium"
                                                color="text.secondary"
                                            >
                                                <Text
                                                    as="span"
                                                    fontWeight="bold"
                                                    color="text.primary"
                                                >
                                                    Base Sepolia ETH
                                                </Text>{' '}
                                                for gas.
                                            </Text>
                                        </ListItem>
                                        <ListItem
                                            fontSize="sm"
                                            color="text.secondary"
                                            display="flex"
                                            alignItems="center"
                                        >
                                            <ListIcon
                                                as={FiCheckCircle}
                                                color="brand.green"
                                            />
                                            <Text
                                                as="span"
                                                fontWeight="medium"
                                                color="text.secondary"
                                            >
                                                <Text
                                                    as="span"
                                                    fontWeight="bold"
                                                    color="text.primary"
                                                >
                                                    Base Sepolia USDC
                                                </Text>{' '}
                                                for buy-ins.
                                            </Text>
                                        </ListItem>
                                    </List>
                                    <Text
                                        fontSize="sm"
                                        color="text.muted"
                                        fontWeight="medium"
                                    >
                                        Steps below cover both.
                                    </Text>
                                </VStack>
                            </HStack>
                        </Box>

                        {/* Step 1: ETH */}
                        <StepCard
                            number={1}
                            title={
                                <>
                                    Get Base Sepolia{' '}
                                    <Highlight color="green">ETH</Highlight>{' '}
                                    <Text
                                        as="span"
                                        color="text.secondary"
                                        fontWeight="medium"
                                        fontSize={{ base: 'sm', md: 'md' }}
                                    >
                                        (for gas)
                                    </Text>
                                </>
                            }
                        >
                            <Text
                                fontSize={{ base: 'sm', md: 'md' }}
                                color="text.secondary"
                                fontWeight="medium"
                                lineHeight="tall"
                            >
                                Pick a faucet, connect your wallet, request
                                ETH.
                            </Text>

                            <Box
                                w="full"
                                bg="card.lightGray"
                                borderRadius={{ base: '14px', md: '20px' }}
                                p={{ base: 3, sm: 4, md: 5 }}
                                border="1px solid"
                                borderColor="border.lightGray"
                                _dark={{
                                    bg: 'rgba(255, 255, 255, 0.04)',
                                    borderColor: 'rgba(255, 255, 255, 0.08)',
                                }}
                            >
                                <VStack
                                    align="start"
                                    spacing={4}
                                    divider={
                                        <Box
                                            w="full"
                                            h="1px"
                                            bg="rgba(12, 21, 49, 0.06)"
                                            _dark={{
                                                bg: 'rgba(255, 255, 255, 0.08)',
                                            }}
                                        />
                                    }
                                >
                                    <FaucetLink
                                        label="Option 1: Alchemy faucet"
                                        href="https://www.alchemy.com/faucets/base-sepolia"
                                    />
                                    <FaucetLink
                                        label="Option 2: QuickNode faucet"
                                        href="https://faucet.quicknode.com/base/sepolia"
                                        note="Requires 0.001 ETH on Ethereum mainnet."
                                    />
                                </VStack>
                            </Box>

                            <HStack
                                spacing={2}
                                bg="rgba(54, 163, 123, 0.06)"
                                borderRadius={{ base: '10px', md: '14px' }}
                                px={{ base: 3, md: 4 }}
                                py={{ base: 2, md: 3 }}
                                border="1px solid"
                                borderColor="rgba(54, 163, 123, 0.12)"
                                _dark={{
                                    bg: 'rgba(54, 163, 123, 0.1)',
                                    borderColor: 'rgba(54, 163, 123, 0.2)',
                                }}
                            >
                                <Icon
                                    as={FiZap}
                                    color="brand.green"
                                    _dark={{ color: 'green.300' }}
                                    boxSize="14px"
                                    flexShrink={0}
                                />
                                <Text
                                    fontSize="xs"
                                    color="text.secondary"
                                    fontWeight="medium"
                                >
                                    Tokens land in a few minutes.
                                </Text>
                            </HStack>
                        </StepCard>

                        {/* Step 2: USDC */}
                        <StepCard
                            number={2}
                            title={
                                <>
                                    Get Base Sepolia{' '}
                                    <Highlight color="pink">USDC</Highlight>{' '}
                                    <Text
                                        as="span"
                                        color="text.secondary"
                                        fontWeight="medium"
                                        fontSize={{ base: 'sm', md: 'md' }}
                                    >
                                        (for buy-ins)
                                    </Text>
                                </>
                            }
                        >
                            <Text
                                fontSize={{ base: 'sm', md: 'md' }}
                                color="text.secondary"
                                fontWeight="medium"
                                lineHeight="tall"
                            >
                                Free testnet USDC from Circle.
                            </Text>

                            <VStack align="start" spacing={4} w="full">
                                <HStack align="flex-start" spacing={3}>
                                    <SubStepBadge label="a" />
                                    <Text
                                        fontSize={{ base: 'sm', md: 'md' }}
                                        color="text.secondary"
                                        fontWeight="medium"
                                        lineHeight="tall"
                                    >
                                        <Text
                                            as="span"
                                            fontWeight="bold"
                                            color="text.primary"
                                        >
                                            Open the Circle faucet:
                                        </Text>{' '}
                                        head to{' '}
                                        <ExternalLink href="https://faucet.circle.com/">
                                            faucet.circle.com
                                        </ExternalLink>
                                        .
                                    </Text>
                                </HStack>

                                <HStack align="flex-start" spacing={3}>
                                    <SubStepBadge label="b" />
                                    <VStack
                                        align="start"
                                        spacing={3}
                                        flex={1}
                                    >
                                        <Text
                                            fontSize={{
                                                base: 'sm',
                                                md: 'md',
                                            }}
                                            color="text.secondary"
                                            fontWeight="medium"
                                            lineHeight="tall"
                                        >
                                            <Text
                                                as="span"
                                                fontWeight="bold"
                                                color="text.primary"
                                            >
                                                Request USDC:
                                            </Text>{' '}
                                            pick{' '}
                                            <Text
                                                as="span"
                                                fontWeight="bold"
                                                color="text.primary"
                                            >
                                                Base-Sepolia
                                            </Text>
                                            , drop in your wallet address,
                                            hit &ldquo;Send 10 USDC&rdquo;.
                                        </Text>
                                        <Box
                                            borderRadius="16px"
                                            overflow="hidden"
                                            border="1px solid"
                                            borderColor="border.lightGray"
                                            bg="card.lightGray"
                                            w="full"
                                            maxW="520px"
                                        >
                                            <Image
                                                src="/free-tokens/testnet-faucet.png"
                                                alt="Circle Testnet Faucet showing Base-Sepolia USDC option"
                                                width={imgWidth}
                                                height={imgHeight}
                                                w="full"
                                                h="auto"
                                            />
                                        </Box>
                                    </VStack>
                                </HStack>
                            </VStack>
                        </StepCard>

                        {/* Step 3: Connect */}
                        <StepCard
                            number={3}
                            title={
                                <>
                                    <Highlight color="pink">Connect</Highlight>{' '}
                                    your wallet
                                </>
                            }
                        >
                            <Text
                                fontSize={{ base: 'sm', md: 'md' }}
                                color="text.secondary"
                                fontWeight="medium"
                                lineHeight="tall"
                            >
                                Open{' '}
                                <Link
                                    href="/"
                                    color="brand.navy"
                                    _dark={{ color: 'brand.lightGray' }}
                                    fontWeight="semibold"
                                    textDecoration="underline"
                                    textUnderlineOffset="3px"
                                    textDecorationThickness="1.5px"
                                    transition="color 80ms ease"
                                    _hover={{ color: 'brand.green' }}
                                >
                                    stackedpoker.io
                                </Link>{' '}
                                and connect. MetaMask, Coinbase Wallet,
                                Google, Discord all work.
                            </Text>

                            <VStack align="start" spacing={3} w="full">
                                {[
                                    {
                                        src: '/free-tokens/connect-wallet-1.png',
                                        alt: 'Sign in button on Stacked Poker',
                                    },
                                    {
                                        src: '/free-tokens/connect-wallet-2.png',
                                        alt: 'Wallet connected to Stacked Poker',
                                    },
                                    {
                                        src: '/free-tokens/connect-wallet-3.png',
                                        alt: 'Base Sepolia network selected in wallet',
                                    },
                                ].map((img) => (
                                    <Box
                                        key={img.src}
                                        borderRadius={{
                                            base: '12px',
                                            md: '16px',
                                        }}
                                        overflow="hidden"
                                        border="1px solid"
                                        borderColor="border.lightGray"
                                        bg="card.lightGray"
                                        w="full"
                                        maxW={{
                                            base: 'full',
                                            md: '520px',
                                        }}
                                    >
                                        <Image
                                            src={img.src}
                                            alt={img.alt}
                                            width={imgWidth}
                                            height={imgHeight}
                                            w="full"
                                            h="auto"
                                        />
                                    </Box>
                                ))}
                            </VStack>
                        </StepCard>

                        {/* Step 4: Verify */}
                        <StepCard
                            number={4}
                            title={
                                <>
                                    Verify your{' '}
                                    <Highlight color="yellow">
                                        balance
                                    </Highlight>
                                </>
                            }
                        >
                            <Text
                                fontSize={{ base: 'sm', md: 'md' }}
                                color="text.secondary"
                                fontWeight="medium"
                                lineHeight="tall"
                            >
                                Open your wallet. Tokens may take a minute
                                to land. You should see:
                            </Text>
                            <List spacing={2}>
                                <ListItem
                                    fontSize={{ base: 'sm', md: 'md' }}
                                    color="text.secondary"
                                    display="flex"
                                    alignItems="center"
                                    fontWeight="medium"
                                >
                                    <ListIcon
                                        as={FiCheckCircle}
                                        color="brand.green"
                                        fontSize="lg"
                                    />
                                    Base Sepolia ETH (gas)
                                </ListItem>
                                <ListItem
                                    fontSize={{ base: 'sm', md: 'md' }}
                                    color="text.secondary"
                                    display="flex"
                                    alignItems="center"
                                    fontWeight="medium"
                                >
                                    <ListIcon
                                        as={FiCheckCircle}
                                        color="brand.green"
                                        fontSize="lg"
                                    />
                                    Base Sepolia USDC (buy-ins)
                                </ListItem>
                            </List>

                            <Box
                                borderRadius="16px"
                                overflow="hidden"
                                border="1px solid"
                                borderColor="border.lightGray"
                                bg="card.lightGray"
                                w="full"
                                maxW="520px"
                            >
                                <Image
                                    src="/free-tokens/check-wallet.png"
                                    alt="Wallet balance showing testnet ETH and USDC tokens"
                                    width={imgWidth}
                                    height={imgHeight}
                                    w="full"
                                    h="auto"
                                />
                            </Box>
                        </StepCard>

                        {/* Disclaimer */}
                        <Box
                            w="full"
                            bg="card.white"
                            borderRadius={{ base: '14px', md: '20px' }}
                            p={{ base: 3, sm: 4, md: 5 }}
                            border="1px solid"
                            borderColor="border.lightGray"
                        >
                            <HStack align="flex-start" spacing={3}>
                                <Icon
                                    as={FiAlertTriangle}
                                    color="brand.yellowDark"
                                    _dark={{ color: 'yellow.300' }}
                                    boxSize="18px"
                                    mt={0.5}
                                    flexShrink={0}
                                />
                                <Text
                                    fontSize="xs"
                                    color="text.secondary"
                                    lineHeight="tall"
                                    fontWeight="medium"
                                >
                                    <Text
                                        as="span"
                                        fontWeight="bold"
                                        color="text.primary"
                                    >
                                        Disclaimer:
                                    </Text>{' '}
                                    Base Sepolia testnet tokens have no
                                    real-world value. They exist for
                                    development and testing, and can&apos;t
                                    be exchanged for real currency.
                                </Text>
                            </HStack>
                        </Box>

                        <Text
                            fontSize="xs"
                            color="text.muted"
                            textAlign="center"
                            fontWeight="medium"
                            px={4}
                        >
                            Always confirm you&apos;re on the right testnet
                            before requesting or using tokens.
                        </Text>
                    </VStack>
                </Container>
            </Box>

            <Footer />
        </Flex>
    );
};

export default FreeTokensPage;
