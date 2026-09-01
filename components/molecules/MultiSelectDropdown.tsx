import { ReactNode, useEffect, useRef, useState } from "react";
import { Checkbox, TextInput } from "@a2zb/react";
import { cn } from "@/lib/cn";

type Props = {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  placeholder?: string;
};

// Searchable multiselect: the search input doubles as the dropdown's
// trigger, filtering `options` as you type.
export function MultiSelectDropdown({
  options,
  selected,
  onToggle,
  placeholder,
}: Props) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Popover
        open={open}
        onOpenChange={setOpen}
        contentClassName="w-full rounded shadow-lg"
        trigger={
          <div
            className="w-full"
            onClick={(e) => e.stopPropagation()}
            onFocus={() => setOpen(true)}
          >
            <TextInput
              value={search}
              input={{
                placeholder,
                onChange: (e) => setSearch(e.currentTarget.value),
                className: "text-subtle text-sm",
              }}
              className="h-8 w-full"
            />
          </div>
        }
      >
        <div className="flex flex-col gap-0.5">
          {options
            .filter((option) =>
              option.toLowerCase().includes(search.toLowerCase()),
            )
            .map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-fg cursor-pointer hover:bg-lowered"
              >
                <Checkbox
                  checked={selected.includes(option)}
                  onChange={() => onToggle(option)}
                />
                {option}
              </label>
            ))}
        </div>
      </Popover>
    </div>
  );
}

type PopoverProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  contentClassName?: string;
};

export function Popover({
  open,
  onOpenChange,
  trigger,
  children,
  align = "right",
  contentClassName,
}: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleMouseDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        onOpenChange(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={ref} className="relative">
      {trigger}

      {open && (
        <div
          className={cn(
            "absolute top-full z-50 mt-1 whitespace-nowrap border border-line bg-raised p-2",
            align === "right" ? "right-0" : "left-0",
            contentClassName,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
