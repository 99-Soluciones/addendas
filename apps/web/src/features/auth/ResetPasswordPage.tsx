import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Card } from "../../shared/components/ui/Card";
import { Input } from "../../shared/components/ui/Input";
import { Button } from "../../shared/components/ui/Button";
import { ApiError } from "../../shared/api/client";
import { useResetPassword } from "./auth.hooks";

const schema = z
  .object({
    newPassword: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
type FormValues = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const reset = useResetPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (!token) {
    return (
      <Card>
        <h2 className="mb-2 text-lg font-semibold">Enlace inválido</h2>
        <p className="text-sm text-muted">
          El enlace de recuperación no es válido o está incompleto. Solicita uno nuevo.
        </p>
        <p className="mt-4 text-center text-sm">
          <Link to="/recuperar-password" className="text-accent hover:underline">
            Solicitar otro enlace
          </Link>
        </p>
      </Card>
    );
  }

  const onSubmit = handleSubmit((values) =>
    reset.mutate({ token, newPassword: values.newPassword }),
  );

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Nueva contraseña</h2>
      {reset.isSuccess ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-success">
            Tu contraseña fue actualizada. Ya puedes iniciar sesión.
          </p>
          <Button type="button" onClick={() => navigate("/login")}>
            Iniciar sesión
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input
            label="Nueva contraseña"
            type="password"
            autoComplete="new-password"
            {...register("newPassword")}
            error={errors.newPassword?.message}
          />
          <Input
            label="Confirmar contraseña"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />
          {reset.isError && (
            <p className="text-sm text-danger">
              {reset.error instanceof ApiError
                ? reset.error.message
                : "No se pudo restablecer la contraseña"}
            </p>
          )}
          <Button type="submit" loading={reset.isPending}>
            Restablecer contraseña
          </Button>
        </form>
      )}
    </Card>
  );
}
