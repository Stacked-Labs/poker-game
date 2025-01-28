import { Player } from '@/app/interfaces';
import { Flex, Box, Button, Text } from '@chakra-ui/react';
import React from 'react';
import { GiBootKick } from 'react-icons/gi';

interface Props {
    acceptedPlayers: Player[] | undefined;
    handleKickPlayer: (uuid: string) => void;
}

const AcceptedPlayers = ({ acceptedPlayers, handleKickPlayer }: Props) => {
    if (acceptedPlayers && acceptedPlayers.length > 0) {
        return (
            <>
                <Text color={'white'}>Accepted</Text>
                {acceptedPlayers.map((player: Player, index: number) => {
                    if (player) {
                        return (
                            <Flex
                                key={index}
                                alignItems={'center'}
                                gap={{ base: 0, lg: 10 }}
                                width={{ base: '90vw', md: '70%' }}
                                borderColor={'grey'}
                                borderWidth={2}
                                borderRadius={10}
                                paddingX={{ base: 5, md: 10 }}
                                paddingY={{ base: 2, md: 5 }}
                                direction={{
                                    base: 'column',
                                    lg: 'row',
                                }}
                            >
                                <Flex
                                    flex={3}
                                    justifyContent={'space-around'}
                                    alignItems={'center'}
                                    textAlign={'left'}
                                    gap={40}
                                >
                                    <Flex
                                        gap={{ base: 2, xl: 5 }}
                                        flex={2}
                                        direction={{
                                            base: 'column',
                                            xl: 'row',
                                        }}
                                    >
                                        <Flex
                                            justifyContent={'space-between'}
                                            direction={{
                                                base: 'column',
                                                xl: 'row',
                                            }}
                                            gap={{ base: 2, xl: 5 }}
                                        >
                                            <Flex
                                                gap={{ base: 2, xl: 5 }}
                                                direction={{
                                                    base: 'column',
                                                    xl: 'row',
                                                }}
                                            >
                                                <Box
                                                    bgColor={'charcoal.600'}
                                                    paddingY={1}
                                                    paddingX={2}
                                                    borderRadius={10}
                                                >
                                                    <Text
                                                        fontSize={'small'}
                                                        color={'white'}
                                                    >
                                                        ID:{' '}
                                                        {player.uuid.substring(
                                                            0,
                                                            8
                                                        )}
                                                    </Text>
                                                </Box>
                                            </Flex>
                                            <Text color={'white'}>
                                                Total buy-in:{' '}
                                                <Text
                                                    as={'span'}
                                                    fontWeight={'bold'}
                                                >
                                                    {player.totalBuyIn}
                                                </Text>
                                            </Text>
                                        </Flex>
                                        <Flex
                                            gap={4}
                                            justifyContent={'space-between'}
                                            direction={{
                                                base: 'column',
                                                xl: 'row',
                                            }}
                                        >
                                            <Text color={'white'}>
                                                Seat:{' '}
                                                <Text
                                                    as={'span'}
                                                    fontWeight={'bold'}
                                                >
                                                    {player.seatID}
                                                </Text>
                                            </Text>
                                        </Flex>
                                    </Flex>
                                </Flex>

                                <Flex
                                    gap={{ base: 5, lg: 10 }}
                                    py={{ base: 5, lg: 0 }}
                                    width={'20%'}
                                    justifyItems={'space-between'}
                                >
                                    <Box width={'50%'}></Box>
                                    <Button
                                        variant={'settingsSmallButton'}
                                        bg={'red.500'}
                                        marginLeft={{ base: 5, lg: 0 }}
                                        _hover={{ background: 'red' }}
                                        onClick={() =>
                                            handleKickPlayer(player.uuid)
                                        }
                                    >
                                        <GiBootKick />
                                    </Button>
                                </Flex>
                            </Flex>
                        );
                    }
                })}
            </>
        );
    }
};

export default AcceptedPlayers;
