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
    Image,
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

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const slideUp = keyframes`
    from { 
        opacity: 0; 
        transform: translateY(30px); 
    }
    to { 
        opacity: 1; 
        transform: translateY(0); 
    }
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
            p={2}
        >
            {/* Animated Background Glow */}
            <Box
                position="absolute"
                width="450px"
                height="450px"
                borderRadius="50%"
                bg="brand.pink"
                filter="blur(120px)"
                opacity={0.15}
                animation={`${float} 6s ease-in-out infinite`}
                zIndex={0}
            />

            {/* Main Card Container */}
            <Flex
                position="relative"
                borderRadius="32px"
                width={['100%', '85%', '65%', '55%']}
                maxWidth="460px"
                minWidth="320px"
                minHeight="320px"
                height="fit-content"
                bg='card.white'
                boxShadow="0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)"
                overflow="hidden"
                animation={`${slideUp} 0.6s ease-out`}
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.8)"
                _hover={{
                    transform: 'translateY(-4px)',
                    boxShadow:
                        '0 30px 80px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            >
                {/* Animated Gradient Border */}
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    borderRadius="32px"
                    padding="4px"
                    bgGradient="linear(to-r, brand.pink, brand.green, brand.yellow, brand.pink)"
                    backgroundSize="200% 200%"
                    animation={`${gradientShift} 4s ease infinite`}
                    pointerEvents="none"
                >
                    <Box
                        width="100%"
                        height="100%"
                        bg="card.white"
                        borderRadius="29px"
                    />
                </Box>

                {/* Content */}
                <Stack
                    gap={{ base: 8, md: 10 }}
                    flex={1}
                    justifyContent="center"
                    alignItems="center"
                    paddingY={{ base: 8, md: 10, lg: 12 }}
                    paddingX={{ base: 8, md: 10, lg: 12 }}
                    position="relative"
                    zIndex={1}
                >
                    {/* Logo/Title Section */}
                    <Box
                        animation={`${slideUp} 0.8s ease-out 0.2s backwards`}
                        textAlign="center"
                        width="100%"
                        px={2}
                    >
                        <Image
                            src="/Text Logo.png"
                            alt="STACKED"
                            width={{ base: '75%', sm: '85%', md: '100%' }}
                            maxW={{ base: '240px', sm: '280px', md: '100%' }}
                            height="auto"
                            mx="auto"
                            objectFit="contain"
                        />
                    </Box>

                    {/* Buttons Section */}
                    <Stack
                        gap={{ base: 3, md: 4 }}
                        width="100%"
                        maxW="340px"
                        animation={`${slideUp} 0.8s ease-out 0.4s backwards`}
                    >
                        <Button
                            height="76px"
                            fontSize={{ base: 'sm', md: 'md' }}
                            fontWeight="bold"
                            borderRadius={'bigButton'}
                            bg="brand.green"
                            color="white"
                            border="none"
                            onClick={handlePlayNow}
                            isLoading={isLoading}
                            loadingText="Loading"
                            spinner={<Spinner size="md" color="white" />}
                            _active={{
                                transform: 'translateY(0)',
                            }}
                            transition="all 0.2s ease"
                            position="relative"
                            overflow="hidden"
                            _before={{
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                bg: 'linear-gradient(135deg, transparent, rgba(255,255,255,0.2), transparent)',
                                transform: 'translateX(-100%)',
                                transition: 'transform 0.6s',
                            }}
                            _hover={{
                                bg: 'brand.green',
                                transform: 'translateY(-2px)',
                                boxShadow:
                                    '0 12px 24px rgba(54, 163, 123, 0.35)',
                                _before: {
                                    transform: 'translateX(100%)',
                                },
                            }}
                        >
                            Play Now
                        </Button>

                        <WalletButton
                            width="100%"
                            height="76px"
                        />
                    </Stack>

                    {/* Social Links */}
                    <Flex
                        direction="row"
                        justify="center"
                        align="center"
                        gap={{ base: 4, md: 6 }}
                        width="100%"
                        animation={`${slideUp} 0.8s ease-out 0.6s backwards`}
                    >
                        <Link href="https://x.com/stacked_poker" isExternal>
                            <IconButton
                                aria-label="X"
                                icon={<RiTwitterXLine size={20} />}
                                size={{ base: 'md', md: 'lg' }}
                                variant={'social'}
                                color="#000000"
                                _hover={{
                                    bg: '#000000',
                                    color: 'white',
                                    transform: 'translateY(-4px) rotate(5deg)',
                                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
                                }}
                            />
                        </Link>
                        <Link href="https://discord.gg/896EhkVYbd" isExternal>
                            <IconButton
                                aria-label="Discord"
                                icon={<FaDiscord size={20} />}
                                size={{ base: 'md', md: 'lg' }}
                                variant={'social'}
                                color="#5865F2"
                                _hover={{
                                    bg: '#5865F2',
                                    color: 'white',
                                    transform: 'translateY(-4px) rotate(-5deg)',
                                    boxShadow:
                                        '0 8px 16px rgba(88, 101, 242, 0.3)',
                                }}
                                transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                            />
                        </Link>
                        <Link
                            href="https://warpcast.com/stackedpoker"
                            isExternal
                        >
                            <IconButton
                                aria-label="Warpcast"
                                icon={<SiFarcaster size={20} />}
                                size={{ base: 'md', md: 'lg' }}
                                variant={'social'}
                                color="#855DCD"
                                _hover={{
                                    bg: '#855DCD',
                                    color: 'white',
                                    transform: 'translateY(-4px) rotate(5deg)',
                                    boxShadow:
                                        '0 8px 16px rgba(133, 93, 205, 0.3)',
                                }}
                                transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                            />
                        </Link>
                    </Flex>

                    {/* Decorative Element - Bottom Corner Accent */}
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
                    />
                </Stack>
            </Flex>
        </Flex>
    );
};

export default HomeCard;
