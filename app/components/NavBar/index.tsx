"use client"
import React from 'react';
import { HStack, Flex, IconButton } from '@chakra-ui/react';
import { FiSettings, FiMessageSquare } from 'react-icons/fi';
import Web3Button from '../Web3Button';
const Navbar = () => {
  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1rem"
      bg="gray.200" 
      color="white"
      zIndex={10}
    >
      <IconButton
        icon={<FiSettings size={32}/>}
        aria-label="Settings"
        size={'lg'}
        //onClick={() => { /* Placeholder for future functionality */ }}
      />

      <HStack ml="auto" gap={6} alignItems='center'> 
        <Web3Button />
        <IconButton
          icon={<FiMessageSquare size={32}/>}
          aria-label="Chat"
          size={'lg'}
          //onClick={() => { /* Placeholder for chat functionality */ }}
          marginRight="4"
        />
      </HStack>
    </Flex>
  );
};

export default Navbar;
