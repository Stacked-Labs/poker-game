'use client';

import Link from 'next/link';
import {
    Box,
    Flex,
    HStack,
    Icon,
    Skeleton,
    Text,
    Button,
    VStack,
    useColorModeValue,
    usePrefersReducedMotion,
} from '@chakra-ui/react';
import { FiPlus, FiUsers, FiFilter } from 'react-icons/fi';

interface EmptyStateProps {
    variant: 'loading' | 'error' | 'empty' | 'filtered';
    onRetry?: () => void;
    onClear?: () => void;
}

// Vary the name-bar widths a touch so the skeleton reads as real rows, not a
// perfectly uniform grid.
const NAME_WIDTHS = ['44%', '38%', '50%', '35%', '46%', '40%'];

export default function EmptyState({ variant, onRetry, onClear }: EmptyStateProps) {
    const ruleColor = useColorModeValue('rgba(11, 20, 48, 0.06)', 'rgba(255, 255, 255, 0.06)');
    const prefersReducedMotion = usePrefersReducedMotion();
    const skeletonSpeed = prefersReducedMotion ? 0 : 1.4;
    const iconBg = useColorModeValue('rgba(54, 163, 123, 0.10)', 'rgba(54, 163, 123, 0.18)');

    if (variant === 'loading') {
        // Mirrors PublicGameCard's column rhythm (dot · stakes · identity · seats ·
        // age) so the list doesn't jump when real rows arrive.
        return (
            <Box w="full" aria-busy="true" aria-label="Loading public games">
                {NAME_WIDTHS.map((nameW, i) => (
                    <HStack
                        key={i}
                        px={{ base: 3, md: 6 }}
                        py={{ base: 3, md: 3.5 }}
                        spacing={{ base: 3, md: 4 }}
                        minH={{ base: '68px', md: 'auto' }}
                        align="center"
                        borderBottom={i === NAME_WIDTHS.length - 1 ? 'none' : '1px solid'}
                        borderColor={ruleColor}
                    >
                        <Skeleton boxSize="10px" borderRadius="full" speed={skeletonSpeed} flexShrink={0} />
                        {/* stakes (desktop) */}
                        <Box flex="1.4" display={{ base: 'none', md: 'block' }}>
                            <Skeleton h="14px" w="88px" borderRadius="6px" speed={skeletonSpeed} />
                        </Box>
                        {/* identity (both) */}
                        <Box flex={{ base: '1', md: '2.2' }} minW={0}>
                            <Skeleton h="13px" w={nameW} borderRadius="6px" speed={skeletonSpeed} />
                            <Skeleton h="9px" w="30%" borderRadius="6px" speed={skeletonSpeed} mt={2} />
                        </Box>
                        {/* seats (desktop) */}
                        <Box flex="1.2" display={{ base: 'none', md: 'block' }}>
                            <Skeleton h="12px" w="72px" borderRadius="6px" speed={skeletonSpeed} />
                        </Box>
                        {/* age (desktop) */}
                        <Skeleton
                            display={{ base: 'none', md: 'block' }}
                            h="10px"
                            w="30px"
                            borderRadius="6px"
                            speed={skeletonSpeed}
                            flexShrink={0}
                        />
                        {/* seats + age (mobile) */}
                        <VStack display={{ base: 'flex', md: 'none' }} align="end" spacing={2} flexShrink={0}>
                            <Skeleton h="12px" w="46px" borderRadius="6px" speed={skeletonSpeed} />
                            <Skeleton h="8px" w="26px" borderRadius="6px" speed={skeletonSpeed} />
                        </VStack>
                    </HStack>
                ))}
            </Box>
        );
    }

    if (variant === 'error') {
        return (
            <Flex
                w="full"
                direction="column"
                align="center"
                py={{ base: 12, md: 16 }}
                px={4}
                gap={4}
                textAlign="center"
            >
                <Text
                    color="text.secondary"
                    fontSize={{ base: 'md', md: 'lg' }}
                    fontWeight="bold"
                >
                    Unable to load games. Please try again.
                </Text>
                <Button
                    variant="tactilePrimary"
                    borderRadius="14px"
                    onClick={onRetry}
                    minH="44px"
                    px={6}
                >
                    Retry
                </Button>
            </Flex>
        );
    }

    if (variant === 'filtered') {
        return (
            <Flex
                w="full"
                direction="column"
                align="center"
                py={{ base: 12, md: 16 }}
                px={4}
                gap={4}
                textAlign="center"
            >
                <Flex
                    align="center"
                    justify="center"
                    boxSize="56px"
                    borderRadius="full"
                    bg={iconBg}
                    aria-hidden
                >
                    <Icon as={FiFilter} boxSize="22px" color="brand.green" />
                </Flex>
                <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" color="text.primary">
                    No tables match these filters
                </Text>
                <Text color="text.secondary" fontSize="sm" lineHeight={1.6} maxW="420px">
                    Nothing live at this stake or type right now. Try a wider filter,
                    or check back in a minute as new tables open.
                </Text>
                <Button
                    onClick={onClear}
                    variant="tactileNeutral"
                    borderRadius="14px"
                    minH="44px"
                    px={6}
                >
                    Clear filters
                </Button>
            </Flex>
        );
    }

    return (
        <Flex
            w="full"
            direction="column"
            align="center"
            py={{ base: 12, md: 16 }}
            px={4}
            gap={4}
            textAlign="center"
        >
            <Flex
                align="center"
                justify="center"
                boxSize="56px"
                borderRadius="full"
                bg={iconBg}
                aria-hidden
            >
                <Icon as={FiUsers} boxSize="24px" color="brand.green" />
            </Flex>
            <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                fontWeight="bold"
                color="text.primary"
            >
                No cash games running right now
            </Text>
            <Text
                color="text.secondary"
                fontSize="sm"
                lineHeight={1.6}
                maxW="440px"
            >
                Every table here is opened by a player, and every seat needs the
                Host&apos;s approval. Start your own table, or check back in a minute,
                new ones show up the moment a host opens one.
            </Text>
            <Button
                as={Link}
                href="/create-game"
                leftIcon={<FiPlus />}
                variant="tactilePrimary"
                borderRadius="14px"
                minH="44px"
                px={6}
            >
                Host a Table
            </Button>
        </Flex>
    );
}
