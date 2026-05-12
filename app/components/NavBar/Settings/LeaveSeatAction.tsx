'use client';

import React from 'react';
import { Button, Icon, Tooltip, ResponsiveValue } from '@chakra-ui/react';
import { FiLogOut } from 'react-icons/fi';

interface LeaveSeatActionProps {
    onClick: () => void;
    isLeaveRequested: boolean;
    settlementStuck: boolean;
    width?: ResponsiveValue<string>;
    height?: ResponsiveValue<string>;
}

const LeaveSeatAction = ({
    onClick,
    isLeaveRequested,
    settlementStuck,
    width,
    height,
}: LeaveSeatActionProps) => {
    const tooltipLabel = settlementStuck
        ? 'Settlement in progress — leave unavailable'
        : isLeaveRequested
          ? 'Cancel leave request'
          : 'Leave after this hand';

    const sharedProps = {
        size: { base: 'sm', md: 'md' } as const,
        h: height ?? ({ base: '34px', sm: '36px', md: '40px' } as const),
        w: width,
        px: { base: 3.5, md: 4 } as const,
        borderRadius: { base: '10px', md: '12px' } as const,
        fontWeight: 'bold' as const,
        fontSize: { base: 'xs', md: 'sm' } as const,
        letterSpacing: '0.02em',
        flexShrink: 0,
        leftIcon: <Icon as={FiLogOut} boxSize={{ base: 3.5, md: 4 }} />,
        iconSpacing: 1.5,
        transition:
            'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease, color 80ms ease',
    };

    return (
        <Tooltip
            label={tooltipLabel}
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
                {...sharedProps}
                onClick={settlementStuck ? undefined : onClick}
                isDisabled={settlementStuck}
                {...(isLeaveRequested
                    ? {
                          bg: 'brand.pink',
                          color: 'white',
                          border: 'none',
                          boxShadow:
                              'inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 #950839',
                          _hover: { bg: 'brand.pink' },
                          _active: {
                              bg: 'brand.pinkDark',
                              transform: 'translateY(2px)',
                              boxShadow:
                                  'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #950839',
                          },
                      }
                    : {
                          bg: 'transparent',
                          color: 'brand.pink',
                          border: '2px solid',
                          borderColor: 'brand.pink',
                          boxShadow: 'none',
                          _hover: { bg: 'brand.pink', color: 'white' },
                          _active: {
                              bg: 'brand.pinkDark',
                              color: 'white',
                              transform: 'translateY(1px)',
                          },
                      })}
            >
                {isLeaveRequested ? 'Cancel leave' : 'Leave seat'}
            </Button>
        </Tooltip>
    );
};

export default LeaveSeatAction;
