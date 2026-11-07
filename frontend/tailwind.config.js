/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        orbitron: ['Orbitron', 'sans-serif'],
        space: ['Space Grotesk', 'sans-serif'],
        cursive: ['"Dancing Script"', 'cursive'],
      },
      colors: {
        navy: {
          950: '#060913',
          900: '#0B0F19',
          850: '#0F1626',
          800: '#141D32',
          700: '#1E293B',
          600: '#334155',
        },
        accent: {
          violet: '#8B5CF6',
          blue: '#38BDF8',
          indigo: '#6366F1',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
        }
      },
      boxShadow: {
        'glow-blue': '0 0 24px -2px rgba(56, 189, 248, 0.35)',
        'glow-violet': '0 0 24px -2px rgba(139, 92, 246, 0.40)',
        'glow-emerald': '0 0 24px -2px rgba(16, 185, 129, 0.35)',
        'card': '0 8px 30px -4px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}

