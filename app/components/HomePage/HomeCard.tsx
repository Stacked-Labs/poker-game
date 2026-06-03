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
    Input,
    Icon,
    useMediaQuery,
} from '@chakra-ui/react';
import { MdArrowForward, MdCheck } from 'react-icons/md';
import WalletButton from '@/app/components/WalletButton';
import { SocialIconButton } from '@/app/components/SocialIconButton';
import NewsletterSuccessModal from './NewsletterSuccessModal';
import useToastHelper from '@/app/hooks/useToastHelper';
import { useRouter } from 'next/navigation';
import { keyframes } from '@emotion/react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useActiveAccount } from 'thirdweb/react';
import { useDisclosure } from '@chakra-ui/react';

const MotionBox = motion(Box);
const MotionStack = motion(Stack);
const MotionFlex = motion(Flex);

// Animations
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

    const [isHostingTournament, setIsHostingTournament] = useState(false);

    const handleCreateGame = () => {
        setIsCreating(true);
        router.push('/create-game');
    };

    const handleHostTournament = () => {
        setIsHostingTournament(true);
        router.push('/create-game?type=tournament');
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
            {/* Ambient brand glow — quiet, single-color emphasis on Neon Stake */}
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
                opacity={0.5}
                animation={
                    allowMotion ? `${pulse} 5s ease-in-out infinite` : 'none'
                }
                zIndex={0}
            />

            {/* Secondary felt-green wash, low opacity */}
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
                opacity={0.06}
                transform="translate(30%, 20%)"
                animation={
                    allowMotion
                        ? `${pulse} 6s ease-in-out 1.5s infinite`
                        : 'none'
                }
                zIndex={0}
            />

            {/* Tertiary chip-yellow wash for depth */}
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
                opacity={0.04}
                transform="translate(-40%, 30%)"
                animation={
                    allowMotion ? `${pulse} 7s ease-in-out 2s infinite` : 'none'
                }
                zIndex={0}
            />

            {/* Main Card Container */}
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
                border="1px solid"
                borderColor="border.lightGray"
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                    mass: 1,
                }}
            >
                {/* Content */}
                <Stack
                    gap={{ base: 2.5, md: 3 }}
                    flex={1}
                    justifyContent="center"
                    width="100%"
                    className="home-card-content"
                    alignItems="center"
                    py={{ base: 5, md: 7, lg: 8 }}
                    px={{ base: 5, sm: 8, md: 10, lg: 12 }}
                    position="relative"
                    zIndex={1}
                >
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
                                base: '2.5rem',
                                sm: '3rem',
                                md: '3.25rem',
                                lg: '3.5rem',
                            }}
                            fontWeight="900"
                            lineHeight={1.05}
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
                                <Box as="span">Your&nbsp;</Box>
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
                                                left="-3px"
                                                right="-3px"
                                                bottom="6px"
                                                height="8px"
                                                bg="brand.green"
                                                opacity={0.12}
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
                        <VStack spacing={3}>
                            <Text
                                fontSize={{ base: 'md', md: 'lg' }}
                                color="text.gray600"
                                lineHeight={1.6}
                                fontWeight="medium"
                            >
                                Host a game. Invite the crew.
                            </Text>

                            <HStack
                                spacing={2}
                                flexWrap="wrap"
                                justify="center"
                            >
                                {['NO SIGNUP', 'NO KYC', 'BUILT ON BASE'].map(
                                    (label) => (
                                        <HStack
                                            key={label}
                                            spacing={1.5}
                                            bg="rgba(54, 163, 123, 0.06)"
                                            border="1px solid"
                                            borderColor="rgba(54, 163, 123, 0.12)"
                                            borderRadius="full"
                                            px={3}
                                            py={1}
                                        >
                                            <Box
                                                w="5px"
                                                h="5px"
                                                bg="brand.green"
                                                borderRadius="full"
                                            />
                                            <Text
                                                fontSize="2xs"
                                                color="text.muted"
                                                fontWeight="bold"
                                                letterSpacing="0.08em"
                                                textTransform="uppercase"
                                            >
                                                {label}
                                            </Text>
                                        </HStack>
                                    )
                                )}
                            </HStack>
                        </VStack>
                    </MotionBox>

                    {/* Buttons Section */}
                    {SHOW_PLAY_BUTTONS && (
                        <MotionStack
                            gap={{ base: 2, md: 2.5 }}
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
                                        <Button
                                            variant="tactilePrimary"
                                            height="48px"
                                            width="100%"
                                            fontSize={{ base: 'md', md: 'lg' }}
                                            onClick={handlePlayNow}
                                        >
                                            PLAY NOW
                                        </Button>
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
                                        <VStack spacing={2} width="100%">
                                            <HStack spacing={2.5} width="100%">
                                                <Button
                                                    variant="tactilePrimary"
                                                    flex={1}
                                                    height="48px"
                                                    fontSize={{
                                                        base: 'sm',
                                                        md: 'md',
                                                    }}
                                                    onClick={handleCreateGame}
                                                    isLoading={isCreating}
                                                    loadingText="Creating"
                                                    spinner={
                                                        <Spinner
                                                            size="sm"
                                                            color="white"
                                                        />
                                                    }
                                                >
                                                    CREATE
                                                </Button>
                                                <Button
                                                    variant="tactileOutline"
                                                    flex={1}
                                                    height="48px"
                                                    fontSize={{
                                                        base: 'sm',
                                                        md: 'md',
                                                    }}
                                                    onClick={handleJoinGame}
                                                    isLoading={isJoining}
                                                    loadingText="Joining"
                                                    spinner={
                                                        <Spinner
                                                            size="sm"
                                                            color="brand.green"
                                                        />
                                                    }
                                                >
                                                    JOIN
                                                </Button>
                                            </HStack>
                                            <Button
                                                width="100%"
                                                height="40px"
                                                fontSize="sm"
                                                fontWeight="semibold"
                                                variant="ghost"
                                                color="text.muted"
                                                borderRadius="12px"
                                                border="1px dashed"
                                                borderColor="border.lightGray"
                                                _hover={{
                                                    color: 'brand.green',
                                                    borderColor: 'brand.green',
                                                    bg: 'rgba(54,163,123,0.04)',
                                                }}
                                                onClick={handleHostTournament}
                                                isLoading={isHostingTournament}
                                                loadingText="Opening…"
                                                spinner={
                                                    <Spinner
                                                        size="xs"
                                                        color="brand.green"
                                                    />
                                                }
                                            >
                                                🏆 Host a Tournament
                                            </Button>
                                        </VStack>
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
                        spacing={3}
                        width="100%"
                        maxW={{ base: '100%', sm: '320px' }}
                        animation={`${slideUp} 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.4s backwards`}
                    >
                        {isSubscribed ? (
                            <HStack
                                width="100%"
                                spacing={2}
                                justify="center"
                                bg="rgba(54, 163, 123, 0.08)"
                                border="1px solid"
                                borderColor="rgba(54, 163, 123, 0.25)"
                                borderRadius="full"
                                height="46px"
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
                                <HStack width="100%" spacing={3} align="center">
                                    <Box
                                        flex={1}
                                        h="1px"
                                        bgGradient="linear(to-r, transparent, border.lightGray)"
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
                                        bgGradient="linear(to-l, transparent, border.lightGray)"
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
                                    transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                                    pl={4}
                                    pr="5px"
                                    height="46px"
                                    align="center"
                                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
                                    _focusWithin={{
                                        borderColor: 'brand.pink',
                                        boxShadow:
                                            '0 0 0 3px rgba(235, 11, 92, 0.1)',
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
                                        _placeholder={{
                                            color: 'text.muted',
                                            opacity: 0.7,
                                        }}
                                        required
                                    />
                                    <IconButton
                                        type="submit"
                                        variant="tactilePrimary"
                                        aria-label="Subscribe"
                                        icon={
                                            <Icon
                                                as={MdArrowForward}
                                                boxSize={4}
                                            />
                                        }
                                        size="sm"
                                        borderRadius="full"
                                        minW={{ base: '40px', md: '36px' }}
                                        h={{ base: '40px', md: '36px' }}
                                        flexShrink={0}
                                        isLoading={isSubscribing}
                                    />
                                </HStack>
                                <Text
                                    fontSize="2xs"
                                    color="text.muted"
                                    textAlign="center"
                                    opacity={0.7}
                                >
                                    Game updates. Bonus drops. Special deals.
                                </Text>
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
                        <Flex
                            direction="row"
                            justify="center"
                            align="center"
                            gap={{ base: 2, md: 3 }}
                            width="100%"
                            pt={{ base: 0, md: 1 }}
                        >
                            <Link href="https://x.com/stacked_poker" isExternal>
                                <SocialIconButton tone="x" chipSize="lg" />
                            </Link>
                            <Link
                                href="https://discord.gg/347RBVcvpn"
                                isExternal
                            >
                                <SocialIconButton
                                    tone="discord"
                                    chipSize="lg"
                                />
                            </Link>
                            <Link href="https://t.me/stackedpoker" isExternal>
                                <SocialIconButton
                                    tone="telegram"
                                    chipSize="lg"
                                />
                            </Link>
                        </Flex>
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
