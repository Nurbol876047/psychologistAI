import { Camera, CameraOff, Hand, Loader2, MousePointer2, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useWellbeingCamera } from '../../hooks/useWellbeingCamera.js';
import StatusPill from '../shared/StatusPill.jsx';

const gestureText = {
  kk: {
    title: 'Қолмен антистресс шар',
    subtitle: 'Жұмсақ шар қол қимылына қарай созылып, қысылады.',
    camera: 'Камера',
    pointer: 'Тач / mouse',
    active: 'қол табылды',
    idle: 'қол күтілуде',
    squeeze: 'қысым',
    release: 'босаңсу',
  },
  ru: {
    title: 'Антистресс-шар руками',
    subtitle: 'Мягкий шар растягивается и сжимается от движения руки.',
    camera: 'Камера',
    pointer: 'Тач / mouse',
    active: 'рука найдена',
    idle: 'рука ожидается',
    squeeze: 'сжатие',
    release: 'расслабление',
  },
};

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export default function GestureStressBall() {
  const { language } = useLanguage();
  const copy = gestureText[language] ?? gestureText.kk;
  const camera = useWellbeingCamera({ enableFace: false, enableHands: true });
  const [pointer, setPointer] = useState({ active: false, x: 0.5, y: 0.5, squeeze: 0 });

  const hand = camera.signals.hand;
  const interaction = camera.active && hand.detected ? hand : pointer;
  const squeeze = clamp(interaction.squeeze || 0);
  const x = clamp(interaction.x ?? 0.5);
  const y = clamp(interaction.y ?? 0.5);
  const active = (camera.active && hand.detected) || pointer.active;

  const orbStyle = useMemo(() => {
    const xShift = (x - 0.5) * 90;
    const yShift = (y - 0.5) * 56;
    const scaleX = 1 + squeeze * 0.2;
    const scaleY = 1 - squeeze * 0.18;
    const glow = 0.22 + squeeze * 0.32;

    return {
      transform: `translate(${xShift}px, ${yShift}px) scale(${scaleX}, ${scaleY}) rotate(${(x - 0.5) * 16}deg)`,
      borderRadius: `${54 - squeeze * 18}% ${48 + x * 16}% ${52 + squeeze * 20}% ${46 + y * 18}%`,
      background: `radial-gradient(circle at ${32 + x * 34}% ${25 + y * 24}%, rgba(255,255,255,.95), rgba(135,196,163,.88) 18%, rgba(85,221,224,.74) 45%, rgba(124,109,242,.64) 100%)`,
      boxShadow: `0 28px 90px rgba(85,221,224,${glow}), inset 0 -28px 60px rgba(11,16,32,.22)`,
    };
  }, [squeeze, x, y]);

  const updatePointer = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const nextX = clamp((event.clientX - rect.left) / rect.width);
    const nextY = clamp((event.clientY - rect.top) / rect.height);
    setPointer({
      active: true,
      x: nextX,
      y: nextY,
      squeeze: event.buttons || event.pressure > 0 ? Math.max(event.pressure || 0.74, 0.62) : 0.24,
    });
  };

  const releasePointer = () => {
    setPointer((current) => ({ ...current, active: false, squeeze: 0 }));
  };

  return (
    <section className="glass-panel rounded-[1.75rem] p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-aqua/78">Gesture game</p>
          <h2 className="mt-2 font-display text-2xl font-extrabold text-white">{copy.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-cloud/62">{copy.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (camera.active || camera.loading) {
              camera.stop();
              return;
            }
            void camera.start();
          }}
          disabled={!camera.supported}
          className={camera.active ? 'secondary-button min-h-11 px-4 text-sm focus-ring' : 'premium-button min-h-11 px-4 text-sm focus-ring'}
        >
          {camera.loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : camera.active ? (
            <CameraOff size={18} />
          ) : (
            <Camera size={18} />
          )}
          {camera.loading ? (language === 'ru' ? 'Загрузка' : 'Жүктелуде') : copy.camera}
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
        <div
          className="relative min-h-[390px] touch-none overflow-hidden rounded-[1.4rem] border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,.09),rgba(135,196,163,.08),rgba(124,109,242,.08))]"
          onPointerDown={updatePointer}
          onPointerMove={updatePointer}
          onPointerUp={releasePointer}
          onPointerCancel={releasePointer}
          onPointerLeave={releasePointer}
        >
          <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.045)_1px,transparent_1px)] [background-size:38px_38px]" />

          <div className="absolute left-1/2 top-1/2 h-[min(58vw,20rem)] w-[min(58vw,20rem)] -translate-x-1/2 -translate-y-1/2">
            <div className="absolute inset-0 rounded-full border border-aqua/18" />
            <div className="absolute inset-[12%] rounded-full border border-sage/16" />
            <div
              className="absolute inset-[15%] transition-[border-radius,box-shadow,transform,background] duration-150 ease-out"
              style={orbStyle}
            />
            <span
              className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/45 bg-white/10 shadow-[0_0_34px_rgba(245,248,255,.28)] transition-all duration-150"
              style={{ left: `${x * 100}%`, top: `${y * 100}%`, opacity: active ? 1 : 0.28 }}
            />
          </div>

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <StatusPill color={active ? 'sage' : 'iris'}>{active ? copy.active : copy.idle}</StatusPill>
            <StatusPill color={squeeze > 0.5 ? 'peach' : 'aqua'}>
              {squeeze > 0.5 ? copy.squeeze : copy.release}
            </StatusPill>
          </div>

          <div className="absolute bottom-4 left-4 right-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-calm-line transition-all duration-200"
              style={{ width: `${Math.round((0.18 + squeeze * 0.82) * 100)}%` }}
            />
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="relative min-h-[210px] overflow-hidden rounded-[1.25rem] border border-white/12 bg-ink/48">
            <video
              ref={camera.videoRef}
              className={camera.active ? 'h-full min-h-[210px] w-full scale-x-[-1] object-cover opacity-80' : 'hidden'}
              muted
              playsInline
              autoPlay
            />
            {!camera.active ? (
              <div className="absolute inset-0 grid place-items-center px-6 text-center">
                <Hand className="mx-auto text-aqua" size={34} />
                <p className="mt-3 text-sm leading-7 text-cloud/62">
                  {camera.supported ? copy.camera : 'Camera unavailable'}
                </p>
              </div>
            ) : null}
          </div>

          <div className="grid gap-3 rounded-[1.25rem] border border-white/12 bg-white/7 p-4">
            {[
              [copy.pointer, <MousePointer2 key="pointer" size={19} />],
              [copy.camera, <Camera key="camera" size={19} />],
              ['AI gesture', <Sparkles key="sparkles" size={19} />],
            ].map(([label, icon]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-ink/28 px-4 py-3">
                <span className="text-sm font-bold text-cloud/72">{label}</span>
                <span className="text-aqua">{icon}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {camera.error ? (
        <p className="mt-3 rounded-2xl border border-peach/20 bg-peach/10 px-4 py-3 text-sm text-cloud/68">
          {camera.error}
        </p>
      ) : null}
    </section>
  );
}
