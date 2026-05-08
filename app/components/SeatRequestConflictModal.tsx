'use client';

import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
} from '@chakra-ui/react';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    seatId?: number | null;
};

const SeatRequestConflictModal = ({ isOpen, onClose, seatId }: Props) => {
    const message = seatId ? `Seat #${seatId} requested already.` : null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay bg="blackAlpha.400" />
            <ModalContent
                bg="card.white"
                color="text.secondary"
                borderRadius="20px"
                borderWidth="2px"
                borderColor="border.lightGray"
                boxShadow="0 16px 40px rgba(0, 0, 0, 0.18)"
                mx={4}
                maxW="360px"
            >
                <ModalHeader
                    fontSize="lg"
                    fontWeight="bold"
                    letterSpacing="-0.02em"
                    pt={5}
                    pb={2}
                    color="brand.pink"
                >
                    Seat Busy
                </ModalHeader>
                <ModalCloseButton
                    color="text.secondary"
                    size="md"
                    top="14px"
                    right="14px"
                    borderRadius="full"
                    _hover={{ bg: 'brand.lightGray' }}
                />

                <ModalBody py={2}>
                    {message ? (
                        <Text fontSize="sm" color="text.primary">
                            {message}
                        </Text>
                    ) : null}
                </ModalBody>

                <ModalFooter pt={3} pb={5}>
                    <Button
                        variant="tactilePrimary"
                        onClick={onClose}
                        size="md"
                        height="44px"
                        width="100%"
                        borderRadius="12px"
                    >
                        Choose Another Seat
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default SeatRequestConflictModal;
