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

// Tactile transition shared across all states.
const TACTILE_TRANSITION =
    'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease';

const AwayButton = ({
    isAway,
    sitOutNextHand,
    readyNextHand,
    handleReturnReady,
    handleSitOutNext,
    handleCancelRejoin,
}: AwayButtonProps) => {
    // State 1: Away & Requested to Rejoin -> Show "Cancel Rejoin"
    // Solid green tactile chip — signals "rejoin queued, click to cancel."
    if (isAway && readyNextHand) {
        return (
            <Tooltip
                label="Cancel request to rejoin"
                aria-label="Cancel rejoin"
            >
                <IconButton
                    data-testid="away-btn"
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
                    boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 #22674E"
                    transition={TACTILE_TRANSITION}
                    _hover={{ bg: 'brand.green' }}
                    _active={{
                        bg: 'brand.greenDark',
                        transform: 'translateY(2px)',
                        boxShadow:
                            'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #22674E',
                    }}
                />
            </Tooltip>
        );
    }

    // State 2: Away & Not Requested -> Show "I'm Back"
    // Solid green tactile chip — primary action to return.
    if (isAway) {
        return (
            <Tooltip label="I'm back" aria-label="I'm back">
                <IconButton
                    data-testid="away-btn"
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
                    boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 #22674E"
                    transition={TACTILE_TRANSITION}
                    _hover={{ bg: 'brand.green' }}
                    _active={{
                        bg: 'brand.greenDark',
                        transform: 'translateY(2px)',
                        boxShadow:
                            'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #22674E',
                    }}
                />
            </Tooltip>
        );
    }

    // State 3: Playing & Sit Out Next -> Show "Cancel Sit Out" (solid pink)
    // State 4: Playing & Normal       -> Show "Sit Out Next" (idle chrome)
    const isSitOutNext = sitOutNextHand;

    return (
        <Tooltip
            label={
                isSitOutNext ? 'Cancel sit out request' : 'Sit out next hand'
            }
            aria-label="Away toggle"
        >
            <IconButton
                data-testid="away-btn"
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
                {...(isSitOutNext
                    ? {
                          // Active toggle: solid pink tactile chip.
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
                          // Idle chrome — opaque page-toned chip so it reads
                          // against the table felt in landscape NavBar and in
                          // the portrait burger menu without a container.
                          variant: 'tactileChromeSolid',
                      })}
            />
        </Tooltip>
    );
};

export default AwayButton;
