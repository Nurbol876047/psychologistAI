import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const MIME_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];

function chooseRecorderOptions() {
  const mimeType = MIME_TYPES.find((type) => window.MediaRecorder?.isTypeSupported?.(type));
  return mimeType ? { mimeType } : undefined;
}

function stopTracks(stream) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function useVoiceRecorder({ language = 'kk-KZ' } = {}) {
  const [status, setStatus] = useState('idle');
  const [level, setLevel] = useState(0);
  const [transcript, setTranscriptState] = useState('');
  const [error, setError] = useState('');

  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const animationRef = useRef(0);
  const recognitionRef = useRef(null);
  const stopResolveRef = useRef(null);
  const transcriptRef = useRef('');
  const statusRef = useRef('idle');

  const supported =
    typeof window !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof window.MediaRecorder !== 'undefined';

  const setTranscript = useCallback((value) => {
    transcriptRef.current = value;
    setTranscriptState(value);
  }, []);

  const cleanupAudio = useCallback(() => {
    cancelAnimationFrame(animationRef.current);
    animationRef.current = 0;
    stopTracks(streamRef.current);
    streamRef.current = null;
    audioContextRef.current?.close?.();
    audioContextRef.current = null;
    setLevel(0);
  }, []);

  const stopRecognition = useCallback(() => {
    try {
      recognitionRef.current?.stop?.();
    } catch {
      // Some browsers throw if recognition is already stopped.
    }
    recognitionRef.current = null;
  }, []);

  const startRecognition = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        const text = Array.from(event.results)
          .map((result) => result[0]?.transcript ?? '')
          .join(' ')
          .trim();

        if (text) setTranscript(text);
      };
      recognition.onerror = () => {};
      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      recognitionRef.current = null;
    }
  }, [language, setTranscript]);

  const connectLevelMeter = useCallback(async (stream) => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(data);
      const average = data.reduce((sum, value) => sum + value, 0) / data.length;
      setLevel(Math.min(1, average / 128));
      animationRef.current = requestAnimationFrame(tick);
    };

    tick();
  }, []);

  const start = useCallback(async () => {
    if (!supported || statusRef.current === 'recording' || statusRef.current === 'starting') {
      return false;
    }

    setError('');
    setTranscript('');
    chunksRef.current = [];
    statusRef.current = 'starting';
    setStatus('starting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      await connectLevelMeter(stream);

      const recorder = new MediaRecorder(stream, chooseRecorderOptions());
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = chunksRef.current.length
          ? new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
          : null;

        cleanupAudio();
        statusRef.current = 'idle';
        setStatus('idle');
        stopResolveRef.current?.({ audioBlob: blob, transcript: transcriptRef.current });
        stopResolveRef.current = null;
        recorderRef.current = null;
      };

      recorder.start(350);
      startRecognition();
      statusRef.current = 'recording';
      setStatus('recording');
      return true;
    } catch (startError) {
      cleanupAudio();
      stopRecognition();
      statusRef.current = 'idle';
      setStatus('idle');
      setError(startError?.message || 'microphone_unavailable');
      return false;
    }
  }, [cleanupAudio, connectLevelMeter, startRecognition, setTranscript, stopRecognition, supported]);

  const stop = useCallback(() => {
    stopRecognition();

    if (statusRef.current !== 'recording' || !recorderRef.current) {
      return Promise.resolve({ audioBlob: null, transcript: transcriptRef.current });
    }

    statusRef.current = 'stopping';
    setStatus('stopping');

    return new Promise((resolve) => {
      stopResolveRef.current = resolve;
      try {
        recorderRef.current.stop();
      } catch {
        cleanupAudio();
        statusRef.current = 'idle';
        setStatus('idle');
        resolve({ audioBlob: null, transcript: transcriptRef.current });
      }
    });
  }, [cleanupAudio, stopRecognition]);

  const resetTranscript = useCallback(() => setTranscript(''), [setTranscript]);

  const cancel = useCallback(() => {
    stopRecognition();
    try {
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    } catch {
      // Recorder may already be inactive while the component is unmounting.
    }
    cleanupAudio();
    statusRef.current = 'idle';
    setStatus('idle');
  }, [cleanupAudio, stopRecognition]);

  useEffect(() => cancel, [cancel]);

  return useMemo(
    () => ({
      supported,
      status,
      recording: status === 'recording',
      busy: status === 'starting' || status === 'stopping',
      level,
      transcript,
      error,
      start,
      stop,
      cancel,
      resetTranscript,
    }),
    [cancel, error, level, resetTranscript, start, status, stop, supported, transcript],
  );
}
