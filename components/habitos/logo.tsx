import { SproutIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showName?: boolean;
}

export function Logo({ className, showName = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <SproutIcon className="size-4.5" />
      </span>
      {showName && (
        <span className="font-heading text-lg font-semibold tracking-tight">
          Hábitos
        </span>
      )}
    </div>
  );
}
