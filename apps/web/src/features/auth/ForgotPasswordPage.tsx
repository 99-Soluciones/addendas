import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router";
import { Card } from "../../shared/components/ui/Card";
import { Input } from "../../shared/components/ui/Input";
import { Button } from "../../shared/components/ui/Button";
import { ApiError } from "../../shared/api/client";
import { useForgotPassword } from "./auth.hooks";

const schema = z.object({
  correo: z.string().email("Correo inválido"),
});
type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const forgot = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit((values) => forgot.mutate(values.correo));

  return (
    <Card>
      <h2 className="mb-2 text-lg font-semibold">Recuperar contraseña</h2>
      {forgot.isSuccess ? (
        <p className="text-sm text-muted">
          Si existe una cuenta con ese correo, te enviamos un enlace para restablecer tu contraseña.
          Revisa tu bandeja de entrada y la carpeta de spam.
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted">
            Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
          </p>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Input
              label="Correo"
              type="email"
              autoComplete="email"
              {...register("correo")}
              error={errors.correo?.message}
            />
            {forgot.isError && (
              <p className="text-sm text-danger">
                {forgot.error instanceof ApiError
                  ? forgot.error.message
                  : "No se pudo procesar la solicitud"}
              </p>
            )}
            <Button type="submit" loading={forgot.isPending}>
              Enviar enlace
            </Button>
          </form>
        </>
      )}
      <p className="mt-4 text-center text-sm text-muted">
        <Link to="/login" className="text-accent hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </Card>
  );
}
