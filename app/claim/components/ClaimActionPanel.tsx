'use client';

import React from 'react';
import {
    Button,
    Flex,
    HStack,
    Icon,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FaCheck, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import WalletButton from '@/app/components/WalletButton';

type ActionState =
    | 'no-wallet'
    | 'loading'
    | 'eligible'
    | 'claimed'
    | 'just-claimed'
    | 'not-eligible';

interface ClaimActionPanelProps {
    state: ActionState;
    claiming?: boolean;
    onClaim?: () => void;
}

const ClaimActionPanel: React.FC<ClaimActionPanelProps> = ({
    state,
    claiming,
    onClaim,
}) => {
    if (state === 'no-wallet') {
        return (
            <VStack spacing={4} align={{ base: 'center', md: 'start' }} w="full">
                <Text fontSize={{ base: 'sm', md: 'md' }} color="text.secondary">
                    Connect a wallet to check eligibility.
                </Text>
                <WalletButton />
            </VStack>
        );
    }

    if (state === 'loading') {
        return (
            <Flex w="full" justify={{ base: 'center', md: 'flex-start' }} py={3}>
                <Spinner size="md" color="brand.yellow" />
            </Flex>
        );
    }

    if (state === 'eligible') {
        return (
            <Button
                variant="tactilePrimary"
                w={{ base: 'full', md: 'auto' }}
                minW={{ md: '260px' }}
                size="lg"
                isLoading={claiming}
                loadingText="Minting"
                onClick={onClaim}
                color="white"
                _hover={{ color: 'white' }}
                _active={{ color: 'white' }}
                _focus={{ color: 'white' }}
                _loading={{ color: 'white' }}
            >
                <Text
                    as="span"
                    fontSize={{ base: 'md', md: 'lg' }}
                    fontWeight={800}
                    color="white"
                >
                    Claim your badge
                </Text>
            </Button>
        );
    }

    if (state === 'claimed' || state === 'just-claimed') {
        return (
            <VStack spacing={4} align={{ base: 'center', md: 'start' }} w="full">
                <HStack spacing={2.5} align="center">
                    <Flex
                        w="28px"
                        h="28px"
                        borderRadius="full"
                        bg="brand.green"
                        align="center"
                        justify="center"
                    >
                        <Icon as={FaCheck} color="white" boxSize="12px" />
                    </Flex>
                    <Text
                        fontSize={{ base: 'md', md: 'lg' }}
                        fontWeight={800}
                        color="brand.green"
                    >
                        Badge minted
                    </Text>
                </HStack>
                {state === 'just-claimed' && (
                    <Link
                        href="/leaderboard"
                        style={{ textDecoration: 'none', width: '100%' }}
                    >
                        <Button
                            variant="tactilePrimary"
                            w={{ base: 'full', md: 'auto' }}
                            minW={{ md: '260px' }}
                            size="md"
                            rightIcon={<Icon as={FaArrowRight} boxSize="12px" color="white" />}
                            color="white"
                            _hover={{ color: 'white' }}
                            _active={{ color: 'white' }}
                            _focus={{ color: 'white' }}
                        >
                            <Text as="span" fontWeight={800} color="white">
                                Verify quest, earn points
                            </Text>
                        </Button>
                    </Link>
                )}
            </VStack>
        );
    }

    // not-eligible
    return (
        <VStack
            spacing={3}
            align={{ base: 'center', md: 'start' }}
            w="full"
            p={5}
            borderRadius="12px"
            bg="rgba(253, 197, 29, 0.08)"
            _dark={{ bg: 'rgba(253, 197, 29, 0.10)' }}
        >
            <Text
                fontSize={{ base: 'sm', md: 'md' }}
                color="text.primary"
                textAlign={{ base: 'center', md: 'left' }}
                lineHeight="1.55"
            >
                This wallet isn&apos;t on the list yet. Climb the leaderboard, or
                reach out through a partner contact.
            </Text>
            <Link href="/leaderboard" style={{ textDecoration: 'none' }}>
                <HStack
                    spacing={2}
                    cursor="pointer"
                    _hover={{ textDecoration: 'underline' }}
                >
                    <Text fontSize="sm" fontWeight={700} color="brand.green">
                        Open leaderboard
                    </Text>
                    <Icon as={FaArrowRight} boxSize="12px" color="brand.green" />
                </HStack>
            </Link>
        </VStack>
    );
};

export default ClaimActionPanel;
