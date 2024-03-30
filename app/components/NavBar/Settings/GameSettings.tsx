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
        <Box marginTop={6}>
            <Flex direction={'column'} gap={3} marginBottom={10}>
                <Text fontSize={'2xl'} fontWeight={'bold'}>
                    Blind Levels
                </Text>
                <Flex gap={10}>
                    <Text fontSize={'xl'}>Ante</Text>
                    <Switch
                        colorScheme="green"
                        size="lg"
                        isChecked={isAnte}
                        onChange={() => setIsAnte(!isAnte)}
                    />
                </Flex>
            </Flex>
            <TableContainer>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th color={'white'}>Small Blind</Th>
                            <Th color={'white'}>Big Blind</Th>
                            {isAnte && <Th color={'white'}>Ante</Th>}
                            <Th color={'white'}>Duration</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td>
                                <Input variant={'outlined'} />
                            </Td>
                            <Td>
                                <Input variant={'outlined'} />
                            </Td>
                            {isAnte && (
                                <Td>
                                    <Input variant={'outlined'} />
                                </Td>
                            )}
                            <Td>
                                <Input variant={'outlined'} />
                            </Td>
                        </Tr>
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default GameSettings;
