import { TrendingDownIcon, TrendingUpIcon, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: {
    delta: number;
    label: string;
  };
}

export function MetricCard({ icon: Icon, label, value, trend }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="font-heading text-2xl font-semibold tracking-tight">
            {value}
          </span>
          {trend && (
            <Badge
              variant="outline"
              className={cn(
                "mt-1",
                trend.delta > 0 && "border-primary/30 text-primary",
                trend.delta < 0 && "border-destructive/30 text-destructive"
              )}
            >
              {trend.delta >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              {trend.label}
            </Badge>
          )}
        </div>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4.5" />
        </span>
      </CardContent>
    </Card>
  );
}
