'use client';

import {
    Box,
    CloseButton,
    Flex,
    Input,
    Link,
    ModalContent,
    Stack,
    Text,
    Tooltip,
    Icon,
    Modal,
    useDisclosure,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useContext, useEffect } from 'react';
import { FaCopy, FaCheck } from 'react-icons/fa';
import { AppContext } from '../contexts/AppStoreProvider';
import useCopyToClipboard from '@/app/hooks/useCopyToClipboard';
import { SocialIconButton } from './SocialIconButton';

const pulse = keyframes`
  0% { 
    transform: scale(1); 
    opacity: 1; 
  }
  50% { 
    transform: scale(1.15); 
    opacity: 0.7; 
  }
  100% { 
    transform: scale(1); 
    opacity: 1; 
  }
`;

const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const LinkBox = () => {
    const currentUrl =
        typeof window !== 'undefined' ? window.location.href : '';
    const { copy, copied } = useCopyToClipboard();
    const onCopy = () => void copy(currentUrl);

    return (
        <Flex
            width="85%"
            maxW="380px"
            borderRadius="12px"
            overflow="hidden"
            boxShadow="0 2px 12px rgba(0, 0, 0, 0.08)"
            border="2px solid"
            borderColor="brand.green"
        >
            <Box
                flex={1}
                bg={'input.white'}
                display="flex"
                alignItems="center"
                px={2.5}
                py={2}
            >
                <Input
                    value={currentUrl}
                    isReadOnly
                    border="none"
                    bg="transparent"
                    color="text.secondary"
                    fontSize="xs"
                    fontWeight="medium"
                    p={0}
                    height="auto"
                    minH="0"
                    _focus={{
                        outline: 'none',
                        boxShadow: 'none',
                    }}
                    cursor="text"
                />
            </Box>
            <Tooltip
                label={copied ? 'Copied!' : 'Copy Link'}
                closeOnClick={false}
            >
                <Flex
                    onClick={onCopy}
                    minW="44px"
                    py={1.5}
                    bg="brand.green"
                    cursor="pointer"
                    justifyContent="center"
                    alignItems="center"
                    color="white"
                    boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), inset 2px 0 0 rgba(0,0,0,0.10)"
                    transition="background-color 80ms ease, box-shadow 80ms ease"
                    _hover={{ bg: 'brand.green' }}
                    _active={{
                        bg: 'brand.greenDark',
                        boxShadow:
                            'inset 0 2px 4px rgba(0,0,0,0.18), inset 2px 0 0 rgba(0,0,0,0.10)',
                    }}
                >
                    <Icon as={copied ? FaCheck : FaCopy} boxSize={3.5} />
                </Flex>
            </Tooltip>
        </Flex>
    );
};

const LobbyBanner = () => {
    const { appState } = useContext(AppContext);
    const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });

    useEffect(() => {
        if (appState.game?.players && appState.game?.players.length > 1) {
            onClose();
        }
    }, [appState.game?.players, onClose]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size={'xs'}>
            <ModalContent
                bg={'card.white'}
                borderRadius={{ base: '20px', md: '24px' }}
                overflow="hidden"
                boxShadow="0 20px 60px rgba(0, 0, 0, 0.25)"
                border="1px solid"
                borderColor="rgba(0, 0, 0, 0.08)"
                display="flex"
                flexDirection="column"
                animation={`${fadeIn} 0.4s ease-out`}
                maxW="420px"
                mx={{ base: 3, md: 0 }}
            >
                {/* Header */}
                <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    py={{ base: 3, md: 4 }}
                    px={{ base: 4, md: 5 }}
                    bg={'card.lightGray'}
                    borderBottom="1px solid"
                    borderColor="rgba(0, 0, 0, 0.08)"
                >
                    <Stack gap={1}>
                        <Text
                            fontWeight="extrabold"
                            fontSize="xl"
                            color="text.secondary"
                            fontFamily="heading"
                        >
                            Lobby
                        </Text>
                        <Flex gap={2} alignItems="center">
                            <Box
                                height={2}
                                width={2}
                                bg="brand.green"
                                borderRadius="full"
                                animation={`${pulse} 2s ease-in-out infinite`}
                                boxShadow="0 0 8px rgba(54, 163, 123, 0.6)"
                            />
                            <Text
                                fontSize="sm"
                                color="text.secondary"
                                fontWeight="medium"
                                opacity={0.7}
                            >
                                Waiting for players
                            </Text>
                        </Flex>
                    </Stack>
                    <CloseButton
                        data-testid="lobby-banner-close"
                        onClick={onClose}
                        color="text.secondary"
                        borderRadius="8px"
                        _hover={{
                            bg: 'rgba(51, 68, 121, 0.1)',
                        }}
                    />
                </Flex>

                {/* Content */}
                <Stack
                    py={{ base: 3, md: 4 }}
                    px={{ base: 4, md: 5 }}
                    gap={{ base: 3, md: 4 }}
                    overflow="auto"
                    flex={1}
                    minHeight={0}
                    alignItems="center"
                    bg={'card.white'}
                >
                    <LinkBox />

                    {/* Social Buttons */}
                    <Flex
                        gap={{ base: 3, md: 4 }}
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Link href="https://x.com/stacked_poker" isExternal>
                            <SocialIconButton tone="x" chipSize="lg" />
                        </Link>
                        <Link href="https://discord.gg/xdaC5gRP4E" isExternal>
                            <SocialIconButton tone="discord" chipSize="lg" />
                        </Link>
                        <Link href="https://t.me/stackedpoker" isExternal>
                            <SocialIconButton tone="telegram" chipSize="lg" />
                        </Link>
                    </Flex>

                    {/* Hint Text */}
                    <Text
                        fontSize="xs"
                        color="text.secondary"
                        opacity={0.6}
                        textAlign="center"
                        maxW="300px"
                    >
                        Share the link above to invite players to your table
                    </Text>
                </Stack>
            </ModalContent>
        </Modal>
    );
};

export default LobbyBanner;
