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

export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>
            Acesse sua conta com e-mail e senha para gerenciar seus hábitos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="login" />
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Ainda não tem uma conta?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Criar conta
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
