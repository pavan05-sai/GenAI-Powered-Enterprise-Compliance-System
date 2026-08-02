/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        veritas: {
          bg: '#F7F5F0',
          sidebar: '#F2EFF6',
          card: '#FFFFFF',
          border: '#E6E2D8',
          borderLight: '#ECE9E0',
          text: '#1A1918',
          muted: '#6E6B62',
          amber: '#C59B27',
          amberHover: '#B08820',
          gold: '#D4AF37',
          success: '#2E7D32',
          successBg: '#E8F5E9',
          warning: '#ED6C02',
          warningBg: '#FFF3E0',
          danger: '#D32F2F',
          dangerBg: '#FFEBEE',
          badge: '#F0ECE1'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'veritas': '0 2px 8px -2px rgba(0, 0, 0, 0.04), 0 1px 4px -1px rgba(0, 0, 0, 0.02)',
        'veritas-hover': '0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
};
