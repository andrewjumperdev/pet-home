module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 1s ease-out forwards',
        'float-slow': 'float 4s ease-in-out infinite',
      },
      fontFamily: {
        oregano: ['Oregano', 'cursive'],
        sans: ['Roboto', 'sans-serif'],
      },
    },
  },
  corePlugins: {
    scrollBehavior: true,
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
