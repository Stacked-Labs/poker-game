import { Flex } from '@chakra-ui/react';

const EmptyFooter = () => {
    return (
        <Flex
            justifyContent={'end'}
            gap={3}
            p={2}
            height={{ base: '100px', md: '150px' }}
            overflow={'hidden'}
        />
    );
};

export default EmptyFooter;
