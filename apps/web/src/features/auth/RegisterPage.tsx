import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router";
import { LEGAL_DOCS } from "@addendex/shared";
import { Card } from "../../shared/components/ui/Card";
import { Input } from "../../shared/components/ui/Input";
import { Button } from "../../shared/components/ui/Button";
import { Checkbox } from "../../shared/components/ui/Checkbox";
import { ApiError } from "../../shared/api/client";
import { useRegister } from "./auth.hooks";

const schema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  correo: z.string().email("Correo inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  aceptaTerminos: z.boolean().refine((v) => v === true, "Debes aceptar para crear una cuenta"),
});
type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { aceptaTerminos: false },
  });

  const onSubmit = handleSubmit((values) => {
    registerMutation.mutate(values, { onSuccess: () => navigate("/") });
  });

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Crear cuenta</h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input label="Nombre" {...register("nombre")} error={errors.nombre?.message} />
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
          autoComplete="new-password"
          {...register("password")}
          error={errors.password?.message}
        />
        <Checkbox
          id="aceptaTerminos"
          label={
            <>
              Acepto los{" "}
              <Link
                to={LEGAL_DOCS.terminos.ruta}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                Términos y Condiciones
              </Link>
              , el{" "}
              <Link
                to={LEGAL_DOCS.privacidad.ruta}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                Aviso de Privacidad
              </Link>{" "}
              y la{" "}
              <Link
                to={LEGAL_DOCS.cookies.ruta}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                Política de Cookies
              </Link>
              .
            </>
          }
          {...register("aceptaTerminos")}
          error={errors.aceptaTerminos?.message}
        />
        {registerMutation.isError && (
          <p className="text-sm text-danger">
            {registerMutation.error instanceof ApiError
              ? registerMutation.error.message
              : "Error al crear la cuenta"}
          </p>
        )}
        <Button type="submit" loading={registerMutation.isPending}>
          Registrarme
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="text-accent hover:underline">
          Inicia sesión
        </Link>
      </p>
    </Card>
  );
}
