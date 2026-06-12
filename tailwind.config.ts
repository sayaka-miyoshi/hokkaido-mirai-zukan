import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        hokkaido: {
          sky: '#5BAFD6',
          deep: '#2B4A6B',
          lake: '#3D7FA6',
          snow: '#F0F8FF',
          ice: '#E8F4FC',
          forest: '#4A9B7A',
          lavender: '#B8A9E8',
        },
        magazine: {
          cream: '#FFFBF7',
          sky: '#F0F8FF',
          peach: '#FFF5EE',
          mint: '#F2FBF6',
          border: '#E8EEF2',
          text: '#3D4F5F',
          title: '#2B4A6B',
          muted: '#7A8B9A',
          coral: '#FF9B7A',
        },
      },
      fontFamily: {
        'magazine-rounded': ['var(--font-magazine-rounded)', 'Hiragino Maru Gothic ProN', 'sans-serif'],
        sans: ['var(--font-sans)', 'Hiragino Sans', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backgroundImage: {
        'hokkaido-hero': 'linear-gradient(135deg, #5BAFD6 0%, #7EC8E8 45%, #B8E4F5 100%)',
        'hokkaido-page': 'linear-gradient(180deg, #FFFBF7 0%, #FFFFFF 100%)',
      },
      boxShadow: {
        magazine: '0 8px 32px rgba(43, 74, 107, 0.06)',
        'magazine-sm': '0 2px 12px rgba(43, 74, 107, 0.05)',
      },
    },
  },
  plugins: [],
}
export default config
