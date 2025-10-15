/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf7f0',
          100: '#f7e8d8',
          200: '#f0d4b3',
          300: '#e7bb84',
          400: '#dd9f53',
          500: '#d18843',
          600: '#c47238',
          700: '#a35b31',
          800: '#834a2f',
          900: '#6b3e29',
        },
        secondary: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#e8ddc7',
          300: '#d9c59f',
          400: '#c8a876',
          500: '#bc955c',
          600: '#a8844f',
          700: '#8d6d43',
          800: '#73583a',
          900: '#5e4931',
        },
        warm: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
      borderRadius: {
        card: '18px',
        20: '20px',
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0,-10px,0)' },
          '70%': { transform: 'translate3d(0,-5px,0)' },
          '90%': { transform: 'translate3d(0,-2px,0)' },
        },
      },
      shadowColor: {
        warm: '#d18843',
      },
    },
  },
  plugins: [],
};
