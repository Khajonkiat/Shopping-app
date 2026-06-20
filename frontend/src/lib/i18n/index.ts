export type { Locale, Translations } from "./types";
export { en } from "./en";
export { th } from "./th";

import type { Locale, Translations } from "./types";
import { en } from "./en";
import { th } from "./th";

export const locales: Record<Locale, Translations> = { en, th };

export const localeLabels: Record<Locale, string> = {
  en: "EN",
  th: "TH",
};
