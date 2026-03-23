'use client';

import { useRef } from 'react';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    HStack,
    Icon,
    Spinner,
    Text,
    Tooltip,
    VStack,
    useDisclosure,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useEmergencyWithdrawAll } from '../hooks/useEmergencyWithdrawAll';

const slideUp = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
`;

interface Props {
    contractAddress: string;
}

const EmergencyWithdrawAllButton = ({ contractAddress }: Props) => {
    const { trigger, status, error, reset } = useEmergencyWithdrawAll(contractAddress);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);

    const shortAddress = `${contractAddress.slice(0, 6)}…${contractAddress.slice(-4)}`;

    const handleConfirm = () => {
        onClose();
        if (status === 'error') reset();
        trigger();
    };

    if (status === 'success') {
        return (
            <Box as="span" fontSize="xs" fontWeight="bold" color="brand.green">
                Done
            </Box>
        );
    }

    return (
        <>
            <Tooltip
                label={error ?? 'Call emergencyWithdrawAll() on this table contract'}
                hasArrow
                placement="left"
            >
                <Box
                    data-testid="emergency-withdraw-all-btn"
                    as="button"
                    px={2.5}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="bold"
                    cursor={status === 'pending' ? 'not-allowed' : 'pointer'}
                    bg="brand.pink"
                    color="white"
                    opacity={status === 'pending' ? 0.6 : 1}
                    transition="opacity 0.15s"
                    _hover={{ opacity: status === 'pending' ? 0.6 : 0.85 }}
                    onClick={() => {
                        if (status === 'pending') return;
                        onOpen();
                    }}
                    display="inline-flex"
                    alignItems="center"
                    gap={1.5}
                >
                    {status === 'pending' && <Spinner size="xs" />}
                    {status === 'error' ? 'Retry' : 'Emergency Withdraw All'}
                </Box>
            </Tooltip>

            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isCentered
            >
                <AlertDialogOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(8px)" />
                <AlertDialogContent
                    bg="card.white"
                    borderRadius="24px"
                    border="1px solid"
                    borderColor="border.lightGray"
                    boxShadow="0 20px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)"
                    animation={`${slideUp} 0.3s ease-out`}
                    overflow="hidden"
                    maxW="380px"
                    mx={4}
                >
                    <AlertDialogCloseButton
                        color="text.secondary"
                        size="md"
                        top="14px"
                        right="14px"
                        borderRadius="full"
                        _hover={{ bg: 'card.lightGray' }}
                    />

                    <AlertDialogHeader pt={8} pb={2} px={8} display="flex" flexDirection="column" alignItems="center" gap={3}>
                        <Box
                            p={3}
                            borderRadius="full"
                            bg="rgba(235, 11, 92, 0.1)"
                            _dark={{ bg: 'rgba(235, 11, 92, 0.2)' }}
                        >
                            <Icon as={FaExclamationTriangle} boxSize={6} color="brand.pink" />
                        </Box>
                        <Text fontSize="lg" fontWeight="bold" color="text.primary" letterSpacing="-0.02em">
                            Emergency Withdraw All
                        </Text>
                    </AlertDialogHeader>

                    <AlertDialogBody px={8} pb={2} pt={0}>
                        <VStack spacing={3} align="stretch">
                            <Text fontSize="sm" color="text.secondary" textAlign="center">
                                This will call{' '}
                                <Text as="span" fontWeight="bold" color="text.primary">
                                    emergencyWithdrawAll()
                                </Text>{' '}
                                on:
                            </Text>

                            <HStack
                                justify="center"
                                bg="card.lightGray"
                                borderRadius="10px"
                                px={4}
                                py={2.5}
                            >
                                <Text fontSize="sm" fontFamily="mono" fontWeight="semibold" color="brand.pink">
                                    {shortAddress}
                                </Text>
                            </HStack>

                            <HStack
                                bg="rgba(235, 11, 92, 0.08)"
                                _dark={{ bg: 'rgba(235, 11, 92, 0.15)' }}
                                borderRadius="10px"
                                px={4}
                                py={3}
                                spacing={3}
                                align="start"
                            >
                                <Text fontSize="xs" color="text.secondary" lineHeight="tall">
                                    All players will be force-withdrawn from the contract immediately. This action is{' '}
                                    <Text as="span" fontWeight="bold" color="brand.pink">
                                        irreversible
                                    </Text>
                                    .
                                </Text>
                            </HStack>
                        </VStack>
                    </AlertDialogBody>

                    <AlertDialogFooter px={8} pb={8} pt={4} gap={3}>
                        <Button
                            ref={cancelRef}
                            onClick={onClose}
                            flex={1}
                            h="44px"
                            fontSize="sm"
                            fontWeight="bold"
                            borderRadius="12px"
                            bg="card.lightGray"
                            color="text.secondary"
                            border="none"
                            _hover={{
                                bg: 'border.lightGray',
                                transform: 'translateY(-1px)',
                            }}
                            _active={{ transform: 'translateY(0)' }}
                            transition="all 0.2s ease"
                        >
                            Cancel
                        </Button>
                        <Button
                            data-testid="emergency-withdraw-all-confirm"
                            onClick={handleConfirm}
                            flex={1}
                            h="44px"
                            fontSize="sm"
                            fontWeight="bold"
                            borderRadius="12px"
                            bg="brand.pink"
                            color="white"
                            border="none"
                            _hover={{
                                bg: 'brand.pink',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 10px 20px rgba(235, 11, 92, 0.3)',
                            }}
                            _active={{ transform: 'translateY(0)' }}
                            transition="all 0.2s ease"
                        >
                            Confirm
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default EmergencyWithdrawAllButton;
