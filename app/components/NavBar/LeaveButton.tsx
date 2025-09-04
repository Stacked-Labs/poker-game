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
                icon={<Icon as={FiLogOut} boxSize={{ base: 5, md: 8 }} />}
                aria-label="Leave Table"
                size={'lg'}
                colorScheme={isLeaveRequested ? 'gray' : 'red'}
                onClick={handleLeaveTable}
                isDisabled={isLeaveRequested}
                opacity={isLeaveRequested ? 0.6 : 1}
                variant={'outlined'}
            />
        </Tooltip>
    );
};

export default LeaveButton;
