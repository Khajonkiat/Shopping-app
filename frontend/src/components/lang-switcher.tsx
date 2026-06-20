"use client";
import { localeLabels } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { useLocale } from "./locale-provider";

const allLocales = Object.keys(localeLabels) as Locale[];

export default function LangSwitcher() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="flex items-center bg-white/5 rounded-md p-0.5 gap-0.5">
      {allLocales.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
            locale === l
              ? "bg-white/15 text-white"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {localeLabels[l]}
        </button>
      ))}
    </div>
  );
}
