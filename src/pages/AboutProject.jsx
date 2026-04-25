import { Code2, DatabaseZap, ShieldCheck, Workflow } from 'lucide-react';
import PageTransition from '../components/shared/PageTransition.jsx';
import SectionHeader from '../components/shared/SectionHeader.jsx';
import StatusPill from '../components/shared/StatusPill.jsx';
import EmotionalCore from '../components/three/EmotionalCore.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { modules } from '../data/mockData.js';

const architecture = [
  {
    icon: Workflow,
    title: 'Frontend experience',
    text: 'React + Vite, Router, Framer Motion, Tailwind және Three.js арқылы emotion-first интерфейс.',
  },
  {
    icon: DatabaseZap,
    title: 'Backend endpoint',
    text: 'Frontend тек /api/chat және /api/speech-to-text endpoint-теріне сұраныс жібереді.',
  },
  {
    icon: ShieldCheck,
    title: 'API key safety',
    text: 'Gemini API key browser ішінде сақталмайды. Кілт тек backend environment ішінде болуы керек.',
  },
  {
    icon: Code2,
    title: 'Service layer',
    text: 'src/services/aiService.js кейін Node, NestJS, Express немесе serverless backend-пен оңай байланысады.',
  },
];

export default function AboutProject() {
  const { t } = useLanguage();

  return (
    <PageTransition className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
        <SectionHeader eyebrow="About" title={t('about.title')}>
          <p>{t('about.lead')}</p>
          <p className="mt-4">
            Негізгі идея - ұстаздың дауысын есту, күйін жұмсақ талдау және қысқа антистресс
            practice арқылы ішкі ресурсын қалпына келтіру.
          </p>
        </SectionHeader>
        <div className="glass-panel rounded-[1.75rem] p-4">
          <EmotionalCore state="thinking" level={0.28} compact />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {architecture.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="glass-panel rounded-[1.45rem] p-5">
              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-aqua/20 bg-aqua/12 text-aqua">
                <Icon size={23} />
              </span>
              <h2 className="mt-5 font-display text-lg font-extrabold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-cloud/62">{item.text}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-[1.75rem] border border-white/12 bg-white/7 p-5 backdrop-blur-xl sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-aqua/76">Presentation scope</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold text-white">Көрсетілетін негізгі модульдер</h2>
          </div>
          <StatusPill color="iris">ready for backend</StatusPill>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <div key={module.title} className="rounded-[1.1rem] border border-white/10 bg-ink/34 p-4">
                <Icon className="text-aqua" size={20} />
                <h3 className="mt-3 font-bold text-white">{module.title}</h3>
                <p className="mt-2 text-sm leading-6 text-cloud/56">{module.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}
