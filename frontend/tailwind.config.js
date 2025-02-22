/** @type {import('tailwindcss').Config} */
module.exports = {
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
        },
      },
    },
    plugins: [],
  }
  
  