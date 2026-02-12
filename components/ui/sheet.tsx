"use client";

import * as React from "react";
import { Dialog, DialogPanel, DialogBackdrop, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <Dialog open={open} onClose={onOpenChange} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      {children}
    </Dialog>
  );
}

interface SheetContentProps {
  side?: "left" | "right" | "top" | "bottom";
  className?: string;
  children: React.ReactNode;
}

export function SheetContent({ side = "right", className, children }: SheetContentProps) {
  const sideClasses = {
    left: "left-0 top-0 h-full border-r",
    right: "right-0 top-0 h-full border-l",
    top: "top-0 left-0 w-full border-b",
    bottom: "bottom-0 left-0 w-full border-t",
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            "fixed inset-y-0 bg-white p-6 shadow-xl transform transition-transform duration-300 ease-out",
            sideClasses[side],
            side === "left" && "-translate-x-full data-[open]:translate-x-0",
            side === "right" && "translate-x-full data-[open]:translate-x-0",
            className
          )}
          data-open={true}
        >
          <button
            onClick={() => {
              const dialog = document.querySelector('[data-headlessui-state]')?.closest('[role="dialog"]');
              if (dialog) {
                const closeButton = dialog.querySelector('[data-headlessui-state="closed"]') as HTMLButtonElement;
                closeButton?.click();
              }
            }}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}

export function SheetHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function SheetTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <DialogTitle className={cn("text-lg font-bold text-gray-900", className)}>
      {children}
    </DialogTitle>
  );
}

export function SheetTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  return <>{children}</>;
}
