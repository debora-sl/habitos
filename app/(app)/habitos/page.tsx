import { requireUser } from "@/lib/session";
import { getHabitsByUser } from "@/data/habits";
import {
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeading,
  PageTitle,
} from "@/components/ui/page";
import { HabitList } from "@/components/habitos/habit-list";

export default async function HabitosPage() {
  const user = await requireUser();
  const habits = await getHabitsByUser(user.id);

  return (
    <Page>
      <PageHeader>
        <PageHeading>
          <PageTitle>Hábitos</PageTitle>
          <PageDescription>
            Crie e gerencie os hábitos que você quer acompanhar.
          </PageDescription>
        </PageHeading>
      </PageHeader>
      <PageContent>
        <HabitList habits={habits} />
      </PageContent>
    </Page>
  );
}
