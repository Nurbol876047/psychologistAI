export default function SectionHeader({ eyebrow, title, children, align = 'left' }) {
  const centered = align === 'center';

  return (
    <div className={centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      {eyebrow ? (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-aqua/82">{eyebrow}</p>
      ) : null}
      <h1 className="font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      {children ? <div className="mt-4 text-base leading-8 text-cloud/68 sm:text-lg">{children}</div> : null}
    </div>
  );
}
