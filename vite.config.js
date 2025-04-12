import { defineConfig } from "vite";

/** @type {import('vite').UserConfig} */

export default defineConfig({
    base: "/PRG08-game/",

    build: {
        outDir: 'docs',
        emptyOutDir: true, // empty the build dir before new build
    }
});