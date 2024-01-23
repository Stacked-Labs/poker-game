'use client';
import {
	CircularProgress,
	Flex,
	Grid,
	GridItem,
	Image,
	useBreakpointValue,
} from '@chakra-ui/react';
import EmptySeatButton from '@/app/components/EmptySeatButton';
import { useEffect, useState, useContext, ReactNode } from 'react';
import { MetaStateContext } from '@/app/state';
import TakenSeatButton from '@/app/components/TakenSeatButton';

const MainGamePage = ({ params }: { params: { id: string } }) => {
	const seatIndices = [1, 2, 3, 5, 9, 15, 19, 21, 23];
	const [loading, setLoading] = useState(true);
	const [progress, setProgress] = useState(0);
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
			index >= 0 && index < rowStartOptions.length ? rowStartOptions[index] : 0;

		return rowStart;
	};

	useEffect(() => {
		const startTime = Date.now();
		const duration = 300;

		const updateProgress = () => {
			const currentTime = Date.now();
			const elapsedTime = currentTime - startTime;

			const newProgress = Math.min((elapsedTime / duration) * 100, 100);

			setProgress(newProgress);

			if (elapsedTime >= duration + 1000) {
				setLoading(false);
			} else {
				requestAnimationFrame(updateProgress);
			}
		};

		requestAnimationFrame(updateProgress);

		return () => {};
	}, []);

	if (loading) {
		return (
			<Flex
				justify="center"
				align="center"
				w="100vw"
				h="100vh"
				position="fixed"
				backgroundColor="white"
				zIndex={999}
			>
				<CircularProgress
					value={progress}
					isIndeterminate={false}
					color="grey"
					size="100px"
				/>
			</Flex>
		);
	}

	return (
		<Flex
			direction="column"
			alignSelf="center"
			justifySelf="center"
			bgColor={'transparent'}
			h="100vh"
			// maintain 16/9 ratio for width
			aspectRatio={16 / 9}
			position="relative"
			backgroundImage={
				!shouldRotate ? '/table-horizontal.png' : '/table-vertical.png'
			}
			overflow={'hidden'}
			backgroundRepeat="no-repeat"
			backgroundPosition="center"
			backgroundSize={'cover'}
			zIndex={1}
		>
			<Grid
				templateRows={!shouldRotate ? 'repeat(5, 1fr)' : 'repeat(9, 1fr)'}
				templateColumns={!shouldRotate ? 'repeat(5, 1fr)' : 'repeat(3, 1fr)'}
				gap={4}
				w="100%"
				h="100%"
				placeItems="center"
			>
				{Array.from({ length: !shouldRotate ? 25 : 24 }).map((_, index) => {
					const arrayIndex = seatIndices.indexOf(index);
					let buttonComponent = <EmptySeatButton />;

					let style = {};
					if (index === 5 || index === 15) {
						style = { justifySelf: 'start', alignSelf: 'end' }; // Right align and bottom
					} else if (index === 9 || index === 19) {
						style = { justifySelf: 'end', alignSelf: 'end' }; // Left align and bottom
					} else if (index === 1 || index === 2 || index === 3) {
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
						<GridItem key={index} bg="transparent" style={style}>
							{arrayIndex !== -1 && <EmptySeatButton />}
						</GridItem>
					) : (
						<GridItem
							key={index}
							colStart={handleColStart(arrayIndex)}
							rowStart={handleRowStart(arrayIndex)}
							bg="transparent"
						>
							{arrayIndex !== -1 && <EmptySeatButton />}
						</GridItem>
					);
				})}
			</Grid>
		</Flex>
	);
};

export default MainGamePage;
