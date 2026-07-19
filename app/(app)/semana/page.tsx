import { requireUser } from "@/lib/session";
import { getHabitsByUser } from "@/data/habits";
import { getWeekCompletions } from "@/data/completions";
import { addDays, getWeekStart } from "@/lib/date";
import {
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeading,
  PageTitle,
} from "@/components/ui/page";
import { WeekGrid } from "@/components/habitos/week-grid";

interface SemanaPageProps {
  searchParams: Promise<{ week?: string }>;
}

export default async function SemanaPage({ searchParams }: SemanaPageProps) {
  const user = await requireUser();
  const { week } = await searchParams;
  const referenceDate = week ? new Date(`${week}T00:00:00.000Z`) : new Date();
  const weekStart = getWeekStart(referenceDate);

  const [habits, completions] = await Promise.all([
    getHabitsByUser(user.id),
    getWeekCompletions(user.id, weekStart),
  ]);

  return (
    <Page>
      <PageHeader>
        <PageHeading>
          <PageTitle>Semana</PageTitle>
          <PageDescription>
            Marque a conclusão dos seus hábitos em cada dia da semana.
          </PageDescription>
        </PageHeading>
      </PageHeader>
      <PageContent>
        <WeekGrid
          habits={habits}
          completions={completions}
          weekStart={weekStart}
          previousWeekStart={addDays(weekStart, -7)}
          nextWeekStart={addDays(weekStart, 7)}
        />
      </PageContent>
    </Page>
  );
}
