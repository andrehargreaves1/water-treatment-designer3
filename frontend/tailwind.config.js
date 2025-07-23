/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional industrial color palette
        background: '#f8fafc',
        panel: '#ffffff',
        border: '#e2e8f0',
        'text-primary': '#1e293b',
        'text-secondary': '#64748b',
        
        // Equipment colors (ISA-5.1 compliant)
        'equipment-outline': '#1e293b',
        'equipment-fill': '#ffffff',
        'equipment-selected': '#2563eb',
        
        // Stream colors
        'stream-feed': '#ea580c',
        'stream-product': '#2563eb',
        'stream-waste': '#6b7280',
        'stream-chemical': '#d97706',
        'stream-air': '#059669',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Consolas', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'technical': '12px',
        'equipment-label': '14px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'flow': 'flow 2s linear infinite',
      },
      keyframes: {
        flow: {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        }
      },
    },
  },
  plugins: [],
}