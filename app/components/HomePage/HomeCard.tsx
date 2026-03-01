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
import { SiFarcaster } from 'react-icons/si';
import WalletButton from '@/app/components/WalletButton';
import { useRouter } from 'next/navigation';
import { keyframes } from '@emotion/react';
import { useReducedMotion } from 'framer-motion';
import { useActiveAccount } from 'thirdweb/react';

// Animations
const gradientShift = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

const slideUp = keyframes`
    from { 
        opacity: 0; 
        transform: translateY(20px); 
    }
    to { 
        opacity: 1; 
        transform: translateY(0); 
    }
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
                setTimeout(() => setIsSubscribed(false), 5000);
            }
        } catch {
            // Silently fail - non-critical action
        } finally {
            setIsSubscribing(false);
        }
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
            {/* Animated Background Glow */}
            <Box
                position="absolute"
                width={{ base: '300px', md: '400px', lg: '500px' }}
                height={{ base: '300px', md: '400px', lg: '500px' }}
                borderRadius="50%"
                bg="brand.pink"
                filter={{
                    base: 'blur(80px)',
                    md: 'blur(100px)',
                    lg: 'blur(120px)',
                }}
                animation={`${pulse} 4s ease-in-out infinite`}
                zIndex={0}
            />

            {/* Secondary glow for depth */}
            <Box
                position="absolute"
                width={{ base: '200px', md: '280px', lg: '350px' }}
                height={{ base: '200px', md: '280px', lg: '350px' }}
                borderRadius="50%"
                bg="brand.green"
                filter={{
                    base: 'blur(60px)',
                    md: 'blur(80px)',
                    lg: 'blur(100px)',
                }}
                opacity={0.1}
                transform="translate(30%, 20%)"
                animation={`${pulse} 5s ease-in-out 1s infinite`}
                zIndex={0}
            />

            {/* Main Card Container */}
            <Flex
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
                animation={`${slideUp} 0.7s cubic-bezier(0.16, 1, 0.3, 1)`}
                backdropFilter="blur(20px)"
            >
                {/* Animated Gradient Border */}
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    borderRadius={{ base: '24px', md: '28px', lg: '32px' }}
                    padding={{ base: '3px', md: '4px' }}
                    bgGradient="linear(to-r, brand.pink, brand.green, brand.yellow, brand.pink)"
                    backgroundSize="300% 300%"
                    animation={`${gradientShift} 6s ease infinite`}
                    pointerEvents="none"
                >
                    <Box
                        width="100%"
                        height="100%"
                        bg="card.heroInnerBg"
                        borderRadius={{ base: '21px', md: '24px', lg: '28px' }}
                    />
                </Box>

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
                    <Box
                        animation={`${slideUp} 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.05s backwards`}
                    >
                        <Badge
                            bg="rgba(54, 163, 123, 0.15)"
                            color="brand.green"
                            px={4}
                            py={1.5}
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="extrabold"
                            letterSpacing="0.05em"
                            textTransform="uppercase"
                        >
                            ⚡ INSTANT GUEST PLAY
                        </Badge>
                    </Box>

                    {/* Logo/Title Section */}
                    <Box
                        animation={`${slideUp} 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards`}
                        textAlign="center"
                        position="relative"
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
                                                opacity={0.2}
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
                    </Box>

                    {/* Tagline */}
                    <Box
                        animation={`${slideUp} 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s backwards`}
                        textAlign="center"
                        maxW={{ base: '300px', sm: '360px' }}
                        px={1}
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
                                />
                                <Text color="text.muted">NO SIGN-UP</Text>
                            </HStack>
                        </VStack>
                    </Box>

                    {/* Buttons Section */}
                    <Stack
                        gap={{ base: 3, md: 3 }}
                        width="100%"
                        maxW={{ base: '100%', sm: '320px' }}
                        animation={`${slideUp} 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s backwards`}
                    >
                        {!showPlayOptions ? (
                            <Button
                                height={{ base: '64px', md: '64px' }}
                                fontSize={{ base: 'lg', md: 'xl' }}
                                fontWeight="900"
                                borderRadius="18px"
                                bgGradient="linear(to-r, brand.green, rgba(54, 163, 123, 0.85))"
                                color="white"
                                border="none"
                                onClick={handlePlayNow}
                                _active={{
                                    transform: 'scale(0.98)',
                                }}
                                transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                                position="relative"
                                overflow="hidden"
                                boxShadow="0 12px 26px rgba(54, 163, 123, 0.35), inset 0 2px 0 rgba(255, 255, 255, 0.3)"
                                _hover={{
                                    bgGradient:
                                        'linear(to-r, rgba(54, 163, 123, 0.95), rgba(54, 163, 123, 0.8))',
                                    transform: 'translateY(-2px)',
                                    boxShadow:
                                        '0 15px 30px rgba(54, 163, 123, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.3)',
                                }}
                            >
                                [ PLAY NOW ]
                            </Button>
                        ) : (
                            <Stack spacing={{ base: 2.5, md: 3 }} width="100%">
                                <Button
                                    height={{ base: '52px', md: '56px' }}
                                    fontSize={{ base: 'md', md: 'lg' }}
                                    fontWeight="900"
                                    borderRadius="16px"
                                    bgGradient="linear(to-r, brand.green, rgba(54, 163, 123, 0.9))"
                                    color="white"
                                    border="none"
                                    onClick={handleCreateGame}
                                    isLoading={isCreating}
                                    loadingText="Creating"
                                    spinner={
                                        <Spinner size="sm" color="white" />
                                    }
                                    _active={{
                                        transform: 'scale(0.98)',
                                    }}
                                    transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                                    position="relative"
                                    overflow="hidden"
                                    boxShadow="0 10px 22px rgba(54, 163, 123, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.3)"
                                    _hover={{
                                        bgGradient:
                                            'linear(to-r, rgba(54, 163, 123, 0.98), rgba(54, 163, 123, 0.85))',
                                        transform: 'translateY(-2px)',
                                        boxShadow:
                                            '0 14px 26px rgba(54, 163, 123, 0.45), inset 0 2px 0 rgba(255, 255, 255, 0.3)',
                                    }}
                                >
                                    [ CREATE ]
                                </Button>
                                <Button
                                    height={{ base: '52px', md: '56px' }}
                                    fontSize={{ base: 'md', md: 'lg' }}
                                    fontWeight="900"
                                    borderRadius="16px"
                                    bg="white"
                                    color="brand.green"
                                    border="2px solid"
                                    borderColor="rgba(54, 163, 123, 0.35)"
                                    onClick={handleJoinGame}
                                    isLoading={isJoining}
                                    loadingText="Joining"
                                    spinner={
                                        <Spinner
                                            size="sm"
                                            color="brand.green"
                                        />
                                    }
                                    _active={{
                                        transform: 'scale(0.98)',
                                    }}
                                    transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                                    boxShadow="0 10px 22px rgba(17, 24, 39, 0.08)"
                                    _hover={{
                                        bg: 'rgba(54, 163, 123, 0.08)',
                                        transform: 'translateY(-2px)',
                                        boxShadow:
                                            '0 14px 26px rgba(17, 24, 39, 0.12)',
                                    }}
                                    _dark={{
                                        bg: 'rgba(255, 255, 255, 0.08)',
                                        color: 'brand.green',
                                        borderColor:
                                            'rgba(255, 255, 255, 0.12)',
                                        boxShadow: 'none',
                                        _hover: {
                                            bg: 'rgba(255, 255, 255, 0.14)',
                                            boxShadow:
                                                '0 14px 26px rgba(0, 0, 0, 0.2)',
                                        },
                                    }}
                                >
                                    [ JOIN ]
                                </Button>
                            </Stack>
                        )}

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
                    </Stack>

                    {/* Newsletter Inline */}
                    <VStack
                        spacing={2}
                        width="100%"
                        maxW={{ base: '100%', sm: '320px' }}
                        animation={`${slideUp} 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.4s backwards`}
                    >
                        <HStack
                            width="100%"
                            spacing={2}
                            align="center"
                        >
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
                            borderColor={isSubscribed ? 'brand.green' : 'border.lightGray'}
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
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSubscribing || isSubscribed}
                                _placeholder={{
                                    color: 'text.muted',
                                }}
                                required
                            />
                            <IconButton
                                type="submit"
                                aria-label={isSubscribed ? 'Subscribed' : 'Subscribe'}
                                icon={
                                    <Icon
                                        as={isSubscribed ? MdCheck : MdArrowForward}
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
                                disabled={isSubscribing || isSubscribed}
                                _hover={{
                                    bg: 'rgba(54, 163, 123, 0.85)',
                                }}
                            />
                        </HStack>
                    </VStack>

                    {/* Social Links */}
                    <VStack
                        spacing={1.5}
                        animation={`${slideUp} 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.5s backwards`}
                        pt={{ base: 0, md: 1 }}
                    >
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
                            <Link href="https://x.com/stacked_poker" isExternal>
                                <IconButton
                                    aria-label="X"
                                    icon={<RiTwitterXLine size={20} />}
                                    size="lg"
                                    variant="social"
                                    color="text.primary"
                                    borderRadius="12px"
                                    w={{ base: '42px', md: '46px' }}
                                    h={{ base: '42px', md: '46px' }}
                                    _hover={{
                                        bg: '#000000',
                                        color: 'white',
                                        transform: 'translateY(-3px)',
                                        boxShadow:
                                            '0 6px 20px rgba(0, 0, 0, 0.25)',
                                    }}
                                    transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
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
                                    borderRadius="12px"
                                    w={{ base: '42px', md: '46px' }}
                                    h={{ base: '42px', md: '46px' }}
                                    _hover={{
                                        bg: '#5865F2',
                                        color: 'white',
                                        transform: 'translateY(-3px)',
                                        boxShadow:
                                            '0 6px 20px rgba(88, 101, 242, 0.3)',
                                    }}
                                    transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                                />
                            </Link>
                            <Link
                                href="https://warpcast.com/stackedpoker"
                                isExternal
                            >
                                <IconButton
                                    aria-label="Warpcast"
                                    icon={<SiFarcaster size={20} />}
                                    size="lg"
                                    variant="social"
                                    color="#855DCD"
                                    borderRadius="12px"
                                    w={{ base: '42px', md: '46px' }}
                                    h={{ base: '42px', md: '46px' }}
                                    _hover={{
                                        bg: '#855DCD',
                                        color: 'white',
                                        transform: 'translateY(-3px)',
                                        boxShadow:
                                            '0 6px 20px rgba(133, 93, 205, 0.3)',
                                    }}
                                    transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                                />
                            </Link>
                        </Flex>
                    </VStack>
                </Stack>
            </Flex>
        </Flex>
    );
};

export default HomeCard;
