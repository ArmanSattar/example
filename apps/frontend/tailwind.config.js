const { createGlobPatternsForDependencies } = require("@nx/react/tailwind");
const { join } = require("path");
const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, "{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}"),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-bg)",
        main_background: "#252833",
        custom_gray: "#23303A",
        search_bar_gray: "#0e151a",
        blue_one: "#0A182D",
        gray_action_btn: "var(--gray-action-btn)",
        chatbar_bg: "var(--color-chatbar-bg)",
        navbar_bg: "var(--color-navbar-bg)",
        gray_1: "var(--gray-1)",
        color_primary: "var(--color-primary)",
        color_secondary: "var(--color-secondary)",
        color_chat_text: "var(--color-chat-text)",
        color_gray_2: "var(--color-gray-2)",
        color_gray_3: "var(--color-gray-3)",
        color_light_gray_1: "var(--color-light-gray-1)",
        color_tertiary: "var(--color-tertiary)",
        color_tertiary_2: "var(--color-tertiary-2)",
      },
      fontSize: {
        "md-1": "1.0625rem",
        "2xs": ".75rem",
        "3xs": ".5rem",
        "4xs": ".4rem",
      },
      boxShadow: {
        circle: "0 3px 5px -1px #0003, 0 6px 10px #00000024, 0 1px 18px #0000001f",
      },
      screens: {
        "lg-1": "985px",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".grid-cols-dynamic": {
          "grid-template-columns": "repeat(auto-fit, minmax(272px, 272px))",
        },
        ".grid-cols-dynamic-2": {
          "grid-template-columns": "repeat(auto-fit, minmax(200px, 220px))",
        },
      });
    }),
  ],
};
