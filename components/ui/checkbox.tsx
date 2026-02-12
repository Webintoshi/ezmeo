"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  count?: number;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, count, checked, ...props }, ref) => {
    return (
      <label className={cn("flex items-center gap-3 cursor-pointer group", className)}>
        <div className="relative">
          <input
            type="checkbox"
            ref={ref}
            checked={checked}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              "w-5 h-5 border-2 rounded-md transition-all duration-200",
              "group-hover:border-primary/50",
              checked
                ? "bg-primary border-primary"
                : "bg-white border-gray-300 peer-focus:ring-2 peer-focus:ring-primary/20"
            )}
          >
            {checked && (
              <Check className="w-full h-full text-white p-0.5" strokeWidth={3} />
            )}
          </div>
        </div>
        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
          {label}
        </span>
        {count !== undefined && (
          <span className="ml-auto text-xs text-gray-400">({count})</span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
