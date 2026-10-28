/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Automotive dark theme base
        'graphite': '#121316',
        'card-bg': '#1C1E24',
        // BVK-AUTOSERVIS green
        'bvo-green': '#2E8B57',
        'bvo-green-light': '#4CAF50',
        // МирГбоСПб red
        'gbo-red': '#D32F2F',
        'gbo-red-light': '#FF5252',
        // Logo-specific
        'bvo-green-gradient': '#2E8B57',
        'bvo-green-gradient-end': '#4CAF50',
        'gbo-red-gradient': '#B71C1C',
        'gbo-red-gradient-end': '#FF5252',
        'road-purple': '#AB47BC',
        'road-purple-end': '#D81B60',
        'road-cyan': '#29B6F6',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-neon-green': 'pulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'pulse-neon-red': 'pulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
      boxShadow: {
        'neon-green': '0 0 20px rgba(46, 139, 87, 0.5), 0 0 40px rgba(76, 175, 80, 0.3)',
        'neon-red': '0 0 20px rgba(211, 47, 47, 0.5), 0 0 40px rgba(255, 82, 82, 0.3)',
      },
    },
  },
  plugins: [],
};
