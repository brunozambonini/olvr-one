import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([
    ".next/**", "out/**", "next-env.d.ts", ".cache/**", ".wrangler/**",
    "docs/**", "work/**", "reports/**", "playwright-report/**", "test-results/**",
  ]),
]);
