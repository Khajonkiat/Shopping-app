"use client";
import { btnPrimary, btnSecondary } from "@/lib/styles";

interface ConfirmDialogProps {
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ message, confirmLabel, cancelLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl border border-[#d9cfc3] shadow-lg max-w-sm w-full p-6">
        <p className="text-sm text-[#4a3728] mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className={btnSecondary}>
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 bg-rose-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
