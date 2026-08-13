import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../shared/api/auth.api";
import { useAuthStore } from "../../stores/auth.store";

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { correo: string; password: string }) =>
      authApi.login(input.correo, input.password),
    onSuccess: (data) => {
      setSession(data.accessToken, data.user);
      queryClient.invalidateQueries();
    },
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      nombre: string;
      correo: string;
      password: string;
      aceptaTerminos: boolean;
    }) => authApi.register(input.nombre, input.correo, input.password, input.aceptaTerminos),
    onSuccess: (data) => {
      setSession(data.accessToken, data.user);
      queryClient.invalidateQueries();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (correo: string) => authApi.forgotPassword(correo),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: { token: string; newPassword: string }) =>
      authApi.resetPassword(input.token, input.newPassword),
  });
}
