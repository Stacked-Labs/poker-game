'use client';
import { Flex, Grid, GridItem, useBreakpointValue } from '@chakra-ui/react';
import EmptySeatButton from '@/app/components/EmptySeatButton';

const MainGamePage = ({ params }: { params: { id: string } }) => {
  const shouldRotate = useBreakpointValue({ base: true, lg: false, md: false });

  // Indices where seats should be placed
  const seatIndices = [1, 2, 3, 5, 9, 15, 19, 21, 22, 23];

  const handleColStart = (index: number): number => {
    const colStartOptions = [2, 1, 3, 1, 3, 1, 3, 1, 3, 2];
    return colStartOptions[index];
  };

  const handleRowStart = (index: number): number => {
    const rowStartOptions = [2, 3, 3, 4, 4, 6, 6, 7, 7, 8];
    const rowStart =
      index >= 0 && index < rowStartOptions.length ? rowStartOptions[index] : 0;

    console.log(index, rowStart);

    return rowStart;
  };

  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      w="100vw"
      h="100vh"
      position="fixed"
      transformOrigin="center center"
    >
      <Flex
        direction="column"
        align="center"
        justify="center"
        bg="gray.200"
        w={!shouldRotate ? '100%' : 'calc( 89vh / 1.6 )'}
        h={!shouldRotate ? 'calc(89vw / 1.6)' : '100%'}
        position="relative"
        backgroundImage={
          !shouldRotate ? '/table-horizontal.png' : '/table-vertical.png'
        }
        backgroundRepeat="no-repeat"
        backgroundPosition="center"
        backgroundSize={!shouldRotate ? '67% auto' : '80% auto'}
      >
        <Grid
          templateRows={!shouldRotate ? 'repeat(5, 1fr)' : 'repeat(9, 1fr)'}
          templateColumns={!shouldRotate ? 'repeat(5, 1fr)' : 'repeat(3, 1fr)'}
          gap={4}
          position="absolute"
          w="100%"
          h="100%"
          p={6}
          placeItems="center"
        >
          {Array.from({ length: !shouldRotate ? 25 : 24 }).map((_, index) => {
            const arrayIndex = seatIndices.indexOf(index);

            let style = {};
            if (index === 5 || index === 15) {
              style = { justifySelf: 'end', alignSelf: 'end' }; // Right align and bottom
            } else if (index === 9 || index === 19) {
              style = { justifySelf: 'start', alignSelf: 'end' }; // Left align and bottom
            } else if (index === 1 || index === 2 || index === 3) {
              style = { alignSelf: 'end' }; // Bottom align only
            }

            return !shouldRotate ? (
              <GridItem key={index} bg="transparent" style={style}>
                {seatIndices.includes(index) ? <EmptySeatButton /> : null}
              </GridItem>
            ) : (
              <GridItem
                key={index}
                colStart={handleColStart(arrayIndex)}
                rowStart={handleRowStart(arrayIndex)}
                bg="transparent"
                style={style}
              >
                {seatIndices.includes(index) ? <EmptySeatButton /> : null}
              </GridItem>
            );
          })}
        </Grid>
      </Flex>
    </Flex>
  );
};

export default MainGamePage;
