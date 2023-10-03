import React from 'react';
import StartButton from './components/StartButton';
import { Container, Typography } from '@mui/material';

const Home: React.FC = () => {
  return (
    <Container 
      disableGutters 
      maxWidth={false} 
      className="flex flex-col items-center justify-center h-screen w-full bg-green-800"
    >
      <Typography variant="h1" gutterBottom className="text-6xl text-white mb-4 animate__animated animate__bounce">
        Poker Game
      </Typography>
      <StartButton />
    </Container>
  );
};

export default Home;
