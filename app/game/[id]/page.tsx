'use client';
import {
	Box,
	Button,
	CircularProgress,
	Flex,
	Grid,
	GridItem,
	Icon,
	Text,
	useBreakpointValue,
	useMediaQuery,
} from '@chakra-ui/react';
import EmptySeatButton from '@/app/components/EmptySeatButton';
import { useEffect, useState } from 'react';
import SideBarChat from '@/app/components/ChatBox/SideBarChat';
import { Seat } from '@/app/interfaces';
import { useCurrentUser } from '@/app/contexts/currentUserContext';
import { AiOutlineDisconnect } from 'react-icons/ai';
import { useAccount, useDisconnect } from 'wagmi';

const MainGamePage = ({ params }: { params: { id: string } }) => {
	// Indices where seats should be placed
	const seatIndices = [1, 2, 3, 5, 9, 15, 19, 21, 22, 23];

	const [loading, setLoading] = useState(true);
	const [progress, setProgress] = useState(0);
	const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
	const [seats, setSeats] = useState<Array<Seat>>(
		Array(10).fill({
			player: null,
		})
	);

	const { currentUser } = useCurrentUser();
	const { disconnect } = useDisconnect();
	const { address } = useAccount();

	const shouldRotate = useBreakpointValue({ base: true, xl: false });
	const [isLargerScreen] = useMediaQuery('(min-width: 1025px)');

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

	const handleDisconnectButtonClick = () => {
		disconnect();
	};

	useEffect(() => {
		if (!currentUser.seatedAt) {
			disconnect();
		}
	}, [currentUser.seatedAt, disconnect]);

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
				backgroundColor="rgba(255, 255, 255, 0.8)"
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
								{arrayIndex !== -1 && (
									<EmptySeatButton
										seats={seats}
										handleSetSeats={setSeats}
										seatIndex={arrayIndex}
									/>
								)}
							</GridItem>
						) : (
							<GridItem
								key={index}
								colStart={handleColStart(arrayIndex)}
								rowStart={handleRowStart(arrayIndex)}
								bg="transparent"
							>
								{arrayIndex !== -1 && (
									<EmptySeatButton
										seats={seats}
										handleSetSeats={setSeats}
										seatIndex={arrayIndex}
									/>
								)}
							</GridItem>
						);
					})}
				</Grid>
				<Box
					position={'absolute'}
					top={0}
					right={0}
					height={isChatBoxOpen ? '100%' : 'fit-content'}
					width={isChatBoxOpen && !isLargerScreen ? '100%' : 'fit-content'}
					padding={2}
					alignSelf={'end'}
					textAlign={'end'}
				>
					<SideBarChat handleOpen={setIsChatBoxOpen} />
				</Box>
				<Box
					position={'absolute'}
					top={0}
					left={0}
					padding={2}
					alignSelf={'end'}
					textAlign={'end'}
				>
					<Flex
						justifyContent={'center'}
						alignItems={'center'}
						border={'black'}
						rounded={'xl'}
						padding={4}
						gap={2}
						color="white.200"
						bgColor="gray.50"
					>
						<Text>
							{address
								? `${address.substring(0, 4)}...${address.slice(-5)}`
								: 'Not connected.'}
						</Text>
						<Button
							size="lg"
							w={'fit-content'}
							paddingX={3}
							h={8}
							iconSpacing={0}
							leftIcon={<Icon as={AiOutlineDisconnect} color="white" />}
							bg="red.500"
							color="black"
							_hover={{
								borderColor: 'white',
								borderWidth: '2px',
							}}
							onClick={handleDisconnectButtonClick}
							isDisabled={address ? false : true}
							// _disabled={{
							// 	cursor: 'none',
							// 	bg: 'gray.500',
							// 	color: 'gray.500',
							// }}
						></Button>
					</Flex>
				</Box>
			</Flex>
		</Flex>
	);
};

export default MainGamePage;
