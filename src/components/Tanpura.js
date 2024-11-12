import React, { useEffect, useRef } from 'react';
import * as Tone from 'tone';

const Tanpura = ({ scale, isPlaying, onPlayingChange }) => {
  const tanpuraRef = useRef(null);

  useEffect(() => {
    return () => {
      if (tanpuraRef.current) {
        tanpuraRef.current.synth.dispose();
        tanpuraRef.current.loop.dispose();
        Tone.Transport.stop();
      }
    };
  }, []);

  useEffect(() => {
    const setupTanpura = async () => {
      try {
        if (tanpuraRef.current) {
          tanpuraRef.current.loop.stop();
          tanpuraRef.current.synth.dispose();
          tanpuraRef.current = null;
        }

        if (isPlaying && scale) {
          if (Tone.context.state !== 'running') {
            await Tone.start();
          }

          const [root] = scale.split(' ');
          const rootNote = `${root}3`;
          const fifthNote = `${root}4`;

          const synth = new Tone.Synth({
            oscillator: { 
              type: 'sine',
              volume: -10
            },
            envelope: { 
              attack: 0.1,
              decay: 0.2,
              sustain: 1,
              release: 0.8
            }
          }).toDestination();

          const loop = new Tone.Loop(time => {
            synth.triggerAttackRelease(rootNote, '2n', time);
            synth.triggerAttackRelease(fifthNote, '2n', time + Tone.Time('2n'));
          }, '1m').start(0);

          tanpuraRef.current = { synth, loop };

          if (Tone.Transport.state !== 'started') {
            Tone.Transport.start();
          }
        } else {
          if (tanpuraRef.current) {
            tanpuraRef.current.loop.stop();
            tanpuraRef.current.synth.dispose();
            tanpuraRef.current = null;
          }
          Tone.Transport.stop();
        }
      } catch (error) {
        console.error('Tanpura error:', error);
        onPlayingChange(false);
      }
    };

    setupTanpura();
  }, [isPlaying, scale, onPlayingChange]);

  return null;
};

export default Tanpura; 