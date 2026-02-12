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
                backdropFilter="blur(2px)"
                onClick={onOpen}
                isLoading={isLoading}
                color="white"
                borderRadius={{ base: '8px', md: '20px' }}
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
                    bg: 'rgba(11, 20, 48, 0.55)',
                    borderColor: 'white',
                    borderStyle: 'solid',
                    transform: 'scale(1.02)',
                    boxShadow: '0 8px 24px rgba(255, 255, 255, 0.18)',
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
                sx={{
                    '@media (orientation: portrait)': {
                        width: '90%',
                    },
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                isDisabled={disabled}
            >
                <Icon
                    as={IoPersonAddSharp}
                    boxSize={{ base: '28px', md: '36px' }}
                    color="white"
                    animation={
                        isHovered && !disabled
                            ? `${fadeIn} 0.3s ease-out`
                            : undefined
                    }
                />
            </MotionButton>
            <TakeSeatModal isOpen={isOpen} onClose={onClose} seatId={seatId} />
        </>
    );
};

export default EmptySeatButton;
