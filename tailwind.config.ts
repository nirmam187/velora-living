import type { Config } from 'tailwindcss'

/**
 * The brand palette and type scale from the original single-file site, lifted into
 * Tailwind's theme so new work (contact form, admin, future pages) can use utilities
 * without re-typing hex codes. The marketing page itself keeps its original
 * hand-tuned CSS in app/globals.css — see the note at the top of that file.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F5F0E6',
          deep: '#EAE1CE',
        },
        ink: {
          DEFAULT: '#1A1815',
          soft: '#3A362F',
        },
        gold: {
          DEFAULT: '#B08A3E',
          light: '#D8BD84',
        },
        emerald: {
          DEFAULT: '#28402F',
          deep: '#1B2C21',
        },
        rust: '#8B4A3C',
        line: 'rgba(26,24,21,0.14)',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Fraunces', 'serif'],
        sans: ['var(--font-jost)', 'Jost', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.28em',
      },
      maxWidth: {
        wrap: '1280px',
      },
    },
  },
  plugins: [],
}

export default config
