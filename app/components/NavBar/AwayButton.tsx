'use client';

import { Tooltip, IconButton, Icon } from '@chakra-ui/react';
import { FaUserCheck, FaCoffee } from 'react-icons/fa';

interface AwayButtonProps {
    isAway: boolean | undefined;
    sitOutNextHand?: boolean;
    readyNextHand?: boolean;
    handleReturnReady: () => void;
    handleSitOutNext: () => void;
    handleCancelRejoin: () => void;
}

const AwayButton = ({
    isAway,
    sitOutNextHand,
    readyNextHand,
    handleReturnReady,
    handleSitOutNext,
    handleCancelRejoin,
}: AwayButtonProps) => {
    // State 1: Away & Requested to Rejoin -> Show "Cancel Rejoin"
    if (isAway && readyNextHand) {
        return (
            <Tooltip
                label="Cancel request to rejoin"
                aria-label="Cancel rejoin"
            >
                <IconButton
                    icon={<Icon as={FaCoffee} boxSize={{ base: 4, md: 5 }} />}
                    aria-label="Cancel rejoin"
                    size={{ base: 'md', md: 'md' }}
                    px={2}
                    py={2}
                    width={{ base: '40px', sm: '40px', md: '48px' }}
                    height={{ base: '40px', sm: '40px', md: '48px' }}
                    onClick={handleCancelRejoin}
                    bg="brand.green"
                    color="white"
                    border="none"
                    borderRadius="12px"
                    _hover={{
                        bg: 'brand.navy',
                        color: 'white',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(54, 163, 123, 0.4)',
                    }}
                    transition="all 0.2s ease"
                />
            </Tooltip>
        );
    }

    // State 2: Away & Not Requested -> Show "I'm Back"
    if (isAway) {
        return (
            <Tooltip label="I'm back" aria-label="I'm back">
                <IconButton
                    icon={
                        <Icon as={FaUserCheck} boxSize={{ base: 4, md: 5 }} />
                    }
                    aria-label="I'm back"
                    size={{ base: 'md', md: 'md' }}
                    px={2}
                    py={2}
                    width={{ base: '40px', sm: '40px', md: '48px' }}
                    height={{ base: '40px', sm: '40px', md: '48px' }}
                    onClick={handleReturnReady}
                    bg="brand.green"
                    color="white"
                    border="none"
                    borderRadius="12px"
                    _hover={{
                        bg: 'brand.navy',
                        color: 'white',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(54, 163, 123, 0.4)',
                    }}
                    transition="all 0.2s ease"
                />
            </Tooltip>
        );
    }

    // State 3: Playing & Sit Out Next -> Show "Cancel Sit Out"
    // State 4: Playing & Normal -> Show "Sit Out Next Hand"
    const isSitOutNext = sitOutNextHand;

    return (
        <Tooltip
            label={
                isSitOutNext ? 'Cancel sit out request' : 'Sit out next hand'
            }
            aria-label="Away toggle"
        >
            <IconButton
                icon={<Icon as={FaCoffee} boxSize={{ base: 4, md: 5 }} />}
                aria-label={
                    isSitOutNext ? 'Cancel sit out' : 'Sit out next hand'
                }
                size={{ base: 'md', md: 'md' }}
                px={2}
                py={2}
                width={{ base: '40px', sm: '40px', md: '48px' }}
                height={{ base: '40px', sm: '40px', md: '48px' }}
                onClick={handleSitOutNext}
                bg={isSitOutNext ? 'brand.pink' : 'btn.lightGray'}
                color={isSitOutNext ? 'white' : 'text.secondary'}
                border="none"
                borderRadius="12px"
                _hover={{
                    bg: isSitOutNext ? 'brand.pink' : 'brand.navy',
                    color: 'white',
                    transform: 'translateY(-2px)',
                    boxShadow: isSitOutNext
                        ? '0 4px 12px rgba(253, 197, 29, 0.4)'
                        : '0 4px 12px rgba(51, 68, 121, 0.3)',
                }}
                transition="all 0.2s ease"
            />
        </Tooltip>
    );
};

export default AwayButton;
