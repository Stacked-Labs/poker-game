import { Box, Flex, IconButton, useMediaQuery } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Chatbox from './ChatBox';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

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
            direction="column"
            as={motion.div}
            initial={false}
            animate={{
                width: isOpen ? (!isLargerScreen ? '100%' : 500) : 0,
            }}
            overflow="hidden"
            whiteSpace="nowrap"
            position="fixed"
            right="0"
            height="100%"
            top="0"
            bg="white"
            zIndex={1000}
            boxShadow="-4px 0 24px rgba(0, 0, 0, 0.12)"
            borderLeft="1px solid"
            borderColor="rgba(0, 0, 0, 0.08)"
        >
            <Chatbox onToggle={onToggle} />
        </Flex>
    );
};

export default SideBarChat;
