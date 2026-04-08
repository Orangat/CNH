/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette from Church of New Hope brand book
        navy: {
          900: '#0A2A46', // Deepest — hero backgrounds, headers
          800: '#173E5C', // Dark — section backgrounds
          700: '#1D5273', // Medium — primary text on light, links
          600: '#2A6890', // Lighter, hover states
          50:  '#EAF1F7', // Subtle navy tint
        },
        tan: {
          500: '#B59E81', // Brand accent — CTA, highlights, script
          600: '#9C8769', // Hover
          400: '#C9B69C', // Lighter
          50:  '#F5F1EB', // Cream background tint
        },
        cream: '#FAF7F2',  // Warm off-white background
        ash:   '#E2E3E4',  // Brand neutral gray
      },
      fontFamily: {
        // Existing 'Creo' is already loaded via @font-face in App.css
        display: ['Creo', 'system-ui', 'sans-serif'],
        sans:    ['Creo', 'Inter', 'system-ui', 'sans-serif'],
        script:  ['"Dancing Script"', '"Caveat"', 'cursive'], // stand-in for Freehand
        serif:   ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      letterSpacing: {
        wider: '0.08em',
        widest: '0.18em', // brand uses very wide tracking on caps
      },
      maxWidth: {
        '8xl': '88rem',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.7s ease-out',
        'fade-in':    'fadeIn 0.6s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
