// tailwind.config.js
export default {
    content: [
      "./index.html",
      "./src/**/*.{vue,js,ts,jsx,tsx}", // asegúrate que cubra tus archivos
    ],
    theme: {
      extend: {
        fontFamily: {
          nunito: ['Nunito', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }
  