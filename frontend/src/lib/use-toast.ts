import { useState, useCallback } from "react";
import type { ToastType } from "@/components/toast";

interface ToastState {
  message: string;
  type: ToastType;
}

export function useToast() {
  const [state, setState] = useState<ToastState | null>(null);
  const toast = useCallback((msg: string) => setState({ message: msg, type: "success" }), []);
  const toastError = useCallback((msg: string) => setState({ message: msg, type: "error" }), []);
  const dismiss = useCallback(() => setState(null), []);
  return {
    message: state?.message ?? null,
    toastType: state?.type ?? "success",
    toast,
    toastError,
    dismiss,
  };
}
