import { createSafeActionClient } from "next-safe-action";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const actionClient = createSafeActionClient();

export const protectedActionClient = actionClient.use(async ({ next }) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Não autenticado.");
  }

  return next({ ctx: { user: session.user } });
});
