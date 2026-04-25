import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatSeconds, getBreathingPhase } from '../utils/recommendations.js';

export function useBreathingTimer(initialSeconds = 60) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || secondsLeft <= 0) return undefined;

    const interval = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [running, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0) setRunning(false);
  }, [secondsLeft]);

  const reset = useCallback(() => {
    setRunning(false);
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  const phase = useMemo(() => getBreathingPhase(secondsLeft), [secondsLeft]);

  return {
    secondsLeft,
    formatted: formatSeconds(secondsLeft),
    running,
    phase,
    progress: 1 - secondsLeft / initialSeconds,
    toggle: () => setRunning((value) => !value),
    reset,
  };
}
