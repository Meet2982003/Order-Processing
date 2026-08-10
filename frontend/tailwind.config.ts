import type { Config } from "tailwindcss"

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                int: "#101828",
                paper: "#FAFAF8",
                cobalt:{
                    DEFAULT: "#3654E0",
                    light: "#5A73E8",
                    dark: "#2740B8"
                },
                amber: {
                    DEFAULT: "#C88719",
                },
                shipped: {
                    DEFAULT: "#1F9D6C",
                },
                alert: {
                    DEFAULT : "#D64545",
                },
            },
            fontFamily: {
                display: ["var(--font-space-grotesk)","sans-serif"],
                body: ["var(--font-inter)","sans-serif"],
                mono: ["var(--font-plex-mono)","monospace"],
            },
        },
    },
};

export default config;