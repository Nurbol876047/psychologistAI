import { AnimatePresence, motion } from 'framer-motion';
import { Brain, HeartPulse } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CameraWellbeingPanel from '../components/camera/CameraWellbeingPanel.jsx';
import PageTransition from '../components/shared/PageTransition.jsx';
import SectionHeader from '../components/shared/SectionHeader.jsx';
import StatusPill from '../components/shared/StatusPill.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { moodOptions } from '../data/mockData.js';
import { requestCameraAdvice } from '../services/aiService.js';
import { getMoodRecommendation } from '../utils/recommendations.js';

export default function MoodAnalysis() {
  const { t, language } = useLanguage();
  const [selectedMood, setSelectedMood] = useState('calm');
  const [cameraSignals, setCameraSignals] = useState(null);
  const [cameraAdvice, setCameraAdvice] = useState('');
  const [cameraAdviceBusy, setCameraAdviceBusy] = useState(false);
  const lastAdviceRef = useRef({ key: '', time: 0 });

  const mood = moodOptions.find((item) => item.key === selectedMood) ?? moodOptions[0];
  const recommendation = useMemo(
    () => getMoodRecommendation(selectedMood),
    [selectedMood],
  );

  const handleMoodDetected = useCallback((moodKey) => {
    if (!moodKey) return;
    setSelectedMood(moodKey);
  }, []);

  const askCameraAi = useCallback(
    async (signals = cameraSignals) => {
      if (!signals?.face?.detected || cameraAdviceBusy) return;

      setCameraAdviceBusy(true);
      const advice = await requestCameraAdvice({
        signals,
        locale: language,
        context: mood.label,
      });
      setCameraAdvice(advice);
      setCameraAdviceBusy(false);
    },
    [cameraAdviceBusy, cameraSignals, language, mood.label],
  );

  useEffect(() => {
    if (!cameraSignals?.face?.detected) return undefined;

    const key = `${cameraSignals.face.state}-${cameraSignals.face.moodKey}-${language}`;
    const now = Date.now();

    if (lastAdviceRef.current.key === key || now - lastAdviceRef.current.time < 9000) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      lastAdviceRef.current = { key, time: Date.now() };
      askCameraAi(cameraSignals);
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [askCameraAi, cameraSignals, language]);

  return (
    <PageTransition className="space-y-8">
      <SectionHeader eyebrow="Mood Intelligence" title={t('mood.title')}>
        <p>{t('mood.question')}</p>
      </SectionHeader>

      <div className="grid gap-6 lg:grid-cols-[.95fr_1.05fr]">
        <div className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <StatusPill color="aqua">{t('mood.mark')}</StatusPill>
            <Brain className="text-aqua" size={22} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {moodOptions.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedMood(item.key)}
                className={[
                  'rounded-[1.2rem] border p-4 text-left transition focus-ring',
                  selectedMood === item.key
                    ? 'border-aqua/44 bg-aqua/12 shadow-calm'
                    : 'border-white/12 bg-white/7 hover:border-white/24 hover:bg-white/10',
                ].join(' ')}
              >
                <span className="mb-3 block h-2 w-12 rounded-full" style={{ background: item.color }} />
                <span className="text-base font-extrabold text-white">{item.label}</span>
                <span className="mt-2 block text-xs font-bold uppercase tracking-[0.2em] text-cloud/38">
                  {item.score}% balance
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <CameraWellbeingPanel
            onMoodDetected={handleMoodDetected}
            onSignalsChange={setCameraSignals}
            aiAdvice={cameraAdvice}
            aiBusy={cameraAdviceBusy}
            onAskAi={() => askCameraAi()}
          />

          <div className="rounded-[1.65rem] border border-white/12 bg-white/7 p-6 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-aqua/76">{t('mood.responseTitle')}</p>
                <h2 className="mt-3 font-display text-2xl font-extrabold text-white">{mood.label}</h2>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/12 bg-white/8">
                <HeartPulse style={{ color: mood.color }} size={26} />
              </div>
            </div>

            <div className="mt-5 h-3 rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${mood.score}%`, background: mood.color }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={selectedMood}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-5 text-base leading-8 text-cloud/72"
              >
                {recommendation}
              </motion.p>
            </AnimatePresence>

            <p className="mt-4 rounded-2xl border border-aqua/16 bg-aqua/8 px-4 py-3 text-sm leading-7 text-cloud/64">
              {cameraAdvice ||
                (language === 'ru'
                  ? 'Вы не одни. Отметить своё состояние - уже мягкий первый шаг к восстановлению.'
                  : 'Сіз жалғыз емессіз. Өз сезіміңізді белгілеу - қалпына келудің бірінші жұмсақ қадамы.')}
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
