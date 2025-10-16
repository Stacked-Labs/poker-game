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
                        boxSize={{ base: 5, md: 8 }}
                    />
                }
                aria-label={isAway ? "I'm back" : 'Sit out next hand'}
                size={'lg'}
                onClick={isAway ? handleReturnReady : handleSitOutNext}
                isDisabled={!isAway && sitOutPending}
                colorScheme={isAway ? 'green' : undefined}
                bg={'gray.200'}
            />
        </Tooltip>
    );
};

export default AwayButton;
