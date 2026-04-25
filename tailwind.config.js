/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        ink: '#0B1020',
        cloud: '#F5F8FF',
        mist: '#DDE7F6',
        aqua: '#55DDE0',
        skyglass: '#8EC5FF',
        iris: '#7C6DF2',
        plum: '#6F58C9',
        sage: '#87C4A3',
        peach: '#F0B38A',
      },
      boxShadow: {
        premium: '0 22px 70px rgba(14, 28, 68, 0.28)',
        glass: '0 20px 60px rgba(13, 22, 47, 0.22)',
        calm: '0 18px 45px rgba(85, 221, 224, 0.18)',
      },
      backgroundImage: {
        'app-radial':
          'radial-gradient(circle at 50% 4%, rgba(85,221,224,.23), transparent 30%), radial-gradient(circle at 12% 18%, rgba(124,109,242,.18), transparent 26%), linear-gradient(135deg, #08111f 0%, #0d1630 46%, #111827 100%)',
        'soft-surface':
          'linear-gradient(145deg, rgba(255,255,255,.18), rgba(255,255,255,.06))',
        'calm-line':
          'linear-gradient(90deg, rgba(85,221,224,.88), rgba(124,109,242,.72), rgba(240,179,138,.72))',
      },
      animation: {
        breathe: 'breathe 6s ease-in-out infinite',
        floaty: 'floaty 8s ease-in-out infinite',
        shimmer: 'shimmer 6s linear infinite',
        wave: 'wave 1.6s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(.88)', opacity: '.82' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(.45)' },
          '50%': { transform: 'scaleY(1)' },
        },
      },
    },
  },
  plugins: [],
};
