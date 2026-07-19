"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} disabled={isLoading}>
      <LogOutIcon />
      Sair
    </Button>
  );
}
