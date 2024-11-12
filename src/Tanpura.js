import React, { useState } from 'react';
import * as Tone from 'tone';

const Tanpura = ({ scale = 'C' }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const startTanpura = async () => {
    // Ensure Tone.js is ready to start sound
    await Tone.start();

    // Calculate frequencies based on the scale
    const rootNote = `${scale}3`;
    const fifthNote = Tone.Frequency(rootNote).transpose(7).toNote();  // Perfect fifth

    // Create two oscillators for the tanpura drone effect
    const osc1 = new Tone.Oscillator(rootNote, 'sine').toDestination();
    const osc2 = new Tone.Oscillator(fifthNote, 'sine').toDestination();

    // Create a tremolo effect to emulate the tanpura’s natural vibrato
    const tremolo = new Tone.Tremolo(0.5, 0.7).toDestination().start();

    // Connect oscillators through the tremolo effect
    osc1.connect(tremolo);
    osc2.connect(tremolo);

    // Start the oscillators
    osc1.start();
    osc2.start();

    // Store oscillators in state to manage stopping
    setIsPlaying({ osc1, osc2 });
  };

  const stopTanpura = () => {
    if (isPlaying) {
      // Stop both oscillators
      isPlaying.osc1.stop();
      isPlaying.osc2.stop();
      setIsPlaying(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Tanpura Simulator</h1>
      <p>Click below to start or stop the tanpura drone sound.</p>
      {isPlaying ? (
        <button onClick={stopTanpura} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Stop Tanpura
        </button>
      ) : (
        <button onClick={startTanpura} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Start Tanpura
        </button>
      )}
    </div>
  );
};

export default Tanpura;
