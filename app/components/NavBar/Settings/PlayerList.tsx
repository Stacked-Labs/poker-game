import { Player } from '@/app/interfaces';
import { Flex, Button, Text, Box } from '@chakra-ui/react';
import React from 'react';
import { FaCheck } from 'react-icons/fa';
import { GiBootKick } from 'react-icons/gi';

const PlayerList = ({ players }: { players: Player[] }) => {
    return (
        <>
            {players.map((player: Player, index: number) => (
                <Flex key={index} alignItems={'center'} marginY={8} gap={20}>
                    <Flex
                        flex={1}
                        justifyContent={'space-around'}
                        alignItems={'center'}
                        textAlign={'center'}
                    >
                        <Text flex={2}>{player.username}</Text>
                        <Box
                            bgColor={'charcoal.600'}
                            flex={1}
                            paddingY={2}
                            paddingX={5}
                            borderRadius={4}
                            borderWidth={1}
                            borderColor={'grey'}
                            textAlign={'left'}
                        >
                            <Text>ID: {player.address}</Text>
                        </Box>
                    </Flex>
                    <Flex flex={1} gap={50}>
                        <Button
                            flex={1}
                            gap={3}
                            bg={'green.500'}
                            border={0}
                            alignItems={'center'}
                            _hover={{ background: 'green' }}
                        >
                            Accept
                            <FaCheck />
                        </Button>
                        <Button
                            flex={1}
                            gap={3}
                            bg={'red.500'}
                            border={0}
                            alignItems={'center'}
                            _hover={{ background: 'red' }}
                        >
                            Kick
                            <GiBootKick size={25} />
                        </Button>
                    </Flex>
                </Flex>
            ))}
        </>
    );
};

export default PlayerList;
