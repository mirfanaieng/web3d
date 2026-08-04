import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * Flat config — ESLint 9 no longer reads `.eslintrc.*`, so `eslint .` needs
 * this file to find the Next.js rules that were already installed.
 */
const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts", "models/**", "public/**"],
  },
];

export default config;
