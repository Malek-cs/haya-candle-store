'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './EmberSoundToggle.module.css'

// صوت "لهيب شمعة" مصنوع بالكامل بالمتصفح (Web Audio API) - بدون أي ملف صوتي خارجي.
// فكرة الصنع: ضجيج (noise) مستمر خفيف كـ "همسة" + طقطقات عشوائية قصيرة تحاكي فرقعة الشمعة.
function createEmberSound(audioContext) {
  const sampleRate = audioContext.sampleRate
  const noiseBuffer = audioContext.createBuffer(1, sampleRate * 2, sampleRate)
  const data = noiseBuffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1

  const masterGain = audioContext.createGain()
  masterGain.gain.value = 0
  masterGain.connect(audioContext.destination)

  // الهمسة المستمرة (hiss خفيف جداً)
  const hiss = audioContext.createBufferSource()
  hiss.buffer = noiseBuffer
  hiss.loop = true
  const hissFilter = audioContext.createBiquadFilter()
  hissFilter.type = 'lowpass'
  hissFilter.frequency.value = 800
  const hissGain = audioContext.createGain()
  hissGain.gain.value = 0.015
  hiss.connect(hissFilter).connect(hissGain).connect(masterGain)
  hiss.start()

  // الطقطقات العشوائية (crackle pops)
  let crackleTimer = null
  const scheduleCrackle = () => {
    const source = audioContext.createBufferSource()
    source.buffer = noiseBuffer
    const offset = Math.random() * (noiseBuffer.duration - 0.05)

    const bandpass = audioContext.createBiquadFilter()
    bandpass.type = 'bandpass'
    bandpass.frequency.value = 700 + Math.random() * 2500
    bandpass.Q.value = 4 + Math.random() * 6

    const popGain = audioContext.createGain()
    const now = audioContext.currentTime
    const peak = 0.08 + Math.random() * 0.15
    popGain.gain.setValueAtTime(0, now)
    popGain.gain.linearRampToValueAtTime(peak, now + 0.004)
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03 + Math.random() * 0.05)

    source.connect(bandpass).connect(popGain).connect(masterGain)
    source.start(now, offset, 0.08)

    crackleTimer = setTimeout(scheduleCrackle, 120 + Math.random() * 550)
  }
  scheduleCrackle()

  return {
    masterGain,
    stop() {
      clearTimeout(crackleTimer)
      try { hiss.stop() } catch {}
    },
  }
}

export default function EmberSoundToggle() {
  const [enabled, setEnabled] = useState(false)
  const contextRef = useRef(null)
  const soundRef = useRef(null)

  const toggle = () => {
    if (!enabled) {
      if (!contextRef.current) {
        contextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      if (contextRef.current.state === 'suspended') contextRef.current.resume()
      if (!soundRef.current) {
        soundRef.current = createEmberSound(contextRef.current)
      }
      soundRef.current.masterGain.gain.linearRampToValueAtTime(
        1, contextRef.current.currentTime + 0.4
      )
      setEnabled(true)
    } else {
      if (soundRef.current && contextRef.current) {
        soundRef.current.masterGain.gain.linearRampToValueAtTime(
          0, contextRef.current.currentTime + 0.3
        )
      }
      setEnabled(false)
    }
  }

  useEffect(() => {
    return () => {
      soundRef.current?.stop()
      contextRef.current?.close()
    }
  }, [])

  return (
    <button
      className={`${styles.toggle} ${enabled ? styles.on : ''}`}
      onClick={toggle}
      aria-label={enabled ? 'إيقاف صوت الشمعة' : 'تشغيل صوت الشمعة'}
      title={enabled ? 'إيقاف صوت الشمعة 🔇' : 'استمع لصوت الشمعة 🔥'}
      type="button"
    >
      {enabled ? '🔊' : '🔈'}
    </button>
  )
}
