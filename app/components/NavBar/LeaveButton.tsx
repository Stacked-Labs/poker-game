'use client';

import { Tooltip, IconButton, Icon } from '@chakra-ui/react';
import { FiLogOut } from 'react-icons/fi';

interface LeaveButtonProps {
    isUserSeated: boolean;
    isLeaveRequested: boolean;
    handleLeaveTable: () => void;
}

const LeaveButton = ({
    isUserSeated,
    isLeaveRequested,
    handleLeaveTable,
}: LeaveButtonProps) => {
    if (!isUserSeated) return null;

    return (
        <Tooltip
            label={
                isLeaveRequested ? 'Leaving after this hand...' : 'Leave Table'
            }
        >
            <IconButton
                icon={<Icon as={FiLogOut} boxSize={{ base: 5, md: 6 }} />}
                aria-label="Leave Table"
                size="lg"
                onClick={handleLeaveTable}
                isDisabled={isLeaveRequested}
                bg={isLeaveRequested ? 'gray.300' : 'brand.pink'}
                color="white"
                border="none"
                borderRadius="12px"
                opacity={isLeaveRequested ? 0.6 : 1}
                _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(235, 11, 92, 0.4)',
                }}
                _disabled={{
                    cursor: 'not-allowed',
                }}
                transition="all 0.2s ease"
            />
        </Tooltip>
    );
};

export default LeaveButton;
