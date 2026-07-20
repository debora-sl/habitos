"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { toDateKey } from "@/lib/date";

interface CompletionsChartProps {
  data: Array<{ date: Date; count: number }>;
}

const chartConfig = {
  count: {
    label: "Conclusões",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig;

const DAY_LABEL_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "UTC",
});

export function CompletionsChart({ data }: CompletionsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conclusões por dia</CardTitle>
        <CardDescription>Últimos 30 dias</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Ainda não há conclusões registradas.
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[16rem] w-full"
          >
            <BarChart data={data.map((entry) => ({ date: toDateKey(entry.date), count: entry.count }))}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value: string) =>
                  DAY_LABEL_FORMATTER.format(new Date(`${value}T00:00:00.000Z`))
                }
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
