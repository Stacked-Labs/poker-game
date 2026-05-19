'use client';

import React from 'react';
import { Button, Icon, Tooltip, ResponsiveValue } from '@chakra-ui/react';
import { FiXCircle } from 'react-icons/fi';

interface CancelSeatRequestActionProps {
    onClick: () => void;
    width?: ResponsiveValue<string>;
    height?: ResponsiveValue<string>;
}

const CancelSeatRequestAction = ({
    onClick,
    width,
    height,
}: CancelSeatRequestActionProps) => {
    return (
        <Tooltip
            label="Cancel your pending seat request"
            placement="top"
            hasArrow
            fontSize="xs"
            bg="gray.800"
            color="white"
            borderRadius="md"
            px={2}
            py={1}
        >
            <Button
                data-testid="withdraw-cancel-seat-request-btn"
                size={{ base: 'sm', md: 'md' }}
                h={height ?? ({ base: '34px', sm: '36px', md: '40px' } as const)}
                w={width}
                px={{ base: 3.5, md: 4 }}
                borderRadius={{ base: '10px', md: '12px' }}
                fontWeight="bold"
                fontSize={{ base: 'xs', md: 'sm' }}
                letterSpacing="0.02em"
                flexShrink={0}
                leftIcon={<Icon as={FiXCircle} boxSize={{ base: 3.5, md: 4 }} />}
                iconSpacing={1.5}
                transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease, color 80ms ease"
                onClick={onClick}
                bg="brand.pink"
                color="white"
                border="none"
                boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 #950839"
                _hover={{ bg: 'brand.pink' }}
                _active={{
                    bg: 'brand.pinkDark',
                    transform: 'translateY(2px)',
                    boxShadow:
                        'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #950839',
                }}
            >
                Cancel seat request
            </Button>
        </Tooltip>
    );
};

export default CancelSeatRequestAction;
