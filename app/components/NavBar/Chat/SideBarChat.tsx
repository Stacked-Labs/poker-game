import { Box, Flex, IconButton, useMediaQuery } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Chatbox from './ChatBox';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';

const SideBarChat = ({
    isOpen,
    onToggle,
}: {
    isOpen: boolean;
    onToggle: () => void;
}) => {
    const [isLargerScreen] = useMediaQuery('(min-width: 770px)');

    return (
        <Flex
            as={motion.div}
            initial={false}
            animate={{
                width: isOpen ? (!isLargerScreen ? '100%' : 500) : 0,
            }}
            overflow={'hidden'}
            whiteSpace={'nowrap'}
            position={'fixed'}
            right={'0'}
            height={'100%'}
            top={'0'}
            bgColor={'gray.200'}
            zIndex={99999999999}
        >
            {isOpen && (
                <>
                    <IconButton
                        onClick={onToggle}
                        icon={isOpen ? <FaChevronRight /> : <FaChevronLeft />}
                        aria-label={'Close Chat Box'}
                        border={'none'}
                        height={{ base: 'fit-content', sm: '100%' }}
                        color={'lightGray'}
                        _hover={{ background: 'none' }}
                        _active={{ background: 'none', outline: 'none' }}
                        _focus={{ outline: 'none', boxShadow: 'none' }}
                    ></IconButton>
                    <Chatbox />
                </>
            )}
        </Flex>
    );
};

export default SideBarChat;
