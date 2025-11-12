/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'morphlex-dark': '#0f172a',
        'morphlex-darker': '#020617',
        'morphlex-accent': '#06b6d4',
        'morphlex-success': '#10b981',
        'morphlex-warning': '#f59e0b',
        'morphlex-error': '#ef4444',
      },
    },
  },
  plugins: [],
}
