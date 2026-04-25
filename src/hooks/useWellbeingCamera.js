import {
  FaceLandmarker,
  FilesetResolver,
  GestureRecognizer,
} from '@mediapipe/tasks-vision';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const TASKS_VERSION = '0.10.34';
const WASM_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VERSION}/wasm`;
const FACE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task';
const GESTURE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';

const initialSignals = {
  face: {
    detected: false,
    state: 'waiting',
    moodKey: 'calm',
    confidence: 0,
    smile: 0,
    tension: 0,
    fatigue: 0,
    balance: 64,
  },
  hand: {
    detected: false,
    gesture: 'None',
    confidence: 0,
    x: 0.5,
    y: 0.5,
    squeeze: 0,
    openness: 0,
    pinch: 0,
  },
};

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function score(categories, name) {
  return categories.find((item) => item.categoryName === name)?.score ?? 0;
}

function distance(a, b) {
  if (!a || !b) return 0;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function smooth(previous, next, amount = 0.34) {
  return previous + (next - previous) * amount;
}

async function createTask(factory, vision, options) {
  try {
    return await factory(vision, {
      ...options,
      baseOptions: { ...options.baseOptions, delegate: 'GPU' },
    });
  } catch {
    return factory(vision, {
      ...options,
      baseOptions: { ...options.baseOptions, delegate: 'CPU' },
    });
  }
}

function analyzeFace(results) {
  const categories = results.faceBlendshapes?.[0]?.categories ?? [];

  if (!categories.length) {
    return initialSignals.face;
  }

  const smile = (score(categories, 'mouthSmileLeft') + score(categories, 'mouthSmileRight')) / 2;
  const eyeClosed = (score(categories, 'eyeBlinkLeft') + score(categories, 'eyeBlinkRight')) / 2;
  const browDown = (score(categories, 'browDownLeft') + score(categories, 'browDownRight')) / 2;
  const browInner = score(categories, 'browInnerUp');
  const frown = (score(categories, 'mouthFrownLeft') + score(categories, 'mouthFrownRight')) / 2;
  const jawOpen = score(categories, 'jawOpen');

  const tension = clamp(browDown * 0.9 + frown * 0.7 + browInner * 0.24 + jawOpen * 0.22);
  const fatigue = clamp(eyeClosed * 0.86 + Math.max(0, 0.28 - smile) * 0.45 + jawOpen * 0.18);
  const positivity = clamp(smile * 1.2 - tension * 0.18);

  let state = 'calm';
  let moodKey = 'calm';

  if (fatigue > 0.52 && smile < 0.28) {
    state = 'tired';
    moodKey = 'tired';
  } else if (tension > 0.42) {
    state = 'tense';
    moodKey = tension > 0.58 ? 'stress' : 'anxious';
  } else if (positivity > 0.34) {
    state = 'positive';
    moodKey = 'happy';
  }

  const balance = Math.round(clamp(0.72 + positivity * 0.28 - tension * 0.34 - fatigue * 0.25, 0.18, 0.96) * 100);

  return {
    detected: true,
    state,
    moodKey,
    confidence: 0.82,
    smile,
    tension,
    fatigue,
    balance,
  };
}

function analyzeHand(results) {
  const gesture = results.gestures?.[0]?.[0];
  const landmarks = results.landmarks?.[0] ?? [];

  if (!gesture || !landmarks.length) {
    return initialSignals.hand;
  }

  const center = landmarks.reduce(
    (point, item) => ({ x: point.x + item.x / landmarks.length, y: point.y + item.y / landmarks.length }),
    { x: 0, y: 0 },
  );
  const palmSize = distance(landmarks[0], landmarks[9]) || 0.16;
  const pinchRaw = 1 - clamp(distance(landmarks[4], landmarks[8]) / (palmSize * 1.12));
  const categoryName = gesture.categoryName || 'None';
  const isFist = categoryName === 'Closed_Fist';
  const isOpen = categoryName === 'Open_Palm';
  const squeeze = clamp(Math.max(isFist ? 0.94 : 0, pinchRaw > 0.56 ? pinchRaw : 0));

  return {
    detected: true,
    gesture: categoryName,
    confidence: gesture.score ?? 0,
    x: clamp(1 - center.x),
    y: clamp(center.y),
    squeeze,
    openness: isOpen ? 0.9 : clamp(1 - squeeze),
    pinch: clamp(pinchRaw),
  };
}

function mergeSignals(previous, next) {
  return {
    face: {
      ...next.face,
      smile: smooth(previous.face.smile, next.face.smile),
      tension: smooth(previous.face.tension, next.face.tension),
      fatigue: smooth(previous.face.fatigue, next.face.fatigue),
      balance: Math.round(smooth(previous.face.balance, next.face.balance, 0.28)),
    },
    hand: {
      ...next.hand,
      x: smooth(previous.hand.x, next.hand.x, 0.42),
      y: smooth(previous.hand.y, next.hand.y, 0.42),
      squeeze: smooth(previous.hand.squeeze, next.hand.squeeze, 0.4),
      openness: smooth(previous.hand.openness, next.hand.openness, 0.4),
      pinch: smooth(previous.hand.pinch, next.hand.pinch, 0.4),
    },
  };
}

export function useWellbeingCamera({ enableFace = true, enableHands = true } = {}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(0);
  const lastVideoTimeRef = useRef(-1);
  const lastRenderRef = useRef(0);
  const signalsRef = useRef(initialSignals);
  const faceLandmarkerRef = useRef(null);
  const gestureRecognizerRef = useRef(null);
  const loadingRef = useRef(null);

  const [status, setStatus] = useState('idle');
  const [signals, setSignals] = useState(initialSignals);
  const [error, setError] = useState('');

  const supported =
    typeof window !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof HTMLVideoElement !== 'undefined';

  const loadModels = useCallback(async () => {
    if (loadingRef.current) return loadingRef.current;

    loadingRef.current = (async () => {
      const vision = await FilesetResolver.forVisionTasks(WASM_BASE);

      if (enableFace && !faceLandmarkerRef.current) {
        faceLandmarkerRef.current = await createTask(FaceLandmarker.createFromOptions, vision, {
          baseOptions: { modelAssetPath: FACE_MODEL },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: false,
        });
      }

      if (enableHands && !gestureRecognizerRef.current) {
        gestureRecognizerRef.current = await createTask(GestureRecognizer.createFromOptions, vision, {
          baseOptions: { modelAssetPath: GESTURE_MODEL },
          runningMode: 'VIDEO',
          numHands: 2,
        });
      }
    })();

    return loadingRef.current;
  }, [enableFace, enableHands]);

  const stop = useCallback(() => {
    cancelAnimationFrame(animationRef.current);
    animationRef.current = 0;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    lastVideoTimeRef.current = -1;
    signalsRef.current = initialSignals;
    setSignals(initialSignals);
    setStatus('idle');
  }, []);

  const loop = useCallback(() => {
    const video = videoRef.current;

    if (!video || !streamRef.current || video.readyState < 2) {
      animationRef.current = requestAnimationFrame(loop);
      return;
    }

    const now = performance.now();
    const videoTime = video.currentTime;

    if (videoTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = videoTime;

      const nextSignals = {
        face: signalsRef.current.face,
        hand: signalsRef.current.hand,
      };

      if (enableFace && faceLandmarkerRef.current) {
        nextSignals.face = analyzeFace(faceLandmarkerRef.current.detectForVideo(video, now));
      }

      if (enableHands && gestureRecognizerRef.current) {
        nextSignals.hand = analyzeHand(gestureRecognizerRef.current.recognizeForVideo(video, now));
      }

      const merged = mergeSignals(signalsRef.current, nextSignals);
      signalsRef.current = merged;

      if (now - lastRenderRef.current > 90) {
        lastRenderRef.current = now;
        setSignals(merged);
      }
    }

    animationRef.current = requestAnimationFrame(loop);
  }, [enableFace, enableHands]);

  const start = useCallback(async () => {
    if (!supported || status === 'loading' || status === 'running') return false;

    setError('');
    setStatus('loading');

    try {
      await loadModels();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 960 },
          height: { ideal: 540 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStatus('running');
      animationRef.current = requestAnimationFrame(loop);
      return true;
    } catch (startError) {
      stop();
      setError(startError?.message || 'camera_unavailable');
      return false;
    }
  }, [loadModels, loop, status, stop, supported]);

  const toggle = useCallback(() => {
    if (status === 'running' || status === 'loading') {
      stop();
      return Promise.resolve(false);
    }

    return start();
  }, [start, status, stop]);

  useEffect(() => stop, [stop]);

  return useMemo(
    () => ({
      videoRef,
      supported,
      status,
      active: status === 'running',
      loading: status === 'loading',
      signals,
      error,
      start,
      stop,
      toggle,
    }),
    [error, signals, start, status, stop, supported, toggle],
  );
}
