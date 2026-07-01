'use client';

import {
    Box,
    Container,
    Flex,
    Grid,
    GridItem,
    HStack,
    Skeleton,
    SkeletonCircle,
    VStack,
} from '@chakra-ui/react';
import { useWarmSkeleton } from '@/app/components/Skeletons/useWarmSkeleton';

// Mirrors the bento silhouette so a cold load resolves into shape (no CLS). Lighter + calmer
// than Chakra's default cool-gray pulse: warm low-contrast colors, gentler speed, still on
// reduced-motion.
export default function ProfileSkeleton() {
    const sk = useWarmSkeleton();

    const Tile = ({ lines = 3 }: { lines?: number }) => (
        <Box
            bg="card.white"
            border="1px solid"
            borderColor="border.felt"
            borderRadius="20px"
            p={{ base: 4, md: 5 }}
            h="full"
        >
            <Skeleton h="10px" w="40%" borderRadius="md" mb={4} {...sk} />
            <VStack align="stretch" spacing={3}>
                {Array.from({ length: lines }).map((_, i) => (
                    <Skeleton key={i} h="14px" w={`${90 - i * 12}%`} borderRadius="md" {...sk} />
                ))}
            </VStack>
        </Box>
    );

    return (
        <Container maxW="container.xl" py={{ base: 5, md: 8 }}>
            <VStack align="stretch" spacing={4}>
                {/* Hero band */}
                <Box
                    bg="card.white"
                    borderRadius="24px"
                    border="1px solid"
                    borderColor="border.felt"
                    boxShadow="card.lift"
                    p={{ base: 5, md: 6 }}
                >
                    <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" gap={{ base: 5, md: 8 }}>
                        <HStack spacing={{ base: 4, md: 5 }} flex={{ md: 1 }}>
                            <SkeletonCircle size="80px" flexShrink={0} {...sk} />
                            <VStack align="start" spacing={2} flex={1}>
                                <Skeleton h="22px" w="55%" borderRadius="md" {...sk} />
                                <Skeleton h="14px" w="80%" borderRadius="md" {...sk} />
                                <Skeleton h="12px" w="40%" borderRadius="md" {...sk} />
                            </VStack>
                        </HStack>
                        <VStack align={{ base: 'start', md: 'end' }} spacing={2}>
                            <Skeleton h="12px" w="64px" borderRadius="md" {...sk} />
                            <Skeleton h="32px" w="120px" borderRadius="md" {...sk} />
                        </VStack>
                    </Flex>
                </Box>

                {/* Bento tiles */}
                <Grid templateColumns="repeat(12, 1fr)" gap={4}>
                    <GridItem colSpan={{ base: 12, lg: 6 }}><Tile lines={4} /></GridItem>
                    <GridItem colSpan={{ base: 12, lg: 6 }}><Tile lines={3} /></GridItem>
                    <GridItem colSpan={{ base: 12, lg: 8 }}><Tile lines={3} /></GridItem>
                    <GridItem colSpan={{ base: 12, lg: 4 }}><Tile lines={2} /></GridItem>
                </Grid>
            </VStack>
        </Container>
    );
}
