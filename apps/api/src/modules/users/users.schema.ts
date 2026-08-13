import { z } from "zod";

export const updateProfileSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es requerido").optional(),
  correo: z.string().trim().toLowerCase().email("Correo inválido").optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
