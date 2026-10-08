import localFont from "next/font/local";

/**
 * Estedad — Arabic/Persian + Latin variable font (Google Fonts / OFL).
 * @see https://fonts.google.com/specimen/Estedad
 */
export const estedad = localFont({
  src: "./Estedad-Variable.ttf",
  variable: "--font-estedad",
  display: "swap",
  weight: "100 900",
  fallback: ["Tahoma", "Arial", "sans-serif"],
});
