import { requireUser } from "@/lib/session";
import { getCompletionsPerDay } from "@/data/dashboard";
import {
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeading,
  PageTitle,
} from "@/components/ui/page";
import { CompletionsChart } from "@/components/habitos/completions-chart";

export default async function DashboardPage() {
  const user = await requireUser();
  const completionsPerDay = await getCompletionsPerDay(user.id);

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
        <CompletionsChart data={completionsPerDay} />
      </PageContent>
    </Page>
  );
}
