import { Text } from '@chakra-ui/react';
import React from 'react';

const TitleText = ({ text }: { text: string }) => {
    return (
        <Text
            fontSize={'4xl'}
            fontWeight={'bolder'}
            textTransform={'uppercase'}
            marginBottom={16}
            borderStartWidth={4}
            borderColor={'green.500'}
            paddingStart={3}
            textAlign={'start'}
            alignSelf={'start'}
        >
            {text}
        </Text>
    );
};

export default TitleText;
