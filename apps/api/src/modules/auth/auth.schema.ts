import { z } from "zod";

export const registerSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es requerido"),
  correo: z.string().trim().toLowerCase().email("Correo inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  aceptaTerminos: z
    .boolean()
    .refine(
      (v) => v === true,
      "Debes aceptar los términos, el aviso de privacidad y la política de cookies",
    ),
});

export const loginSchema = z.object({
  correo: z.string().trim().toLowerCase().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const forgotPasswordSchema = z.object({
  correo: z.string().trim().toLowerCase().email("Correo inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "El token es requerido"),
  newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
