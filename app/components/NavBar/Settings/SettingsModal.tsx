'use client';

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    HStack,
    Icon,
    IconButton,
    Box,
    useColorModeValue,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
    FiUsers,
    FiSettings,
    FiFileText,
    FiDollarSign,
    FiHelpCircle,
    FiX,
    FiChevronLeft,
    FiChevronRight,
} from 'react-icons/fi';
import { BiSupport } from 'react-icons/bi';
import GameSettings from './GameSettings';
import PlayerList from './PlayerList';
import GameLog from './GameLog';
import Ledger from './Ledger';
import HowTo from './HowTo';
import Support from './Support';
import { GameEventsProvider } from '@/app/contexts/GameEventsProvider';
import { IconType } from 'react-icons/lib/iconBase';
import { ColorModeButton } from '../../ColorModeButton';

// Animations
const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const slideDown = keyframes`
    from { 
        opacity: 0; 
        transform: translateY(-20px); 
    }
    to { 
        opacity: 1; 
        transform: translateY(0); 
    }
`;

const TabItem = ({
    text,
    color,
    icon,
}: {
    text: string;
    color: string;
    icon: IconType;
}) => {
    return (
        <Tab
            minW="fit-content"
            px={{ base: '2px', md: 4 }}
            py={{ base: 1, md: 2 }}
            _hover={{
                bg: 'input.white',
                color: color,
                boxShadow: '0 4px 8px rgba(54, 163, 123, 0.2)',
            }}
            _selected={{
                bg: color,
                color: 'text.white !important',
                boxShadow: '0 4px 12px rgba(54, 163, 123, 0.3)',
                '& *': {
                    color: 'text.white !important',
                },
            }}
            borderRadius="6px"
            fontWeight="bold"
            fontSize={{ base: '2xs', sm: 'xs', md: 'md' }}
            transition="all 0.2s ease"
        >
            <HStack spacing={{ base: 0.5, md: 2 }}>
                <Icon
                    as={icon}
                    boxSize={{ base: 3.5, md: 5 }}
                    color={'text.primary'}
                />
                <Text textTransform={'capitalize'} color={'text.primary'}>
                    {text}
                </Text>
            </HStack>
        </Tab>
    );
};

const TAB_SCROLL_AMOUNT = 150;

const SettingsModal = ({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) => {
    const tabListRef = useRef<HTMLDivElement | null>(null);
    const roRef = useRef<ResizeObserver | null>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Resolve theme colors for CSS gradients (semantic tokens don't work in bgGradient)
    const tabBg = useColorModeValue('#ECEEF5', '#191414'); // card.lightGray
    const arrowBg = useColorModeValue(
        'rgba(236, 238, 245, 0.95)',
        'rgba(25, 20, 20, 0.95)'
    );
    const arrowHoverBg = useColorModeValue('white', '#2a2a2a');
    const arrowColor = useColorModeValue('#334479', '#ECEEF5'); // text.secondary

    const updateScrollState = useCallback(() => {
        const el = tabListRef.current;
        if (!el) return;
        const tolerance = 2;
        setCanScrollLeft(el.scrollLeft > tolerance);
        setCanScrollRight(
            el.scrollLeft + el.clientWidth < el.scrollWidth - tolerance
        );
    }, []);

    // Callback ref — fires reliably when the DOM node mounts/unmounts,
    // even inside a Chakra Modal portal.
    const setTabListRef = useCallback(
        (node: HTMLDivElement | null) => {
            // Clean up previous node
            if (tabListRef.current) {
                tabListRef.current.removeEventListener(
                    'scroll',
                    updateScrollState
                );
                roRef.current?.disconnect();
                roRef.current = null;
            }

            tabListRef.current = node;

            // Attach to new node
            if (node) {
                node.addEventListener('scroll', updateScrollState, {
                    passive: true,
                });
                roRef.current = new ResizeObserver(updateScrollState);
                roRef.current.observe(node);
                // Initial measurement (small delay for layout to settle)
                setTimeout(updateScrollState, 50);
            }
        },
        [updateScrollState]
    );

    // Clean up on unmount
    useEffect(() => {
        return () => {
            tabListRef.current?.removeEventListener(
                'scroll',
                updateScrollState
            );
            roRef.current?.disconnect();
        };
    }, [updateScrollState]);

    const scrollTabs = useCallback((direction: 'left' | 'right') => {
        const el = tabListRef.current;
        if (!el) return;
        el.scrollBy({
            left: direction === 'left' ? -TAB_SCROLL_AMOUNT : TAB_SCROLL_AMOUNT,
            behavior: 'smooth',
        });
    }, []);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size={'full'}>
            <ModalOverlay
                bg="rgba(11, 20, 48, 0.0.5)"
                backdropFilter="blur(6px)"
            />
            <ModalContent
                bg="transparent"
                backdropFilter="blur(8px)"
                h="100vh"
                w="100vw"
                maxW="100vw"
                maxH="100vh"
                m={0}
                borderRadius={0}
                animation={`${fadeIn} 0.3s ease-out`}
            >
                <ModalBody p={{ base: 4, md: 8 }} h="100%">
                    <Tabs
                        size={{ base: 'sm', md: 'md' }}
                        variant="unstyled"
                        defaultIndex={0}
                        orientation="horizontal"
                        h="100%"
                        display="flex"
                        flexDirection="column"
                    >
                        <HStack
                            gap={{ base: 2, md: 3 }}
                            mb={{ base: 0.25, md: 0.25 }}
                            align="center"
                            animation={`${slideDown} 0.4s ease-out`}
                        >
                            <Box position="relative" flex={1} minW={0}>
                                <TabList
                                    ref={setTabListRef}
                                    gap={{ base: 0, md: 2 }}
                                    bg="card.lightGray"
                                    p={{ base: 1, md: 3 }}
                                    borderRadius="16px"
                                    flexWrap={{ base: 'nowrap', sm: 'wrap' }}
                                    overflowX="auto"
                                    boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
                                    sx={{
                                        '&::-webkit-scrollbar': {
                                            display: 'none',
                                        },
                                        scrollbarWidth: 'none',
                                    }}
                                >
                                    <TabItem
                                        text="Players"
                                        color="brand.green"
                                        icon={FiUsers}
                                    />
                                    <TabItem
                                        text="Ledger"
                                        color="brand.green"
                                        icon={FiDollarSign}
                                    />
                                    <TabItem
                                        text="Log"
                                        color="brand.green"
                                        icon={FiFileText}
                                    />
                                    <TabItem
                                        text="Settings"
                                        color="brand.green"
                                        icon={FiSettings}
                                    />
                                    <TabItem
                                        text="Support"
                                        color="brand.pink"
                                        icon={BiSupport}
                                    />
                                    <TabItem
                                        text="How To"
                                        color="brand.navy"
                                        icon={FiHelpCircle}
                                    />
                                </TabList>

                                {/* Left gradient + arrow */}
                                {canScrollLeft && (
                                    <Box
                                        position="absolute"
                                        left={0}
                                        top={0}
                                        bottom={0}
                                        w="44px"
                                        borderLeftRadius="16px"
                                        bg={`linear-gradient(to right, ${tabBg} 40%, transparent)`}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="flex-start"
                                        pl="6px"
                                        zIndex={2}
                                    >
                                        <IconButton
                                            aria-label="Scroll tabs left"
                                            icon={<FiChevronLeft size={14} />}
                                            onClick={() => scrollTabs('left')}
                                            size="xs"
                                            variant="unstyled"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            borderRadius="full"
                                            bg={arrowBg}
                                            color={arrowColor}
                                            boxShadow="0 1px 4px rgba(0,0,0,0.15)"
                                            _hover={{
                                                bg: arrowHoverBg,
                                                boxShadow:
                                                    '0 2px 8px rgba(0,0,0,0.2)',
                                            }}
                                            _active={{
                                                transform: 'scale(0.9)',
                                            }}
                                            minW="26px"
                                            h="26px"
                                            transition="all 0.15s ease"
                                        />
                                    </Box>
                                )}

                                {/* Right gradient + arrow */}
                                {canScrollRight && (
                                    <Box
                                        position="absolute"
                                        right={0}
                                        top={0}
                                        bottom={0}
                                        w="44px"
                                        borderRightRadius="16px"
                                        bg={`linear-gradient(to left, ${tabBg} 40%, transparent)`}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="flex-end"
                                        pr="6px"
                                        zIndex={2}
                                    >
                                        <IconButton
                                            aria-label="Scroll tabs right"
                                            icon={<FiChevronRight size={14} />}
                                            onClick={() => scrollTabs('right')}
                                            size="xs"
                                            variant="unstyled"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            borderRadius="full"
                                            bg={arrowBg}
                                            color={arrowColor}
                                            boxShadow="0 1px 4px rgba(0,0,0,0.15)"
                                            _hover={{
                                                bg: arrowHoverBg,
                                                boxShadow:
                                                    '0 2px 8px rgba(0,0,0,0.2)',
                                            }}
                                            _active={{
                                                transform: 'scale(0.9)',
                                            }}
                                            minW="26px"
                                            h="26px"
                                            transition="all 0.15s ease"
                                        />
                                    </Box>
                                )}
                            </Box>
                            <IconButton
                                aria-label="Close"
                                icon={<FiX size={20} />}
                                onClick={onClose}
                                bg="brand.pink"
                                color="text.white"
                                borderRadius="12px"
                                size="lg"
                                _hover={{
                                    bg: 'brand.pink',
                                    transform: 'scale(1.05)',
                                    boxShadow:
                                        '0 4px 12px rgba(235, 11, 92, 0.4)',
                                }}
                                _active={{
                                    transform: 'scale(0.95)',
                                }}
                                transition="all 0.2s ease"
                                flexShrink={0}
                            />
                        </HStack>

                        <TabPanels
                            flex={1}
                            overflowY="auto"
                            bg="rgba(255, 255, 255, 0.05)"
                            borderRadius="20px"
                            p={{ base: 1, md: 2 }}
                            sx={{
                                '&::-webkit-scrollbar': {
                                    width: '10px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    bg: 'card.lightGray',
                                    borderRadius: 'full',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    bg: 'text.secondary',
                                    borderRadius: 'full',
                                    _hover: {
                                        bg: 'brand.pink',
                                    },
                                },
                            }}
                        >
                            <TabPanel
                                px={{ base: 0, sm: 1, md: 2 }}
                                py={{ base: 1, md: 2 }}
                            >
                                <PlayerList />
                            </TabPanel>
                            <TabPanel
                                px={{ base: 0, sm: 1, md: 2 }}
                                py={{ base: 1, md: 2 }}
                            >
                                <Ledger />
                            </TabPanel>
                            <TabPanel
                                px={{ base: 0, sm: 1, md: 2 }}
                                py={{ base: 1, md: 2 }}
                            >
                                <GameEventsProvider isModalOpen={isOpen}>
                                    <GameLog />
                                </GameEventsProvider>
                            </TabPanel>
                            <TabPanel
                                px={{ base: 0, sm: 1, md: 2 }}
                                py={{ base: 1, md: 2 }}
                            >
                                <GameSettings />
                            </TabPanel>
                            <TabPanel
                                px={{ base: 0, sm: 1, md: 2 }}
                                py={{ base: 1, md: 2 }}
                            >
                                <Support />
                            </TabPanel>
                            <TabPanel
                                px={{ base: 0, sm: 1, md: 2 }}
                                py={{ base: 1, md: 2 }}
                            >
                                <HowTo />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default SettingsModal;
