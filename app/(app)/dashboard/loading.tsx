import {
  Page,
  PageContent,
  PageHeader,
  PageHeading,
} from "@/components/ui/page";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Page>
      <PageHeader>
        <PageHeading>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-80" />
        </PageHeading>
      </PageHeader>
      <PageContent>
        <Skeleton className="h-64 w-full" />
      </PageContent>
    </Page>
  );
}
