import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Send, UserRound } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function ChatPanel({ messages, input, setInput, onSend, busy = false }) {
  const { t } = useLanguage();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy]);

  return (
    <div className="flex h-full min-h-[360px] flex-col rounded-[1.55rem] border border-white/12 bg-white/7 p-4 backdrop-blur-xl sm:min-h-[520px]">
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => {
            const isUser = message.role === 'user';
            return (
              <motion.div
                key={`${message.role}-${index}-${message.content.slice(0, 8)}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser ? (
                  <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-aqua/22 bg-aqua/12 text-aqua">
                    <Bot size={18} />
                  </span>
                ) : null}
                <div
                  className={[
                    'max-w-[82%] rounded-[1.2rem] px-4 py-3 text-sm leading-7',
                    isUser
                      ? 'bg-white text-ink shadow-calm'
                      : 'border border-white/12 bg-ink/42 text-cloud/78',
                  ].join(' ')}
                >
                  {message.content}
                </div>
                {isUser ? (
                  <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/18 bg-white/10 text-white">
                    <UserRound size={18} />
                  </span>
                ) : null}
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <form
        className="mt-4 flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          onSend(input);
        }}
      >
        <textarea
          className="soft-input min-h-[78px] resize-none px-4 py-3 text-sm leading-6"
          rows={3}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t('voice.prompt')}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="icon-button h-[78px] w-[54px] shrink-0 bg-aqua/16 text-aqua focus-ring disabled:cursor-not-allowed disabled:opacity-45"
          aria-label={t('actions.send')}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
