import { Providers } from "./app/providers";
import { AuthBootstrap } from "./app/AuthBootstrap";
import { AppRouter } from "./app/router";

export function App() {
  return (
    <Providers>
      <AuthBootstrap>
        <AppRouter />
      </AuthBootstrap>
    </Providers>
  );
}
