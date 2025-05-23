'use client';
import { Poppins } from 'next/font/google';
import { useState } from 'react';

const poppins = Poppins({
    weight: ['700'],
    subsets: ['latin'],
    display: 'swap',
});

import {
    Flex,
    Button,
    IconButton,
    Text,
    Stack,
    Link,
    Spinner,
} from '@chakra-ui/react';
import { RiTwitterXLine } from 'react-icons/ri';
import { FaDiscord } from 'react-icons/fa';
import { SiFarcaster } from 'react-icons/si'; // Imported SiFarcaster from react-icons/si
import Web3Button from '@/app/components/Web3Button';
import { useRouter } from 'next/navigation';

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
            minHeight="100vh"
            width="100%"
            p={2}
        >
            <Flex
                borderRadius={['40px']}
                width={['100%', '90%', '80%', '70%']}
                maxWidth="400px"
                minWidth="250px"
                minHeight="300px"
                height="fit-content"
                bgColor="gray.100"
                boxShadow="xl"
            >
                <Stack
                    gap={12}
                    flex={1}
                    justifyContent="center"
                    alignItems={'center'}
                    paddingY={[8, 12, 16]}
                >
                    <Text
                        className={poppins.className}
                        fontSize={{ base: '5xl', lg: '4xl', xl: '5xl' }}
                        textAlign="center"
                        fontWeight={700}
                        color="white"
                        whiteSpace="nowrap"
                        maxWidth="100%"
                    >
                        Stacked
                    </Text>

                    <Stack
                        gap={12}
                        paddingX={[8, 12, 16]}
                        width={'100%'}
                        alignItems={'center'}
                    >
                        <Stack
                            gap={8}
                            width={{ sm: '70%', base: '60%', lg: '100%' }}
                        >
                            <Button
                                variant="homeSectionButton"
                                bg="green.500"
                                _hover={{ bg: 'green.600' }}
                                fontSize={{ base: 'sm', md: 'md' }}
                                onClick={handlePlayNow}
                                isLoading={isLoading}
                                loadingText="Loading"
                                spinner={<Spinner size="md" color="white" />}
                            >
                                Play Now
                            </Button>

                            <Web3Button />
                        </Stack>

                        <Flex
                            direction="row"
                            justify="space-evenly"
                            align="center"
                            width="100%"
                        >
                            <Link href="https://x.com/stacked_poker" isExternal>
                                <IconButton
                                    aria-label="X"
                                    variant="social"
                                    icon={<RiTwitterXLine size={36} />}
                                    size="lg"
                                    transition="transform 0.2s"
                                    _hover={{ transform: 'scale(1.1)' }}
                                />
                            </Link>
                            <Link
                                href="https://discord.gg/896EhkVYbd"
                                isExternal
                            >
                                <IconButton
                                    aria-label="Discord"
                                    variant="social"
                                    icon={<FaDiscord size={36} />}
                                    size="lg"
                                    transition="transform 0.2s"
                                    _hover={{ transform: 'scale(1.1)' }}
                                />
                            </Link>
                            <Link
                                href="https://warpcast.com/stackedpoker"
                                isExternal
                            >
                                <IconButton
                                    aria-label="Warpcast"
                                    variant="social"
                                    icon={<SiFarcaster size={36} />}
                                    size="lg"
                                    transition="transform 0.2s"
                                    _hover={{ transform: 'scale(1.1)' }}
                                />
                            </Link>
                        </Flex>
                    </Stack>
                </Stack>
            </Flex>
        </Flex>
    );
};

export default HomeCard;
