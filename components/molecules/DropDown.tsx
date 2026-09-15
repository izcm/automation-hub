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
  galleryItem: (option: T, handleCommit: (option: T) => void) => ReactNode;
  onCommit: (option: T) => void;

  dropdownProps: Partial<Omit<PopoverProps, "trigger" | "children">>;
};

// Shared shell: search input doubles as the dropdown's trigger, filtering
// `options` as you type. Selection UI/behavior is left to `renderLabel`/`onCommit`.
export function SelectDropdown<T = string>({
  options,
  getLabel = (option) => String(option),
  getKey = getLabel,
  galleryItem,
  onCommit,
  textInputProps,
  dropdownProps: popoverProps,
}: BaseProps<T>) {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = popoverProps.open ?? internalOpen;
  const onOpenChange = popoverProps.onOpenChange ?? setInternalOpen;

  const [search, setSearch] = useState("");

  // track which item is selected in dropdown
  const [highlighted, setHighlighted] = useState<T | undefined>(undefined);

  const { htmlInputProps, ...restTextInputProps } = textInputProps;

  const applicable = () =>
    options.filter((option) =>
      getLabel(option).toLowerCase().includes(search.toLowerCase()),
    );

  const handleCommit = (option: T) => {
    onCommit(option);
    setSearch(getLabel(option));
  };

  return (
    <>
      <Popover
        open={open}
        onOpenChange={onOpenChange}
        align={popoverProps.align}
        contentClassName={cn(
          "w-full rounded shadow-lg",
          popoverProps.contentClassName,
        )}
        trigger={
          <TextInput
            {...restTextInputProps}
            value={search}
            htmlInputProps={{
              onChange: (e) => setSearch(e.currentTarget.value),
              className: "text-fg",
              ...htmlInputProps,
            }}
            className={cn("h-10 w-full", restTextInputProps.className)}
          />
        }
      >
        <Gallery
          items={applicable()}
          getId={getKey}
          selected={highlighted}
          onSelect={setHighlighted}
          onEnter={handleCommit}
          galleryItem={(option) => galleryItem(option, handleCommit)}
          className={{
            arrowList: "flex flex-col gap-0.5 max-h-[240px]",
            arrowRow: "inset-focus",
          }}
        />
      </Popover>
    </>
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
