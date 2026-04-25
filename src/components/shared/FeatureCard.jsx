import { ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const toneClasses = {
  cyan: 'text-aqua bg-aqua/12 border-aqua/20',
  blue: 'text-skyglass bg-skyglass/12 border-skyglass/20',
  violet: 'text-[#c8c2ff] bg-iris/14 border-iris/22',
  green: 'text-[#bfe8ce] bg-sage/14 border-sage/22',
  peach: 'text-[#ffd4b9] bg-peach/14 border-peach/22',
  iris: 'text-[#d8d4ff] bg-plum/14 border-plum/22',
};

export default function FeatureCard({ item, index = 0 }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      className="group glass-panel relative overflow-hidden rounded-[1.45rem] p-5 transition duration-200 hover:-translate-y-1 hover:border-aqua/26 focus-ring"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <span className={`grid h-12 w-12 place-items-center rounded-2xl border ${toneClasses[item.tone]}`}>
          <Icon size={23} />
        </span>
        <ArrowRight className="mt-2 text-cloud/32 transition group-hover:translate-x-1 group-hover:text-aqua" size={19} />
      </div>
      <h3 className="font-display text-lg font-extrabold text-white">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-cloud/62">{item.description}</p>
      <div className="mt-5 h-1 rounded-full bg-calm-line opacity-65" />
    </NavLink>
  );
}
