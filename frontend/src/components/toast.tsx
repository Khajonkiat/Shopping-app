"use client";
import { useEffect } from "react";

export function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 2500);
    return () => clearTimeout(id);
  }, [message, onDismiss]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#2a1c10] text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg border border-[#3d2a1a]">
      <svg className="w-4 h-4 text-[#8dbd7a] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      {message}
    </div>
  );
}
