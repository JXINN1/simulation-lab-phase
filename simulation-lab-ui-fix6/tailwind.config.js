/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      'sm': '1024px',
      'md': '1024px',
      'lg': '1280px',
      'xl': '1536px',
    },
    extend: {
      colors: {
        'void': '#050505',
        'void-light': '#0a0a0a',
        'terminal': '#00ff41',
        'alert': '#ff0055',
        'cyber-blue': '#00d4ff',
        'cyber-purple': '#9d00ff',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
        'mono': ['Share Tech Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
