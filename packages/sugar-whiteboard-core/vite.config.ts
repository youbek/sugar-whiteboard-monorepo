import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      name: "index",
      fileName: "index",
      entry: "./src/index.ts",
    },
  },
  /** @ts-ignore */
  plugins: [dts()],
});
