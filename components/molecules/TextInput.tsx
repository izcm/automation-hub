import React, { useState } from "react";

import { cn } from "@/lib/cn";
import { SquareArrowRightEnterIcon as EnterIcon } from "lucide-react";

type Props = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  ref?: React.Ref<HTMLInputElement>;
  numeric?: boolean;
  className?: string;
  submitLabel?: string;
  startIcon?: React.ReactNode;
};

// internal state is added. then render only happens on submit

export function TextInput({
  placeholder,
  value,
  onChange,
  onSubmit,
  ref,
  numeric,
  className,
  submitLabel,
  startIcon,
}: Props) {
  const [internal, setInternal] = useState(value ?? "");
  const [prevValue, setPrevValue] = useState(value);

  // if parent changed value prop - sync internal to match
  if (prevValue !== value) {
    setPrevValue(value);
    setInternal(value ?? "");
  }

  return (
    <div
      className={cn(
        "text-input flex items-center w-full rounded-lg border border-line",
        className,
      )}
    >
      {startIcon && (
        <span className="ml-3 shrink-0 text-muted">{startIcon}</span>
      )}

      <input
        ref={ref}
        className="min-w-0 flex-1 px-4 py-2 outline-none"
        placeholder={placeholder}
        value={internal}
        onChange={(e) => {
          const value = numeric
            ? e.currentTarget.value.replace(/[^0-9.]/g, "")
            : e.currentTarget.value;

          setInternal(value);
          onChange?.(value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit?.(internal);
          } else if (e.key === "Escape") {
            setInternal("");
          }
        }}
      />

      {internal !== (value ?? "") && submitLabel && (
        <span className="mr-3 inline-flex shrink-0 items-center gap-1 text-xs text-muted">
          <EnterIcon size={14} />
          {submitLabel}
        </span>
      )}
    </div>
  );
}
