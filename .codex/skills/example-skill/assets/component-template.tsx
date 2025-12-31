'use client'

import { Box, Text } from '@chakra-ui/react'
import { useState } from 'react'

/**
 * ComponentName - Brief description
 * 
 * @example
 * <ComponentName prop1="value" />
 */
export const ComponentName = ({ 
  prop1,
  prop2 = 'default'
}: {
  prop1: string
  prop2?: string
}) => {
  const [state, setState] = useState<string>('')

  return (
    <Box>
      <Text>{prop1}</Text>
      <Text>{prop2}</Text>
    </Box>
  )
}


