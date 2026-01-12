/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'quantum-blue': '#0EA5E9',
        'quantum-teal': '#14B8A6',
        'quark-blue': '#3B82F6',
        'electron-pink': '#EC4899',
        'gluon-purple': '#8B5CF6',
        'photon-yellow': '#F59E0B',
        'higgs-gold': '#EAB308',
      },
    },
  },
  plugins: [],
}
