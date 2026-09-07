/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1440px',
    },
    extend: {
      colors: {
        void: '#0A0A0A',
        surface: '#141414',
        paper: '#F4F3EF',
        ink: '#FFFFFF',
        'ink-inverse': '#0A0A0A',
        muted: '#9A9A94',
        signal: '#FF4713',
        'signal-ink': '#0A0A0A',
      },
      fontFamily: {
        display: ['"Hubot Sans"', 'system-ui', 'monospace'],
        body: ['"Hubot Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', '"SF Mono"', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
