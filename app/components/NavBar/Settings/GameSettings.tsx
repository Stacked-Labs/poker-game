import {
    Box,
    Flex,
    Input,
    Switch,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
} from '@chakra-ui/react';
import React, { useState } from 'react';

const GameSettings = () => {
    const [isAnte, setIsAnte] = useState<boolean>(false);

    return (
        <Box>
            <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight={'bold'}
                mb={{ base: 4, md: 6 }}
                color="white"
                fontFamily="Poppins, sans-serif"
            >
                Game Settings
            </Text>

            <Box
                bg="#262626"
                borderRadius="lg"
                border="2px solid"
                borderColor="#363535"
                p={{ base: 4, md: 6 }}
                mb={6}
            >
                <Flex
                    direction={{ base: 'column', sm: 'row' }}
                    justify={'space-between'}
                    align={{ base: 'start', sm: 'center' }}
                    mb={4}
                    pb={4}
                    borderBottom="1px"
                    borderColor="#363535"
                    gap={3}
                >
                    <Box flex={1}>
                        <Text
                            fontSize={{ base: 'md', md: 'lg' }}
                            fontWeight="semibold"
                            color="white"
                            fontFamily="Poppins, sans-serif"
                        >
                            Enable Ante
                        </Text>
                        <Text
                            fontSize={'sm'}
                            color="#c6c6c6"
                            mt={1}
                            fontFamily="Poppins, sans-serif"
                        >
                            Add an ante requirement for each hand
                        </Text>
                    </Box>
                    <Switch
                        colorScheme="green"
                        size={{ base: 'md', md: 'lg' }}
                        isChecked={isAnte}
                        onChange={() => setIsAnte(!isAnte)}
                    />
                </Flex>

                <Text
                    fontSize={{ base: 'md', md: 'lg' }}
                    fontWeight={'semibold'}
                    mb={4}
                    color="white"
                    fontFamily="Poppins, sans-serif"
                >
                    Blind Levels
                </Text>

                <TableContainer overflowX="auto">
                    <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                        <Thead bg="#363535">
                            <Tr>
                                <Th
                                    color={'#c6c6c6'}
                                    fontSize="xs"
                                    fontFamily="Poppins, sans-serif"
                                >
                                    Small Blind
                                </Th>
                                <Th
                                    color={'#c6c6c6'}
                                    fontSize="xs"
                                    fontFamily="Poppins, sans-serif"
                                >
                                    Big Blind
                                </Th>
                                {isAnte && (
                                    <Th
                                        color={'#c6c6c6'}
                                        fontSize="xs"
                                        fontFamily="Poppins, sans-serif"
                                    >
                                        Ante
                                    </Th>
                                )}
                                <Th
                                    color={'#c6c6c6'}
                                    fontSize="xs"
                                    fontFamily="Poppins, sans-serif"
                                >
                                    Duration (min)
                                </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            <Tr _hover={{ bg: '#2e2e2e' }}>
                                <Td>
                                    <Input
                                        variant="outline"
                                        placeholder="10"
                                        size="sm"
                                        bg="#363535"
                                        color="white"
                                        borderColor="#424242"
                                        _hover={{ borderColor: '#1db954' }}
                                        _focus={{
                                            borderColor: '#1ed760',
                                            boxShadow: '0 0 0 1px #1ed760',
                                        }}
                                        _placeholder={{ color: '#c6c6c6' }}
                                        fontFamily="Poppins, sans-serif"
                                    />
                                </Td>
                                <Td>
                                    <Input
                                        variant="outline"
                                        placeholder="20"
                                        size="sm"
                                        bg="#363535"
                                        color="white"
                                        borderColor="#424242"
                                        _hover={{ borderColor: '#1db954' }}
                                        _focus={{
                                            borderColor: '#1ed760',
                                            boxShadow: '0 0 0 1px #1ed760',
                                        }}
                                        _placeholder={{ color: '#c6c6c6' }}
                                        fontFamily="Poppins, sans-serif"
                                    />
                                </Td>
                                {isAnte && (
                                    <Td>
                                        <Input
                                            variant="outline"
                                            placeholder="5"
                                            size="sm"
                                            bg="#363535"
                                            color="white"
                                            borderColor="#424242"
                                            _hover={{ borderColor: '#1db954' }}
                                            _focus={{
                                                borderColor: '#1ed760',
                                                boxShadow: '0 0 0 1px #1ed760',
                                            }}
                                            _placeholder={{ color: '#c6c6c6' }}
                                            fontFamily="Poppins, sans-serif"
                                        />
                                    </Td>
                                )}
                                <Td>
                                    <Input
                                        variant="outline"
                                        placeholder="15"
                                        size="sm"
                                        bg="#363535"
                                        color="white"
                                        borderColor="#424242"
                                        _hover={{ borderColor: '#1db954' }}
                                        _focus={{
                                            borderColor: '#1ed760',
                                            boxShadow: '0 0 0 1px #1ed760',
                                        }}
                                        _placeholder={{ color: '#c6c6c6' }}
                                        fontFamily="Poppins, sans-serif"
                                    />
                                </Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
};

export default GameSettings;
