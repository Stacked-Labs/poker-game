'use client';

import { Tooltip, IconButton, Icon } from '@chakra-ui/react';
import { FiLogOut } from 'react-icons/fi';

interface LeaveButtonProps {
    isUserSeated: boolean;
    isLeaveRequested: boolean;
    handleLeaveTable: () => void;
    settlementInProgress?: boolean;
}

const TACTILE_TRANSITION =
    'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease';

const LeaveButton = ({
    isUserSeated,
    isLeaveRequested,
    handleLeaveTable,
    settlementInProgress,
}: LeaveButtonProps) => {
    const tooltipLabel = settlementInProgress
        ? 'Settlement in progress — leave unavailable'
        : isLeaveRequested
          ? 'Cancel leave request'
          : 'Leave after this hand';
    const buttonLabel = isLeaveRequested
        ? 'Cancel leave request'
        : 'Leave Table';

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
                onClick={settlementInProgress ? undefined : handleLeaveTable}
                isDisabled={settlementInProgress}
                {...(isLeaveRequested
                    ? {
                          // Queued state: solid pink tactile chip — clearly
                          // signals "leave is queued, click to cancel."
                          bg: 'brand.pink',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow:
                              'inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 #950839',
                          transition: TACTILE_TRANSITION,
                          _hover: { bg: 'brand.pink' },
                          _active: {
                              bg: 'brand.pinkDark',
                              transform: 'translateY(2px)',
                              boxShadow:
                                  'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #950839',
                          },
                      }
                    : {
                          // Idle: opaque page-toned chip so it reads against
                          // the table felt in both landscape NavBar and the
                          // portrait burger menu. Pink-icon hint signals it's
                          // a destructive action.
                          //
                          // Note: tactileChromeSolid sets its own `_dark.color`
                          // and `_dark._hover`, which would win over a plain
                          // top-level `color` / `_hover` here. Mirror the pink
                          // overrides inside `_dark` so the destructive hint
                          // survives dark mode too.
                          variant: 'tactileChromeSolid',
                          color: 'brand.pink',
                          _hover: {
                              bg: 'brand.pink',
                              color: 'white',
                              borderColor: 'brand.pink',
                          },
                          _active: {
                              bg: 'brand.pinkDark',
                              transform: 'translateY(1px)',
                              boxShadow:
                                  'inset 0 1px 2px rgba(0,0,0,0.30), 0 0 0 transparent',
                          },
                          _dark: {
                              color: 'brand.pink',
                              // Chakra replaces (does not merge) `_dark` from
                              // the variant when a component sets its own
                              // `_dark`, so re-include the variant's dark
                              // borderColor + boxShadow here.
                              borderColor: 'rgba(255,255,255,0.14)',
                              boxShadow:
                                  'inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 0 rgba(0,0,0,0.4)',
                              _hover: {
                                  bg: 'brand.pink',
                                  color: 'white',
                                  borderColor: 'brand.pink',
                              },
                              _active: {
                                  bg: 'brand.pinkDark',
                                  transform: 'translateY(1px)',
                                  boxShadow:
                                      'inset 0 1px 2px rgba(0,0,0,0.30), 0 0 0 transparent',
                              },
                          },
                      })}
            />
        </Tooltip>
    );
};

export default LeaveButton;
