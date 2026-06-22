"use client";
import { localeLabels } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { useLocale } from "./locale-provider";

const allLocales = Object.keys(localeLabels) as Locale[];

export default function LangSwitcher() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="flex items-center bg-[#f0e9e0] rounded-md p-0.5 gap-0.5">
      {allLocales.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            locale === l
              ? "bg-white text-[#1a1208] shadow-sm"
              : "text-[#9c8c7c] hover:text-[#4a3728]"
          }`}
        >
          {localeLabels[l]}
        </button>
      ))}
    </div>
  );
}
