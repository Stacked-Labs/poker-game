'use client';

import { useContext, useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    Text,
    VStack,
    Icon,
} from '@chakra-ui/react';
import { MdWarning } from 'react-icons/md';
import { AppContext } from '../contexts/AppStoreProvider';

const TableClosedModal = () => {
    const { appState } = useContext(AppContext);
    // Allow the user to dismiss the modal without clearing the global state.
    const [dismissed, setDismissed] = useState(false);

    const tableClosed = appState.tableClosed;

    if (!tableClosed || dismissed) return null;

    const isEmergency = tableClosed.reason === 'EmergencyWithdrawAll';

    return (
        <Modal
            isOpen={true}
            onClose={() => setDismissed(true)}
            isCentered
            size="sm"
        >
            <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.700" />
            <ModalContent
                bg="gray.900"
                border="1px solid"
                borderColor="red.600"
                boxShadow="0 0 32px rgba(229, 62, 62, 0.35)"
                borderRadius="xl"
                mx={4}
            >
                <ModalCloseButton color="whiteAlpha.600" />
                <ModalHeader>
                    <VStack spacing={2} pt={2}>
                        <Icon
                            as={MdWarning}
                            boxSize={10}
                            color="red.400"
                        />
                        <Text
                            fontSize="lg"
                            fontWeight="bold"
                            color="red.300"
                            textAlign="center"
                        >
                            {isEmergency
                                ? 'Emergency Table Closure'
                                : 'Table Closed'}
                        </Text>
                    </VStack>
                </ModalHeader>
                <ModalBody pb={2}>
                    <Text
                        fontSize="sm"
                        color="whiteAlpha.800"
                        textAlign="center"
                        lineHeight={1.6}
                    >
                        {tableClosed.message}
                    </Text>
                </ModalBody>
                <ModalFooter justifyContent="center" pb={5}>
                    <Button
                        colorScheme="red"
                        variant="outline"
                        size="sm"
                        onClick={() => setDismissed(true)}
                        borderRadius="full"
                    >
                        Dismiss
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default TableClosedModal;
