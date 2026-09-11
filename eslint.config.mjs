import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintPluginTailwindcss from "eslint-plugin-tailwindcss";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintPluginTailwindcss.configs["flat/recommended"] ||
    eslintPluginTailwindcss.configs.recommended,

  {
    settings: {
      tailwindcss: {
        cssConfigPath: "./app/globals.css",
      },
    },
    rules: {
      "tailwindcss/classnames-order": "off",
    },
  },

  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
