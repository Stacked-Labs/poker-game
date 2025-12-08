'use client';

import { Tooltip, IconButton, Icon, useColorModeValue } from '@chakra-ui/react';
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
    const tooltipLabel = isLeaveRequested
        ? 'Cancel leave request'
        : 'Leave after this hand';
    const buttonLabel = isLeaveRequested
        ? 'Cancel leave request'
        : 'Leave Table';
    const defaultBg = useColorModeValue('brand.lightGray', 'charcoal.600');
    const bgColor = isLeaveRequested ? 'brand.pink' : defaultBg;
    const iconColor = isLeaveRequested ? 'white' : 'brand.pink';
    const hoverShadow = isLeaveRequested
        ? '0 4px 12px rgba(235, 11, 92, 0.4)'
        : '0 4px 12px rgba(235, 11, 92, 0.4)';

    if (!isUserSeated) return null;

    return (
        <Tooltip label={tooltipLabel}>
            <IconButton
                icon={<Icon as={FiLogOut} boxSize={{ base: 4, md: 5 }} />}
                aria-label={buttonLabel}
                aria-pressed={isLeaveRequested}
                size={{ base: 'md', md: 'md' }}
                px={2}
                py={2}
                width={{ base: '40px', sm: '40px', md: '48px' }}
                height={{ base: '40px', sm: '40px', md: '48px' }}
                onClick={handleLeaveTable}
                bg={bgColor}
                border="none"
                borderRadius="12px"
                _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: hoverShadow,
                    bg: 'brand.pink',
                }}
                _disabled={{
                    cursor: 'not-allowed',
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
