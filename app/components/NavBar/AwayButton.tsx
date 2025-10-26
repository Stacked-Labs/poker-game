'use client';

import { Tooltip, IconButton, Icon } from '@chakra-ui/react';
import { FaUserCheck, FaCoffee } from 'react-icons/fa';

interface AwayButtonProps {
    isAway: boolean | undefined;
    sitOutPending: boolean;
    handleReturnReady: () => void;
    handleSitOutNext: () => void;
}

const AwayButton = ({
    isAway,
    sitOutPending,
    handleReturnReady,
    handleSitOutNext,
}: AwayButtonProps) => {
    return (
        <Tooltip
            label={
                isAway
                    ? "I'm back"
                    : sitOutPending
                      ? 'Sit out requested – will apply next hand'
                      : 'Sit out next hand'
            }
            aria-label="Away toggle"
        >
            <IconButton
                icon={
                    <Icon
                        as={isAway ? FaUserCheck : FaCoffee}
                        boxSize={{ base: 5, md: 6 }}
                    />
                }
                aria-label={isAway ? "I'm back" : 'Sit out next hand'}
                size="lg"
                onClick={isAway ? handleReturnReady : handleSitOutNext}
                isDisabled={!isAway && sitOutPending}
                bg={isAway ? 'brand.green' : 'brand.lightGray'}
                color={isAway ? 'white' : 'brand.navy'}
                border="none"
                borderRadius="12px"
                _hover={{
                    bg: isAway ? 'brand.green' : 'brand.navy',
                    color: 'white',
                    transform: 'translateY(-2px)',
                    boxShadow: isAway
                        ? '0 4px 12px rgba(54, 163, 123, 0.4)'
                        : '0 4px 12px rgba(51, 68, 121, 0.3)',
                }}
                _disabled={{
                    opacity: 0.5,
                    cursor: 'not-allowed',
                }}
                transition="all 0.2s ease"
            />
        </Tooltip>
    );
};

export default AwayButton;
