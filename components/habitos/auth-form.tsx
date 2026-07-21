"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { signIn, signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

type AuthFormMode = "login" | "sign-up";

interface AuthFormProps {
  mode: AuthFormMode;
}

const SUBMIT_LABEL: Record<AuthFormMode, string> = {
  login: "Entrar",
  "sign-up": "Criar conta",
};

const GENERIC_LOGIN_ERROR = "E-mail ou senha inválidos.";
const EMAIL_IN_USE_ERROR = "Este e-mail já está em uso.";
const GENERIC_SIGN_UP_ERROR = "Não foi possível criar sua conta. Verifique os dados informados.";

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(undefined);
    setIsSubmitting(true);

    const { error } =
      mode === "sign-up"
        ? await signUp.email({ name: email.split("@")[0], email, password })
        : await signIn.email({ email, password });

    setIsSubmitting(false);

    if (error) {
      if (mode === "sign-up") {
        setErrorMessage(
          error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
            ? EMAIL_IN_USE_ERROR
            : GENERIC_SIGN_UP_ERROR
        );
      } else {
        setErrorMessage(GENERIC_LOGIN_ERROR);
      }
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={!!errorMessage}>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <FieldContent>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </FieldContent>
        </Field>
        <Field data-invalid={!!errorMessage}>
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <FieldContent>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              minLength={mode === "sign-up" ? 8 : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <FieldError>{errorMessage}</FieldError>
          </FieldContent>
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2Icon className="animate-spin" />}
        {SUBMIT_LABEL[mode]}
      </Button>
    </form>
  );
}
