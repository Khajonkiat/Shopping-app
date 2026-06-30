"use client";
import { useEffect } from "react";

export type ToastType = "success" | "error";

export function Toast({
  message,
  type = "success",
  onDismiss,
}: {
  message: string;
  type?: ToastType;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 2500);
    return () => clearTimeout(id);
  }, [message, onDismiss]);

  const isError = type === "error";
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg border ${
        isError ? "bg-[#5a1e1e] border-[#7a2e2e]" : "bg-[#2a1c10] border-[#3d2a1a]"
      }`}
    >
      {isError ? (
        <svg className="w-4 h-4 text-[#f08080] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-[#8dbd7a] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {message}
    </div>
  );
}
