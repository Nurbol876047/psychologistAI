import { motion } from 'framer-motion';
import { Mic, MicOff, Radio, Volume2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ChatPanel from '../components/voice/ChatPanel.jsx';
import VoiceLevelBars from '../components/voice/VoiceLevelBars.jsx';
import PageTransition from '../components/shared/PageTransition.jsx';
import SectionHeader from '../components/shared/SectionHeader.jsx';
import StatusPill from '../components/shared/StatusPill.jsx';
import EmotionalCore from '../components/three/EmotionalCore.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { chatSeed } from '../data/mockData.js';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder.js';
import { sendChatMessage, sendVoiceTranscript, transcribeAudio } from '../services/aiService.js';

const quickPrompts = [
  'Бүгін қатты шаршадым, бірақ сабаққа дайындалуым керек.',
  'Ата-анамен сөйлесуден кейін өзімді жайсыз сезініп тұрмын.',
  'Маған қазір қысқа тыныштандыру сөзі керек.',
];

export default function VoiceSupport() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState(chatSeed);
  const [input, setInput] = useState('');
  const [voiceState, setVoiceState] = useState('idle');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [busy, setBusy] = useState(false);
  const recorder = useVoiceRecorder({
    language: language === 'kk' ? 'kk-KZ' : 'ru-RU',
  });
  const cancelRecording = recorder.cancel;

  useEffect(() => {
    if (recorder.recording) {
      setVoiceState('listening');
      if (recorder.transcript) setInput(recorder.transcript);
    }
  }, [recorder.recording, recorder.transcript]);

  useEffect(() => {
    if (recorder.status === 'idle' && voiceState === 'listening') setVoiceState('idle');
  }, [recorder.status, voiceState]);

  useEffect(() => {
    return () => {
      cancelRecording();
      window.speechSynthesis?.cancel();
    };
  }, [cancelRecording]);

  const statusText = useMemo(() => {
    if (voiceState === 'listening') return t('voice.listening');
    if (voiceState === 'thinking') return t('voice.thinking');
    if (voiceState === 'speaking') return t('voice.speaking');
    if (recorder.status === 'starting') return language === 'ru' ? 'Включаю микрофон...' : 'Микрофон қосылып жатыр...';
    if (recorder.status === 'stopping') return language === 'ru' ? 'Обрабатываю запись...' : 'Жазба өңделіп жатыр...';
    return t('voice.ready');
  }, [language, recorder.status, t, voiceState]);

  const visualLevel =
    voiceState === 'listening'
      ? Math.max(recorder.level, 0.18)
      : voiceState === 'speaking'
        ? 0.68
        : voiceState === 'thinking'
          ? 0.34
          : 0.12;

  const speak = useCallback(
    (text) => {
      if (!ttsEnabled || !window.speechSynthesis) {
        window.setTimeout(() => setVoiceState('idle'), 1200);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'kk' ? 'kk-KZ' : 'ru-RU';
      utterance.rate = 0.92;
      utterance.pitch = 1.02;
      const voices = window.speechSynthesis.getVoices?.() ?? [];
      const preferredVoice = voices.find((voice) =>
        voice.lang.toLowerCase().startsWith(language === 'kk' ? 'kk' : 'ru'),
      );
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.onend = () => setVoiceState('idle');
      utterance.onerror = () => setVoiceState('idle');
      window.speechSynthesis.speak(utterance);
    },
    [language, ttsEnabled],
  );

  const handleSend = useCallback(
    async (rawMessage, viaVoice = false) => {
      const nextMessage = rawMessage.trim();
      if (!nextMessage || busy) return;

      const userMessage = { role: 'user', content: nextMessage };
      const nextHistory = [...messages, userMessage];
      setMessages(nextHistory);
      setInput('');
      setBusy(true);
      setVoiceState('thinking');

      const reply = viaVoice
        ? await sendVoiceTranscript({ transcript: nextMessage, history: messages, locale: language })
        : await sendChatMessage({ message: nextMessage, history: messages, locale: language });

      setMessages((current) => [...current, reply]);
      setBusy(false);
      setVoiceState('speaking');
      speak(reply.content);
    },
    [busy, language, messages, speak],
  );

  const toggleListening = async () => {
    if (busy || recorder.busy) return;

    if (recorder.recording) {
      const capture = await recorder.stop();
      let spokenText = capture.transcript?.trim() || input.trim();

      if (capture.audioBlob?.size > 1200) {
        setVoiceState('thinking');
        try {
          const result = await transcribeAudio(capture.audioBlob, language);
          spokenText = result.text?.trim() || spokenText;
        } catch (error) {
          console.info('Voice transcription fallback:', error.message);
        }
      }

      recorder.resetTranscript();

      if (!spokenText) {
        setVoiceState('idle');
        setInput('');
        return;
      }

      await handleSend(spokenText, true);
      return;
    }

    window.speechSynthesis?.cancel();
    setInput('');
    const started = await recorder.start();
    if (!started) setVoiceState('idle');
  };

  return (
    <PageTransition className="space-y-8">
      <SectionHeader eyebrow="Voice AI" title={t('voice.title')}>
        <p>{t('voice.subtitle')}</p>
      </SectionHeader>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
        <div className="glass-panel rounded-[1.75rem] p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <StatusPill color={voiceState === 'listening' ? 'aqua' : voiceState === 'speaking' ? 'peach' : 'iris'}>
              {statusText}
            </StatusPill>
            <label className="flex cursor-pointer items-center gap-3 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-cloud/70">
              <Volume2 size={17} className="text-aqua" />
              <span>{t('voice.tts')}</span>
              <input
                type="checkbox"
                checked={ttsEnabled}
                onChange={(event) => setTtsEnabled(event.target.checked)}
                className="h-4 w-4 accent-aqua"
              />
            </label>
          </div>

          <div className="relative">
            <EmotionalCore state={voiceState} level={visualLevel} compact className="min-h-[360px]" />
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={toggleListening}
              disabled={busy || recorder.busy}
              className={[
                'absolute bottom-8 left-1/2 grid h-20 w-20 -translate-x-1/2 place-items-center rounded-full border shadow-premium transition focus-ring disabled:opacity-60',
                recorder.recording
                  ? 'border-peach/55 bg-peach text-ink'
                  : 'border-aqua/45 bg-aqua text-ink hover:scale-105',
              ].join(' ')}
              aria-label="Microphone"
            >
              {recorder.recording ? <MicOff size={30} /> : <Mic size={30} />}
            </motion.button>
          </div>

          <VoiceLevelBars level={visualLevel} active={voiceState !== 'idle'} />

          {!recorder.supported ? (
            <p className="mt-3 rounded-2xl border border-peach/20 bg-peach/10 px-4 py-3 text-sm text-cloud/68">
              {t('voice.unsupported')}
            </p>
          ) : null}
          {recorder.error ? (
            <p className="mt-3 rounded-2xl border border-peach/20 bg-peach/10 px-4 py-3 text-sm text-cloud/68">
              {recorder.error}
            </p>
          ) : null}

          <div className="mt-5 grid gap-2 md:grid-cols-3">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setInput(prompt)}
                className="rounded-2xl border border-white/12 bg-white/7 px-4 py-3 text-left text-sm leading-6 text-cloud/68 transition hover:border-aqua/28 hover:bg-white/10 focus-ring"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[1.75rem] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-aqua/76">Support chat</p>
              <p className="mt-1 text-sm text-cloud/56">AI жауаптары backend арқылы қосылуға дайын</p>
            </div>
            <Radio className="text-aqua" size={21} />
          </div>
          <ChatPanel messages={messages} input={input} setInput={setInput} onSend={handleSend} busy={busy} />
        </div>
      </div>
    </PageTransition>
  );
}
