import React, { useState, useRef, useEffect } from 'react';
import { PitchDetector } from 'pitchy';
import { Note, Scale } from '@tonaljs/tonal';
import * as Tone from 'tone';
import Tanpura from './components/Tanpura';

const songDatabase = {
  'C major': ['Let It Be - The Beatles', 'Hey Jude - The Beatles', 'Clocks - Coldplay'],
  'G major': ['Sweet Home Alabama - Lynyrd Skynyrd', 'What a Wonderful World - Louis Armstrong', 'Sweet Child O\' Mine - Guns N\' Roses'],
  'D major': ['Hey Ya! - Outkast', 'I Will Always Love You - Whitney Houston', 'Uptown Funk - Mark Ronson ft. Bruno Mars'],
  'A major': ['Sweet Caroline - Neil Diamond', 'I Wanna Dance with Somebody - Whitney Houston', 'Brown Eyed Girl - Van Morrison'],
  'E major': ['Livin\' on a Prayer - Bon Jovi', 'Wake Me Up Before You Go-Go - Wham!', 'I\'m Yours - Jason Mraz'],
  'B major': ['All You Wanted - Michelle Branch', 'Since U Been Gone - Kelly Clarkson', 'Just The Way You Are - Bruno Mars'],
  'F# major': ['Purple Rain - Prince', 'Unwritten - Natasha Bedingfield', 'Creep - Radiohead (chorus)'],
  'C# major': ['Wouldn\'t It Be Nice - The Beach Boys', 'Pure Imagination - Willy Wonka & The Chocolate Factory', 'The Lazy Song - Bruno Mars'],
  'F major': ['Billie Jean - Michael Jackson', 'I Want to Hold Your Hand - The Beatles', 'Uptown Girl - Billy Joel'],
  'Bb major': ['Can\'t Stop the Feeling! - Justin Timberlake', 'All of Me - John Legend', 'September - Earth, Wind & Fire'],
  'Eb major': ['Superstition - Stevie Wonder', 'Boogie Wonderland - Earth, Wind & Fire', 'All Star - Smash Mouth'],
  'Ab major': ['Rocket Man - Elton John', 'Dancing Queen - ABBA', 'Somebody to Love - Queen'],
  'C minor': ['Smooth Criminal - Michael Jackson', 'Bad Guy - Billie Eilish', 'Boulevard of Broken Dreams - Green Day'],
  'G minor': ['Sweet Dreams (Are Made of This) - Eurythmics', 'Pumped Up Kicks - Foster The People', 'Havana - Camila Cabello'],
  'D minor': ['Another Brick in the Wall - Pink Floyd', 'Billie Jean - Michael Jackson (verses)', 'Losing My Religion - R.E.M.'],
  'A minor': ['Stairway to Heaven - Led Zeppelin', 'All Along the Watchtower - Jimi Hendrix', 'Smooth - Santana ft. Rob Thomas'],
  'E minor': ['Zombie - The Cranberries', 'Nothing Else Matters - Metallica', 'Somebody That I Used to Know - Gotye'],
  'B minor': ['All the Small Things - Blink-182', 'Royals - Lorde', 'Counting Stars - OneRepublic'],
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(to right, #4fd1c5, #3b82f6, #4f46e5)',
    padding: '1rem',
  },
  card: {
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    maxWidth: '28rem',
    width: '100%',
  },
  title: {
    marginBottom: '1.5rem',
    fontSize: '1.875rem',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    gap: '1rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    color: 'white',
    borderRadius: '9999px',
    fontWeight: '600',
    transition: 'background-color 0.3s',
    border: 'none',
    cursor: 'pointer',
  },
  startButton: {
    backgroundColor: '#10b981',
  },
  tanpuraButton: {
    backgroundColor: '#3b82f6',
  },
  tanpuraButtonPlaying: {
    backgroundColor: '#ef4444',
  },
  error: {
    marginBottom: '1rem',
    color: '#ef4444',
  },
  infoSection: {
    marginBottom: '1.5rem',
  },
  infoTitle: {
    marginBottom: '0.5rem',
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#4b5563',
  },
  scaleText: {
    marginBottom: '1rem',
    fontSize: '1.5rem',
    color: '#2563eb',
  },
  notesList: {
    fontSize: '1.125rem',
    color: '#4f46e5',
  },
  songsList: {
    listStyleType: 'disc',
    listStylePosition: 'inside',
    textAlign: 'left',
    color: '#4f46e5',
  },
};

export default function ScaleSuggesterWithTanpura() {
  const [isListening, setIsListening] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [suggestedScale, setSuggestedScale] = useState(null);
  const [detectedNotes, setDetectedNotes] = useState([]);
  const [error, setError] = useState(null);
  const [songList, setSongList] = useState([]);
  const [isTanpuraPlaying, setIsTanpuraPlaying] = useState(false);
  const [audioContextStarted, setAudioContextStarted] = useState(false);

  const audioContext = useRef(null);
  const analyserNode = useRef(null);
  const detector = useRef(null);
  const rafId = useRef(null);
  const tanpuraRef = useRef(null);

  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
      if (tanpuraRef.current) {
        tanpuraRef.current.synth.dispose();
        tanpuraRef.current.loop.dispose();
      }
    };
  }, []);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserNode.current = audioContext.current.createAnalyser();
      const sourceNode = audioContext.current.createMediaStreamSource(stream);
      sourceNode.connect(analyserNode.current);
      detector.current = PitchDetector.forFloat32Array(analyserNode.current.fftSize);
      setIsListening(true);
      setDetectedNotes([]);
      setSuggestedScale(null);
      setSongList([]);
      setError(null);
      detectPitch();
      startCountdown();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Error accessing microphone. Please check your permissions and try again.');
    }
  };

  const stopListening = () => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    setIsListening(false);
    suggestScale();
  };

  const startCountdown = () => {
    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timer);
          stopListening();
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
  };

  const detectPitch = () => {
    if (!analyserNode.current || !detector.current) return;

    const buffer = new Float32Array(analyserNode.current.fftSize);
    analyserNode.current.getFloatTimeDomainData(buffer);
    const [pitch, clarity] = detector.current.findPitch(buffer, audioContext.current.sampleRate);

    if (clarity > 0.8 && pitch > 30) {
      const detectedNote = Note.pitchClass(Note.fromFreq(pitch));
      setDetectedNotes((prevNotes) => {
        if (!prevNotes.includes(detectedNote)) {
          return [...prevNotes, detectedNote];
        }
        return prevNotes;
      });
    }

    rafId.current = requestAnimationFrame(detectPitch);
  };

  const suggestScale = () => {
    if (detectedNotes.length === 0) {
      setSuggestedScale('Not enough notes detected. Please try again.');
      return;
    }

    const scaleTypes = ['major', 'minor'];
    let bestScale = '';
    let maxMatches = 0;

    for (const note of detectedNotes) {
      for (const scaleType of scaleTypes) {
        const scale = Scale.get(`${note} ${scaleType}`);
        const matches = detectedNotes.filter((n) => scale.notes.includes(n)).length;
        if (matches > maxMatches) {
          maxMatches = matches;
          bestScale = `${note} ${scaleType}`;
        }
      }
    }

    if (bestScale) {
      setSuggestedScale(bestScale);
      const songs = songDatabase[bestScale] || [];
      setSongList(songs);
    } else {
      setSuggestedScale('Unable to determine a scale. Please try again.');
      setSongList([]);
    }
  };

  const toggleTanpura = async () => {
    try {
      if (!audioContextStarted) {
        await Tone.start();
        setAudioContextStarted(true);
      }

      if (suggestedScale) {
        setIsTanpuraPlaying(!isTanpuraPlaying);
      } else {
        setError('Please detect a scale first before playing tanpura.');
      }
    } catch (error) {
      console.error('Error toggling tanpura:', error);
      setError('Error playing tanpura. Please ensure your browser supports audio playback.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Scale Suggester with Tanpura</h1>
        <div style={styles.buttonContainer}>
          <button
            onClick={startListening}
            disabled={isListening}
            style={{...styles.button, ...styles.startButton, opacity: isListening ? 0.5 : 1}}
            aria-label={isListening ? "Listening in progress" : "Start listening"}
          >
            {isListening ? `Listening... ${countdown}` : 'Start'}
          </button>
          {suggestedScale && (
            <button
              onClick={toggleTanpura}
              style={{
                ...styles.button,
                ...(isTanpuraPlaying ? styles.tanpuraButtonPlaying : styles.tanpuraButton)
              }}
            >
              {isTanpuraPlaying ? 'Stop Tanpura' : 'Play Tanpura'}
            </button>
          )}
        </div>
        <div style={{textAlign: 'center'}}>
          {error && <p style={styles.error}>{error}</p>}
          {suggestedScale && (
            <div style={styles.infoSection}>
              <p style={styles.infoTitle}>Suggested Scale:</p>
              <p style={styles.scaleText}>{suggestedScale}</p>
            </div>
          )}
          {detectedNotes.length > 0 && (
            <div style={styles.infoSection}>
              <p style={styles.infoTitle}>Detected Notes:</p>
              <p style={styles.notesList}>{detectedNotes.join(', ')}</p>
            </div>
          )}
          {songList.length > 0 && (
            <div style={styles.infoSection}>
              <p style={styles.infoTitle}>Songs in this scale:</p>
              <ul style={styles.songsList}>
                {songList.map((song, index) => (
                  <li key={index}>{song}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <Tanpura 
        scale={suggestedScale}
        isPlaying={isTanpuraPlaying}
        onPlayingChange={setIsTanpuraPlaying}
      />
    </div>
  );
}