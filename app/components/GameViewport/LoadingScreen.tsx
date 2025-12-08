'use client';

import { Flex, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionFlex = motion(Flex);
const MotionText = motion(Text);

const LoadingScreen = () => {
    return (
        <MotionFlex
            key="loading-screen"
            justify="center"
            align="center"
            position="fixed"
            inset={0}
            zIndex={9999}
            bg="rgba(0, 0, 0, 0.3)"
            backdropFilter="blur(10px)"
            sx={{
                WebkitBackdropFilter: 'blur(10px)',
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
            <MotionText
                color="text.white"
                fontSize="min(15vw, 15vh)"
                fontWeight="extrabold"
                letterSpacing="0.05em"
                textShadow="2px 2px 10px rgba(0,0,0,0.5)"
            >
                {'LOADING'.split('').map((char, index) => (
                    <span
                        key={`${char}-${index}`}
                        className={`loading-letter loading-variant-${index % 8}`}
                        style={{ animationDelay: `${index * 700}ms` }}
                    >
                        {char}
                    </span>
                ))}
            </MotionText>
        </MotionFlex>
    );
};

export default LoadingScreen;

