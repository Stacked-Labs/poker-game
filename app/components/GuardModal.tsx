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
            bgColor="brand.darkNavy"
            borderRadius="xl"
            overflow="hidden"
            boxShadow="2xl"
            display="flex"
            flexDirection="column"
            gap={2}
            alignItems={'center'}
            border="2px solid"
            borderColor="brand.navy"
        >
            <Flex
                justifyContent={'center'}
                textAlign="center"
                fontSize="lg"
                fontWeight="bold"
                bg={'brand.pink'}
                w={'100%'}
                height={'fit-content'}
                py={2}
            >
                <Text
                    fontWeight={'extrabold'}
                    color={'white'}
                    textTransform="uppercase"
                >
                    Check instead!
                </Text>
            </Flex>
            <Text
                px={'4'}
                py={'1'}
                color={'white'}
                fontWeight={'bold'}
                fontSize="md"
            >
                Are you sure you want to fold?
            </Text>
            <Flex
                width={'100%'}
                justifyContent="space-between"
                gap={4}
                px={4}
                pb={4}
                pt={1}
            >
                <Button
                    flex={1}
                    bg="white"
                    color="brand.darkNavy"
                    border="2px solid"
                    borderColor="brand.navy"
                    borderRadius="10px"
                    fontWeight="bold"
                    textTransform="uppercase"
                    fontSize={{ base: 'xs', sm: 'sm', md: 'sm' }}
                    _hover={{
                        bg: 'brand.lightGray',
                        transform: 'translateY(-1px)',
                        boxShadow: 'lg',
                    }}
                    _active={{
                        transform: 'translateY(0px)',
                    }}
                    transition="all 0.2s"
                    onClick={() => onClose()}
                >
                    Back
                </Button>
                <Button
                    flex={1}
                    bg={'brand.pink'}
                    border="2px solid"
                    borderColor="brand.pink"
                    borderRadius="10px"
                    color={'white'}
                    fontWeight="bold"
                    textTransform="uppercase"
                    fontSize={{ base: 'xs', sm: 'sm', md: 'sm' }}
                    _hover={{
                        bg: '#c9094c',
                        transform: 'translateY(-1px)',
                        boxShadow: 'lg',
                    }}
                    _active={{
                        transform: 'translateY(0px)',
                    }}
                    transition="all 0.2s"
                    onClick={() => {
                        if (username) {
                            handleFold(username);
                            onClose();
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
