import type { Config } from "tailwindcss";

export default {
    content: ["./index.html", "./client/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            colors: {
                primary: "#1a1a1a",
                accent: "#f59e0b",
                surface: "#ffffff",
                muted: "#f5f5f5",
            },
            boxShadow: {
                neo: "4px 4px 0px 0px #1a1a1a",
                "neo-sm": "2px 2px 0px 0px #1a1a1a",
                "neo-lg": "6px 6px 0px 0px #1a1a1a",
                "neo-hover": "6px 6px 0px 0px #1a1a1a",
            },
        },
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: false,
        base: false,
    },
} satisfies Config;
