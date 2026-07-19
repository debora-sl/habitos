import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthForm } from "@/components/habitos/auth-form";

export default function SignUpPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>
            Cadastre-se com seu e-mail e senha para começar a acompanhar seus
            hábitos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="sign-up" />
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Entrar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
