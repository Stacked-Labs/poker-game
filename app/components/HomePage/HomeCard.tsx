'use client';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
    weight: ['700'],
    subsets: ['latin'],
    display: 'swap',
});

import { Flex, Button, IconButton, Text, Stack, Link } from '@chakra-ui/react';
import { RiTwitterXLine } from 'react-icons/ri';
import { FaDiscord } from 'react-icons/fa';
import { SiFarcaster } from 'react-icons/si'; // Imported SiFarcaster from react-icons/si
import Web3Button from '@/app/components/Web3Button';

const HomeCard = () => {
    return (
        <Flex
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            width="100%"
            p={4}
        >
            <Flex
                flexDirection="column"
                justifyContent="space-between"
                gap={[6, 6, 8]}
                borderRadius={['40px']}
                width={['100%', '90%', '80%', '70%']}
                maxWidth="600px"
                minWidth="250px"
                minHeight="300px"
                height="fit-content"
                bgColor="gray.100"
                padding={[8, 12, 16]}
                boxShadow="xl"
            >
                <Stack gap={12} flex={1} justifyContent="flex-start">
                    <Text
                        className={poppins.className}
                        fontSize={['4xl', '5xl', '6xl']}
                        textAlign="center"
                        fontWeight={700}
                        color="white"
                        whiteSpace="nowrap"
                    >
                        Stacked
                    </Text>

                    <Button
                        variant="homeSectionButton"
                        bg="green.500"
                        _hover={{ bg: 'green.600' }}
                        size={['xl']}
                        py={8}
                        as={'a'}
                        fontSize={['xl']}
                        href="/create-game"
                    >
                        Play Now
                    </Button>

                    <Web3Button size={['xl']} />
                </Stack>

                <Flex
                    direction="row"
                    justify="space-evenly" // Evenly distribute the icons
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
                    <Link href="https://discord.gg/R42388MfDd" isExternal>
                        <IconButton
                            aria-label="Discord"
                            variant="social"
                            icon={<FaDiscord size={36} />}
                            size="lg"
                            transition="transform 0.2s"
                            _hover={{ transform: 'scale(1.1)' }}
                        />
                    </Link>
                    <Link href="https://warpcast.com/stackedpoker" isExternal>
                        <IconButton
                            aria-label="Warpcast"
                            variant="social"
                            icon={<SiFarcaster size={36} />} // Using SiFarcaster icon
                            size="lg"
                            transition="transform 0.2s"
                            _hover={{ transform: 'scale(1.1)' }}
                        />
                    </Link>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default HomeCard;
