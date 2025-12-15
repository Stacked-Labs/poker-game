import { Flex } from '@chakra-ui/react';
import SeatRequestStatusBadge from './SeatRequestStatusBadge';

const EmptyFooter = () => {
    return (
        <Flex
            className="empty-footer"
            justifyContent={'end'}
            gap={3}
            p={2}
            height="auto"
            maxHeight={{ base: '70px', md: '100px' }}
            minHeight={{ base: '50px', md: '70px' }}
            overflow={'hidden'}
            zIndex={1}
            bg="transparent"
        >
            <SeatRequestStatusBadge />
        </Flex>
    );
};

export default EmptyFooter;
