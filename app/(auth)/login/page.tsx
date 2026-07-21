import Link from "next/link";
import { AuthForm } from "@/components/habitos/auth-form";
import { AuthShell } from "@/components/habitos/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      title="Entrar"
      description="Acesse sua conta com e-mail e senha para gerenciar seus hábitos."
      footer={
        <p className="text-sm text-muted-foreground">
          Ainda não tem uma conta?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Criar conta
          </Link>
        </p>
      }
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}
