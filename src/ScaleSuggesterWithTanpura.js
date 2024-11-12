'use client'

import React, { useState, useRef, useEffect } from 'react'
import { PitchDetector } from 'pitchy'
import { Note, Scale } from '@tonaljs/tonal'
import * as Tone from 'tone'

// ... songDatabase object remains the same ...

export default function ScaleSuggesterWithTanpura() {
  // Remove TypeScript type annotations
  const [isListening, setIsListening] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [suggestedScale, setSuggestedScale] = useState(null)
  const [detectedNotes, setDetectedNotes] = useState([])
  const [error, setError] = useState(null)
  const [songList, setSongList] = useState([])
  const [isTanpuraPlaying, setIsTanpuraPlaying] = useState(false)
  const [audioContextStarted, setAudioContextStarted] = useState(false)

  // Remove TypeScript type annotations from refs
  const audioContext = useRef(null)
  const analyserNode = useRef(null)
  const detector = useRef(null)
  const rafId = useRef(null)
  const tanpuraRef = useRef(null)

  // ... rest of the code remains largely the same, just remove TypeScript types ...

  const toggleTanpura = async () => {
    try {
      if (!audioContextStarted) {
        await Tone.start()
        setAudioContextStarted(true)
      }

      if (isTanpuraPlaying) {
        if (tanpuraRef.current) {
          tanpuraRef.current.loop.stop()
          tanpuraRef.current.synth.triggerRelease()
        }
        setIsTanpuraPlaying(false)
      } else {
        if (suggestedScale) {
          const [root, scaleType] = suggestedScale.split(' ')
          const fundamentalFreq = Tone.Frequency(root + '3').toFrequency()
          const fifthFreq = Tone.Frequency(root + '3').harmonize(7).toFrequency()

          const synth = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { attack: 0.02, decay: 0.1, sustain: 0.9, release: 0.1 },
          }).toDestination()

          const loop = new Tone.Loop((time) => {
            synth.triggerAttackRelease(fundamentalFreq, '2n', time)
            synth.triggerAttackRelease(fifthFreq, '2n', time + 0.5)
          }, '1n').start(0)

          tanpuraRef.current = { synth, loop }

          Tone.Transport.start()
          setIsTanpuraPlaying(true)
        }
      }
    } catch (error) {
      console.error('Error toggling tanpura:', error)
      setError('Error playing tanpura. Please try again.')
    }
  }

  // ... rest of the code remains the same ...
} 