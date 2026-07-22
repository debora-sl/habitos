import { CheckCheckIcon, FlameIcon, ListChecksIcon, TargetIcon } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getCompletionsPerDay, getDashboardMetrics } from "@/data/dashboard";
import {
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeading,
  PageTitle,
} from "@/components/ui/page";
import { CompletionsChart } from "@/components/habitos/completions-chart";
import { MetricCard } from "@/components/habitos/metric-card";

export default async function DashboardPage() {
  const user = await requireUser();
  const [completionsPerDay, metrics] = await Promise.all([
    getCompletionsPerDay(user.id),
    getDashboardMetrics(user.id),
  ]);

  const completionRateDelta = metrics.completionRate - metrics.previousCompletionRate;

  return (
    <Page>
      <PageHeader>
        <PageHeading>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>
            Acompanhe suas conclusões de hábitos nos últimos 30 dias.
          </PageDescription>
        </PageHeading>
      </PageHeader>
      <PageContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={FlameIcon}
            label="Sequência atual"
            value={`${metrics.streak} ${metrics.streak === 1 ? "dia" : "dias"}`}
          />
          <MetricCard
            icon={TargetIcon}
            label="Taxa de conclusão (30 dias)"
            value={`${metrics.completionRate}%`}
            trend={{
              delta: completionRateDelta,
              label: `${completionRateDelta >= 0 ? "+" : ""}${completionRateDelta}% vs. período anterior`,
            }}
          />
          <MetricCard
            icon={CheckCheckIcon}
            label="Total de conclusões"
            value={metrics.totalCompletions.toString()}
          />
          <MetricCard
            icon={ListChecksIcon}
            label="Hábitos ativos"
            value={metrics.activeHabitsCount.toString()}
          />
        </div>
        <CompletionsChart data={completionsPerDay} />
      </PageContent>
    </Page>
  );
}
