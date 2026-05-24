'use client';

import React from 'react';
import { Box, Image, Text, VStack } from '@chakra-ui/react';
import ExternalLink from '@/app/components/ExternalLink';

interface BadgeArtifactProps {
    image: string;
    name: string;
    address?: string;
    explorerURL?: string | null;
}

const shorten = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

const BadgeArtifact: React.FC<BadgeArtifactProps> = ({
    image,
    name,
    address,
    explorerURL,
}) => {
    return (
        <VStack spacing={6} align="center" w="full">
            <Box
                w="full"
                maxW={{ base: '300px', md: '380px' }}
                borderRadius="18px"
                overflow="hidden"
                bg="card.lightGray"
                boxShadow="0 0 0 1px rgba(11, 20, 48, 0.08)"
                _dark={{ boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.08)' }}
            >
                <Image src={image} alt={name} w="full" h="auto" display="block" />
            </Box>

            {address && (
                <VStack spacing={1.5} align="center">
                    <Text
                        fontSize="xs"
                        fontWeight={700}
                        color="text.secondary"
                        textTransform="uppercase"
                        letterSpacing="0.14em"
                    >
                        Issued to
                    </Text>
                    <Text
                        fontSize="sm"
                        color="text.primary"
                        letterSpacing="0.02em"
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        {shorten(address)}
                    </Text>
                </VStack>
            )}

            {explorerURL && (
                <ExternalLink href={explorerURL} fontSize="sm" iconSize="11px">
                    View on chain
                </ExternalLink>
            )}
        </VStack>
    );
};

export default BadgeArtifact;
