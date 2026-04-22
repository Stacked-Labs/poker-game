'use client';

import { Tooltip, IconButton, Icon } from '@chakra-ui/react';
import { FiLogOut } from 'react-icons/fi';

interface LeaveButtonProps {
    isUserSeated: boolean;
    isLeaveRequested: boolean;
    handleLeaveTable: () => void;
    settlementStuck?: boolean;
}

const LeaveButton = ({
    isUserSeated,
    isLeaveRequested,
    handleLeaveTable,
    settlementStuck,
}: LeaveButtonProps) => {
    const tooltipLabel = settlementStuck
        ? 'Settlement in progress — leave unavailable'
        : isLeaveRequested
          ? 'Cancel leave request'
          : 'Leave after this hand';
    const buttonLabel = isLeaveRequested
        ? 'Cancel leave request'
        : 'Leave Table';
    const bgColor = isLeaveRequested ? 'brand.pink' : 'btn.lightGray';
    const iconColor = isLeaveRequested ? 'white' : 'brand.pink';
    const hoverShadow = isLeaveRequested
        ? '0 4px 12px rgba(235, 11, 92, 0.4)'
        : '0 4px 12px rgba(235, 11, 92, 0.4)';

    if (!isUserSeated) return null;

    return (
        <Tooltip label={tooltipLabel}>
            <IconButton
                data-testid="leave-table-btn"
                icon={<Icon as={FiLogOut} boxSize={{ base: 4, md: 5 }} />}
                aria-label={buttonLabel}
                aria-pressed={isLeaveRequested}
                size={{ base: 'md', md: 'md' }}
                px={2}
                py={2}
                width={{ base: '40px', sm: '40px', md: '48px' }}
                height={{ base: '40px', sm: '40px', md: '48px' }}
                onClick={settlementStuck ? undefined : handleLeaveTable}
                isDisabled={settlementStuck}
                bg={settlementStuck ? 'gray.300' : bgColor}
                border="none"
                borderRadius="12px"
                _hover={settlementStuck ? {} : {
                    transform: 'translateY(-2px)',
                    boxShadow: hoverShadow,
                    bg: 'brand.pink',
                }}
                _disabled={{
                    cursor: 'not-allowed',
                    opacity: 0.5,
                }}
                sx={{
                    svg: {
                        color: iconColor,
                        transition: 'color 0.2s ease',
                    },
                    '&:hover svg': {
                        color: 'white',
                    },
                }}
                transition="all 0.2s ease"
            />
        </Tooltip>
    );
};

export default LeaveButton;
