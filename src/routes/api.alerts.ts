import { createFileRoute } from "@tanstack/react-router";
import { apiJson, handleApiError, validateJson } from "@/server/api/response";
import { requireAuth } from "@/server/auth/session";
import type { ApiRouteContext } from "@/server/db/types";
import { writeAuditLog } from "@/server/middlewares/audit";
import { createAlert, listAlerts } from "@/server/repositories/alerts";
import { alertInputSchema } from "@/server/validators/schemas";

export const Route = createFileRoute("/api/alerts")({
  server: {
    handlers: {
      GET: async (ctx) => {
        try {
          const routeCtx = ctx as ApiRouteContext;
          await requireAuth(routeCtx);
          const status = new URL(routeCtx.request.url).searchParams.get("status") ?? "open";
          return apiJson({ alerts: await listAlerts(routeCtx, status) });
        } catch (error) {
          return handleApiError(error);
        }
      },
      POST: async (ctx) => {
        try {
          const routeCtx = ctx as ApiRouteContext;
          const user = await requireAuth(routeCtx, ["admin", "physician", "nurse"]);
          const input = await validateJson(routeCtx.request, alertInputSchema);
          const alert = await createAlert(routeCtx, input, user.id);
          await writeAuditLog(routeCtx, {
            actorId: user.id,
            action: "create",
            entityType: "clinical_alert",
            entityId: alert?.id,
            after: alert,
          });
          return apiJson({ alert }, { status: 201 });
        } catch (error) {
          return handleApiError(error);
        }
      },
    },
  },
});
