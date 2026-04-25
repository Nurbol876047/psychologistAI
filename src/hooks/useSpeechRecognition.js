import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export function useSpeechRecognition({ language = 'kk-KZ', onResult } = {}) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ')
        .trim();

      setTranscript(text);
      onResult?.(text);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [language, onResult]);

  const start = useCallback(() => {
    if (!recognitionRef.current || listening) return;
    setTranscript('');
    recognitionRef.current.start();
  }, [listening]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
  }, []);

  return useMemo(
    () => ({ supported, listening, transcript, setTranscript, start, stop, reset }),
    [supported, listening, transcript, start, stop, reset],
  );
}
