'use client';

import React, { useContext, useEffect, useCallback } from 'react';
import {
    Button,
    Tooltip,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    VStack,
    Text,
    HStack,
    Icon,
    Spinner,
    Box,
    Heading,
    Image,
    Link,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaCoins, FaInfoCircle } from 'react-icons/fa';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { useWithdraw } from '@/app/hooks/useWithdraw';
import { useActiveWallet } from 'thirdweb/react';
import useToastHelper from '@/app/hooks/useToastHelper';

const CHIPS_PER_USDC = 100;
const USDC_LOGO_URL = 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png';

// Animations (matching TakeSeatModal)
const gradientShift = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

const slideUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const WithdrawButton = () => {
    const wallet = useActiveWallet();
    const address = wallet?.getAccount()?.address;
    const appStore = useContext(AppContext);
    const config = appStore.appState.game?.config;
    const isCryptoGame = Boolean(config?.crypto);
    const contractAddress = config?.contractAddress;
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { success, error: toastError } = useToastHelper();

    // Check if user is seated at the table
    const isUserSeated = appStore.appState.game?.players?.some(
        (player) => player.uuid === appStore.appState.clientID
    );

    const {
        withdraw,
        checkCanWithdraw,
        canWithdraw,
        chipBalance,
        status,
        error,
        isLoading,
        reset,
    } = useWithdraw(contractAddress);

    // Check withdraw eligibility when modal opens or address changes
    const refreshWithdrawStatus = useCallback(() => {
        if (address && contractAddress) {
            checkCanWithdraw();
        }
    }, [address, contractAddress, checkCanWithdraw]);

    useEffect(() => {
        if (isOpen) {
            refreshWithdrawStatus();
        }
    }, [isOpen, refreshWithdrawStatus]);

    // Don't render if not a crypto game or no wallet
    if (!isCryptoGame || !address) {
        return null;
    }

    const formattedChipBalance =
        chipBalance !== null
            ? Number(chipBalance).toLocaleString('en-US')
            : '0';

    const formattedUsdcValue =
        chipBalance !== null
            ? (Number(chipBalance) / CHIPS_PER_USDC).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : '0.00';

    const handleWithdraw = async () => {
        const withdrawSuccess = await withdraw();
        if (withdrawSuccess) {
            success(
                'Withdrawal Successful',
                'Your chips have been converted back to USDC.'
            );
            onClose();
        } else if (error) {
            toastError('Withdrawal Failed', error);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const getStatusMessage = () => {
        if (status === 'withdrawing') return 'Converting chips to USDC...';
        return 'Processing...';
    };

    const isButtonDisabled =
        isUserSeated ||
        isLoading ||
        !canWithdraw ||
        chipBalance === BigInt(0);

    return (
        <>
            <Tooltip
                label={
                    isUserSeated
                        ? 'Leave the table first to withdraw'
                        : 'Withdraw your chips'
                }
                placement="bottom"
                fontSize="xs"
                bg="brand.navy"
                color="white"
                borderRadius="md"
                px={2}
                py={1}
            >
                <Button
                    onClick={onOpen}
                    size={{ base: 'md', md: 'md' }}
                    px={2}
                    py={2}
                    width="auto"
                    height={{ base: '40px', sm: '40px', md: '48px' }}
                    bg="brand.yellow"
                    color="white"
                    border="none"
                    borderRadius="12px"
                    fontWeight="semibold"
                    fontSize={{ base: 'xs', md: 'sm' }}
                    leftIcon={
                        <Icon as={FaCoins} boxSize={{ base: 4, md: 5 }} />
                    }
                    iconSpacing={1.5}
                    filter={isUserSeated ? 'blur(1px)' : 'none'}
                    opacity={isUserSeated ? 0.6 : 1}
                    _hover={{
                        transform: isUserSeated
                            ? 'none'
                            : 'translateY(-2px)',
                        boxShadow: isUserSeated
                            ? 'none'
                            : '0 4px 12px rgba(253, 197, 29, 0.4)',
                        filter: isUserSeated ? 'blur(1px)' : 'none',
                    }}
                    transition="all 0.2s ease"
                >
                    Withdraw
                </Button>
            </Tooltip>

            <Modal isOpen={isOpen} onClose={handleClose} isCentered>
                <ModalOverlay
                    bg="rgba(0, 0, 0, 0.7)"
                    backdropFilter="blur(8px)"
                />
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
                        bgGradient="linear(to-r, brand.yellow, brand.green, brand.pink, brand.yellow)"
                        backgroundSize="200% 200%"
                        animation={`${gradientShift} 4s ease infinite`}
                        pointerEvents="none"
                        zIndex={0}
                    >
                        <Box
                            width="100%"
                            height="100%"
                            bg="card.white"
                            borderRadius="29px"
                        />
                    </Box>

                    {/* Content Container */}
                    <Box position="relative" zIndex={1} bg="card.white">
                        <ModalCloseButton
                            color="text.secondary"
                            size="lg"
                            top={4}
                            right={4}
                            borderRadius="full"
                            _hover={{
                                bg: 'brand.lightGray',
                                transform: 'rotate(90deg)',
                            }}
                            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        />

                        <ModalHeader textAlign="center" pt={10} pb={2}>
                            <Heading
                                as="h2"
                                fontSize="xl"
                                fontWeight="bold"
                                color="text.secondary"
                                letterSpacing="-0.02em"
                            >
                                Withdraw Chips
                            </Heading>
                        </ModalHeader>

                        <ModalBody px={8} pb={3} pt={0}>
                            <VStack spacing={3}>
                                {isLoading && status === 'checking' ? (
                                    <HStack
                                        bg="card.lightGray"
                                        borderRadius="12px"
                                        px={4}
                                        py={3}
                                        w="100%"
                                        spacing={3}
                                        justify="center"
                                    >
                                        <Spinner
                                            size="sm"
                                            color="brand.yellow"
                                            thickness="2px"
                                        />
                                        <Text
                                            fontSize="sm"
                                            color="text.muted"
                                            fontWeight="medium"
                                        >
                                            Checking balance...
                                        </Text>
                                    </HStack>
                                ) : (
                                    <>
                                        {/* Balance row */}
                                        <HStack
                                            bg="card.lightGray"
                                            borderRadius="12px"
                                            px={4}
                                            py={3}
                                            w="100%"
                                            justify="space-between"
                                            align="center"
                                        >
                                            <Text
                                                fontSize="xs"
                                                color="text.muted"
                                                fontWeight="semibold"
                                                textTransform="uppercase"
                                                letterSpacing="0.04em"
                                            >
                                                Balance
                                            </Text>
                                            <VStack spacing={0} align="flex-end">
                                                <Text
                                                    fontSize="lg"
                                                    fontWeight="bold"
                                                    color="text.secondary"
                                                    lineHeight="short"
                                                >
                                                    {formattedChipBalance} chips
                                                </Text>
                                                <HStack spacing={1}>
                                                    <Image
                                                        src={USDC_LOGO_URL}
                                                        alt="USDC"
                                                        boxSize="12px"
                                                        loading="lazy"
                                                    />
                                                    <Text
                                                        fontSize="xs"
                                                        color="text.muted"
                                                        fontWeight="medium"
                                                    >
                                                        {formattedUsdcValue} USDC
                                                    </Text>
                                                </HStack>
                                            </VStack>
                                        </HStack>

                                        {isUserSeated && (
                                            <HStack
                                                spacing={2}
                                                alignItems="flex-start"
                                                bg="rgba(237, 137, 54, 0.12)"
                                                color="orange.600"
                                                _dark={{
                                                    bg: 'rgba(237, 137, 54, 0.15)',
                                                    color: 'orange.300',
                                                }}
                                                borderRadius="md"
                                                px={3}
                                                py={2}
                                                fontSize="xs"
                                                fontWeight="medium"
                                                width="100%"
                                            >
                                                <Icon
                                                    as={FaInfoCircle}
                                                    boxSize={3.5}
                                                    mt={0.5}
                                                />
                                                <Text
                                                    color="inherit"
                                                    textAlign="left"
                                                >
                                                    You must leave the table
                                                    before withdrawing.
                                                </Text>
                                            </HStack>
                                        )}

                                        {!canWithdraw &&
                                            !isUserSeated &&
                                            chipBalance !== null &&
                                            chipBalance > BigInt(0) && (
                                                <HStack
                                                    spacing={2}
                                                    alignItems="flex-start"
                                                    bg="rgba(237, 137, 54, 0.12)"
                                                    color="orange.600"
                                                    _dark={{
                                                        bg: 'rgba(237, 137, 54, 0.15)',
                                                        color: 'orange.300',
                                                    }}
                                                    borderRadius="md"
                                                    px={3}
                                                    py={2}
                                                    fontSize="xs"
                                                    fontWeight="medium"
                                                    width="100%"
                                                >
                                                    <Icon
                                                        as={FaInfoCircle}
                                                        boxSize={3.5}
                                                        mt={0.5}
                                                    />
                                                    <Text
                                                        color="inherit"
                                                        textAlign="left"
                                                    >
                                                        Withdrawal not
                                                        available. You may need
                                                        to wait for the current
                                                        hand to complete.
                                                    </Text>
                                                </HStack>
                                            )}

                                        {error && (
                                            <HStack
                                                spacing={2}
                                                alignItems="flex-start"
                                                bg="red.50"
                                                color="red.700"
                                                _dark={{
                                                    bg: 'rgba(254, 178, 178, 0.12)',
                                                    color: 'red.300',
                                                }}
                                                borderRadius="md"
                                                px={3}
                                                py={2}
                                                fontSize="xs"
                                                fontWeight="medium"
                                                width="100%"
                                            >
                                                <Icon
                                                    as={FaInfoCircle}
                                                    boxSize={3.5}
                                                    mt={0.5}
                                                />
                                                <Text
                                                    color="inherit"
                                                    textAlign="left"
                                                    wordBreak="break-word"
                                                >
                                                    {error}
                                                </Text>
                                            </HStack>
                                        )}
                                    </>
                                )}
                            </VStack>
                        </ModalBody>

                        <ModalFooter px={8} pb={6} pt={1}>
                            <VStack w="100%" spacing={3}>
                            <Button
                                w="100%"
                                h="56px"
                                fontSize="md"
                                fontWeight="bold"
                                borderRadius="bigButton"
                                bg={
                                    isButtonDisabled
                                        ? 'gray.300'
                                        : 'brand.yellow'
                                }
                                color={
                                    isButtonDisabled ? 'gray.500' : 'white'
                                }
                                border="none"
                                isDisabled={isButtonDisabled}
                                isLoading={
                                    isLoading && status === 'withdrawing'
                                }
                                loadingText={getStatusMessage()}
                                onClick={handleWithdraw}
                                _disabled={{
                                    bg: 'gray.300',
                                    color: 'gray.500',
                                    cursor: 'not-allowed',
                                    opacity: 0.6,
                                }}
                                position="relative"
                                overflow="hidden"
                                _before={{
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    bg: 'linear-gradient(135deg, transparent, rgba(255,255,255,0.3), transparent)',
                                    transform: 'translateX(-100%)',
                                    transition: 'transform 0.6s',
                                    opacity: isButtonDisabled ? 0 : 1,
                                }}
                                _hover={
                                    isButtonDisabled
                                        ? {}
                                        : {
                                              bg: 'brand.yellow',
                                              transform:
                                                  'translateY(-2px)',
                                              boxShadow:
                                                  '0 12px 24px rgba(253, 197, 29, 0.35)',
                                              _before: {
                                                  transform:
                                                      'translateX(100%)',
                                              },
                                          }
                                }
                                _active={{
                                    transform: isButtonDisabled
                                        ? 'none'
                                        : 'translateY(0)',
                                }}
                                transition="all 0.2s ease"
                            >
                                Withdraw
                            </Button>
                            <Text
                                fontSize="2xs"
                                color="text.muted"
                                textAlign="center"
                                lineHeight="short"
                                px={2}
                                opacity={0.7}
                            >
                                {isUserSeated
                                    ? 'Leave the table before withdrawing. Your on-chain chip balance reflects the last settled hand.'
                                    : 'Your on-chain chip balance reflects the last settled hand. Chips are held by the table contract and returned as USDC upon withdrawal.'}
                                {' '}{CHIPS_PER_USDC} chips&nbsp;=&nbsp;1&nbsp;USDC.
                                {contractAddress && (
                                    <>
                                        {' '}
                                        <Link
                                            href={`https://sepolia.basescan.org/address/${contractAddress}`}
                                            isExternal
                                            color="brand.navy"
                                            _dark={{ color: 'brand.lightGray' }}
                                            fontWeight="semibold"
                                            textDecoration="underline"
                                            textUnderlineOffset="2px"
                                        >
                                            View contract
                                        </Link>
                                    </>
                                )}
                            </Text>
                            </VStack>
                        </ModalFooter>
                    </Box>

                    {/* Decorative Background Elements */}
                    <Box
                        position="absolute"
                        top="-20px"
                        right="-20px"
                        width="120px"
                        height="120px"
                        borderRadius="50%"
                        bg="brand.yellow"
                        opacity={0.08}
                        filter="blur(40px)"
                        pointerEvents="none"
                    />
                    <Box
                        position="absolute"
                        bottom="-30px"
                        left="-30px"
                        width="140px"
                        height="140px"
                        borderRadius="50%"
                        bg="brand.green"
                        opacity={0.08}
                        filter="blur(50px)"
                        pointerEvents="none"
                    />
                </ModalContent>
            </Modal>
        </>
    );
};

export default WithdrawButton;
