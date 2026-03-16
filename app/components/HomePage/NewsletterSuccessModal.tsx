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
import { FaDiscord } from 'react-icons/fa';
import { FaTelegram } from 'react-icons/fa6';
import { RiTwitterXLine } from 'react-icons/ri';

const slideUp = keyframes`
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
`;

const gradientShift = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

interface NewsletterSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const fireConfetti = () => {
    import('canvas-confetti').then((mod) => {
        const create = mod.create;
        // Create a canvas that sits above the modal overlay
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.inset = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '9999';
        canvas.style.pointerEvents = 'none';
        document.body.appendChild(canvas);

        const confetti = create(canvas, { resize: true });

        // Initial burst
        confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.45 },
            colors: ['#36A37B', '#FFD700', '#EB0B5C', '#5865F2', '#0088cc'],
        });
        // Delayed side bursts
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

        // Clean up canvas after confetti settles
        setTimeout(() => {
            canvas.remove();
        }, 4000);
    });
};

const socials = [
    {
        name: 'Discord',
        icon: FaDiscord,
        href: 'https://discord.gg/347RBVcvpn',
        color: '#5865F2',
        hoverBg: '#4752C4',
        label: 'Chat &\nhangout',
    },
    {
        name: 'Telegram',
        icon: FaTelegram,
        href: 'https://t.me/stackedpoker',
        color: '#0088cc',
        hoverBg: '#006DA3',
        label: 'News &\nupdates',
    },
    {
        name: 'X',
        icon: RiTwitterXLine,
        href: 'https://x.com/stacked_poker',
        color: '#000000',
        hoverBg: '#1a1a1a',
        label: 'Follow the\naction',
    },
];

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
                maxWidth="420px"
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
                    <VStack spacing={6}>
                        {/* Emoji + Title */}
                        <VStack spacing={2}>
                            <Heading
                                fontSize={{ base: '2xl', md: '3xl' }}
                                fontWeight="900"
                                color="text.primary"
                                textAlign="center"
                                letterSpacing="-0.02em"
                            >
                                You&apos;re on the list! 🎉
                            </Heading>
                            <Text
                                fontSize="sm"
                                color="text.gray600"
                                textAlign="center"
                                maxW="280px"
                                lineHeight={1.5}
                            >
                                You&apos;ve got a seat at the table. Now join
                                the crew.
                            </Text>
                        </VStack>

                        {/* Social Cards */}
                        <HStack spacing={3} width="100%" maxW="280px">
                            {socials.map((s) => (
                                <Link
                                    key={s.name}
                                    href={s.href}
                                    isExternal
                                    flex={1}
                                    _hover={{ textDecoration: 'none' }}
                                >
                                    <VStack
                                        bg={s.color}
                                        borderRadius="18px"
                                        py={2}
                                        px={0}
                                        spacing={1}
                                        //aspectRatio="4/3"
                                        justify="center"
                                        transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                                        cursor="pointer"
                                        position="relative"
                                        overflow="hidden"
                                        boxShadow={`0 4px 12px ${s.color}40`}
                                        _hover={{
                                            transform:
                                                'translateY(-3px) scale(1.02)',
                                            boxShadow: `0 12px 28px ${s.color}55`,
                                        }}
                                        _active={{
                                            transform:
                                                'translateY(0) scale(0.98)',
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
                                                    'linear-gradient(to bottom, rgba(255, 255, 255, 0.15), transparent)',
                                                borderRadius: 'inherit',
                                                pointerEvents: 'none',
                                            },
                                        }}
                                    >
                                        <Icon
                                            as={s.icon}
                                            boxSize={8}
                                            color="white"
                                        />
                                        <Text
                                            fontSize="2xs"
                                            color="whiteAlpha.900"
                                            fontWeight="semibold"
                                            textAlign="center"
                                            lineHeight={1.3}
                                            whiteSpace="pre-line"
                                        >
                                            {s.label}
                                        </Text>
                                    </VStack>
                                </Link>
                            ))}
                        </HStack>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default NewsletterSuccessModal;
