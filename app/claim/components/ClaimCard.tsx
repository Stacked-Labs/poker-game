'use client';

import React from 'react';
import {
    Box,
    Button,
    Flex,
    Icon,
    Image,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FaCheck, FaArrowRight } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';
import type { Account } from 'thirdweb/wallets';
import type { SBTInfo } from '@/app/hooks/server_actions';
import WalletButton from '@/app/components/WalletButton';
import NotEligiblePanel from './NotEligiblePanel';

interface ClaimCardProps {
    account: Account | undefined;
    eligibility: { eligible: boolean; claimed: boolean } | null;
    claiming: boolean;
    onClaim: () => void;
    sbtInfo: SBTInfo | null;
    justClaimed?: boolean;
}

const FALLBACK_IMAGE = '/previews/home_preview.png';
const FALLBACK_NAME  = 'Stacked Poker Badge';

const ClaimCard: React.FC<ClaimCardProps> = ({ account, eligibility, claiming, onClaim, sbtInfo, justClaimed }) => {
    const nftImage = sbtInfo?.image || FALLBACK_IMAGE;
    const nftName  = sbtInfo?.name  || FALLBACK_NAME;
    const explorerURL = sbtInfo?.explorerURL || null;

    const renderContent = () => {
        if (!account) {
            return (
                <VStack spacing={4} align="center" py={4}>
                    <Text fontSize="sm" color="text.secondary" textAlign="center">
                        Connect your wallet to check eligibility.
                    </Text>
                    <WalletButton />
                </VStack>
            );
        }

        if (eligibility === null) {
            return (
                <Flex justify="center" py={8}>
                    <Spinner size="md" color="brand.yellow" />
                </Flex>
            );
        }

        if (eligibility.claimed) {
            return (
                <VStack spacing={5} align="center">
                    <Box position="relative">
                        <Image
                            src={nftImage}
                            alt={nftName}
                            borderRadius="16px"
                            w="180px"
                            h="180px"
                            objectFit="cover"
                            boxShadow="0 8px 32px rgba(253, 197, 29, 0.25)"
                        />
                        <Flex
                            position="absolute"
                            bottom="-10px"
                            right="-10px"
                            w="32px"
                            h="32px"
                            borderRadius="full"
                            bg="brand.green"
                            align="center"
                            justify="center"
                            boxShadow="0 2px 8px rgba(0,0,0,0.2)"
                        >
                            <Icon as={FaCheck} color="white" boxSize="14px" />
                        </Flex>
                    </Box>
                    <VStack spacing={1} align="center">
                        <Text fontSize="sm" fontWeight={800} color="brand.green">
                            You own this NFT
                        </Text>
                        <Text fontSize="xs" color="text.secondary" textAlign="center">
                            {nftName}
                        </Text>
                    </VStack>
                    {explorerURL && (
                        <Text
                            as="a"
                            href={explorerURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            fontSize="xs"
                            color="text.secondary"
                            textDecoration="underline"
                            textDecorationColor="border.lightGray"
                            textUnderlineOffset="3px"
                            cursor="pointer"
                            display="inline-flex"
                            alignItems="center"
                            gap={1}
                            transition="color 0.15s ease"
                            _hover={{ color: 'text.primary' }}
                        >
                            View on chain
                            <Icon as={FiExternalLink} boxSize="10px" />
                        </Text>
                    )}
                    {justClaimed && (
                        <Link href="/leaderboard" style={{ textDecoration: 'none', width: '100%' }}>
                            <Button
                                w="full"
                                bg="brand.green"
                                color="white"
                                fontWeight={800}
                                borderRadius="12px"
                                size="md"
                                rightIcon={<Icon as={FaArrowRight} boxSize="12px" />}
                                _hover={{ opacity: 0.9 }}
                                _active={{ transform: 'scale(0.98)' }}
                            >
                                Verify quest & earn points
                            </Button>
                        </Link>
                    )}
                </VStack>
            );
        }

        if (!eligibility.eligible) {
            return <NotEligiblePanel />;
        }

        return (
            <VStack spacing={5} align="center">
                <Image
                    src={nftImage}
                    alt={nftName}
                    borderRadius="16px"
                    w="180px"
                    h="180px"
                    objectFit="cover"
                    boxShadow="0 8px 32px rgba(253, 197, 29, 0.20)"
                />
                <VStack spacing={1} align="center">
                    <Text fontSize="md" fontWeight={800} color="text.primary">
                        {nftName}
                    </Text>
                    {sbtInfo?.description && (
                        <Text fontSize="xs" color="text.secondary" textAlign="center" maxW="260px">
                            {sbtInfo.description}
                        </Text>
                    )}
                    <Text fontSize="xs" color="text.secondary" textAlign="center">
                        Soulbound — non-transferable
                    </Text>
                </VStack>
                <Button
                    w="full"
                    bg="brand.green"
                    color="white"
                    fontWeight={800}
                    borderRadius="12px"
                    size="lg"
                    isLoading={claiming}
                    loadingText="Minting…"
                    onClick={onClaim}
                    _hover={{ opacity: 0.9 }}
                    _active={{ transform: 'scale(0.98)' }}
                >
                    Claim Your Badge
                </Button>
            </VStack>
        );
    };

    return (
        <Box
            bg="card.white"
            borderRadius="24px"
            p={{ base: 6, md: 8 }}
            boxShadow="0 14px 40px rgba(12, 21, 49, 0.12)"
            _dark={{ boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)' }}
        >
            <VStack spacing={2} mb={6} align="center">
                <Text fontSize="xl" fontWeight={900} color="text.primary" textAlign="center">
                    Claim Your NFT
                </Text>
                <Text fontSize="sm" color="text.secondary" textAlign="center">
                    Exclusive badge for Stacked Poker community members.
                </Text>
            </VStack>
            {renderContent()}
        </Box>
    );
};

export default ClaimCard;
