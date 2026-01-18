import { tableColors } from '@/app/utils/tableColors';
import {
    Box,
    Flex,
    Select,
    Text,
    Switch,
    HStack,
    Icon,
} from '@chakra-ui/react';
import { FaMoon } from 'react-icons/fa';
import { IoMdSunny } from 'react-icons/io';
import { useColorMode } from '@chakra-ui/react';
import React, { useState } from 'react';

const GameSettings = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const tableColorKey = localStorage.getItem('tableColorKey') ?? 'green';
    const [selectedColor, onColorChange] = useState<string>(tableColorKey);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const key = e.target.value;
        onColorChange(key);

        localStorage.setItem('tableColorKey', key);
        window.dispatchEvent(new Event('tableColorChanged'));
    };

    return (
        <Box>
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
                    gap={3}
                >
                    <Text
                        fontSize={{ base: 'md', md: 'lg' }}
                        fontWeight="bold"
                        color="text.secondary"
                    >
                        Table Color
                    </Text>
                    <Select
                        id="color-select"
                        value={selectedColor}
                        onChange={handleSelectChange}
                        variant="outline"
                        width="50%"
                        bg={tableColors[selectedColor].color}
                        color={
                            selectedColor == 'white'
                                ? 'brand.darkNavy'
                                : 'white'
                        }
                        fontWeight={'bold'}
                        sx={{
                            '& > option:checked': {
                                color: 'text.primary',
                                fontWeight: 'bold',
                            },
                            '& > option': {
                                bg: 'card.white',
                                color: 'text.primary',
                            },
                        }}
                        _hover={{
                            cursor: 'pointer',
                        }}
                        defaultValue={tableColorKey}
                    >
                        {tableColors &&
                            Object.entries(tableColors).map(([key]) => (
                                <option key={key} value={key}>
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                </option>
                            ))}
                    </Select>
                </Flex>
            </Box>
            <Box
                bg="card.white"
                borderRadius="16px"
                border="2px solid"
                borderColor="border.lightGray"
                p={{ base: 5, md: 6 }}
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
            >
                <Flex
                    direction={{ base: 'column', sm: 'row' }}
                    justify={'space-between'}
                    align={{ base: 'start', sm: 'center' }}
                    gap={3}
                >
                    <Text
                        fontSize={{ base: 'md', md: 'lg' }}
                        fontWeight="bold"
                        color="text.secondary"
                    >
                        Theme
                    </Text>
                    <HStack spacing={3}>
                        <Icon
                            as={colorMode === 'light' ? IoMdSunny : FaMoon}
                            boxSize={{ base: 5, md: 6 }}
                            color="text.secondary"
                        />
                        <Switch
                            size="lg"
                            isChecked={colorMode === 'dark'}
                            onChange={toggleColorMode}
                            colorScheme="green"
                        />
                    </HStack>
                </Flex>
            </Box>
        </Box>
    );
};

export default GameSettings;
