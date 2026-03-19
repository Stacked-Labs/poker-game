'use client';

import { useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalCloseButton,
    ModalBody,
    Box,
    VStack,
    HStack,
    Heading,
    Text,
    Icon,
    Link,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaTelegram } from 'react-icons/fa6';

const slideUp = keyframes`
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
`;

const gradientShift = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

const pulse = keyframes`
    0% { box-shadow: 0 0 0 0 rgba(0, 136, 204, 0.5); }
    70% { box-shadow: 0 0 0 18px rgba(0, 136, 204, 0); }
    100% { box-shadow: 0 0 0 0 rgba(0, 136, 204, 0); }
`;

const shimmer = keyframes`
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
`;

interface NewsletterSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const fireConfetti = () => {
    import('canvas-confetti').then((mod) => {
        const create = mod.create;
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.inset = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '9999';
        canvas.style.pointerEvents = 'none';
        document.body.appendChild(canvas);

        const confetti = create(canvas, { resize: true });

        confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.45 },
            colors: ['#36A37B', '#FFD700', '#EB0B5C', '#0088cc', '#00BFFF'],
        });
        setTimeout(() => {
            confetti({
                particleCount: 40,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.5 },
                colors: ['#36A37B', '#FFD700', '#EB0B5C'],
            });
            confetti({
                particleCount: 40,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.5 },
                colors: ['#36A37B', '#FFD700', '#EB0B5C'],
            });
        }, 200);

        setTimeout(() => {
            canvas.remove();
        }, 4000);
    });
};

const NewsletterSuccessModal = ({
    isOpen,
    onClose,
}: NewsletterSuccessModalProps) => {
    useEffect(() => {
        if (isOpen) {
            fireConfetti();
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(8px)" />
            <ModalContent
                zIndex="modal"
                borderRadius="32px"
                maxWidth="380px"
                minWidth="320px"
                boxShadow="0 20px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)"
                animation={`${slideUp} 0.4s ease-out`}
                overflow="hidden"
                position="relative"
                border="1px solid"
                borderColor="card.white"
                mx={4}
            >
                {/* Animated Gradient Border */}
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    borderRadius="32px"
                    padding="3px"
                    bgGradient="linear(to-r, brand.pink, brand.green, brand.yellow, brand.pink)"
                    backgroundSize="200% 200%"
                    animation={`${gradientShift} 4s ease infinite`}
                    pointerEvents="none"
                    zIndex={0}
                >
                    <Box
                        width="100%"
                        height="100%"
                        bg="card.heroInnerBg"
                        borderRadius="29px"
                    />
                </Box>

                <ModalCloseButton
                    zIndex={2}
                    borderRadius="full"
                    top={4}
                    right={4}
                />

                <ModalBody
                    position="relative"
                    zIndex={1}
                    pt={10}
                    pb={8}
                    px={{ base: 6, md: 8 }}
                >
                    <VStack spacing={5}>
                        {/* Title */}
                        <VStack spacing={2}>
                            <Heading
                                fontSize={{ base: '2xl', md: '3xl' }}
                                fontWeight="900"
                                color="text.primary"
                                textAlign="center"
                                letterSpacing="-0.02em"
                            >
                                You&apos;re on the list!
                            </Heading>
                            <Text
                                fontSize="md"
                                color="text.gray600"
                                textAlign="center"
                                maxW="280px"
                                lineHeight={1.5}
                            >
                                You&apos;ve got a seat at the table. Now join
                                the crew.
                            </Text>
                        </VStack>

                        {/* Telegram CTA */}
                        <Link
                            href="https://t.me/stackedpoker"
                            isExternal
                            _hover={{ textDecoration: 'none' }}
                        >
                            <Box
                                bg="linear-gradient(135deg, #0088cc 0%, #00BFFF 100%)"
                                borderRadius="14px"
                                py={2.5}
                                px={5}
                                transition="all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                                cursor="pointer"
                                position="relative"
                                overflow="hidden"
                                animation={`${pulse} 2s ease-out infinite`}
                                _hover={{
                                    transform: 'translateY(-3px) scale(1.02)',
                                    boxShadow:
                                        '0 16px 40px rgba(0, 136, 204, 0.4)',
                                }}
                                _active={{
                                    transform: 'translateY(0) scale(0.98)',
                                }}
                                sx={{
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '50%',
                                        background:
                                            'linear-gradient(to bottom, rgba(255, 255, 255, 0.18), transparent)',
                                        borderRadius: 'inherit',
                                        pointerEvents: 'none',
                                    },
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        background:
                                            'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                        animation: `${shimmer} 2.5s ease-in-out infinite`,
                                        pointerEvents: 'none',
                                    },
                                }}
                            >
                                <HStack spacing={3}>
                                    <Icon
                                        as={FaTelegram}
                                        boxSize={6}
                                        color="white"
                                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                                    />
                                    <Text
                                        fontSize="sm"
                                        color="white"
                                        fontWeight="700"
                                        letterSpacing="-0.01em"
                                    >
                                        Join the Telegram
                                    </Text>
                                </HStack>
                            </Box>
                        </Link>

                        {/* Social proof nudge */}
                        <Text
                            fontSize="xs"
                            color="text.gray600"
                            textAlign="center"
                            fontStyle="italic"
                        >
                            Don&apos;t miss a hand
                        </Text>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default NewsletterSuccessModal;
