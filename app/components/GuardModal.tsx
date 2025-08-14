import { Button, Flex, ModalContent, Text } from '@chakra-ui/react';

const GuardModal = ({
    handleFold,
    username,
    onClose,
}: {
    handleFold: (username: string) => void;
    username: string | null;
    onClose: () => void;
}) => {
    return (
        <ModalContent
            bgColor="gray.100"
            borderRadius="2xl"
            overflow="hidden"
            boxShadow="none"
            display="flex"
            flexDirection="column"
            gap={4}
            alignItems={'center'}
        >
            <Flex
                justifyContent={'center'}
                textAlign="center"
                fontSize="lg"
                fontWeight="bold"
                bg={'red.500'}
                w={'100%'}
                height={'fit-content'}
                py={2}
            >
                <Text fontWeight={'extrabold'} color={'white'}>
                    Check instead!
                </Text>
            </Flex>
            <Text p={'2'} color={'white'} fontWeight={'bold'}>
                Are you sure you want to fold?
            </Text>
            <Flex width={'100%'} justifyContent="space-between" gap={6} p={4}>
                <Button flex={1} onClick={() => onClose()}>
                    Back
                </Button>
                <Button
                    flex={1}
                    bg={'red.500'}
                    border="5px double white"
                    color={'white'}
                    _hover={{ bg: 'red.600' }}
                    onClick={() => {
                        if (username) {
                            handleFold(username);
                        }
                    }}
                >
                    Fold Anyway
                </Button>
            </Flex>
        </ModalContent>
    );
};

export default GuardModal;
