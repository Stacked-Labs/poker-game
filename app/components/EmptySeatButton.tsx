import React, { useState } from 'react';
import {
  Button,
  Box,
  Icon,
  Modal,
  Tooltip,
  VStack,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { motion, MotionStyle } from 'framer-motion';
import { FaDiscord, FaWallet } from 'react-icons/fa';

const MotionButton = motion(Button);

const EmptySeatButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleOpenModal = () => {
    setIsLoading(true);
    onOpen();
  };

  const handleCloseModal = () => {
    setIsLoading(false);
    onClose();
  };

  const motionStyle: MotionStyle = {
    display: 'inline-block',
    // Use colors from the theme
    color: 'white',
  };

  // Motion variants for animation
  const variants = {
    hover: { scale: 1.5, transition: { duration: 0.3 } }, // Scale up on hover
    initial: { scale: 1 }, // Initial scale
  };

  return (
    <>
      <MotionButton
        width={['100%', '250px', '300px']}
        height={['40px', '65px']}
        color="gray.200"
        bgColor="gray.50"
        onClick={handleOpenModal}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        isLoading={isLoading}
        textColor="white"
        borderRadius={40}
        spinner={<Spinner color="green.100" size="lg" />}
        border="2px dashed white"
        fontSize={['4xl', '5xl', '6xl']}
        fontFamily="sans-serif"
      >
        🪑
      </MotionButton>

      <Modal isOpen={isOpen} onClose={handleCloseModal} isCentered>
        <ModalOverlay />
        <ModalContent bgColor="gray.100">
          {' '}
          {/* Set modal background color */}
          <ModalHeader color="#f2f2f2" textAlign="center">
            <Tooltip
              label="All you need is a chip and a chair - Jack  Straus "
              fontSize="lg"
              placement="top"
            >
              <Box
                as={motion.div}
                style={motionStyle}
                variants={variants}
                initial="initial"
                whileHover="hover"
                fontSize="6xl"
              >
                🪑
              </Box>
            </Tooltip>
          </ModalHeader>
          <ModalCloseButton color={'#f2f2f2'} size="42px" padding={2} />
          <ModalBody w="100%">
            <Center>
              <FormControl justifyContent={'center'} w="80%">
                <FormLabel color="#f2f2f2" fontSize={'4xl'}>
                  🕵️
                </FormLabel>
                <Input
                  border={'1.5px solid #f2f2f2'}
                  placeholder="Name"
                  _placeholder={{ color: 'white' }}
                  color="white"
                />
                <FormLabel mt={4} color="#f2f2f2" fontSize={'4xl'}>
                  💵
                </FormLabel>
                <Input
                  border={'1.5px solid #f2f2f2'}
                  placeholder="Amount"
                  _placeholder={{ color: 'white' }}
                  color="white"
                />
              </FormControl>
            </Center>
          </ModalBody>
          <ModalFooter>
            <VStack w={'100%'}>
              <Button
                size="lg"
                mb={4}
                w={'80%'}
                h={12}
                leftIcon={<Icon as={FaDiscord} color="white" />}
                bg="#7289DA"
                color="white"
                _hover={{
                  borderColor: 'white',
                  borderWidth: '2px',
                }}
              >
                Discord
              </Button>
              <Button
                size="lg"
                mb={4}
                w={'80%'}
                h={12}
                leftIcon={<Icon as={FaWallet} color="white" />}
                bg="green.500" // Replace with a specific green color from theme if available
                color="white"
                _hover={{
                  borderColor: 'white',
                  borderWidth: '2px',
                }}
              >
                Connect
              </Button>
            </VStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EmptySeatButton;
