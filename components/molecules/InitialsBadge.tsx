import { cn } from "@/lib/cn";

type Size = "sm" | "md" | "lg";

const SIZE_CLASSNAMES: Record<Size, { circle: string; text: string }> = {
  sm: { circle: "size-8", text: "text-sm" },
  md: { circle: "size-10", text: "text-base" },
  lg: { circle: "size-14", text: "text-lg" },
};

type Props = {
  label: string;
  size?: Size;
  className?: string;
};

export function InitialsBadge({ label, size = "md", className }: Props) {
  const words = label.trim().split(/\s+/);

  const initials = [words[0]?.[0], words.at(-1)?.[0]]
    .filter((letter): letter is string => letter !== undefined)
    .slice(0, 2)
    .join("");

  const { circle, text } = SIZE_CLASSNAMES[size];

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-ground/25 border border-accent/25",
        circle,
        className,
      )}
    >
      <span className={cn("font-medium tracking-wide text-accent-strong", text)}>
        {initials.toUpperCase()}
      </span>
    </div>
  );
}
