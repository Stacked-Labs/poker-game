'use client'

import { Box, Button, Text } from '@chakra-ui/react'
import { useState } from 'react'

/**
 * GoodExample - Demonstrates best practices
 * 
 * This component shows:
 * - Proper 'use client' directive
 * - TypeScript types
 * - Chakra UI usage
 * - Clean structure
 */
export const GoodExample = ({ 
  title,
  onClick
}: {
  title: string
  onClick: () => void
}) => {
  const [count, setCount] = useState(0)

  return (
    <Box p={4} bg="gray.100" borderRadius="md">
      <Text fontSize="xl" fontWeight="bold" mb={2}>
        {title}
      </Text>
      <Text mb={4}>Count: {count}</Text>
      <Button 
        onClick={() => {
          setCount(count + 1)
          onClick()
        }}
        colorScheme="blue"
      >
        Increment
      </Button>
    </Box>
  )
}


