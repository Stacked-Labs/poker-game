import React, { useState } from 'react';
import { Button, useDisclosure, Spinner, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { User } from '../interfaces';

const MotionButton = motion(Button);

const TakenSeatButton = ({ player }: { player: User }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <MotionButton
                w={['100%', '150px', '150px', '100%']}
                h={['40px', '100%']}
                color="gray.200"
                bgColor="gray.50"
                onClick={onOpen}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                isLoading={isLoading}
                textColor="white"
                borderRadius={10}
                spinner={<Spinner color="green.100" size="lg" />}
                border="2px dashed white"
                fontFamily="sans-serif"
                flexDirection={'column'}
            >
                <Text fontWeight={'bold'} fontSize={['14px', '16px', '24px']}>
                    {player.username}
                </Text>
                <Text fontSize={['14px', '16px', '24px']}>{player.amount}</Text>
            </MotionButton>
        </>
    );
};

export default TakenSeatButton;
