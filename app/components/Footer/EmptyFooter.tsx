import { Flex } from '@chakra-ui/react';
import CancelSeatRequestButton from './CancelSeatRequestButton';

const EmptyFooter = () => {
    return (
        <Flex
            justifyContent={'end'}
            gap={3}
            p={2}
            height={{ base: '100px', md: '120px' }}
            overflow={'hidden'}
            zIndex={1}
            bg="transparent"
        >
            <CancelSeatRequestButton />
        </Flex>
    );
};

export default EmptyFooter;
