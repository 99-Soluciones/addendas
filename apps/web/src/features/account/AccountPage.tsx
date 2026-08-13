import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, PageTitle } from "../../shared/components/ui/Card";
import { Input } from "../../shared/components/ui/Input";
import { Button } from "../../shared/components/ui/Button";
import { usersApi } from "../../shared/api/users.api";
import { useAuthStore } from "../../stores/auth.store";

const profileSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  correo: z.email("Correo inválido"),
});
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Requerida"),
  newPassword: z.string().min(8, "Mínimo 8 caracteres"),
});
type PasswordValues = z.infer<typeof passwordSchema>;

export function AccountPage() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setSession = useAuthStore((s) => s.setSession);
  const queryClient = useQueryClient();

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: { nombre: user?.nombre ?? "", correo: user?.correo ?? "" },
  });
  const updateProfile = useMutation({
    mutationFn: (data: ProfileValues) => usersApi.updateProfile(data),
    onSuccess: (res) => {
      if (accessToken) setSession(accessToken, res.user);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });
  const changePassword = useMutation({
    mutationFn: (data: PasswordValues) =>
      usersApi.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => passwordForm.reset(),
  });

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle title="Mi cuenta" />

      <Card className="mb-6">
        <h3 className="mb-4 text-sm font-semibold">Perfil</h3>
        <form
          onSubmit={profileForm.handleSubmit((v) => updateProfile.mutate(v))}
          className="flex flex-col gap-4"
        >
          <Input
            label="Nombre"
            {...profileForm.register("nombre")}
            error={profileForm.formState.errors.nombre?.message}
          />
          <Input
            label="Correo"
            type="email"
            {...profileForm.register("correo")}
            error={profileForm.formState.errors.correo?.message}
          />
          {updateProfile.isSuccess && <p className="text-sm text-success">Perfil actualizado.</p>}
          <Button type="submit" loading={updateProfile.isPending}>
            Guardar cambios
          </Button>
        </form>
      </Card>

      <Card>
        <h3 className="mb-4 text-sm font-semibold">Cambiar contraseña</h3>
        <form
          onSubmit={passwordForm.handleSubmit((v) => changePassword.mutate(v))}
          className="flex flex-col gap-4"
        >
          <Input
            label="Contraseña actual"
            type="password"
            {...passwordForm.register("currentPassword")}
            error={passwordForm.formState.errors.currentPassword?.message}
          />
          <Input
            label="Nueva contraseña"
            type="password"
            {...passwordForm.register("newPassword")}
            error={passwordForm.formState.errors.newPassword?.message}
          />
          {changePassword.isSuccess && (
            <p className="text-sm text-success">Contraseña actualizada.</p>
          )}
          <Button type="submit" loading={changePassword.isPending}>
            Actualizar contraseña
          </Button>
        </form>
      </Card>
    </div>
  );
}
