import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router";
import { Card } from "../../shared/components/ui/Card";
import { Input } from "../../shared/components/ui/Input";
import { Button } from "../../shared/components/ui/Button";
import { ApiError } from "../../shared/api/client";
import { useLogin } from "./auth.hooks";

const schema = z.object({
  correo: z.email("Correo inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, { onSuccess: () => navigate("/") });
  });

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Iniciar sesión</h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="Correo"
          type="email"
          autoComplete="email"
          {...register("correo")}
          error={errors.correo?.message}
        />
        <Input
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          error={errors.password?.message}
        />
        <div className="-mt-2 text-right">
          <Link to="/recuperar-password" className="text-sm text-accent hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        {login.isError && (
          <p className="text-sm text-danger">
            {login.error instanceof ApiError ? login.error.message : "Error al iniciar sesión"}
          </p>
        )}
        <Button type="submit" loading={login.isPending}>
          Entrar
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        ¿No tienes cuenta?{" "}
        <Link to="/register" className="text-accent hover:underline">
          Regístrate
        </Link>
      </p>
    </Card>
  );
}
