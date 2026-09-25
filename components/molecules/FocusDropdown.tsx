import {
  ComponentProps,
  ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Gallery, TextInput } from "@a2zb/react";
import { cn } from "@/lib/cn";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import { useFitToViewport } from "@/lib/hooks/use-fit-to-viewport";

type BaseProps<T> = {
  options: T[];
  // Defaults to String(option), which is exactly identity for T = string.
  getLabel?: (option: T) => string;
  getKey?: (option: T) => string;
  textInputProps: ComponentProps<typeof TextInput>;
  // Display only — no handlers. Click and Enter both commit via `onCommit`.
  galleryItem: (option: T, handleCommit: (option: T) => void) => ReactNode;
  onCommit: (option: T) => void;

  popoverProps: Partial<Omit<PopoverProps, "trigger" | "children">>;
};

// Shared shell: search input doubles as the dropdown's trigger, filtering
// `options` as you type. Selection UI/behavior is left to `renderLabel`/`onCommit`.
export function FocusDropdown<T = string>({
  options,
  getLabel = (option) => String(option),
  getKey = getLabel,
  galleryItem,
  onCommit,
  textInputProps,
  popoverProps,
}: BaseProps<T>) {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = popoverProps.open ?? internalOpen;
  const onOpenChange = popoverProps.onOpenChange ?? setInternalOpen;

  const [search, setSearch] = useState("");

  // track which item is selected in dropdown
  const [highlighted, setHighlighted] = useState<T | undefined>(undefined);

  const { htmlInputProps, ...restTextInputProps } = textInputProps;

  const inputRef = useRef<HTMLInputElement>(null);

  // match if the query starts any word in the label — "e" matches "erik"
  // and "issi engel" (second word starts with e), but not "irek"
  const applicable = () => {
    const query = search.toLowerCase();
    if (!query) return options;

    return options.filter((option) =>
      getLabel(option)
        .toLowerCase()
        .split(/\s+/)
        .some((word) => word.startsWith(query)),
    );
  };

  const handleCommit = (option: T) => {
    // keep focus on the input across a commit — otherwise the item you just
    // picked (often the thing with focus, eg. via keyboard nav) disappears
    // when onCommit closes the list, and the browser is left to pick
    // wherever focus goes next.
    inputRef.current?.focus();
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
              ref: inputRef,
              onChange: (e) => setSearch(e.currentTarget.value),

              onFocus: () => onOpenChange(true),

              "aria-haspopup": "listbox",
              "aria-expanded": open,

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
          htmlUlElementProps={{
            role: "listbox",
            className: "flex flex-col gap-0.5 max-h-[240px]",
          }}
          htmlLiElementProps={({ isSelected }) => ({
            role: "option",
            "aria-selected": isSelected,
            className: "inset-focus",
          })}
        />
      </Popover>
    </>
  );
}

type PopoverProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  /** Overrides the dropdown's default anchored positioning (e.g. to center it as a wide sheet). */
  contentClassName?: string;
  /** Controlled open state — omit to let Popover manage it internally. */
};

export function Popover({
  trigger,
  children,
  align = "left",
  contentClassName,
  open,
  onOpenChange,
}: PopoverProps) {
  const { anchorRef, contentRef, placement, shiftX, fit } = useFitToViewport<
    HTMLDivElement,
    HTMLDivElement
  >(align);

  // before paint, so there's no visible flash of the wrong placement
  useLayoutEffect(() => {
    if (open) fit();
  }, [open, fit]);

  useClickOutside(anchorRef, () => onOpenChange(false), open);

  return (
    <div ref={anchorRef} className="relative">
      {trigger}

      {open && (
        <div
          ref={contentRef}
          className={cn(
            "absolute z-50 whitespace-nowrap bg-raised border border-line popover-in",
            placement === "top" ? "bottom-full mb-1" : "top-full mt-1",
            align === "right" ? "right-0" : "left-0",
            // align === "right" ? "-right-3" : "-left-3",
            contentClassName,
          )}
          // margin, not transform — popover-in animates transform
          style={{ marginLeft: shiftX }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
