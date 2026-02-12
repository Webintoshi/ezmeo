import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "new" | "discount" | "sugarfree" | "outofstock" | "success" | "warning" | "error";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    new: "bg-gradient-to-r from-pink-500 to-rose-500 text-white",
    discount: "bg-gradient-to-r from-red-500 to-orange-500 text-white",
    sugarfree: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
    outofstock: "bg-gray-800 text-white",
    success: "bg-apple-green text-white",
    warning: "bg-apple-orange text-white",
    error: "bg-apple-red text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full shadow-md",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
