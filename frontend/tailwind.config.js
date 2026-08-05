/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          amber: '#ffb600',
          plum: '#2e0022',
          text: '#fbffe7',
        },
        accent: {
          50: '#fff4cc',
          100: '#ffe899',
          300: '#ffd34d',
          500: '#ffb600',
          600: '#d99b00',
          700: '#8f6600',
        },
      },
    },
  },
  plugins: [],
}
