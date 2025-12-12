'use client';
import { useState } from 'react';
import {
    Flex,
    Button,
    IconButton,
    Stack,
    Link,
    Spinner,
    Box,
    Heading,
    Text,
} from '@chakra-ui/react';
import { RiTwitterXLine } from 'react-icons/ri';
import { FaDiscord } from 'react-icons/fa';
import { SiFarcaster } from 'react-icons/si';
import WalletButton from '@/app/components/WalletButton';
import { useRouter } from 'next/navigation';
import { keyframes } from '@emotion/react';

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

const shimmer = keyframes`
    0% { transform: translateX(-100%) rotate(45deg); }
    100% { transform: translateX(100%) rotate(45deg); }
`;

const HomeCard = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handlePlayNow = () => {
        setIsLoading(true);
        router.push('/create-game');
    };

    return (
        <Flex
            justifyContent="center"
            alignItems="center"
            minHeight="var(--full-vh)"
            width="100%"
            p={{ base: 3, md: 4 }}
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
                bg="card.white"
                boxShadow="0 25px 80px rgba(0, 0, 0, 0.12), 0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.9)"
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
                        bg="card.white"
                        borderRadius={{ base: '21px', md: '24px', lg: '28px' }}
                    />
                </Box>

                {/* Content */}
                <Stack
                    gap={{ base: 6, md: 6 }}
                    flex={1}
                    justifyContent="center"
                    width="100%"
                    className="home-card-content"
                    alignItems="center"
                    py={{ base: 10, md: 10, lg: 12 }}
                    px={{ base: 5, sm: 8, md: 10, lg: 12 }}
                    position="relative"
                    zIndex={1}
                >
                    {/* Logo/Title Section */}
                    <Box
                        animation={`${slideUp} 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards`}
                        textAlign="center"
                        position="relative"
                    >
                        <Heading
                            fontSize={{
                                base: '3.25rem',
                                sm: '3.5rem',
                                md: '3.75rem',
                                lg: '4rem',
                            }}
                            fontWeight="extrabold"
                            lineHeight={1}
                            letterSpacing={{ base: '-0.03em', md: '-0.03em' }}
                            bgGradient="linear(to-r, brand.darkNavy, brand.navy)"
                            bgClip="text"
                            _dark={{
                                bgGradient: 'none',
                                bgClip: 'unset',
                                color: 'brand.lightGray',
                            }}
                        >
                            STACKED
                        </Heading>
                    </Box>

                    {/* Tagline */}
                    <Box
                        animation={`${slideUp} 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s backwards`}
                        textAlign="center"
                        maxW={{ base: '280px', sm: '320px' }}
                        px={2}
                    >
                        <Text
                            fontSize={{ base: 'md', md: 'md' }}
                            color="text.secondary"
                            lineHeight={1.6}
                            fontWeight="medium"
                        >
                            Create a table, invite friends, play in seconds.{' '}
                            <Text
                                as="span"
                                color="brand.green"
                                fontWeight="bold"
                            >
                                No sign up required.
                            </Text>
                        </Text>
                    </Box>

                    {/* Buttons Section */}
                    <Stack
                        gap={{ base: 3, md: 3 }}
                        width="100%"
                        maxW={{ base: '100%', sm: '320px' }}
                        animation={`${slideUp} 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s backwards`}
                        pt={1}
                    >
                        <Button
                            height={{ base: '60px', md: '60px' }}
                            fontSize={{ base: 'md', md: 'lg' }}
                            fontWeight="bold"
                            borderRadius={{ base: '14px', md: '16px' }}
                            bg="brand.green"
                            color="white"
                            border="none"
                            onClick={handlePlayNow}
                            isLoading={isLoading}
                            loadingText="Loading"
                            spinner={<Spinner size="md" color="white" />}
                            _active={{
                                transform: 'scale(0.98)',
                            }}
                            transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                            position="relative"
                            overflow="hidden"
                            boxShadow="0 4px 14px rgba(54, 163, 123, 0.4)"
                            _before={{
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '200%',
                                height: '100%',
                                bg: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                animation: `${shimmer} 3s ease-in-out infinite`,
                            }}
                            _hover={{
                                bg: 'brand.green',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(54, 163, 123, 0.5)',
                            }}
                        >
                            Play Now
                        </Button>

                        <WalletButton width="100%" height="60px" />
                    </Stack>

                    {/* Divider with text */}
                    <Flex
                        align="center"
                        width="100%"
                        maxW={{ base: '100%', sm: '320px' }}
                        animation={`${slideUp} 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.4s backwards`}
                        gap={3}
                        pt={1}
                    >
                        <Box flex={1} height="1px" bg="brand.lightGray" />
                        <Text
                            fontSize="xs"
                            color="gray.400"
                            fontWeight="semibold"
                            textTransform="uppercase"
                            letterSpacing="0.12em"
                        >
                            Connect
                        </Text>
                        <Box flex={1} height="1px" bg="brand.lightGray" />
                    </Flex>

                    {/* Social Links */}
                    <Flex
                        direction="row"
                        justify="center"
                        align="center"
                        gap={{ base: 4, md: 4 }}
                        width="100%"
                        animation={`${slideUp} 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.5s backwards`}
                    >
                        <Link href="https://x.com/stacked_poker" isExternal>
                            <IconButton
                                aria-label="X"
                                icon={<RiTwitterXLine size={20} />}
                                size="lg"
                                variant="social"
                                color="#000000"
                                borderRadius="12px"
                                w={{ base: '48px', md: '52px' }}
                                h={{ base: '48px', md: '52px' }}
                                _hover={{
                                    bg: '#000000',
                                    color: 'white',
                                    transform: 'translateY(-3px)',
                                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
                                }}
                                transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                            />
                        </Link>
                        <Link href="https://discord.gg/896EhkVYbd" isExternal>
                            <IconButton
                                aria-label="Discord"
                                icon={<FaDiscord size={20} />}
                                size="lg"
                                variant="social"
                                color="#5865F2"
                                borderRadius="12px"
                                w={{ base: '48px', md: '52px' }}
                                h={{ base: '48px', md: '52px' }}
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
                                w={{ base: '48px', md: '52px' }}
                                h={{ base: '48px', md: '52px' }}
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
                </Stack>

                {/* Decorative corner accents */}
                <Box
                    position="absolute"
                    top="-30px"
                    left="-30px"
                    width="80px"
                    height="80px"
                    borderRadius="50%"
                    bg="brand.yellow"
                    opacity={0.08}
                    filter="blur(30px)"
                    pointerEvents="none"
                />
                <Box
                    position="absolute"
                    bottom="-20px"
                    right="-20px"
                    width="100px"
                    height="100px"
                    borderRadius="50%"
                    bg="brand.green"
                    opacity={0.1}
                    filter="blur(40px)"
                    pointerEvents="none"
                />
            </Flex>
        </Flex>
    );
};

export default HomeCard;
