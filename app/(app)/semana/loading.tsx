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
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-80" />
        </PageHeading>
      </PageHeader>
      <PageContent>
        <Skeleton className="h-96 w-full" />
      </PageContent>
    </Page>
  );
}
