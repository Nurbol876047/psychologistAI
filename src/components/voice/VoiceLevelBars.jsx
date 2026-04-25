export default function VoiceLevelBars({ level = 0, active = false }) {
  return (
    <div className="flex h-14 items-center justify-center gap-1.5" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, index) => {
        const wave = Math.sin(index * 0.92 + level * 4) * 0.5 + 0.5;
        const height = active ? 18 + wave * 24 + level * 32 : 8 + wave * 10;
        const duration = `${1.1 + index * 0.025}s`;
        const delay = `${index * 40}ms`;
        return (
          <span
            key={index}
            className="origin-center w-1.5 rounded-full bg-gradient-to-t from-aqua via-skyglass to-white/90 transition-[height,opacity] duration-150 will-change-transform"
            style={{
              height,
              opacity: active ? 0.82 : 0.35,
              animationName: active ? 'voice-wave' : 'none',
              animationDuration: duration,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationDelay: delay,
            }}
          />
        );
      })}
    </div>
  );
}
