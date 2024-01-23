'use client';

import { Flex, Grid, GridItem, useBreakpointValue } from '@chakra-ui/react';
import EmptySeatButton from '@/app/components/EmptySeatButton';
import { useState, useContext } from 'react';
import { MetaStateContext } from '@/app/state';
import TakenSeatButton from '@/app/components/TakenSeatButton';

const MainGamePage = ({ params }: { params: { id: string } }) => {
    const seatIndices = [1, 2, 3, 5, 9, 15, 19, 21, 23];
    const { isUserSitting, User } = useContext(MetaStateContext);
    const [seats, setSeats] = useState<Array<any>>(
        Array(10).fill({
            player: null,
        })
    );

    const shouldRotate = useBreakpointValue({ base: true, xl: false });
    const userSeat = !shouldRotate ? 22 : 0;

    const handleColStart = (index: number): number => {
        const colStartOptions = [2, 1, 3, 1, 3, 1, 3, 1, 3, 2];
        return colStartOptions[index];
    };

    const handleRowStart = (index: number): number => {
        const rowStartOptions = [2, 3, 3, 4, 4, 6, 6, 7, 7, 8];
        const rowStart =
            index >= 0 && index < rowStartOptions.length
                ? rowStartOptions[index]
                : 0;

        return rowStart;
    };

    return (
        <Flex
            direction="column"
            justify="center"
            align="center"
            w="80vw"
            h="100vh"
            position="relative"
            transformOrigin="center center"
            bg="gray.200"
        >
            <Flex
                direction="column"
                align="center"
                justify="center"
                w={!shouldRotate ? '100%' : 'calc( 89vh / 1.6 )'}
                h={!shouldRotate ? 'calc(89vw / 1.6)' : '100%'}
                aspectRatio={16 / 9}
                position="relative"
                backgroundImage={
                    !shouldRotate
                        ? '/table-horizontal.png'
                        : '/table-vertical.png'
                }
                backgroundRepeat="no-repeat"
                backgroundPosition="center"
                backgroundSize={!shouldRotate ? '67% auto' : '80% auto'}
            >
                <Grid
                    templateRows={
                        !shouldRotate ? 'repeat(5, 1fr)' : 'repeat(9, 1fr)'
                    }
                    templateColumns={
                        !shouldRotate ? 'repeat(5, 1fr)' : 'repeat(3, 1fr)'
                    }
                    gap={4}
                    w={['80vw', '100%']}
                    h="100%"
                    placeItems="center"
                    // bg={'red'}
                    position={'absolute'}
                >
                    {Array.from({ length: !shouldRotate ? 25 : 24 }).map(
                        (_, index) => {
                            const arrayIndex = seatIndices.indexOf(index);
                            let buttonComponent = <EmptySeatButton />;

                            let style = {};
                            if (index === 5 || index === 15) {
                                style = {
                                    justifySelf: 'start',
                                    alignSelf: 'end',
                                }; // Right align and bottom
                            } else if (index === 9 || index === 19) {
                                style = {
                                    justifySelf: 'end',
                                    alignSelf: 'end',
                                }; // Left align and bottom
                            } else if (
                                index === 1 ||
                                index === 2 ||
                                index === 3
                            ) {
                                style = { marginTop: 20 }; // Bottom align only
                            }

                            //If User is sitting auto fill in seat five for him
                            if (index === userSeat) {
                                console.log('User is sitting', index);
                                buttonComponent = isUserSitting ? (
                                    <TakenSeatButton player={User} />
                                ) : (
                                    <EmptySeatButton />
                                );
                            } else if (seatIndices.includes(index)) {
                                buttonComponent = <EmptySeatButton />;
                            }
                            return !shouldRotate ? (
                                <GridItem
                                    key={index}
                                    bg="transparent"
                                    style={style}
                                    w={'100%'}
                                    h={'100%'}
                                    display={'flex'}
                                    justifyContent={'center'}
                                    alignItems={'center'}
                                >
                                    {arrayIndex !== -1 && <EmptySeatButton />}
                                </GridItem>
                            ) : (
                                <GridItem
                                    key={index}
                                    colStart={handleColStart(arrayIndex)}
                                    rowStart={handleRowStart(arrayIndex)}
                                    bg="transparent"
                                    w={'100%'}
                                    h={'100%'}
                                    display={'flex'}
                                    justifyContent={'center'}
                                    alignItems={'center'}
                                >
                                    {arrayIndex !== -1 && <EmptySeatButton />}
                                </GridItem>
                            );
                        }
                    )}
                </Grid>
            </Flex>
        </Flex>
    );
};

export default MainGamePage;
