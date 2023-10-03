"use client"
import { useRouter } from 'next/navigation';
import { ButtonBase, Typography } from '@mui/material';
import axios from 'axios';
import React from 'react';

const StartButton: React.FC = () => {
  const router = useRouter();

  const startGame: VoidFunction = async () => {
    try {
      const response = await axios.post('https://your-api.com/start-game');
      const gameId = response.data.gameId;
      router.push(`/game/${gameId}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ButtonBase 
      onClick={startGame}
      className="w-24 h-24 rounded-full flex items-center justify-center transition-transform transform hover:scale-105"
      style={{ backgroundImage: "url('/start-game-chip.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <Typography variant="subtitle1" component="div" className="text-white font-bold">
        Start Game
      </Typography>
    </ButtonBase>
  );
};

export default StartButton;