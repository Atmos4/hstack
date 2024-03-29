import {
  defineConfig,
  presetIcons,
  presetTypography,
  presetUno,
  transformerVariantGroup,
} from "unocss";
import { presetDaisy } from "unocss-preset-daisy";
import { themes } from "./src/themes";

export default defineConfig({
  cli: {
    entry: {
      patterns: ["src/**/*.{ts,tsx}"],
      outFile: "assets/style.css",
    },
  },
  presets: [
    presetUno(),
    presetTypography(),
    presetIcons(),
    presetDaisy({ themes, darkTheme: "black" }),
  ],
  transformers: [transformerVariantGroup()],
});
