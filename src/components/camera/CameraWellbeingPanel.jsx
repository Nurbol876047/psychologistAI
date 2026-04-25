import { Camera, CameraOff, Loader2, ScanFace, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useWellbeingCamera } from '../../hooks/useWellbeingCamera.js';
import StatusPill from '../shared/StatusPill.jsx';

const faceCopy = {
  kk: {
    waiting: ['Камера дайын', 'Күйді жұмсақ тексеру үшін камераны қосыңыз.'],
    calm: ['бірқалыпты күй', 'Бетіңіздегі сыртқы белгілер тыныш ырғаққа жақын. Осы қарқынды сақтап, бір қысқа үзіліс алыңыз.'],
    tired: ['шаршау белгісі', 'Көз айналасы мен мимикада шаршауға ұқсас белгі бар. Су ішіп, иықты босатып, бір міндетті кейінге қалдырыңыз.'],
    tense: ['кернеу байқалды', 'Қас пен жақ аймағында кернеуге ұқсас белгі бар. Демді баяулатып, ойды бір ғана келесі қадамға жинақтаңыз.'],
    positive: ['жылы энергия', 'Жылы мимика байқалады. Осы ресурс жоғалмай тұрғанда бүгінгі жақсы сәтті күнделікке белгілеңіз.'],
  },
  ru: {
    waiting: ['Камера готова', 'Включите камеру для мягкой проверки состояния.'],
    calm: ['ровное состояние', 'Внешние признаки лица похожи на спокойный ритм. Сохраните этот темп и сделайте короткую паузу.'],
    tired: ['признаки усталости', 'В зоне глаз и мимике есть признаки, похожие на усталость. Выпейте воды, расслабьте плечи и отложите одну задачу.'],
    tense: ['заметно напряжение', 'В зоне бровей и челюсти есть признаки, похожие на напряжение. Замедлите дыхание и выберите один следующий шаг.'],
    positive: ['тёплая энергия', 'Мимика выглядит более открытой. Пока ресурс рядом, отметьте хороший момент в дневнике.'],
  },
};

const gestureLabels = {
  kk: {
    None: 'қол күтілуде',
    Open_Palm: 'ашық алақан',
    Closed_Fist: 'жұдырық',
    Pointing_Up: 'нұсқау',
    Thumb_Up: 'мақұлдау',
    Thumb_Down: 'кері белгі',
    Victory: 'жеңіс',
    ILoveYou: 'қол белгісі',
  },
  ru: {
    None: 'рука ожидается',
    Open_Palm: 'открытая ладонь',
    Closed_Fist: 'кулак',
    Pointing_Up: 'указание',
    Thumb_Up: 'одобрение',
    Thumb_Down: 'обратный знак',
    Victory: 'жест победы',
    ILoveYou: 'жест рукой',
  },
};

function metricPercent(value) {
  return `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;
}

export default function CameraWellbeingPanel({
  onMoodDetected,
  onSignalsChange,
  aiAdvice,
  aiBusy = false,
  onAskAi,
}) {
  const { language } = useLanguage();
  const camera = useWellbeingCamera({ enableFace: true, enableHands: true });
  const copy = faceCopy[language] ?? faceCopy.kk;
  const face = camera.signals.face;
  const hand = camera.signals.hand;
  const [faceTitle, faceAdvice] = copy[face.state] ?? copy.waiting;
  const gestureText = gestureLabels[language]?.[hand.gesture] ?? gestureLabels.kk[hand.gesture] ?? hand.gesture;

  useEffect(() => {
    onSignalsChange?.(camera.signals);

    if (camera.active && face.detected) {
      onMoodDetected?.(face.moodKey);
    }
  }, [camera.active, camera.signals, face.detected, face.moodKey, onMoodDetected, onSignalsChange]);

  return (
    <section className="glass-panel rounded-[1.75rem] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-aqua/78">Camera AI</p>
          <h2 className="mt-2 font-display text-xl font-extrabold text-white sm:text-2xl">
            {language === 'ru' ? 'Скан состояния' : 'Күйді камерамен оқу'}
          </h2>
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
          {camera.loading
            ? language === 'ru'
              ? 'Загрузка'
              : 'Жүктелуде'
            : camera.active
            ? language === 'ru'
              ? 'Выключить'
              : 'Өшіру'
            : language === 'ru'
              ? 'Включить'
              : 'Қосу'}
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <div className="relative min-h-[250px] overflow-hidden rounded-[1.25rem] border border-white/12 bg-ink/48">
          <video
            ref={camera.videoRef}
            className={[
              'h-full min-h-[250px] w-full object-cover opacity-80',
              camera.active ? 'scale-x-[-1]' : 'hidden',
            ].join(' ')}
            muted
            playsInline
            autoPlay
          />
          {!camera.active ? (
            <div className="absolute inset-0 grid place-items-center px-6 text-center">
              <div>
                <ScanFace className="mx-auto text-aqua" size={36} />
                <p className="mt-4 text-sm leading-7 text-cloud/62">
                  {camera.supported
                    ? copy.waiting[1]
                    : language === 'ru'
                      ? 'Браузер не дал доступ к камере.'
                      : 'Браузер камераға қол жеткізе алмады.'}
                </p>
              </div>
            </div>
          ) : null}
          {camera.active && hand.detected ? (
            <span
              className="pointer-events-none absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-aqua/70 bg-aqua/12 shadow-[0_0_32px_rgba(85,221,224,.45)]"
              style={{ left: `${hand.x * 100}%`, top: `${hand.y * 100}%` }}
            />
          ) : null}
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
            <StatusPill color={face.detected ? 'sage' : 'iris'}>{faceTitle}</StatusPill>
            <StatusPill color={hand.detected ? 'aqua' : 'peach'}>{gestureText}</StatusPill>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[1.25rem] border border-white/12 bg-white/7 p-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-aqua/18 bg-aqua/12 text-aqua">
                <ShieldCheck size={21} />
              </span>
              <p className="text-sm leading-7 text-cloud/68">
                {aiAdvice || faceAdvice}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {[
                [language === 'ru' ? 'Баланс' : 'Баланс', `${face.balance}%`, face.balance / 100],
                [language === 'ru' ? 'Улыбка' : 'Жымию', metricPercent(face.smile), face.smile],
                [language === 'ru' ? 'Напряжение' : 'Кернеу', metricPercent(face.tension), face.tension],
              ].map(([label, value, percent]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-ink/28 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-cloud/42">{label}</span>
                    <strong className="text-sm text-white">{value}</strong>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-calm-line transition-all duration-500"
                      style={{ width: metricPercent(percent) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onAskAi}
            disabled={!face.detected || aiBusy}
            className="secondary-button mt-4 min-h-11 w-full text-sm focus-ring disabled:cursor-not-allowed disabled:opacity-45"
          >
            {aiBusy ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {language === 'ru' ? 'AI-рекомендация' : 'AI кеңес алу'}
          </button>
        </div>
      </div>

      {camera.error ? (
        <p className="mt-3 rounded-2xl border border-peach/20 bg-peach/10 px-4 py-3 text-sm text-cloud/68">
          {camera.error}
        </p>
      ) : null}
    </section>
  );
}
