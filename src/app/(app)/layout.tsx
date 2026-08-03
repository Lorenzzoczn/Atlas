import { AuthGuard } from "@/components/layout/auth-guard";
import { AppShell } from "@/layouts/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
