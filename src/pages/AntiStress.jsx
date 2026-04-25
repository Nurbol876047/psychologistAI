import { Sparkles } from 'lucide-react';
import BreathingPractice from '../components/stress/BreathingPractice.jsx';
import GestureStressBall from '../components/stress/GestureStressBall.jsx';
import PageTransition from '../components/shared/PageTransition.jsx';
import SectionHeader from '../components/shared/SectionHeader.jsx';
import { antiStressCards } from '../data/mockData.js';

export default function AntiStress() {
  return (
    <PageTransition className="space-y-8">
      <SectionHeader eyebrow="Calm tools" title="Антистресс модульдері">
        <p>Кішкене демалып алайық. Қысқа practice мұғалімнің жүйке жүйесін сабақ арасында қайта реттеуге көмектеседі.</p>
      </SectionHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {antiStressCards.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="glass-panel rounded-[1.45rem] p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-aqua/20 bg-aqua/12 text-aqua">
                  <Icon size={23} />
                </span>
                <Sparkles className="text-cloud/30" size={18} />
              </div>
              <h2 className="font-display text-lg font-extrabold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-cloud/62">{item.description}</p>
            </div>
          );
        })}
      </div>

      <GestureStressBall />

      <BreathingPractice />
    </PageTransition>
  );
}
