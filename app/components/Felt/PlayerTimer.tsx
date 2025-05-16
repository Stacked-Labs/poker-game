import { Flex, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

interface PlayerTimerProps {
    actionDeadline: number;
    isActivePlayer: boolean;
}

const PlayerTimer: React.FC<PlayerTimerProps> = ({
    actionDeadline,
    isActivePlayer,
}) => {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        if (!isActivePlayer || !actionDeadline) {
            setTimeLeft(null);
            return;
        }

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const remainingMs = actionDeadline - now;
            if (remainingMs > 0) {
                setTimeLeft(Math.ceil(remainingMs / 1000));
            } else {
                setTimeLeft(0);
            }
        };

        calculateTimeLeft(); // Calculate immediately on render

        const intervalId = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(intervalId);
    }, [actionDeadline, isActivePlayer]);

    if (!isActivePlayer || timeLeft === null || timeLeft < 0) {
        return null;
    }

    return (
        <Flex
            justifyContent="center"
            alignItems="center"
            backgroundColor={timeLeft <= 5 ? 'red.500' : 'white'}
            borderRadius="md"
            paddingX={2}
            paddingY={1}
        >
            <Text
                fontSize="lg"
                fontWeight="bold"
                color={timeLeft <= 5 ? 'red.500' : 'white'}
            >
                Time left: {timeLeft}s
            </Text>
        </Flex>
    );
};

export default PlayerTimer;
