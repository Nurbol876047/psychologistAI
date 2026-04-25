import { moodOptions } from '../data/mockData.js';

export function getMoodRecommendation(moodKey, worryText = '') {
  const mood = moodOptions.find((item) => item.key === moodKey) ?? moodOptions[0];
  const hasWorry = worryText.trim().length > 8;

  if (!hasWorry) return mood.recommendation;

  return `${mood.recommendation} Сіз жазған ой маңызды: оны бірден шешуге тырыспай, алдымен ең кішкентай келесі қадамды ғана таңдаңыз.`;
}

export function formatSeconds(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function getBreathingPhase(secondsLeft) {
  const cycleSecond = (60 - secondsLeft) % 10;
  if (cycleSecond < 4) return 'inhale';
  if (cycleSecond < 6) return 'hold';
  return 'exhale';
}
