import Link from "next/link";
import { AuthForm } from "@/components/habitos/auth-form";
import { AuthShell } from "@/components/habitos/auth-shell";

export default function SignUpPage() {
  return (
    <AuthShell
      title="Criar conta"
      description="Cadastre-se com seu e-mail e senha para começar a acompanhar seus hábitos."
      footer={
        <p className="text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Entrar
          </Link>
        </p>
      }
    >
      <AuthForm mode="sign-up" />
    </AuthShell>
  );
}
