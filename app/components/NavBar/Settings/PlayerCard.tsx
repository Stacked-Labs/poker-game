import { PendingPlayer } from '@/app/interfaces';
import { Flex, Box, Button, Text, Tooltip, VStack } from '@chakra-ui/react';
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import { GiBootKick } from 'react-icons/gi';

const PlayerCard = ({
    index,
    player,
    isOwner,
    type,
    isKicking,
    handleAcceptPlayer,
    handleDenyPlayer,
    confirmKick,
}: {
    index: number;
    player: PendingPlayer;
    isOwner: boolean;
    type: 'accepted' | 'pending';
    isKicking: boolean | null;
    handleAcceptPlayer?: ((uuid: string) => void) | null;
    handleDenyPlayer?: ((uuid: string) => void) | null;
    confirmKick?: ((player: PendingPlayer) => void) | null;
}) => {
    return (
        <Flex
            key={index}
            alignItems={'center'}
            justifyContent={'space-between'}
            width={'100%'}
            bg="#262626"
            borderRadius="lg"
            border="2px solid"
            borderColor="#363535"
            paddingX={{ base: 3, sm: 4, md: 6 }}
            paddingY={{ base: 3, md: 4 }}
            _hover={{
                borderColor: '#1db954',
                bg: '#2e2e2e',
                transform: 'translateY(-2px)',
            }}
            transition="all 0.2s"
            flexDirection={{ base: 'column', sm: 'row' }}
            gap={{ base: 3, sm: 0 }}
        >
            <VStack
                flex={1}
                justifyContent={{ base: 'center', lg: 'space-around' }}
                alignItems={'start'}
                textAlign={'left'}
                gap={{ base: 2, md: 3 }}
                w={{ base: '100%', sm: 'auto' }}
            >
                <Text
                    color={'white'}
                    fontWeight={'bold'}
                    fontSize={{ base: 'md', md: 'lg', lg: 'xl' }}
                    fontFamily="Poppins, sans-serif"
                >
                    {player.username}
                </Text>
                <Flex
                    gap={{ base: 2, md: 3 }}
                    flex={2}
                    direction={{
                        base: 'column',
                        md: 'row',
                    }}
                    flexWrap="wrap"
                    w="100%"
                >
                    <Box
                        bgColor={'#363535'}
                        paddingY={1}
                        paddingX={3}
                        borderRadius="md"
                        border="1px solid"
                        borderColor="#424242"
                    >
                        <Text
                            fontSize={'xs'}
                            color={'#c6c6c6'}
                            fontWeight="medium"
                            fontFamily="Poppins, sans-serif"
                        >
                            ID: {player.uuid.substring(0, 8)}
                        </Text>
                    </Box>
                    <Flex gap={3} flexWrap="wrap">
                        <Text
                            color={'#c6c6c6'}
                            fontSize="sm"
                            fontFamily="Poppins, sans-serif"
                        >
                            Buy-in:{' '}
                            <Text
                                as={'span'}
                                fontWeight={'bold'}
                                color="#1ed760"
                            >
                                ${player.buyIn}
                            </Text>
                        </Text>
                        <Text
                            color={'#c6c6c6'}
                            fontSize="sm"
                            fontFamily="Poppins, sans-serif"
                        >
                            Seat:{' '}
                            <Text
                                as={'span'}
                                fontWeight={'bold'}
                                color="#1ed760"
                            >
                                #{player.seatId}
                            </Text>
                        </Text>
                    </Flex>
                </Flex>
            </VStack>

            {isOwner &&
                type == 'pending' &&
                handleAcceptPlayer &&
                handleDenyPlayer && (
                    <Flex
                        gap={{ base: 2, lg: 3 }}
                        w={{ base: '100%', sm: 'auto' }}
                        justifyContent={{ base: 'flex-end', sm: 'flex-start' }}
                    >
                        <Tooltip label="Accept Player" placement="top">
                            <Button
                                size={{ base: 'sm', md: 'md' }}
                                bg={'#1db954'}
                                color="white"
                                _hover={{ bg: '#1ed760' }}
                                _active={{ bg: '#1db954' }}
                                onClick={() => handleAcceptPlayer(player.uuid)}
                                minW={{ base: '44px', md: '48px' }}
                                h={{ base: '44px', md: '48px' }}
                                borderRadius="10px"
                                border="2px solid white"
                                fontFamily="Poppins, sans-serif"
                            >
                                <FaCircleCheck size={20} />
                            </Button>
                        </Tooltip>
                        <Tooltip label="Deny Player" placement="top">
                            <Button
                                size={{ base: 'sm', md: 'md' }}
                                bg={'#eb4034'}
                                color="white"
                                _hover={{ bg: '#f55449' }}
                                _active={{ bg: '#eb4034' }}
                                onClick={() => handleDenyPlayer(player.uuid)}
                                minW={{ base: '44px', md: '48px' }}
                                h={{ base: '44px', md: '48px' }}
                                borderRadius="10px"
                                border="2px solid white"
                                fontFamily="Poppins, sans-serif"
                            >
                                <FaCircleXmark size={20} />
                            </Button>
                        </Tooltip>
                    </Flex>
                )}

            {isOwner &&
                type == 'accepted' &&
                isKicking !== null &&
                confirmKick && (
                    <Tooltip label="Kick Player" placement="top">
                        <Button
                            size={{ base: 'sm', md: 'md' }}
                            bg={'#eb4034'}
                            color="white"
                            _hover={{
                                bg: '#f55449',
                            }}
                            _active={{ bg: '#eb4034' }}
                            onClick={() => confirmKick(player)}
                            isLoading={isKicking}
                            loadingText="Kicking..."
                            minW={{ base: '44px', md: '48px' }}
                            h={{ base: '44px', md: '48px' }}
                            borderRadius="10px"
                            border="2px solid white"
                            fontFamily="Poppins, sans-serif"
                        >
                            <GiBootKick size={20} />
                        </Button>
                    </Tooltip>
                )}
        </Flex>
    );
};

export default PlayerCard;
