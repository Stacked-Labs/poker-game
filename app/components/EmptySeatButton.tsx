import React, { useState } from 'react';
import { Button, Spinner, useDisclosure, Text } from '@chakra-ui/react';
import TakeSeatModal from './TakeSeatModal';
import { motion } from 'framer-motion';

const MotionButton = motion(Button);

const EmptySeatButton = ({
    seatId,
    disabled,
}: {
    seatId: number;
    disabled: boolean;
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <MotionButton
                className="empty-seat-button"
                width={'100%'}
                height={'100%'}
                bgColor="transparent"
                onClick={onOpen}
                isLoading={isLoading}
                textColor="white"
                borderRadius={10}
                spinner={<Spinner color="green.100" size="lg" />}
                border="2px dashed white"
                fontSize={['2xl', '3xl', '4xl']}
                fontFamily="sans-serif"
                _hover={{ bg: 'transparent' }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                isDisabled={disabled}
                position="relative"
            >
                <Text
                    position="absolute"
                    top="2"
                    left="2"
                    fontSize="sm"
                    color="white"
                >
                    {seatId}
                </Text>
                {isHovered ? (
                    <Text
                        color="white"
                        fontFamily="Poppins, sans-serif"
                        fontWeight="700"
                        opacity="0.7"
                    >
                        SIT
                    </Text>
                ) : (
                    ''
                )}
            </MotionButton>
            <TakeSeatModal isOpen={isOpen} onClose={onClose} seatId={seatId} />
        </>
    );
};

export default EmptySeatButton;
// test commit
// test commit
// test commit
