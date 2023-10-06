import * as React from "react";
import { Box, Flex, IconButton, Button } from "@chakra-ui/react";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

const HomePage: React.FC = () => {
  return (
    <Flex width="100vw" height="100vh">
      {/* Left Container */}
      <Box
        width="33%"
        height="100%"
        overflow="hidden"
        backgroundImage="url('tile4.png')"
        backgroundRepeat="repeat"
        backgroundSize="300px"
        position="relative"  
      >
        <Flex
          position="absolute"  
          top="30%"    
          left="17%"  
          direction="column"
          justify="center"
          align="center"
          height="40%"
          borderRadius={32}
          width="66%"
          bgColor="red.500"
        >
          <Button mb={4}>Play Now</Button>
          <Flex>
            <IconButton
              aria-label="Facebook"
              icon={<FaFacebook />}
              m={2}
            />
            <IconButton
              aria-label="Twitter"
              icon={<FaTwitter />}
              m={2}
            />
            <IconButton
              aria-label="Instagram"
              icon={<FaInstagram />}
              m={2}
            />
          </Flex>
        </Flex>
      </Box>

      {/* Right Container */}
      <Box width="67%" height="100%" overflowY="auto">
        {/* Your content here */}
      </Box>
    </Flex>
  );
};

export default function Home() {
  return (
    <main>
      <HomePage />
    </main>
  );
}
