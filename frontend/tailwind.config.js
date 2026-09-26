/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#08090E',
        'surface-1': '#0F121E',
        'surface-2': '#15192B',
        'surface-card': 'rgba(17, 21, 37, 0.85)',
        'surface-hover': '#1C223A',
        'border-subtle': 'rgba(255, 255, 255, 0.07)',
        'border-card': 'rgba(255, 255, 255, 0.10)',
        'border-focus': 'rgba(123, 63, 228, 0.50)',
        finova: {
          coral: '#FF4B72',
          purple: '#7B3FE4',
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
          canvas: '#08090E',
          surface1: '#0F121E',
          surface2: '#15192B',
          card: 'rgba(17, 21, 37, 0.85)',
          hover: '#1C223A',
        },
        dark: {
          950: '#040508',
          900: '#08090E',
          800: '#0F121E',
          700: '#15192B',
          600: '#1C223A',
          500: '#2A3352',
        },
        nova: {
          cyan: '#06B6D4',
          blue: '#3B82F6',
          indigo: '#7B3FE4',
          violet: '#7B3FE4',
          emerald: '#10B981',
          crimson: '#FF4B72',
          amber: '#F59E0B',
        }
      },
      backgroundImage: {
        'grad-sunset': 'linear-gradient(135deg, #FF4B72 0%, #FF7F59 100%)',
        'grad-violet': 'linear-gradient(135deg, #7B3FE4 0%, #4F46E5 100%)',
        'grad-emerald': 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
        'grad-cyber-card': 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.00) 100%)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'finova-card': '0 10px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'finova-glow-purple': '0 0 25px rgba(123, 63, 228, 0.35)',
        'finova-glow-cyan': '0 0 25px rgba(6, 182, 212, 0.35)',
        'finova-glow-coral': '0 0 25px rgba(255, 75, 114, 0.35)',
        'finova-glow-emerald': '0 0 25px rgba(16, 185, 129, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(123, 63, 228, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(123, 63, 228, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
