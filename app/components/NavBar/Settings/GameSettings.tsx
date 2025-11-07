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
                mb={6}
                color="text.secondary"
                letterSpacing="-0.02em"
            >
                Game Settings
            </Text>

            <Box
                bg="card.white"
                borderRadius="16px"
                border="2px solid"
                borderColor="border.lightGray"
                p={{ base: 5, md: 6 }}
                mb={6}
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
            >
                <Flex
                    direction={{ base: 'column', sm: 'row' }}
                    justify={'space-between'}
                    align={{ base: 'start', sm: 'center' }}
                    mb={6}
                    pb={5}
                    borderBottom="2px solid"
                    borderColor="card.lightGray"
                    gap={3}
                >
                    <Box flex={1}>
                        <Text
                            fontSize={{ base: 'md', md: 'lg' }}
                            fontWeight="bold"
                            color="text.secondary"
                        >
                            Enable Ante
                        </Text>
                        <Text
                            fontSize={'sm'}
                            color="gray.600"
                            mt={1}
                            fontWeight="medium"
                        >
                            Add an ante requirement for each hand
                        </Text>
                    </Box>
                    <Switch
                        colorScheme="green"
                        size={{ base: 'md', md: 'lg' }}
                        isChecked={isAnte}
                        onChange={() => setIsAnte(!isAnte)}
                        sx={{
                            'span.chakra-switch__track': {
                                bg: 'gray.300',
                                _checked: {
                                    bg: 'brand.green',
                                },
                            },
                        }}
                    />
                </Flex>

                <Text
                    fontSize={{ base: 'md', md: 'lg' }}
                    fontWeight={'bold'}
                    mb={4}
                    color="text.secondary"
                >
                    Blind Levels
                </Text>

                <TableContainer
                    overflowX="auto"
                    borderRadius="12px"
                    border="2px solid"
                    borderColor="border.lightGray"
                >
                    <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                        <Thead bg="card.lightGray">
                            <Tr>
                                <Th
                                    color={'text.secondary'}
                                    fontSize="xs"
                                    fontWeight="bold"
                                >
                                    Small Blind
                                </Th>
                                <Th
                                    color={'text.secondary'}
                                    fontSize="xs"
                                    fontWeight="bold"
                                >
                                    Big Blind
                                </Th>
                                {isAnte && (
                                    <Th
                                        color={'text.secondary'}
                                        fontSize="xs"
                                        fontWeight="bold"
                                    >
                                        Ante
                                    </Th>
                                )}
                                <Th
                                    color={'text.secondary'}
                                    fontSize="xs"
                                    fontWeight="bold"
                                >
                                    Duration (min)
                                </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            <Tr
                                _hover={{
                                    bg: 'input.lightGray',
                                }}
                                transition="all 0.2s ease"
                            >
                                <Td>
                                    <Input
                                        variant={'settings'}
                                        placeholder="5"
                                    />
                                </Td>
                                <Td>
                                    <Input
                                        variant={'settings'}
                                        placeholder="20"
                                    />
                                </Td>
                                {isAnte && (
                                    <Td>
                                        <Input
                                            variant={'settings'}
                                            placeholder="5"
                                        />
                                    </Td>
                                )}
                                <Td>
                                    <Input
                                        variant={'settings'}
                                        placeholder="15"
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
