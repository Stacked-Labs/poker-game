"use client"
import { Box, Flex, Avatar, CircularProgress } from '@chakra-ui/react';

export default function Page({ params }: { params: { id: string } }) {
    
  return (
    <main>
    <Flex
      width="100vw"
      height="100vh"
      justifyContent="center"
      alignItems="center"
      bg="#171717"
    >
      <Box
        width="75%"
        height="75%"
        border="20px solid"
        borderColor="green.900"
        bg='green.600'
        borderRadius={600}
        position="relative"
      >
      </Box>
    </Flex>
    </main>
    )
}