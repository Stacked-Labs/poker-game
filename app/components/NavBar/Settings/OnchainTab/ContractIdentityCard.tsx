'use client';

import { Box, Flex, HStack, Image, Text } from '@chakra-ui/react';
import { FiShield } from 'react-icons/fi';
import SectionCard from './SectionCard';
import AddressChip from './AddressChip';
import { chainDisplayName } from '@/app/hooks/useExplorerUrl';

interface ContractIdentityCardProps {
    contractAddress: string;
    gameCreator: string | null;
    chain: string | null | undefined;
    contractExplorerUrl: string | null;
    creatorExplorerUrl: string | null;
}

const ContractIdentityCard = ({
    contractAddress,
    gameCreator,
    chain,
    contractExplorerUrl,
    creatorExplorerUrl,
}: ContractIdentityCardProps) => {
    const chainName = chainDisplayName(chain);
    const isTestnet = chain?.toLowerCase().includes('sepolia');

    return (
        <SectionCard
            icon={FiShield}
            title="Contract"
            subtitle="This table is its own smart contract. Stacked can't move funds — only you and the contract's settlement logic can."
            accent="navy"
            headerRight={
                chainName ? (
                    <HStack
                        spacing={1.5}
                        bg={isTestnet ? 'rgba(237, 137, 54, 0.12)' : 'rgba(54, 163, 123, 0.10)'}
                        color={isTestnet ? 'orange.600' : 'brand.green'}
                        _dark={{
                            bg: isTestnet
                                ? 'rgba(237, 137, 54, 0.15)'
                                : 'rgba(54, 163, 123, 0.18)',
                            color: isTestnet ? 'orange.300' : 'brand.green',
                        }}
                        borderRadius="full"
                        px={2.5}
                        py={1}
                        fontSize="2xs"
                        fontWeight="bold"
                        letterSpacing="0.04em"
                        textTransform="uppercase"
                    >
                        <Image
                            src="/networkLogos/base-logo.png"
                            alt="Base"
                            boxSize="12px"
                        />
                        <Text>{chainName}</Text>
                    </HStack>
                ) : null
            }
        >
            <Flex direction="column" gap={2.5}>
                <Row label="Contract">
                    <AddressChip
                        address={contractAddress}
                        explorerUrl={contractExplorerUrl}
                    />
                </Row>
                {gameCreator && (
                    <Row
                        label="Host"
                        hint="Earns 25% of rake on real-money tables they create."
                    >
                        <AddressChip
                            address={gameCreator}
                            explorerUrl={creatorExplorerUrl}
                        />
                    </Row>
                )}
            </Flex>
        </SectionCard>
    );
};

const Row = ({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
}) => (
    <Flex
        align={{ base: 'flex-start', sm: 'center' }}
        justify="space-between"
        gap={3}
        direction={{ base: 'column', sm: 'row' }}
    >
        <Box minW={0}>
            <Text
                fontSize="2xs"
                fontWeight="semibold"
                color="text.muted"
                textTransform="uppercase"
                letterSpacing="0.04em"
            >
                {label}
            </Text>
            {hint && (
                <Text fontSize="2xs" color="text.muted" opacity={0.7} mt={0.5}>
                    {hint}
                </Text>
            )}
        </Box>
        {children}
    </Flex>
);

export default ContractIdentityCard;
