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
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Times New Roman"', 'Times', 'serif'],
        serif: ['"Times New Roman"', 'Times', 'serif'],
      },
      colors: {
        royal: {
          700: '#581c87',
          800: '#4c1d95',
          900: '#3b0764',
          950: '#2e1065',
        },
        aqua: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        gray: {
          150: '#eaecf0',
        },
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'card': '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'cyan-glow': '0 0 20px -3px rgba(6, 182, 212, 0.45)',
        'purple-glow': '0 10px 25px -5px rgba(76, 29, 149, 0.35)',
      },
      backgroundImage: {
        'chat-bubbles': `radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.05) 0, rgba(255, 255, 255, 0.05) 12px, transparent 13px),
                         radial-gradient(circle at 80% 40%, rgba(6, 182, 212, 0.08) 0, rgba(6, 182, 212, 0.08) 24px, transparent 25px),
                         radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.04) 0, rgba(255, 255, 255, 0.04) 18px, transparent 19px),
                         radial-gradient(circle at 90% 85%, rgba(6, 182, 212, 0.06) 0, rgba(6, 182, 212, 0.06) 30px, transparent 31px)`,
      },
    },
  },
  plugins: [],
}
