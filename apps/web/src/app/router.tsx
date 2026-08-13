import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AuthLayout } from "./layouts/AuthLayout";
import { AppLayout } from "./layouts/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../features/auth/LoginPage";
import { RegisterPage } from "../features/auth/RegisterPage";
import { ForgotPasswordPage } from "../features/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../features/auth/ResetPasswordPage";
import { LegalPage } from "../features/legal/LegalPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { AddendasPage } from "../features/addendas/AddendasPage";
import { NuevaAddendaPage } from "../features/addendas/NuevaAddendaPage";
import { AccountPage } from "../features/account/AccountPage";
import { HelpPage } from "../features/help/HelpPage";
import { UsersPage } from "../features/admin/UsersPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/recuperar-password" element={<ForgotPasswordPage />} />
          <Route path="/restablecer-password" element={<ResetPasswordPage />} />
        </Route>

        <Route path="/legal/:slug" element={<LegalPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/addendas" element={<AddendasPage />} />
            <Route path="/addendas/nueva" element={<NuevaAddendaPage />} />
            <Route path="/cuenta" element={<AccountPage />} />
            <Route path="/ayuda" element={<HelpPage />} />
            <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
              <Route path="/admin/usuarios" element={<UsersPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
