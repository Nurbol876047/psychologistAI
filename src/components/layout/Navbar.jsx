import { AnimatePresence, motion } from 'framer-motion';
import { BrainCircuit, Menu, Mic2, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import LanguageToggle from '../shared/LanguageToggle.jsx';

const navItems = [
  { to: '/', key: 'home' },
  { to: '/voice', key: 'voice' },
  { to: '/mood', key: 'mood' },
  { to: '/anti-stress', key: 'stress' },
  { to: '/diary', key: 'diary' },
  { to: '/about', key: 'about' },
];

function navClass({ isActive }) {
  return [
    'rounded-full px-3 py-2 text-sm font-semibold transition focus-ring',
    isActive ? 'bg-white/14 text-white shadow-calm' : 'text-cloud/66 hover:bg-white/8 hover:text-white',
  ].join(' ');
}

export default function Navbar() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 px-4 py-4 sm:px-6 lg:px-8">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-[1.65rem] border border-white/12 bg-ink/48 px-3 py-3 shadow-glass backdrop-blur-2xl">
        <NavLink to="/" className="group flex min-w-0 items-center gap-3 rounded-full pr-2 focus-ring">
          <span className="grid h-11 w-11 place-items-center rounded-full border border-aqua/30 bg-white/10 text-aqua shadow-calm">
            <BrainCircuit size={22} />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-sm font-extrabold text-white sm:text-base">
              Teacher Support AI
            </span>
            <span className="block truncate text-xs font-semibold text-cloud/52">Ұстазға көмек AI</span>
          </span>
        </NavLink>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              {t(`nav.${item.key}`)}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageToggle />
          <NavLink to="/voice" className="premium-button min-h-11 px-4 text-sm focus-ring">
            <Mic2 size={18} />
            {t('actions.talk')}
          </NavLink>
        </div>

        <button
          type="button"
          className="icon-button focus-ring md:hidden"
          aria-label="Open navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto mt-3 max-w-7xl rounded-[1.35rem] border border-white/12 bg-ink/88 p-3 shadow-glass backdrop-blur-2xl md:hidden"
          >
            <div className="grid gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={navClass}
                  onClick={() => setOpen(false)}
                >
                  {t(`nav.${item.key}`)}
                </NavLink>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <LanguageToggle />
              <NavLink
                to="/voice"
                onClick={() => setOpen(false)}
                className="premium-button min-h-11 flex-1 px-4 text-sm focus-ring"
              >
                <Mic2 size={18} />
                {t('actions.talk')}
              </NavLink>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
