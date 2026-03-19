'use client';
import { useState } from 'react';
import {
    Flex,
    Button,
    IconButton,
    Stack,
    VStack,
    HStack,
    Link,
    Spinner,
    Box,
    Heading,
    Text,
    Badge,
    Input,
    Icon,
    useMediaQuery,
} from '@chakra-ui/react';
import { RiTwitterXLine } from 'react-icons/ri';
import { MdArrowForward, MdCheck } from 'react-icons/md';
import { FaDiscord } from 'react-icons/fa';
import { FaTelegram } from 'react-icons/fa6';
import WalletButton from '@/app/components/WalletButton';
import NewsletterSuccessModal from './NewsletterSuccessModal';
import useToastHelper from '@/app/hooks/useToastHelper';
import { useRouter } from 'next/navigation';
import { keyframes } from '@emotion/react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useActiveAccount } from 'thirdweb/react';
import { useDisclosure } from '@chakra-ui/react';

const MotionButton = motion(Button);
const MotionBox = motion(Box);
const MotionStack = motion(Stack);
const MotionFlex = motion(Flex);

// Animations
const gradientShift = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

const pulse = keyframes`
    0%, 100% {
        opacity: 0.15;
        transform: scale(1);
    }
    50% {
        opacity: 0.25;
        transform: scale(1.05);
    }
`;

const swapPrimary = keyframes`
    0%, 45% { opacity: 1; transform: translateY(0); }
    50%, 95% { opacity: 0; transform: translateY(-4px); }
    100% { opacity: 1; transform: translateY(0); }
`;

const swapSecondary = keyframes`
    0%, 45% { opacity: 0; transform: translateY(4px); }
    50%, 95% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(4px); }
`;

// Premium shine sweep animation
const shineSweep = keyframes`
    0% { transform: translateX(-100%) rotate(25deg); }
    100% { transform: translateX(200%) rotate(25deg); }
`;

const slideUp = keyframes`
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
`;

// Flip to true to restore the Play Now / Create / Join buttons
const SHOW_PLAY_BUTTONS = true;

const HomeCard = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [showPlayOptions, setShowPlayOptions] = useState(false);
    const [email, setEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const router = useRouter();
    const prefersReducedMotion = useReducedMotion();
    const account = useActiveAccount();
    const {
        isOpen: isSuccessOpen,
        onOpen: onSuccessOpen,
        onClose: onSuccessClose,
    } = useDisclosure();
    const toast = useToastHelper();
    const [isPortrait] = useMediaQuery('(orientation: portrait)');
    const allowMotion = !prefersReducedMotion;
    const swapHeadingPrimaryMotion = allowMotion
        ? `${swapPrimary} 4.8s ease-in-out infinite`
        : 'none';
    const swapHeadingSecondaryMotion = allowMotion
        ? `${swapSecondary} 4.8s ease-in-out infinite`
        : 'none';

    const handlePlayNow = () => {
        setShowPlayOptions(true);
    };

    const handleCreateGame = () => {
        setIsCreating(true);
        router.push('/create-game');
    };

    const handleJoinGame = () => {
        setIsJoining(true);
        router.push('/public-games');
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || isSubscribing) return;

        setIsSubscribing(true);
        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setIsSubscribed(true);
                setEmail('');
                toast.success("You're in!", 'Check your inbox for updates.');
                onSuccessOpen();
            } else {
                toast.error(
                    "Couldn't subscribe",
                    'Please try again in a moment.'
                );
            }
        } catch {
            toast.error(
                'Something went wrong',
                'Please check your connection and try again.'
            );
        } finally {
            setIsSubscribing(false);
        }
    };

    // Spring transition config
    const springTransition = {
        type: 'spring' as const,
        stiffness: 300,
        damping: 20,
    };

    return (
        <Flex
            justifyContent="center"
            alignItems="center"
            height="100%"
            width="100%"
            pt={{ base: '110px', md: '130px', lg: 0 }}
            pb={{ base: '40px', lg: 0 }}
            px={{ base: 3, md: 4 }}
        >
            {/* Animated Background Glow - More diffuse and elegant */}
            <Box
                position="absolute"
                width={{ base: '300px', md: '400px', lg: '500px' }}
                height={{ base: '300px', md: '400px', lg: '500px' }}
                borderRadius="50%"
                bg="brand.pink"
                filter={{
                    base: 'blur(100px)',
                    md: 'blur(120px)',
                    lg: 'blur(140px)',
                }}
                animation={`${pulse} 5s ease-in-out infinite`}
                zIndex={0}
            />

            {/* Secondary glow */}
            <Box
                position="absolute"
                width={{ base: '200px', md: '280px', lg: '350px' }}
                height={{ base: '200px', md: '280px', lg: '350px' }}
                borderRadius="50%"
                bg="brand.green"
                filter={{
                    base: 'blur(80px)',
                    md: 'blur(100px)',
                    lg: 'blur(120px)',
                }}
                opacity={0.12}
                transform="translate(30%, 20%)"
                animation={`${pulse} 6s ease-in-out 1.5s infinite`}
                zIndex={0}
            />

            {/* Tertiary yellow glow for depth */}
            <Box
                position="absolute"
                width={{ base: '120px', md: '180px', lg: '220px' }}
                height={{ base: '120px', md: '180px', lg: '220px' }}
                borderRadius="50%"
                bg="brand.yellow"
                filter={{
                    base: 'blur(80px)',
                    md: 'blur(100px)',
                    lg: 'blur(120px)',
                }}
                opacity={0.08}
                transform="translate(-40%, 30%)"
                animation={`${pulse} 7s ease-in-out 2s infinite`}
                zIndex={0}
            />

            {/* Main Card Container - Premium Glass */}
            <MotionFlex
                position="relative"
                borderRadius={{ base: '24px', md: '28px', lg: '32px' }}
                width={{ base: '100%', sm: '90%', md: '420px', lg: '460px' }}
                maxWidth="460px"
                className="home-card-container"
                minWidth={{ base: '280px', sm: '320px' }}
                height="fit-content"
                bg="card.heroBg"
                boxShadow="card.hero"
                overflow="hidden"
                backdropFilter="blur(24px)"
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                    mass: 1,
                }}
            >
                {/* Animated Gradient Border */}
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    borderRadius={{ base: '24px', md: '28px', lg: '32px' }}
                    padding={{ base: '2px', md: '3px' }}
                    bgGradient="linear(to-r, brand.pink, brand.green, brand.yellow, brand.pink)"
                    backgroundSize="300% 300%"
                    animation={`${gradientShift} 8s ease infinite`}
                    pointerEvents="none"
                >
                    <Box
                        width="100%"
                        height="100%"
                        bg="card.heroInnerBg"
                        borderRadius={{ base: '22px', md: '25px', lg: '29px' }}
                    />
                </Box>

                {/* Shine sweep effect */}
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    overflow="hidden"
                    borderRadius={{ base: '24px', md: '28px', lg: '32px' }}
                    pointerEvents="none"
                    zIndex={2}
                    sx={{
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: '-50%',
                            left: '-50%',
                            width: '50%',
                            height: '200%',
                            background:
                                'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.06), transparent)',
                            animation: allowMotion
                                ? `${shineSweep} 6s ease-in-out 2s infinite`
                                : 'none',
                        },
                    }}
                />

                {/* Content */}
                <Stack
                    gap={{ base: 2, md: 4 }}
                    flex={1}
                    justifyContent="center"
                    width="100%"
                    className="home-card-content"
                    alignItems="center"
                    py={{ base: 4, md: 6, lg: 7 }}
                    px={{ base: 5, sm: 8, md: 10, lg: 12 }}
                    position="relative"
                    zIndex={1}
                >
                    {/* Pill Badge */}
                    <MotionBox
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                            ...springTransition,
                            delay: 0.2,
                        }}
                    >
                        <Badge
                            bg="rgba(54, 163, 123, 0.12)"
                            color="brand.green"
                            px={4}
                            py={1.5}
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="extrabold"
                            letterSpacing="0.05em"
                            textTransform="uppercase"
                            border="1px solid"
                            borderColor="rgba(54, 163, 123, 0.2)"
                            backdropFilter="blur(8px)"
                        >
                            ⚡ INSTANT GUEST PLAY
                        </Badge>
                    </MotionBox>

                    {/* Logo/Title Section */}
                    <MotionBox
                        textAlign="center"
                        position="relative"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            ...springTransition,
                            delay: 0.3,
                        }}
                    >
                        <Heading
                            fontSize={{
                                base: '2.25rem',
                                sm: '2.75rem',
                                md: '3rem',
                                lg: '3.25rem',
                            }}
                            fontWeight="900"
                            lineHeight={1.1}
                            letterSpacing="-0.04em"
                            color="text.primary"
                            whiteSpace="nowrap"
                        >
                            <Box
                                as="span"
                                display="inline-flex"
                                alignItems="center"
                                gap="0.25ch"
                            >
                                <Box as="span">Your</Box>
                                <Box
                                    as="span"
                                    position="relative"
                                    display="inline-flex"
                                    alignItems="center"
                                    minW={{ base: '4.5ch', md: '4.5ch' }}
                                    height="1em"
                                >
                                    <Box
                                        position="absolute"
                                        inset={0}
                                        display="inline-flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        animation={swapHeadingPrimaryMotion}
                                    >
                                        <Box
                                            as="span"
                                            color="brand.green"
                                            position="relative"
                                            display="inline-block"
                                        >
                                            Table
                                            <Box
                                                as="span"
                                                position="absolute"
                                                left="-4px"
                                                right="-4px"
                                                bottom="4px"
                                                height="10px"
                                                bg="brand.green"
                                                opacity={0.15}
                                                borderRadius="full"
                                                zIndex={-1}
                                            />
                                        </Box>
                                    </Box>
                                    <Box
                                        position="absolute"
                                        inset={0}
                                        display="inline-flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        opacity={allowMotion ? undefined : 0}
                                        animation={swapHeadingSecondaryMotion}
                                    >
                                        <Box
                                            as="span"
                                            bg="brand.pink"
                                            color="white"
                                            px={2}
                                            borderRadius="md"
                                            display="inline-block"
                                            transform="rotate(-1deg)"
                                        >
                                            Rules
                                        </Box>
                                    </Box>
                                </Box>
                                <Box as="span">.</Box>
                            </Box>
                        </Heading>
                    </MotionBox>

                    {/* Tagline */}
                    <MotionBox
                        textAlign="center"
                        maxW={{ base: '300px', sm: '360px' }}
                        px={1}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            ...springTransition,
                            delay: 0.4,
                        }}
                    >
                        <VStack>
                            <Text
                                fontSize={{ base: 'md', md: 'lg' }}
                                color="text.gray600"
                                lineHeight={1.5}
                                fontWeight="normal"
                            >
                                Host a game and invite the crew.
                            </Text>

                            {/* Trust Indicators */}
                            <HStack
                                spacing={2}
                                fontSize={{ base: 'sm', md: 'md' }}
                                color="text.muted"
                                lineHeight={1.4}
                                fontWeight="semibold"
                                textTransform="uppercase"
                                letterSpacing="0.08em"
                            >
                                <Text color="text.muted">NO DOWNLOAD</Text>
                                <Box
                                    w="6px"
                                    h="6px"
                                    bg="brand.green"
                                    borderRadius="full"
                                    boxShadow="0 0 8px rgba(54, 163, 123, 0.6)"
                                />
                                <Text color="text.muted">NO SIGN-UP</Text>
                            </HStack>
                        </VStack>
                    </MotionBox>

                    {/* Buttons Section */}
                    {SHOW_PLAY_BUTTONS && (
                        <MotionStack
                            gap={{ base: 3, md: 3 }}
                            width="100%"
                            maxW={{ base: '100%', sm: '320px' }}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                ...springTransition,
                                delay: 0.5,
                            }}
                        >
                            <AnimatePresence mode="wait">
                                {!showPlayOptions ? (
                                    <MotionBox
                                        key="play-now"
                                        initial={{ opacity: 1 }}
                                        exit={{
                                            opacity: 0,
                                            scale: 0.95,
                                            transition: { duration: 0.2 },
                                        }}
                                    >
                                        <MotionButton
                                            height={{
                                                base: '64px',
                                                md: '64px',
                                            }}
                                            fontSize={{
                                                base: 'lg',
                                                md: 'xl',
                                            }}
                                            fontWeight="900"
                                            borderRadius="18px"
                                            bgGradient="linear(to-r, brand.green, rgba(54, 163, 123, 0.85))"
                                            color="white"
                                            border="none"
                                            onClick={handlePlayNow}
                                            width="100%"
                                            position="relative"
                                            overflow="hidden"
                                            letterSpacing="0.05em"
                                            boxShadow="0 12px 26px rgba(54, 163, 123, 0.35), inset 0 2px 0 rgba(255, 255, 255, 0.25)"
                                            whileHover={{
                                                y: -3,
                                                scale: 1.02,
                                                transition: {
                                                    type: 'spring',
                                                    stiffness: 400,
                                                    damping: 17,
                                                },
                                            }}
                                            whileTap={{
                                                scale: 0.97,
                                                y: 0,
                                            }}
                                            _hover={{
                                                bgGradient:
                                                    'linear(to-r, rgba(54, 163, 123, 0.95), rgba(54, 163, 123, 0.8))',
                                                boxShadow:
                                                    '0 16px 36px rgba(54, 163, 123, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.3)',
                                            }}
                                            sx={{
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: '50%',
                                                    background:
                                                        'linear-gradient(to bottom, rgba(255, 255, 255, 0.15), transparent)',
                                                    borderRadius: 'inherit',
                                                    pointerEvents: 'none',
                                                },
                                            }}
                                        >
                                            [ PLAY NOW ]
                                        </MotionButton>
                                    </MotionBox>
                                ) : (
                                    <MotionBox
                                        key="play-options"
                                        initial={{
                                            opacity: 0,
                                            y: 10,
                                            scale: 0.97,
                                        }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 22,
                                        }}
                                    >
                                        <Stack
                                            spacing={{ base: 2.5, md: 3 }}
                                            width="100%"
                                        >
                                            <MotionButton
                                                height={{
                                                    base: '52px',
                                                    md: '56px',
                                                }}
                                                fontSize={{
                                                    base: 'md',
                                                    md: 'lg',
                                                }}
                                                fontWeight="900"
                                                borderRadius="16px"
                                                bgGradient="linear(to-r, brand.green, rgba(54, 163, 123, 0.9))"
                                                color="white"
                                                border="none"
                                                onClick={handleCreateGame}
                                                isLoading={isCreating}
                                                loadingText="Creating"
                                                letterSpacing="0.04em"
                                                spinner={
                                                    <Spinner
                                                        size="sm"
                                                        color="white"
                                                    />
                                                }
                                                position="relative"
                                                overflow="hidden"
                                                boxShadow="0 10px 22px rgba(54, 163, 123, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.2)"
                                                whileHover={{
                                                    y: -2,
                                                    scale: 1.02,
                                                    transition: {
                                                        type: 'spring',
                                                        stiffness: 400,
                                                        damping: 17,
                                                    },
                                                }}
                                                whileTap={{
                                                    scale: 0.97,
                                                    y: 0,
                                                }}
                                                _hover={{
                                                    bgGradient:
                                                        'linear(to-r, rgba(54, 163, 123, 0.98), rgba(54, 163, 123, 0.85))',
                                                    boxShadow:
                                                        '0 14px 30px rgba(54, 163, 123, 0.45), inset 0 2px 0 rgba(255, 255, 255, 0.25)',
                                                }}
                                                sx={{
                                                    '&::before': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        height: '50%',
                                                        background:
                                                            'linear-gradient(to bottom, rgba(255, 255, 255, 0.12), transparent)',
                                                        borderRadius: 'inherit',
                                                        pointerEvents: 'none',
                                                    },
                                                }}
                                            >
                                                CREATE
                                            </MotionButton>
                                            <MotionButton
                                                height={{
                                                    base: '52px',
                                                    md: '56px',
                                                }}
                                                fontSize={{
                                                    base: 'md',
                                                    md: 'lg',
                                                }}
                                                fontWeight="900"
                                                borderRadius="16px"
                                                bg="white"
                                                color="brand.green"
                                                border="1.5px solid"
                                                borderColor="rgba(54, 163, 123, 0.25)"
                                                onClick={handleJoinGame}
                                                isLoading={isJoining}
                                                loadingText="Joining"
                                                letterSpacing="0.04em"
                                                spinner={
                                                    <Spinner
                                                        size="sm"
                                                        color="brand.green"
                                                    />
                                                }
                                                boxShadow="0 10px 22px rgba(17, 24, 39, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)"
                                                whileHover={{
                                                    y: -2,
                                                    scale: 1.02,
                                                    transition: {
                                                        type: 'spring',
                                                        stiffness: 400,
                                                        damping: 17,
                                                    },
                                                }}
                                                whileTap={{
                                                    scale: 0.97,
                                                    y: 0,
                                                }}
                                                _hover={{
                                                    bg: 'rgba(54, 163, 123, 0.06)',
                                                    borderColor:
                                                        'rgba(54, 163, 123, 0.4)',
                                                    boxShadow:
                                                        '0 14px 30px rgba(17, 24, 39, 0.1)',
                                                }}
                                                _dark={{
                                                    bg: 'rgba(255, 255, 255, 0.06)',
                                                    color: 'brand.green',
                                                    borderColor:
                                                        'rgba(255, 255, 255, 0.1)',
                                                    boxShadow: 'none',
                                                    _hover: {
                                                        bg: 'rgba(255, 255, 255, 0.12)',
                                                        borderColor:
                                                            'rgba(255, 255, 255, 0.2)',
                                                        boxShadow:
                                                            '0 14px 26px rgba(0, 0, 0, 0.2)',
                                                    },
                                                }}
                                            >
                                                JOIN
                                            </MotionButton>
                                        </Stack>
                                    </MotionBox>
                                )}
                            </AnimatePresence>

                            {account && isPortrait ? (
                                <Box
                                    width="100%"
                                    maxW={{
                                        base: '100%',
                                        sm: '320px',
                                    }}
                                    mx="auto"
                                >
                                    <WalletButton variant="hero" />
                                </Box>
                            ) : !account ? (
                                <Flex justify="center" pt={0}>
                                    <WalletButton
                                        label="Already have an account? Sign In"
                                        variant="link"
                                    />
                                </Flex>
                            ) : null}
                        </MotionStack>
                    )}

                    {/* Newsletter Inline */}
                    <VStack
                        spacing={2}
                        width="100%"
                        maxW={{ base: '100%', sm: '320px' }}
                        animation={`${slideUp} 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.4s backwards`}
                    >
                        {isSubscribed ? (
                            <HStack
                                width="100%"
                                spacing={2}
                                justify="center"
                                bg="rgba(54, 163, 123, 0.1)"
                                border="1px solid"
                                borderColor="brand.green"
                                borderRadius="full"
                                height="42px"
                                px={4}
                            >
                                <Icon
                                    as={MdCheck}
                                    color="brand.green"
                                    boxSize={4}
                                />
                                <Text
                                    fontSize="sm"
                                    color="brand.green"
                                    fontWeight="bold"
                                >
                                    You&apos;re on the list!
                                </Text>
                            </HStack>
                        ) : (
                            <>
                                <HStack width="100%" spacing={2} align="center">
                                    <Box
                                        flex={1}
                                        h="1px"
                                        bg="border.lightGray"
                                    />
                                    <Text
                                        fontSize="2xs"
                                        color="text.muted"
                                        fontWeight="bold"
                                        letterSpacing="0.15em"
                                        textTransform="uppercase"
                                        whiteSpace="nowrap"
                                    >
                                        or get dealt in
                                    </Text>
                                    <Box
                                        flex={1}
                                        h="1px"
                                        bg="border.lightGray"
                                    />
                                </HStack>
                                <HStack
                                    as="form"
                                    onSubmit={handleEmailSubmit}
                                    width="100%"
                                    spacing={0}
                                    bg="input.white"
                                    borderRadius="full"
                                    border="1px solid"
                                    borderColor="border.lightGray"
                                    transition="border-color 0.2s ease"
                                    pl={4}
                                    pr="5px"
                                    height="42px"
                                    align="center"
                                    _focusWithin={{
                                        borderColor: 'brand.green',
                                    }}
                                >
                                    <Input
                                        type="email"
                                        placeholder="your@email.com"
                                        variant="unstyled"
                                        color="text.primary"
                                        height="100%"
                                        fontSize="sm"
                                        fontWeight="medium"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        disabled={isSubscribing}
                                        _placeholder={{ color: 'text.muted' }}
                                        required
                                    />
                                    <IconButton
                                        type="submit"
                                        aria-label="Subscribe"
                                        icon={
                                            <Icon
                                                as={MdArrowForward}
                                                boxSize={4}
                                            />
                                        }
                                        bg="brand.green"
                                        color="white"
                                        size="sm"
                                        borderRadius="full"
                                        minW="32px"
                                        h="32px"
                                        flexShrink={0}
                                        isLoading={isSubscribing}
                                        disabled={isSubscribing}
                                        _hover={{
                                            bg: 'rgba(54, 163, 123, 0.85)',
                                        }}
                                    />
                                </HStack>
                            </>
                        )}
                    </VStack>

                    {/* Social Links */}
                    <MotionBox
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            ...springTransition,
                            delay: 0.65,
                        }}
                    >
                        <VStack spacing={1.5} pt={{ base: 0, md: 1 }}>
                            <Text
                                fontSize="xs"
                                color="text.gray600"
                                letterSpacing="0.2em"
                                textTransform="uppercase"
                                fontWeight="bold"
                            >
                                Follow the action
                            </Text>
                            <Flex
                                direction="row"
                                justify="center"
                                align="center"
                                gap={{ base: 6, md: 6 }}
                                width="100%"
                            >
                                <Link
                                    href="https://x.com/stacked_poker"
                                    isExternal
                                >
                                    <IconButton
                                        aria-label="X"
                                        icon={<RiTwitterXLine size={20} />}
                                        size="lg"
                                        variant="social"
                                        color="text.primary"
                                        borderRadius="14px"
                                        w={{ base: '42px', md: '46px' }}
                                        h={{ base: '42px', md: '46px' }}
                                        _hover={{
                                            bg: '#000000',
                                            color: 'white',
                                            boxShadow:
                                                '0 8px 24px rgba(0, 0, 0, 0.25)',
                                        }}
                                    />
                                </Link>
                                <Link
                                    href="https://discord.gg/347RBVcvpn"
                                    isExternal
                                >
                                    <IconButton
                                        aria-label="Discord"
                                        icon={<FaDiscord size={20} />}
                                        size="lg"
                                        variant="social"
                                        color="#5865F2"
                                        borderRadius="14px"
                                        w={{ base: '42px', md: '46px' }}
                                        h={{ base: '42px', md: '46px' }}
                                        _hover={{
                                            bg: '#5865F2',
                                            color: 'white',
                                            boxShadow:
                                                '0 8px 24px rgba(88, 101, 242, 0.35)',
                                        }}
                                    />
                                </Link>
                                <Link
                                    href="https://t.me/stackedpoker"
                                    isExternal
                                >
                                    <IconButton
                                        aria-label="Telegram"
                                        icon={<FaTelegram size={20} />}
                                        size="lg"
                                        variant="social"
                                        color="#0088cc"
                                        borderRadius="14px"
                                        w={{ base: '42px', md: '46px' }}
                                        h={{ base: '42px', md: '46px' }}
                                        _hover={{
                                            bg: '#0088cc',
                                            color: 'white',
                                            boxShadow:
                                                '0 8px 24px rgba(0, 136, 204, 0.35)',
                                        }}
                                    />
                                </Link>
                            </Flex>
                        </VStack>
                    </MotionBox>
                </Stack>
            </MotionFlex>

            <NewsletterSuccessModal
                isOpen={isSuccessOpen}
                onClose={onSuccessClose}
            />
        </Flex>
    );
};

export default HomeCard;
