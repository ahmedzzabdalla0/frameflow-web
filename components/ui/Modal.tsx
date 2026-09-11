"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  className?: string;
  maxWidth?: string;
}

const Modal = ({ onClose, children, className, maxWidth = "min(520px,94vw)" }: ModalProps) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-500 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{ width: maxWidth }}
        className={cn(
          "max-h-[92vh] overflow-y-auto rounded-xl border border-border bg-surface-raised p-6 shadow-2xl",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
};

interface ModalHeaderProps {
  children: ReactNode;
  className?: string;
}

const ModalHeader = ({ children, className }: ModalHeaderProps) => (
  <h3 className={cn("mb-5 text-lg font-bold text-foreground", className)}>{children}</h3>
);

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

const ModalFooter = ({ children, className }: ModalFooterProps) => (
  <div className={cn("mt-5 flex items-center justify-end gap-2", className)}>{children}</div>
);

export { Modal, ModalHeader, ModalFooter };
export type { ModalProps };
