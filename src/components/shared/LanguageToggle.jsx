import { Languages } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex h-11 items-center gap-1 rounded-full border border-white/12 bg-white/8 p-1 text-xs font-bold text-cloud/66">
      <Languages size={16} className="ml-2 text-aqua" />
      {['kk', 'ru'].map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLanguage(item)}
          className={[
            'h-8 rounded-full px-3 uppercase transition focus-ring',
            language === item ? 'bg-white text-ink shadow-calm' : 'hover:bg-white/10 hover:text-white',
          ].join(' ')}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
