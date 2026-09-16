import { cn } from "@/lib/cn";

type Props = {
  label: string;
  className?: string;
};

export function InitialsBadge({ label, className }: Props) {
  const words = label.split(" ");

  const initials = [words[0]?.[0], words[words.length - 1]?.[0]]
    .filter((letter): letter is string => letter !== undefined)
    .slice(0, 2)
    .join("");

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center justify-center w-10 h-10 text-sm rounded-full bg-ground/40 border border-line/16">
        <span className="text-base tracking-wide">
          {initials.toUpperCase()}
        </span>
      </div>

      <span className="text-fg">{label}</span>
    </div>
  );
}
