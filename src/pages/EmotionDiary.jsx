import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Plus, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import MiniChart from '../components/shared/MiniChart.jsx';
import PageTransition from '../components/shared/PageTransition.jsx';
import SectionHeader from '../components/shared/SectionHeader.jsx';
import StatusPill from '../components/shared/StatusPill.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { diaryEmotions, diaryEntries, monthMood, weeklyMood } from '../data/mockData.js';

export default function EmotionDiary() {
  const { t, language } = useLanguage();
  const [entries, setEntries] = useState(diaryEntries);
  const [selectedEmotion, setSelectedEmotion] = useState(diaryEmotions[0].key);
  const [note, setNote] = useState('');
  const [range, setRange] = useState('week');

  const currentEmotion = diaryEmotions.find((item) => item.key === selectedEmotion) ?? diaryEmotions[0];
  const chartData = range === 'week' ? weeklyMood : monthMood;
  const average = useMemo(
    () => Math.round(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length),
    [chartData],
  );

  const saveEntry = () => {
    const cleanNote = note.trim() || 'Өзіңізге уақыт бөліп, күйіңізді белгіледіңіз.';
    setEntries((current) => [
      {
        id: Date.now(),
        date: 'Жаңа жазба',
        mood: currentEmotion.label,
        note: cleanNote,
        color: currentEmotion.color,
      },
      ...current,
    ]);
    setNote('');
  };

  return (
    <PageTransition className="diary-calm-page space-y-8">
      <SectionHeader eyebrow="Emotion diary" title={t('diary.title')}>
        <p>
          {t('diary.subtitle')}.{' '}
          {language === 'kk'
            ? 'Күн сайынғы қысқа белгі өз ресурсыңызды байқауға көмектеседі.'
            : 'Короткая ежедневная отметка помогает увидеть собственный ресурс.'}
        </p>
      </SectionHeader>

      <div className="grid gap-6 xl:grid-cols-[.92fr_1.08fr]">
        <div className="calm-panel rounded-[1.75rem] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <StatusPill color="sage">{t('diary.emotion')}</StatusPill>
            <CalendarDays className="text-aqua" size={22} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {diaryEmotions.map((emotion) => (
              <button
                key={emotion.key}
                type="button"
                onClick={() => setSelectedEmotion(emotion.key)}
                className={[
                  'calm-tile rounded-[1.15rem] p-4 text-left focus-ring',
                  selectedEmotion === emotion.key
                    ? 'border-aqua/42 bg-aqua/12 shadow-calm'
                    : 'hover:bg-white/10',
                ].join(' ')}
              >
                <span className="mb-3 block h-2 w-10 rounded-full" style={{ background: emotion.color }} />
                <span className="font-extrabold text-white">{emotion.label}</span>
              </button>
            ))}
          </div>

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-bold text-cloud/76">{t('diary.note')}</span>
            <textarea
              className="soft-input min-h-[136px] resize-none px-4 py-3 leading-7"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t('diary.notePlaceholder')}
            />
          </label>

          <button type="button" onClick={saveEntry} className="premium-button mt-5 w-full focus-ring">
            <Plus size={19} />
            {t('actions.save')}
          </button>
        </div>

        <div className="space-y-6">
          <div className="calm-panel rounded-[1.75rem] p-5 sm:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-aqua/76">{t('diary.analytics')}</p>
                <h2 className="mt-2 font-display text-2xl font-extrabold text-white">{average}% balance</h2>
              </div>
              <div className="flex rounded-full border border-white/12 bg-white/8 p-1 text-sm font-bold text-cloud/58">
                {[
                  ['week', t('diary.week')],
                  ['month', t('diary.month')],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRange(key)}
                    className={[
                      'rounded-full px-4 py-2 transition focus-ring',
                      range === key ? 'bg-white text-ink' : 'hover:bg-white/10 hover:text-white',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <MiniChart data={chartData} />
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ['Жақсарған күндер', '5'],
                ['Тыныштық', '76%'],
                ['Жазба саны', entries.length],
              ].map(([label, value]) => (
                <div key={label} className="calm-tile rounded-2xl p-4">
                  <p className="text-2xl font-extrabold text-white">{value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-cloud/42">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="calm-panel rounded-[1.65rem] p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="font-display text-xl font-extrabold text-white">{t('diary.timeline')}</h2>
              <TrendingUp className="text-aqua" size={21} />
            </div>
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {entries.map((entry) => (
                  <motion.article
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="rounded-[1.1rem] border border-white/10 bg-white/7 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ background: entry.color }} />
                        <strong className="text-white">{entry.mood}</strong>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-cloud/38">{entry.date}</span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-cloud/62">{entry.note}</p>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
