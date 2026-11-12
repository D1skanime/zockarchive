import setupApi from "@/v2/data/adapters/legacy/services/api/setup";
import type { User } from "@/v2/data/adapters/legacy/stores/users";

interface SetupRouteContext {
  route: string | undefined;
  fullPath: string;
  connected: boolean;
  showWizard: boolean;
  user: Pick<User, "role"> | null;
}
export async function resolveSetupRoute(context: SetupRouteContext) {
  if (!context.connected) return undefined;
  if (!context.user)
    return context.showWizard
      ? context.route === "setup"
        ? undefined
        : { name: "setup" }
      : context.route === "setup"
        ? { name: "login", query: { next: "/setup" } }
        : undefined;
  if (context.user.role !== "admin")
    return context.showWizard
      ? context.route === "setup"
        ? undefined
        : { name: "setup" }
      : context.route === "setup"
        ? { name: "home" }
        : undefined;
  try {
    const { data } = await setupApi.getStatus();
    if (!data.setup_complete)
      return context.route === "setup" ? undefined : { name: "setup" };
    // Authoritative completion permits leaving setup despite a stale heartbeat.
    return undefined;
  } catch {
    // A stale heartbeat remains fail-closed when status cannot confirm completion.
    return context.showWizard && context.route !== "setup"
      ? { name: "setup" }
      : undefined;
  }
}
