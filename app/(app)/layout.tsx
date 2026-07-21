import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AppNav, BottomNav } from "@/components/habitos/app-nav";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-20 flex items-center border-b bg-background p-4">
        <AppNav user={session.user} />
      </header>
      <main className="flex flex-1 flex-col pb-16 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
