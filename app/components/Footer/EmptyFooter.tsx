import { Flex } from '@chakra-ui/react';
import CancelSeatRequestButton from './CancelSeatRequestButton';

const EmptyFooter = () => {
    return (
        <Flex
            justifyContent={'end'}
            gap={3}
            p={2}
            height={{ base: '80px', md: '80px' }}
            overflow={'hidden'}
            zIndex={1}
        >
            <CancelSeatRequestButton />
        </Flex>
    );
};

export default EmptyFooter;
