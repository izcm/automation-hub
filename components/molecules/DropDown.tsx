import { ComponentProps, ReactNode, useEffect, useRef, useState } from "react";
import { Checkbox, Gallery, TextInput } from "@a2zb/react";
import { cn } from "@/lib/cn";

type BaseProps<T> = {
  options: T[];
  // Defaults to String(option), which is exactly identity for T = string.
  getLabel?: (option: T) => string;
  getKey?: (option: T) => string;
  textInputProps: ComponentProps<typeof TextInput>;
  // Display only — no handlers. Click and Enter both commit via `onCommit`.
  renderLabel: (option: T) => ReactNode;
  onCommit: (option: T) => void;
  // Single-select closes the popover on commit; multi-select keeps it open.
  closeOnCommit?: boolean;
};

// Shared shell: search input doubles as the dropdown's trigger, filtering
// `options` as you type. Selection UI/behavior is left to `renderLabel`/`onCommit`.
function SelectDropdownBase<T = string>({
  options,
  getLabel = (option) => String(option),
  getKey = getLabel,
  textInputProps,
  renderLabel,
  onCommit,
  closeOnCommit = true,
}: BaseProps<T>) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  // track which item is selected in dropdown
  const [highlighted, setHighlighted] = useState<T | undefined>(undefined);

  const { htmlInputProps, ...restTextInputProps } = textInputProps;

  const applicable = () =>
    options.filter((option) =>
      getLabel(option).toLowerCase().includes(search.toLowerCase()),
    );

  const handleCommit = (option: T) => {
    onCommit(option);
    if (closeOnCommit) setOpen(false);
  };

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
              {...restTextInputProps}
              value={search}
              htmlInputProps={{
                onChange: (e) => setSearch(e.currentTarget.value),
                className: "text-subtle text-sm",
                ...htmlInputProps,
              }}
              className="h-8 w-full"
            />
          </div>
        }
      >
        <Gallery
          items={applicable()}
          getId={getKey}
          selected={highlighted}
          onSelect={setHighlighted}
          onEnter={handleCommit}
          galleryItem={(option) => (
            <div
              onClick={() => handleCommit(option)}
              className="px-2 py-1.5 text-start text-sm text-fg hover:text-accent cursor-pointer"
            >
              {renderLabel(option)}
            </div>
          )}
          bareRows
          className={{ arrowList: "flex flex-col gap-0.5 max-h-[150px]" }}
        />
      </Popover>
    </div>
  );
}

type MultiProps = {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  textInputProps: ComponentProps<typeof TextInput>;
};

export function MultiSelectDropdown({
  options,
  selected,
  onToggle,
  textInputProps,
}: MultiProps) {
  return (
    <SelectDropdownBase
      options={options}
      textInputProps={textInputProps}
      renderLabel={(option) => (
        <span className="flex items-center gap-2">
          <Checkbox checked={selected.includes(option)} readOnly />
          {option}
        </span>
      )}
      onCommit={onToggle}
      closeOnCommit={false}
    />
  );
}

export type SingleProps<T> = {
  options: T[];
  selected: T | undefined;
  onSelect: (value: T) => void;
  // Defaults to String(option) — pass both when T isn't a plain string
  // (e.g. { id, name } objects), so selection is compared by id, not label.
  getLabel?: (option: T) => string;
  getKey?: (option: T) => string;
  textInputProps?: ComponentProps<typeof TextInput>;
};

export function SelectDropdown<T = string>({
  options,
  selected,
  onSelect,
  getLabel = (option) => String(option),
  getKey = getLabel,
  textInputProps = {},
}: SingleProps<T>) {
  return (
    <SelectDropdownBase
      options={options}
      getLabel={getLabel}
      getKey={getKey}
      textInputProps={textInputProps}
      renderLabel={getLabel}
      onCommit={onSelect}
    />
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
            "absolute top-full z-50 mt-1 whitespace-nowrap border border-line bg-raised",
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
