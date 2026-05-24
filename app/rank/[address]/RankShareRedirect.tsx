'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Link as ChakraLink, Spinner, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';

export default function RankShareRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/leaderboard');
    }, [router]);

    return (
        <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
            <VStack spacing={4}>
                <Spinner size="lg" color="brand.green" />
                <ChakraLink as={NextLink} href="/leaderboard" color="brand.green" fontWeight={600}>
                    Open the leaderboard →
                </ChakraLink>
            </VStack>
        </Box>
    );
}
