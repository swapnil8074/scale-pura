import React, { useState, useEffect } from 'react';
import './Tanpura.css';  // Create this CSS file

const Tanpura = ({ scale = 'C' }) => {
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const startTanpura = async () => {
    console.log('Starting tanpura with scale:', scale);
    try {
      if (!audio) {
        const newAudio = new Audio(`${process.env.PUBLIC_URL}/scales/${scale}.mp3`);
        newAudio.loop = true;
        setAudio(newAudio);
        await newAudio.play();
      } else {
        await audio.play();
      }
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const stopTanpura = () => {
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        setAudio(null);
      }
    };
  }, [audio]);

  return (
    <div className="tanpura-container">
      <div className="tanpura-controls">
        <button 
          className={`tanpura-button ${isPlaying ? 'playing' : ''}`}
          onClick={isPlaying ? stopTanpura : startTanpura}
        >
          {isPlaying ? 'Stop' : 'Play'} Tanpura
        </button>
      </div>
    </div>
  );
};

export default Tanpura;