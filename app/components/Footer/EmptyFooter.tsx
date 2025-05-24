import { Flex } from '@chakra-ui/react';

const EmptyFooter = () => {
    return (
        <Flex
            justifyContent={'end'}
            gap={3}
            p={2}
            height={180}
            overflow={'hidden'}
        />
    );
};

export default EmptyFooter;
