/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: ['./src/**/*.{html,js,ts,jsx,tsx}','./src/**/**/*.{html,js,ts,jsx,tsx}'],
    theme: {
      fontFamily: {
        "title": ["Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif"],
      }
    },
    plugins: [
      require('daisyui'),
    ],
    daisyui: {
      themes: ["cupcake", "night", "dark"],
      darkTheme: "night",
      base: true,
      styled: true,
    },
  }
  
  