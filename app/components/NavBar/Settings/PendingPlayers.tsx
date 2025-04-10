import useIsTableOwner from '@/app/hooks/useIsTableOwner';
import { PendingPlayer } from '@/app/interfaces';
import { Flex, Box, Button, Text } from '@chakra-ui/react';
import React from 'react';
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';

interface Props {
    pendingPlayers: PendingPlayer[];
    handleAcceptPlayer: (uuid: string) => void;
    handleDenyPlayer: (uuid: string) => void;
}

const PendingPlayers = ({
    pendingPlayers,
    handleAcceptPlayer,
    handleDenyPlayer,
}: Props) => {
    const isOwner = useIsTableOwner();

    if (pendingPlayers && pendingPlayers.length > 0) {
        return (
            <>
                <Text color={'white'}>Pending</Text>
                {pendingPlayers.map((player: PendingPlayer, index: number) => {
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
                                                    {player.buyIn}
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
                                                    {player.seatId}
                                                </Text>
                                            </Text>
                                        </Flex>
                                    </Flex>
                                </Flex>

                                {isOwner && (
                                    <Flex
                                        gap={{ base: 5, lg: 10 }}
                                        py={{ base: 5, lg: 0 }}
                                        width={'20%'}
                                        justifyContent={'space-between'}
                                    >
                                        <Button
                                            variant={'settingsSmallButton'}
                                            bg={'green.500'}
                                            _hover={{ background: 'green' }}
                                            onClick={() =>
                                                handleAcceptPlayer(player.uuid)
                                            }
                                        >
                                            <FaCircleCheck />
                                        </Button>
                                        <Button
                                            variant={'settingsSmallButton'}
                                            bg={'red.500'}
                                            _hover={{ background: 'red' }}
                                            onClick={() =>
                                                handleDenyPlayer(player.uuid)
                                            }
                                        >
                                            <FaCircleXmark />
                                        </Button>
                                    </Flex>
                                )}
                            </Flex>
                        );
                    }
                })}
            </>
        );
    }
};

export default PendingPlayers;
