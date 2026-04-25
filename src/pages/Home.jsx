import { motion } from 'framer-motion';
import { ArrowRight, HeartHandshake, LockKeyhole, Mic2, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import FeatureCard from '../components/shared/FeatureCard.jsx';
import PageTransition from '../components/shared/PageTransition.jsx';
import StatusPill from '../components/shared/StatusPill.jsx';
import EmotionalCore from '../components/three/EmotionalCore.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { modules } from '../data/mockData.js';

export default function Home() {
  const { t } = useLanguage();

  return (
    <PageTransition className="space-y-16">
      <section className="grid min-h-[calc(100vh-9rem)] items-center gap-8 py-8 lg:grid-cols-[1.02fr_.98fr] lg:py-2">
        <div className="max-w-3xl xl:max-w-[46rem]">
          <div className="mb-6 flex flex-wrap gap-2">
            <StatusPill color="aqua">{t('hero.eyebrow')}</StatusPill>
            <StatusPill color="sage">AI wellbeing</StatusPill>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="font-display text-[2.65rem] font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-6xl"
          >
            <span className="gradient-text animate-shimmer">{t('hero.title')}</span>
          </motion.h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-cloud/72 sm:text-lg">{t('hero.lead')}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <NavLink to="/mood" className="premium-button focus-ring">
              <Sparkles size={19} />
              {t('actions.start')}
            </NavLink>
            <NavLink to="/voice" className="secondary-button focus-ring">
              <Mic2 size={19} />
              {t('actions.talk')}
            </NavLink>
            <NavLink to="/mood" className="secondary-button focus-ring">
              <HeartHandshake size={19} />
              {t('actions.check')}
            </NavLink>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              { icon: LockKeyhole, text: t('hero.trust') },
              { icon: Mic2, text: t('hero.voice') },
              { icon: ArrowRight, text: t('hero.daily') },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="glass-panel-soft rounded-2xl p-4">
                  <Icon className="mb-3 text-aqua" size={20} />
                  <p className="text-sm font-semibold leading-6 text-cloud/72">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-x-8 top-6 h-24 rounded-full bg-white/10 blur-3xl" />
          <EmotionalCore state="idle" level={0.18} className="glass-panel shadow-premium" />
          <div className="absolute bottom-8 left-1/2 w-[min(90%,28rem)] -translate-x-1/2 rounded-[1.25rem] border border-white/12 bg-ink/60 p-4 shadow-glass backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-aqua/80">Emotional core</p>
                <p className="mt-1 text-sm text-cloud/66">idle / listening / calming / AI response</p>
              </div>
              <span className="h-3 w-3 rounded-full bg-aqua shadow-[0_0_24px_rgba(85,221,224,.86)]" />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-aqua/78">Platform modules</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-white sm:text-4xl">
              Бір платформада толық қолдау экожүйесі
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-cloud/58">
            Мұғалімнің күнделікті күйін тыңдап, талдап, тыныштандырып, пайдалы әдетке айналдыруға
            арналған біртұтас қолдау кеңістігі.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((item, index) => (
            <FeatureCard key={item.title} item={item} index={index} />
          ))}
        </div>
      </section>
    </PageTransition>
  );
}
