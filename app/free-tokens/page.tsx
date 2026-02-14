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
    FiExternalLink,
    FiAlertTriangle,
    FiCheckCircle,
    FiInfo,
    FiZap,
} from 'react-icons/fi';
import Footer from '../components/HomePage/Footer';

const imgWidth = 1200;
const imgHeight = 800;

/* ── Highlight — coloured text with subtle bg underline (FeaturesSection pattern) ── */
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
                opacity={0.08}
                zIndex={-1}
                borderRadius="sm"
            />
        </Box>
    );
};

/* ── Step colour palette ── */
const stepColors = [
    {
        bg: 'brand.green',
        shadow: 'rgba(54, 163, 123, 0.3)',
        labelBg: 'rgba(54, 163, 123, 0.1)',
        labelColor: 'brand.green',
        labelDark: 'green.300',
    },
    {
        bg: 'blue.500',
        shadow: 'rgba(66, 153, 225, 0.3)',
        labelBg: 'rgba(66, 153, 225, 0.1)',
        labelColor: 'blue.600',
        labelDark: 'blue.300',
    },
    {
        bg: 'brand.pink',
        shadow: 'rgba(235, 11, 92, 0.3)',
        labelBg: 'rgba(235, 11, 92, 0.08)',
        labelColor: 'brand.pink',
        labelDark: 'pink.300',
    },
    {
        bg: 'brand.yellow',
        shadow: 'rgba(253, 197, 29, 0.3)',
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
            w={{ base: '30px', sm: '34px', md: '40px' }}
            h={{ base: '30px', sm: '34px', md: '40px' }}
            borderRadius={{ base: '10px', md: '14px' }}
            bg={colors.bg}
            color="white"
            fontWeight="bold"
            fontSize={{ base: 'sm', md: 'md' }}
            flexShrink={0}
            boxShadow={`0 6px 12px -4px ${colors.shadow}`}
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
        <Link
            href={href}
            isExternal
            color="brand.green"
            fontWeight="semibold"
            fontSize="sm"
            _hover={{ color: 'brand.pink', textDecoration: 'underline' }}
            display="inline-flex"
            alignItems="center"
            gap={1}
            wordBreak="break-all"
            transition="color 0.2s ease"
        >
            {href}
            <Icon as={FiExternalLink} boxSize="12px" flexShrink={0} />
        </Link>
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
    const colors = stepColors[(number - 1) % stepColors.length];
    return (
        <Box
            w="full"
            bg="card.white"
            borderRadius={{ base: '20px', md: '28px' }}
            p={{ base: 4, sm: 5, md: 7 }}
            border="1px solid"
            borderColor="border.lightGray"
            boxShadow="0 4px 18px rgba(0, 0, 0, 0.03)"
            position="relative"
            overflow="hidden"
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.08)',
                borderColor: colors.bg,
            }}
        >
            {/* Left accent bar */}
            <Box
                position="absolute"
                left="0"
                top="0"
                bottom="0"
                w="3px"
                bg={colors.bg}
                opacity={0.5}
            />

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
                    Wrong Network Detected
                </Text>
                <Text
                    fontSize="sm"
                    color="text.secondary"
                    fontWeight="medium"
                >
                    Your wallet is connected to a different network. Please
                    switch to{' '}
                    <Text as="span" fontWeight="bold" color="text.primary">
                        Base Sepolia
                    </Text>{' '}
                    to use testnet tokens with Stacked Poker.
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
            {/* Decorative background blurs */}
            <Box
                aria-hidden="true"
                position="absolute"
                top={{ base: '200px', md: '160px' }}
                right={{ base: '-100px', md: '-60px' }}
                w={{ base: '200px', md: '280px' }}
                h={{ base: '200px', md: '280px' }}
                bg="brand.green"
                opacity={0.08}
                borderRadius="full"
                pointerEvents="none"
            />
            <Box
                aria-hidden="true"
                position="absolute"
                bottom={{ base: '400px', md: '300px' }}
                left={{ base: '-100px', md: '-60px' }}
                w={{ base: '200px', md: '260px' }}
                h={{ base: '200px', md: '260px' }}
                bg="brand.pink"
                opacity={0.08}
                borderRadius="40px"
                transform="rotate(12deg)"
                pointerEvents="none"
            />
            <Box
                aria-hidden="true"
                position="absolute"
                top={{ base: '600px', md: '500px' }}
                left={{ base: '60%', md: '70%' }}
                w={{ base: '160px', md: '200px' }}
                h={{ base: '160px', md: '200px' }}
                bg="brand.yellow"
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
                <Container maxW="container.md" px={{ base: 3, sm: 4, md: 6, lg: 8 }}>
                    <VStack spacing={{ base: 4, sm: 5, md: 8 }} w="full">
                        {/* ─── Page header card ─── */}
                        <Box
                            w="full"
                            bg="card.white"
                            borderRadius={{ base: '24px', md: '32px' }}
                            p={{ base: 5, sm: 6, md: 10 }}
                            border="1px solid"
                            borderColor="border.lightGray"
                            boxShadow="0 16px 50px rgba(0, 0, 0, 0.08)"
                            position="relative"
                            overflow="hidden"
                        >
                            {/* Radial gradient backdrop */}
                            <Box
                                aria-hidden="true"
                                position="absolute"
                                inset="0"
                                bgGradient="radial(circle at 20% 30%, rgba(54, 163, 123, 0.12) 0%, transparent 50%), radial(circle at 85% 20%, rgba(235, 11, 92, 0.1) 0%, transparent 45%), radial(circle at 50% 90%, rgba(253, 197, 29, 0.1) 0%, transparent 50%)"
                                opacity={0.7}
                                pointerEvents="none"
                                _dark={{ opacity: 0.4 }}
                            />
                            {/* Dot-grid overlay */}
                            <Box
                                aria-hidden="true"
                                position="absolute"
                                inset="0"
                                backgroundImage="radial-gradient(circle, rgba(51, 68, 121, 0.15) 1px, transparent 1px)"
                                backgroundSize="22px 22px"
                                opacity={0.25}
                                pointerEvents="none"
                                _dark={{ opacity: 0.08 }}
                            />
                            {/* Floating decorative pink dot (CommunitySection) */}
                            <Box
                                aria-hidden="true"
                                position="absolute"
                                top={{ base: '12px', md: '20px' }}
                                right={{ base: '16px', md: '28px' }}
                                w={{ base: '10px', md: '12px' }}
                                h={{ base: '10px', md: '12px' }}
                                borderRadius="full"
                                bg="brand.pink"
                                boxShadow="0 0 0 6px rgba(235, 11, 92, 0.12)"
                                pointerEvents="none"
                            />
                            {/* Floating decorative yellow square */}
                            <Box
                                aria-hidden="true"
                                position="absolute"
                                bottom={{ base: '16px', md: '24px' }}
                                right={{ base: '40px', md: '60px' }}
                                w={{ base: '12px', md: '14px' }}
                                h={{ base: '12px', md: '14px' }}
                                bg="brand.yellow"
                                borderRadius="4px"
                                transform="rotate(20deg)"
                                boxShadow="0 0 0 6px rgba(253, 197, 29, 0.18)"
                                pointerEvents="none"
                            />

                            <VStack
                                align="start"
                                spacing={{ base: 4, md: 5 }}
                                position="relative"
                                zIndex={1}
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
                                        Testnet Guide
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

                                {/* ── Playful heading (single-line) ── */}
                                <Heading
                                    fontSize={{
                                        base: '2xl',
                                        sm: '3xl',
                                        md: '4xl',
                                        lg: '5xl',
                                    }}
                                    fontWeight="extrabold"
                                    color="text.primary"
                                    lineHeight={1.15}
                                    letterSpacing="-0.03em"
                                >
                                    <Box
                                        as="span"
                                        display="inline"
                                        position="relative"
                                    >
                                        Get Free
                                        {/* Yellow underline highlight */}
                                        <Box
                                            as="span"
                                            position="absolute"
                                            left="0"
                                            right="0"
                                            bottom={{ base: '0px', md: '-2px' }}
                                            height={{ base: '6px', md: '10px' }}
                                            bg="brand.yellow"
                                            opacity={0.2}
                                            borderRadius="full"
                                            zIndex={-1}
                                            style={{ rotate: '-1deg' }}
                                        />
                                    </Box>{' '}
                                    <Box
                                        as="span"
                                        display="inline-block"
                                        bg="brand.green"
                                        color="white"
                                        px={{ base: 2.5, sm: 3, md: 4 }}
                                        py={{ base: 0, sm: 0.5, md: 1 }}
                                        borderRadius="full"
                                        transform="rotate(-2deg)"
                                        boxShadow="0 6px 16px rgba(54, 163, 123, 0.35)"
                                    >
                                        Tokens
                                    </Box>{' '}
                                    <Flex
                                        as="span"
                                        display="inline-flex"
                                        align="center"
                                        justify="center"
                                        bg="brand.pink"
                                        color="white"
                                        w={{ base: '28px', sm: '32px', md: '40px' }}
                                        h={{ base: '28px', sm: '32px', md: '40px' }}
                                        borderRadius="full"
                                        transform="rotate(6deg)"
                                        boxShadow="0 8px 18px rgba(235, 11, 92, 0.35)"
                                        ml={{ base: 0.5, md: 1 }}
                                        verticalAlign="middle"
                                    >
                                        <Icon
                                            as={FiZap}
                                            color="white"
                                            boxSize={{ base: '13px', sm: '15px', md: '20px' }}
                                        />
                                    </Flex>
                                </Heading>

                                <Text
                                    color="text.secondary"
                                    fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
                                    lineHeight="tall"
                                    fontWeight="medium"
                                    maxW="xl"
                                >
                                    Grab testnet tokens on{' '}
                                    <Text
                                        as="span"
                                        fontWeight="bold"
                                        color="text.primary"
                                    >
                                        Base Sepolia
                                    </Text>{' '}
                                    and start playing poker on Stacked — no
                                    account needed.
                                </Text>
                            </VStack>
                        </Box>

                        {/* Chain warning banner */}
                        <ChainWarningBanner />

                        {/* ─── Important notice ─── */}
                        <Box
                            w="full"
                            bg="card.white"
                            borderRadius={{ base: '18px', md: '24px' }}
                            p={{ base: 4, sm: 5, md: 6 }}
                            border="1px solid"
                            borderColor="border.lightGray"
                            borderLeft="4px solid"
                            borderLeftColor="brand.navy"
                            _dark={{ borderLeftColor: 'blue.400' }}
                            boxShadow="0 4px 18px rgba(0, 0, 0, 0.03)"
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
                                        You Need Both ETH and USDC
                                    </Text>
                                    <Text
                                        fontSize="sm"
                                        color="text.secondary"
                                        fontWeight="medium"
                                    >
                                        To play poker on Stacked, you need both:
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
                                            >
                                                <Text
                                                    as="span"
                                                    fontWeight="bold"
                                                    color="text.primary"
                                                >
                                                    Base Sepolia ETH
                                                </Text>{' '}
                                                &mdash; for gas fees
                                                (transaction costs)
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
                                            >
                                                <Text
                                                    as="span"
                                                    fontWeight="bold"
                                                    color="text.primary"
                                                >
                                                    Base Sepolia USDC
                                                </Text>{' '}
                                                &mdash; for buying into poker
                                                tables
                                            </Text>
                                        </ListItem>
                                    </List>
                                    <Text
                                        fontSize="sm"
                                        color="text.muted"
                                        fontWeight="medium"
                                    >
                                        Follow the steps below to get both
                                        tokens.
                                    </Text>
                                </VStack>
                            </HStack>
                        </Box>

                        {/* ─── Step 1: Get Base Sepolia ETH ─── */}
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
                                        (for gas fees)
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
                                You need Base Sepolia ETH to pay for transaction
                                fees (gas). Choose one of these faucets:
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
                                        label="Option 1: Alchemy Faucet"
                                        href="https://www.alchemy.com/faucets/base-sepolia"
                                    />
                                    <FaucetLink
                                        label="Option 2: QuickNode Faucet"
                                        href="https://faucet.quicknode.com/base/sepolia"
                                        note="Note: QuickNode requires 0.001 ETH on Ethereum Mainnet"
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
                                    Visit the faucet, connect your wallet, and
                                    request Base Sepolia ETH. Tokens should
                                    arrive in a few minutes.
                                </Text>
                            </HStack>
                        </StepCard>

                        {/* ─── Step 2: Get Base Sepolia USDC ─── */}
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
                                Get free testnet USDC from Circle&apos;s public
                                faucet:
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
                                            Visit the Circle Testnet Faucet:
                                        </Text>{' '}
                                        Go to{' '}
                                        <Link
                                            href="https://faucet.circle.com/"
                                            isExternal
                                            color="brand.green"
                                            fontWeight="semibold"
                                            _hover={{
                                                color: 'brand.pink',
                                                textDecoration: 'underline',
                                            }}
                                            transition="color 0.2s ease"
                                        >
                                            faucet.circle.com
                                            <Icon
                                                as={FiExternalLink}
                                                boxSize="11px"
                                                ml={1}
                                                mb="2px"
                                            />
                                        </Link>
                                    </Text>
                                </HStack>

                                <HStack align="flex-start" spacing={3}>
                                    <SubStepBadge label="b" />
                                    <VStack align="start" spacing={3} flex={1}>
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
                                                Request free USDC tokens:
                                            </Text>{' '}
                                            Select{' '}
                                            <Text
                                                as="span"
                                                fontWeight="bold"
                                                color="text.primary"
                                            >
                                                Base-Sepolia
                                            </Text>{' '}
                                            from the dropdown, enter your wallet
                                            address, and click &ldquo;Send 10
                                            USDC&rdquo;.
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

                        {/* ─── Step 3: Connect Your Wallet ─── */}
                        <StepCard
                            number={3}
                            title={
                                <>
                                    <Highlight color="pink">Connect</Highlight>{' '}
                                    Your Wallet to Stacked
                                </>
                            }
                        >
                            <Text
                                fontSize={{ base: 'sm', md: 'md' }}
                                color="text.secondary"
                                fontWeight="medium"
                                lineHeight="tall"
                            >
                                Head to{' '}
                                <Link
                                    href="/"
                                    color="brand.green"
                                    fontWeight="semibold"
                                    _hover={{
                                        color: 'brand.pink',
                                        textDecoration: 'underline',
                                    }}
                                    transition="color 0.2s ease"
                                >
                                    stackedpoker.io
                                </Link>{' '}
                                and connect your wallet. You can use MetaMask,
                                Coinbase Wallet, or sign in with Google, Discord,
                                and more.
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
                                        borderRadius={{ base: '12px', md: '16px' }}
                                        overflow="hidden"
                                        border="1px solid"
                                        borderColor="border.lightGray"
                                        bg="card.lightGray"
                                        w="full"
                                        maxW={{ base: 'full', md: '520px' }}
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

                        {/* ─── Step 4: Verify Your Balance ─── */}
                        <StepCard
                            number={4}
                            title={
                                <>
                                    Verify Your{' '}
                                    <Highlight color="yellow">
                                        Balance
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
                                Check your wallet to confirm you have both ETH
                                and USDC. It may take a minute or two for tokens
                                to arrive. You should see:
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
                                    Base Sepolia ETH balance (for gas)
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
                                    Base Sepolia USDC balance (for buy-ins)
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

                        {/* ─── Disclaimer ─── */}
                        <Box
                            w="full"
                            bg="card.white"
                            borderRadius={{ base: '14px', md: '20px' }}
                            p={{ base: 3, sm: 4, md: 5 }}
                            border="1px solid"
                            borderColor="border.lightGray"
                            borderLeft="4px solid"
                            borderLeftColor="brand.yellow"
                            boxShadow="0 2px 8px rgba(0, 0, 0, 0.03)"
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
                                    Testnet tokens on Base Sepolia have no
                                    real-world or monetary value. They are
                                    provided solely for development and testing
                                    and cannot be exchanged for real currency.
                                </Text>
                            </HStack>
                        </Box>

                        {/* Footer note */}
                        <Text
                            fontSize="xs"
                            color="text.muted"
                            textAlign="center"
                            fontWeight="medium"
                            px={4}
                        >
                            Always double-check that you are on the correct
                            testnet before requesting or using tokens.
                        </Text>
                    </VStack>
                </Container>
            </Box>

            <Footer />
        </Flex>
    );
};

export default FreeTokensPage;
