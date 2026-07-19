import { cn } from "@/lib/utils";

function Page({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page"
      className={cn(
        "mx-auto flex w-full max-w-[64rem] flex-1 flex-col gap-6 p-6",
        className
      )}
      {...props}
    />
  );
}

function PageHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header"
      className={cn(
        "flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      {...props}
    />
  );
}

function PageHeading({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-heading"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  );
}

function PageTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      data-slot="page-title"
      className={cn("text-2xl font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

function PageDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="page-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function PageActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-actions"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

function PageContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-content"
      className={cn("flex flex-1 flex-col gap-4", className)}
      {...props}
    />
  );
}

export {
  Page,
  PageHeader,
  PageHeading,
  PageTitle,
  PageDescription,
  PageActions,
  PageContent,
};
