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
} from '@chakra-ui/react';
import { FaCoins } from 'react-icons/fa';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { useWithdraw } from '@/app/hooks/useWithdraw';
import { useActiveWallet } from 'thirdweb/react';
import useToastHelper from '@/app/hooks/useToastHelper';

const CHIPS_PER_USDC = 100;

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
        if (address && contractAddress && !isUserSeated) {
            checkCanWithdraw();
        }
    }, [address, contractAddress, isUserSeated, checkCanWithdraw]);

    useEffect(() => {
        if (isOpen) {
            refreshWithdrawStatus();
        }
    }, [isOpen, refreshWithdrawStatus]);

    // Don't render if not a crypto game or no wallet
    if (!isCryptoGame || !address) {
        return null;
    }

    const formattedChipBalance = chipBalance !== null
        ? Number(chipBalance).toLocaleString('en-US')
        : '0';

    const formattedUsdcValue = chipBalance !== null
        ? (Number(chipBalance) / CHIPS_PER_USDC).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
        : '0.00';

    const handleWithdraw = async () => {
        const withdrawSuccess = await withdraw();
        if (withdrawSuccess) {
            success('Withdrawal Successful', 'Your chips have been converted back to USDC.');
            onClose();
        } else if (error) {
            toastError('Withdrawal Failed', error);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const getButtonContent = () => {
        if (isUserSeated) {
            return 'Leave table to withdraw';
        }
        if (isLoading && status === 'checking') {
            return 'Checking...';
        }
        if (isLoading && status === 'withdrawing') {
            return 'Withdrawing...';
        }
        return 'Withdraw';
    };

    const isButtonDisabled = isUserSeated || isLoading || !canWithdraw || chipBalance === BigInt(0);

    return (
        <>
            <Tooltip
                label={isUserSeated ? 'Leave the table first to withdraw' : 'Withdraw your chips'}
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
                    size={{ base: 'sm', md: 'md' }}
                    px={3}
                    py={2}
                    height={{ base: '40px', sm: '40px', md: '48px' }}
                    bg="brand.yellow"
                    color="white"
                    border="none"
                    borderRadius="12px"
                    fontWeight="semibold"
                    fontSize={{ base: 'xs', md: 'sm' }}
                    leftIcon={<Icon as={FaCoins} boxSize={{ base: 3, md: 4 }} />}
                    filter={isUserSeated ? 'blur(1px)' : 'none'}
                    opacity={isUserSeated ? 0.6 : 1}
                    _hover={{
                        transform: isUserSeated ? 'none' : 'translateY(-2px)',
                        boxShadow: isUserSeated ? 'none' : '0 4px 12px rgba(253, 197, 29, 0.4)',
                        filter: isUserSeated ? 'blur(1px)' : 'none',
                    }}
                    transition="all 0.2s ease"
                >
                    Withdraw
                </Button>
            </Tooltip>

            <Modal isOpen={isOpen} onClose={handleClose} isCentered>
                <ModalOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(8px)" />
                <ModalContent
                    borderRadius="24px"
                    maxWidth="380px"
                    boxShadow="0 20px 60px rgba(0, 0, 0, 0.25)"
                    border="1px solid"
                    borderColor="card.white"
                >
                    <ModalCloseButton
                        color="text.secondary"
                        size="lg"
                        top={4}
                        right={4}
                        borderRadius="full"
                        _hover={{ bg: 'brand.lightGray' }}
                    />

                    <ModalHeader textAlign="center" pt={8} pb={2}>
                        <VStack spacing={1}>
                            <Icon as={FaCoins} boxSize={8} color="brand.yellow" />
                            <Text fontSize="xl" fontWeight="bold" color="text.secondary">
                                Withdraw Chips
                            </Text>
                        </VStack>
                    </ModalHeader>

                    <ModalBody px={6} pb={4}>
                        <VStack spacing={4}>
                            {isLoading && status === 'checking' ? (
                                <HStack spacing={2}>
                                    <Spinner size="sm" color="brand.yellow" />
                                    <Text fontSize="sm" color="gray.600">
                                        Checking balance...
                                    </Text>
                                </HStack>
                            ) : (
                                <>
                                    <VStack
                                        bg="gray.50"
                                        borderRadius="16px"
                                        p={4}
                                        w="100%"
                                        spacing={1}
                                    >
                                        <Text fontSize="sm" color="gray.500" fontWeight="medium">
                                            Available to Withdraw
                                        </Text>
                                        <Text fontSize="2xl" fontWeight="bold" color="text.secondary">
                                            {formattedChipBalance} chips
                                        </Text>
                                        <Text fontSize="sm" color="gray.500">
                                            ~ {formattedUsdcValue} USDC
                                        </Text>
                                    </VStack>

                                    {isUserSeated && (
                                        <Text
                                            fontSize="xs"
                                            color="orange.600"
                                            bg="orange.50"
                                            px={3}
                                            py={2}
                                            borderRadius="md"
                                            textAlign="center"
                                        >
                                            You must leave the table before withdrawing.
                                        </Text>
                                    )}

                                    {!canWithdraw && !isUserSeated && chipBalance !== null && chipBalance > BigInt(0) && (
                                        <Text
                                            fontSize="xs"
                                            color="orange.600"
                                            bg="orange.50"
                                            px={3}
                                            py={2}
                                            borderRadius="md"
                                            textAlign="center"
                                        >
                                            Withdrawal not available. You may need to wait for the current hand to complete.
                                        </Text>
                                    )}

                                    {error && (
                                        <Text
                                            fontSize="xs"
                                            color="red.600"
                                            bg="red.50"
                                            px={3}
                                            py={2}
                                            borderRadius="md"
                                            textAlign="center"
                                        >
                                            {error}
                                        </Text>
                                    )}
                                </>
                            )}
                        </VStack>
                    </ModalBody>

                    <ModalFooter px={6} pb={6}>
                        <Button
                            w="100%"
                            h="48px"
                            fontSize="md"
                            fontWeight="bold"
                            borderRadius="12px"
                            bg={isButtonDisabled ? 'gray.300' : 'brand.yellow'}
                            color={isButtonDisabled ? 'gray.500' : 'white'}
                            border="none"
                            isDisabled={isButtonDisabled}
                            isLoading={isLoading && status === 'withdrawing'}
                            loadingText="Withdrawing..."
                            onClick={handleWithdraw}
                            _disabled={{
                                bg: 'gray.300',
                                color: 'gray.500',
                                cursor: 'not-allowed',
                            }}
                            _hover={
                                isButtonDisabled
                                    ? {}
                                    : {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 20px rgba(253, 197, 29, 0.35)',
                                    }
                            }
                            transition="all 0.2s ease"
                        >
                            {getButtonContent()}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default WithdrawButton;
