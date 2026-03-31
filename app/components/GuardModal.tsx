import { Button, Flex, Icon, ModalContent, Text, VStack } from '@chakra-ui/react';
import { MdWarning } from 'react-icons/md';
import { keyframes } from '@emotion/react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const GuardModal = ({
    handleFold,
    handleCheck,
    onClose,
}: {
    handleFold: () => void;
    handleCheck: () => void;
    onClose: () => void;
}) => {
    return (
        <ModalContent
            bg="card.white"
            borderRadius="20px"
            borderWidth="2px"
            borderColor="border.lightGray"
            boxShadow="0 16px 40px rgba(0, 0, 0, 0.18)"
            maxW="360px"
            mx={4}
            overflow="hidden"
            animation={`${fadeIn} 0.25s ease-out`}
        >
            <VStack spacing={1} pt={5} pb={2}>
                <Icon as={MdWarning} boxSize={8} color="brand.pink" />
                <Text
                    fontSize="lg"
                    fontWeight="bold"
                    color="brand.pink"
                    textTransform="uppercase"
                    letterSpacing="-0.02em"
                >
                    Check Instead!
                </Text>
            </VStack>

            <Text
                fontSize="sm"
                color="text.primary"
                textAlign="center"
                px={4}
                py={2}
            >
                Are you sure you want to fold?
            </Text>

            <Flex gap={3} px={4} pb={5} pt={1}>
                <Button
                    flex={1}
                    bg="brand.green"
                    color="white"
                    border="none"
                    borderRadius="12px"
                    height="44px"
                    fontWeight="bold"
                    textTransform="uppercase"
                    fontSize={{ base: 'xs', sm: 'sm' }}
                    _hover={{
                        transform: 'translateY(-1px)',
                        boxShadow:
                            '0 10px 18px rgba(54, 163, 123, 0.22)',
                    }}
                    _active={{ transform: 'translateY(0)' }}
                    transition="all 0.2s ease"
                    onClick={() => {
                        handleCheck();
                        onClose();
                    }}
                >
                    Check
                </Button>
                <Button
                    flex={1}
                    bg="brand.pink"
                    color="white"
                    border="none"
                    borderRadius="12px"
                    height="44px"
                    fontWeight="bold"
                    textTransform="uppercase"
                    fontSize={{ base: 'xs', sm: 'sm' }}
                    _hover={{
                        transform: 'translateY(-1px)',
                        boxShadow:
                            '0 10px 18px rgba(235, 11, 92, 0.22)',
                    }}
                    _active={{ transform: 'translateY(0)' }}
                    transition="all 0.2s ease"
                    onClick={() => {
                        handleFold();
                        onClose();
                    }}
                >
                    Fold Anyway
                </Button>
            </Flex>
        </ModalContent>
    );
};

export default GuardModal;
