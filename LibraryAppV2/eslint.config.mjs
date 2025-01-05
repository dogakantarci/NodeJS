import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node,
    },
  },
  { languageOptions: { globals: globals.browser } },
  {
    files: ["test/**/*.js"], // Sadece test dosyaları için
    languageOptions: {
      globals: globals.jest, // Jest global değişkenlerini tanımlar
    },
  },
  pluginJs.configs.recommended,
];
