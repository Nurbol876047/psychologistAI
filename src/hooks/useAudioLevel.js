import { useEffect, useState } from 'react';

export function useAudioLevel(active) {
  const [level, setLevel] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (!active || !navigator.mediaDevices?.getUserMedia) {
      setLevel(0);
      return undefined;
    }

    let animationFrame = 0;
    let stream;
    let audioContext;
    let cancelled = false;

    async function connectMicrophone() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) return;

        setHasPermission(true);
        audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          analyser.getByteFrequencyData(data);
          const average = data.reduce((sum, value) => sum + value, 0) / data.length;
          setLevel(Math.min(1, average / 128));
          animationFrame = requestAnimationFrame(tick);
        };

        tick();
      } catch (error) {
        console.info('Microphone visualizer unavailable:', error.message);
        setHasPermission(false);
        setLevel(0.22);
      }
    }

    connectMicrophone();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
      stream?.getTracks().forEach((track) => track.stop());
      audioContext?.close();
      setLevel(0);
    };
  }, [active]);

  return { level, hasPermission };
}
