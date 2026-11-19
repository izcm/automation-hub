import { cn } from "@/lib/cn";

type Props = {
  className?: string;
};

export function HubbenLogo({ className }: Props) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex gap-1.5" aria-hidden>
        <span className="h-6 w-2.5 -skew-x-[20deg] rounded-sm bg-(--accent-neutral)" />
        <span className="h-6 w-2.5 -skew-x-[20deg] rounded-sm bg-(--accent-neutral)" />
      </div>
      <span className="text-2xl font-semibold tracking-wide">HUBBEN</span>
    </div>
  );
}
