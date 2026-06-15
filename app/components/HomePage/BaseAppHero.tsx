'use client';

import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

/**
 * Trimmed hero shown inside the Base App in place of the marketing `HomeCard`.
 * App-first: skip the flip animation / PLAY-NOW / newsletter / socials and put
 * the lobby one tap away. The rest of the page (below the fold) is unchanged.
 */
export default function BaseAppHero() {
    const router = useRouter();
    return (
        <Box px={{ base: 4, md: 8 }} pt={{ base: 8, md: 14 }} maxW="lg">
            <Box
                bg="rgba(255, 255, 255, 0.92)"
                _dark={{
                    bg: 'rgba(28, 28, 30, 0.92)',
                    borderColor: 'whiteAlpha.200',
                }}
                borderWidth="1px"
                borderColor="blackAlpha.100"
                backdropFilter="blur(12px)"
                borderRadius="2xl"
                boxShadow="0 12px 40px rgba(0,0,0,0.12)"
                px={{ base: 6, md: 8 }}
                py={{ base: 7, md: 9 }}
            >
                <Stack spacing={5}>
                    <Heading
                        fontSize={{ base: '3xl', md: '4xl' }}
                        lineHeight={1.05}
                        color="text.primary"
                    >
                        Your{' '}
                        <Box as="span" color="brand.green">
                            Table
                        </Box>
                        .
                    </Heading>
                    <Text
                        fontSize={{ base: 'md', md: 'lg' }}
                        color="text.secondary"
                    >
                        Poker with friends, onchain. Deal in with your Base
                        wallet — no downloads, no sign-up.
                    </Text>
                    <Stack spacing={3}>
                        <Button
                            size="lg"
                            bg="brand.green"
                            color="white"
                            _hover={{ filter: 'brightness(0.92)' }}
                            _active={{ filter: 'brightness(0.88)' }}
                            onClick={() => router.push('/public-games')}
                        >
                            Browse tables
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            borderColor="brand.green"
                            color="brand.green"
                            bg="transparent"
                            _hover={{ bg: 'rgba(54, 163, 123, 0.10)' }}
                            onClick={() => router.push('/create-game')}
                        >
                            Host a table
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
}
