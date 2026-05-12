'use client';

import { useState } from 'react';
import { HStack, Icon, IconButton, Text, Tooltip } from '@chakra-ui/react';
import { FiCheck, FiCopy, FiExternalLink } from 'react-icons/fi';
import ExternalLink from '@/app/components/ExternalLink';
import { truncateAddress } from './formatters';
import { useCopy } from '@/app/hooks/useExplorerUrl';

interface AddressChipProps {
    address: string;
    explorerUrl?: string | null;
    label?: string;
    showCopy?: boolean;
}

const AddressChip = ({
    address,
    explorerUrl,
    label,
    showCopy = true,
}: AddressChipProps) => {
    const copy = useCopy();
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const ok = await copy(address);
        if (ok) {
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
        }
    };

    const shortened = truncateAddress(address);
    const display = label ?? shortened;

    return (
        <HStack
            spacing={1.5}
            align="center"
            bg="card.lightGray"
            borderRadius="8px"
            px={2}
            py={1}
            fontFamily="mono"
            fontSize="xs"
        >
            {explorerUrl ? (
                <ExternalLink href={explorerUrl} fontSize="xs" iconSize="10px">
                    {display}
                </ExternalLink>
            ) : (
                <HStack spacing={1}>
                    <Text color="text.secondary">{display}</Text>
                    <Icon as={FiExternalLink} boxSize="10px" opacity={0.4} />
                </HStack>
            )}
            {showCopy && (
                <Tooltip
                    label={copied ? 'Copied' : 'Copy address'}
                    placement="top"
                    hasArrow
                    fontSize="2xs"
                >
                    <IconButton
                        aria-label="Copy address"
                        icon={
                            <Icon as={copied ? FiCheck : FiCopy} boxSize="11px" />
                        }
                        onClick={handleCopy}
                        size="xs"
                        variant="ghost"
                        color={copied ? 'brand.green' : 'text.muted'}
                        minW="20px"
                        h="20px"
                        _hover={{ color: 'brand.green', bg: 'transparent' }}
                    />
                </Tooltip>
            )}
        </HStack>
    );
};

export default AddressChip;
