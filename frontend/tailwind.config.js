/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'ig-primary': 'var(--ig-primary)',
          'ig-secondary': 'var(--ig-secondary)',
          'ig-background': 'var(--ig-background)',
          'ig-border': 'var(--ig-border)',
          'ig-text': 'var(--ig-text)',
          'ig-link': 'var(--ig-link)',
          'ig-error': 'var(--ig-error)',
          'wearvana': {
            primary: '#1A1A1A',
            accent: '#000000',
            light: '#F5F5F5',
            dark: '#0A0A0A',
            muted: '#666666'
          }
        },
      },
    },
    plugins: [],
  }
  
  