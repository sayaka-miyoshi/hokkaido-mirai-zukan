import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        hokkaido: {
          sky: '#4A8FB8',
          deep: '#1A4D7C',
          lake: '#2D6A9F',
          snow: '#F0F8FF',
          ice: '#E8F4FC',
          forest: '#2D5016',
          lavender: '#9B8EC4',
        },
      },
      backgroundImage: {
        'hokkaido-hero': 'linear-gradient(135deg, #1A4D7C 0%, #2D6A9F 45%, #4A8FB8 100%)',
        'hokkaido-page': 'linear-gradient(180deg, #E8F4FC 0%, #F5F9FC 35%, #FFFFFF 100%)',
      },
    },
  },
  plugins: [],
}
export default config
