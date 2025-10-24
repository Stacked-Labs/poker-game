import React, { useState } from 'react';
import {
    Button,
    Spinner,
    useDisclosure,
    Text,
    Box,
    Icon,
} from '@chakra-ui/react';
import TakeSeatModal from './TakeSeatModal';
import { motion } from 'framer-motion';
import { keyframes } from '@emotion/react';
import { IoPersonAddSharp } from 'react-icons/io5';

const MotionButton = motion(Button);

// Animations
const float = keyframes`
    0%, 100% { 
        transform: translateY(0px);
    }
    50% { 
        transform: translateY(-3px);
    }
`;

const fadeIn = keyframes`
    from { 
        opacity: 0;
        transform: scale(0.9);
    }
    to { 
        opacity: 1;
        transform: scale(1);
    }
`;

const glowPulse = keyframes`
    0%, 100% { 
        box-shadow: 0 0 12px rgba(54, 163, 123, 0);
    }
    50% { 
        box-shadow: 0 0 24px rgba(54, 163, 123, 0.3);
    }
`;

const EmptySeatButton = ({
    seatId,
    disabled,
}: {
    seatId: number;
    disabled: boolean;
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <MotionButton
                className="empty-seat-button"
                width="100%"
                height="100%"
                bg="rgba(255, 255, 255, 0.05)"
                backdropFilter="blur(10px)"
                onClick={onOpen}
                isLoading={isLoading}
                color="white"
                borderRadius="20px"
                spinner={<Spinner color="brand.green" size="lg" />}
                border="2.5px dashed"
                borderColor="rgba(255, 255, 255, 0.4)"
                position="relative"
                boxShadow="inset 0 0 0 1px rgba(255, 255, 255, 0.1)"
                overflow="visible"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                gap={3}
                transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                    bg: 'rgba(54, 163, 123, 0.15)',
                    borderColor: 'brand.green',
                    borderStyle: 'solid',
                    transform: 'scale(1.02)',
                    boxShadow: '0 8px 24px rgba(54, 163, 123, 0.35)',
                }}
                _active={{
                    transform: 'scale(0.98)',
                }}
                _disabled={{
                    opacity: 0.3,
                    cursor: 'not-allowed',
                    _hover: {
                        bg: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.25)',
                        borderStyle: 'dashed',
                        transform: 'none',
                        boxShadow: 'none',
                    },
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                isDisabled={disabled}
            >
                {/* Seat Number Badge */}
                <Box
                    position="absolute"
                    top={{ base: '6px', sm: '8px', md: '12px' }}
                    left={{ base: '6px', sm: '8px', md: '12px' }}
                    bg="rgba(236, 238, 245, 0.5)"
                    backdropFilter="blur(8px)"
                    color="brand.navy"
                    fontSize={{ base: 'xs', sm: 'sm' }}
                    fontWeight="extrabold"
                    px={{ base: 2, sm: 2.5, md: 3 }}
                    py={{ base: 1, sm: 1, md: 1.5 }}
                    borderRadius="full"
                    border="2px solid white"
                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.15)"
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    minW={{ base: '24px', sm: '28px' }}
                    textAlign="center"
                >
                    {seatId}
                </Box>

                {/* Icon and Text Container */}
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={{ base: 1, sm: 1.5, md: 2 }}
                    animation={
                        !disabled && !isHovered
                            ? `${float} 3s ease-in-out infinite`
                            : undefined
                    }
                >
                    {/* Icon Circle */}
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        width={{
                            base: '40px',
                            sm: '50px',
                            md: '60px',
                            lg: '70px',
                            xl: '80px',
                        }}
                        height={{
                            base: '40px',
                            sm: '50px',
                            md: '60px',
                            lg: '70px',
                            xl: '80px',
                        }}
                        borderRadius="full"
                        bg={
                            isHovered && !disabled
                                ? 'brand.green'
                                : 'rgba(255, 255, 255, 0.1)'
                        }
                        border="2px solid"
                        borderColor={
                            isHovered && !disabled
                                ? 'white'
                                : 'rgba(255, 255, 255, 0.3)'
                        }
                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        boxShadow={
                            isHovered && !disabled
                                ? '0 8px 24px rgba(54, 163, 123, 0.5)'
                                : '0 4px 12px rgba(0, 0, 0, 0.2)'
                        }
                        animation={
                            isHovered && !disabled
                                ? `${glowPulse} 2s ease-in-out infinite`
                                : undefined
                        }
                    >
                        <Icon
                            as={IoPersonAddSharp}
                            boxSize={{
                                base: '20px',
                                sm: '24px',
                                md: '28px',
                                lg: '32px',
                                xl: '36px',
                            }}
                            color="white"
                            animation={
                                isHovered && !disabled
                                    ? `${fadeIn} 0.3s ease-out`
                                    : undefined
                            }
                        />
                    </Box>

                    {/* Hint Text */}
                    {isHovered && !disabled && (
                        <Text
                            color="white"
                            fontSize={{
                                base: '2xs',
                                sm: 'xs',
                                md: 'sm',
                                lg: 'md',
                            }}
                            fontWeight="bold"
                            textShadow="0 2px 8px rgba(0, 0, 0, 0.5)"
                            animation={`${fadeIn} 0.3s ease-out`}
                            letterSpacing="wide"
                            display={{ base: 'none', sm: 'block' }}
                        >
                            Join
                        </Text>
                    )}
                </Box>
            </MotionButton>
            <TakeSeatModal isOpen={isOpen} onClose={onClose} seatId={seatId} />
        </>
    );
};

export default EmptySeatButton;
// test commit
// test commit
// test commit
