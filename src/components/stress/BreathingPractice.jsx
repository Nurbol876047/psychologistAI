import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useBreathingTimer } from '../../hooks/useBreathingTimer.js';
import EmotionalCore from '../three/EmotionalCore.jsx';

export default function BreathingPractice() {
  const { t } = useLanguage();
  const timer = useBreathingTimer(60);
  const [nature, setNature] = useState(false);

  const phaseText = {
    inhale: t('stress.inhale'),
    hold: t('stress.hold'),
    exhale: t('stress.exhale'),
  }[timer.phase];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
      <div className="glass-panel rounded-[1.65rem] p-4 sm:p-6">
        <EmotionalCore
          state="calming"
          level={timer.running ? 0.34 + Math.sin(timer.progress * Math.PI * 8) * 0.18 : 0.12}
          compact
        />
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={timer.toggle} className="premium-button focus-ring">
            {timer.running ? <Pause size={19} /> : <Play size={19} />}
            {timer.running ? t('actions.pause') : t('actions.beginPractice')}
          </button>
          <button type="button" onClick={timer.reset} className="secondary-button focus-ring">
            <RotateCcw size={18} />
            {t('actions.reset')}
          </button>
          <button
            type="button"
            onClick={() => setNature((value) => !value)}
            className="secondary-button focus-ring"
          >
            {nature ? <Volume2 size={18} /> : <VolumeX size={18} />}
            {t('stress.nature')}
          </button>
        </div>
      </div>

      <div className="flex flex-col justify-center rounded-[1.65rem] border border-white/12 bg-white/7 p-6 backdrop-blur-xl">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-aqua/80">{t('stress.oneMinute')}</p>
        <div className="mt-6 text-6xl font-extrabold text-white sm:text-7xl">{timer.formatted}</div>
        <h2 className="mt-6 font-display text-3xl font-extrabold text-white">{phaseText}</h2>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-calm-line transition-all duration-500"
            style={{ width: `${timer.progress * 100}%` }}
          />
        </div>
        <p className="mt-5 text-sm leading-7 text-cloud/62">
          Әр циклде иықты босатып, демді бақылаңыз. Қысқа пауза жүйке жүйесіне қайта реттелуге
          мүмкіндік береді.
        </p>
      </div>
    </div>
  );
}
