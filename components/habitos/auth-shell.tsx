import type { ReactNode } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/habitos/logo";

interface AuthShellProps {
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
}

export function AuthShell({
  title,
  description,
  footer,
  children,
}: AuthShellProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center gap-8 p-6">
        <Logo />
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
          <CardFooter className="justify-center">{footer}</CardFooter>
        </Card>
      </div>
      <div className="relative hidden lg:block">
        <Image
          src="/auth-illustration.svg"
          alt=""
          fill
          priority
          className="object-cover"
        />
      </div>
    </div>
  );
}
