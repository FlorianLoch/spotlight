import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  { files: ["dist/**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { files: ["src/**/*.js"], languageOptions: { sourceType: "module" } },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
];