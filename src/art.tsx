// Local SVG artwork, initials avatars and the colored shift chips.
const hue = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
export const Avatar = ({ name, size = 32 }: { name: string; size?: number }) => (
  <span
    title={name}
    style={{
      width: size,
      height: size,
      background: `linear-gradient(135deg,hsl(${hue(name)} 80% 60%),hsl(${(hue(name) + 50) % 360} 80% 50%))`,
    }}
    className="inline-flex items-center justify-center rounded-full text-white text-xs font-bold shrink-0 ring-2 ring-white"
  >
    {name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')}
  </span>
);
export const shiftTheme = (n: string = '') =>
  /morn/i.test(n)
    ? { i: '☀️', c: 'bg-amber-100 text-amber-800' }
    : /even/i.test(n)
      ? { i: '🌆', c: 'bg-violet-100 text-violet-800' }
      : /night/i.test(n)
        ? { i: '🌙', c: 'bg-slate-800 text-slate-100' }
        : { i: '🕒', c: 'bg-sky-100 text-sky-800' };
export const ShiftChip = ({ name }: { name: string }) => {
  const t = shiftTheme(name);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${t.c}`}
    >
      {t.i} {name}
    </span>
  );
};
export const HeroArt = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 400 300" className={className} fill="none">
    <defs>
      <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#a78bfa" />
        <stop offset="1" stopColor="#38bdf8" />
      </linearGradient>
      <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#fbbf24" />
        <stop offset="1" stopColor="#f472b6" />
      </linearGradient>
    </defs>
    <circle cx="320" cy="60" r="70" fill="url(#g2)" opacity=".35" />
    <circle cx="60" cy="250" r="80" fill="url(#g1)" opacity=".3" />
    <rect x="70" y="50" width="250" height="190" rx="22" fill="#fff" opacity=".95" />
    <rect x="70" y="50" width="250" height="48" rx="22" fill="url(#g1)" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <circle key={i} cx={100 + i * 34} cy="74" r="5" fill="#fff" opacity=".7" />
    ))}
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((i) => {
      const c = ['#fde68a', '#c4b5fd', '#cbd5e1', '#e2e8f0'][(i * 3 + (i > 6 ? 1 : 0)) % 4];
      return (
        <rect
          key={i}
          x={88 + (i % 7) * 31}
          y={112 + Math.floor(i / 7) * 44}
          width="26"
          height="34"
          rx="8"
          fill={c}
        />
      );
    })}
    <circle cx="305" cy="215" r="42" fill="#fff" stroke="url(#g2)" strokeWidth="8" />
    <path d="M305 190v26l18 12" stroke="#6366f1" strokeWidth="6" strokeLinecap="round" />
    {[
      ['#f472b6', 120],
      ['#60a5fa', 150],
      ['#34d399', 180],
    ].map(([c, x], i) => (
      <g key={i}>
        <circle cx={x as number} cy="272" r="14" fill={c as string} />
        <rect
          x={(x as number) - 14}
          y="288"
          width="28"
          height="12"
          rx="6"
          fill={c as string}
          opacity=".6"
        />
      </g>
    ))}
  </svg>
);
export const EmptyArt = () => (
  <svg viewBox="0 0 160 120" className="w-40 mx-auto" fill="none">
    <circle cx="80" cy="60" r="48" fill="#e0e7ff" />
    <rect
      x="45"
      y="35"
      width="70"
      height="55"
      rx="10"
      fill="#fff"
      stroke="#818cf8"
      strokeWidth="3"
    />
    <path d="M45 52h70" stroke="#818cf8" strokeWidth="3" />
    <circle cx="80" cy="73" r="8" stroke="#a5b4fc" strokeWidth="3" />
    <path d="M60 28v14M100 28v14" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" />
  </svg>
);
