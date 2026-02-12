"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Select({ options, value, onChange, placeholder = "Seçin", className }: SelectProps) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <ListboxButton
          className={cn(
            "relative w-full h-11 pl-4 pr-10 text-left bg-white border border-gray-200 rounded-xl",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "transition-all duration-200 cursor-pointer",
            className
          )}
        >
          <span className={cn("block truncate", !selectedOption && "text-gray-400")}>
            {selectedOption?.label || placeholder}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </span>
        </ListboxButton>

        <ListboxOptions className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-auto focus:outline-none">
          {options.map((option) => (
            <ListboxOption
              key={option.value}
              value={option.value}
              className={({ active, selected }) =>
                cn(
                  "relative cursor-pointer select-none py-2.5 pl-10 pr-4",
                  active ? "bg-primary/5 text-primary" : "text-gray-900",
                  selected && "font-medium"
                )
              }
            >
              {({ selected }) => (
                <>
                  <span className={cn("block truncate", selected && "font-medium")}>
                    {option.label}
                  </span>
                  {selected && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
