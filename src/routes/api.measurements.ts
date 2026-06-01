import { createFileRoute } from "@tanstack/react-router";
import { apiJson, handleApiError, validateJson } from "@/server/api/response";
import { requireAuth } from "@/server/auth/session";
import type { ApiRouteContext } from "@/server/db/types";
import { writeAuditLog } from "@/server/middlewares/audit";
import { createMeasurement } from "@/server/repositories/measurements";
import { measurementInputSchema } from "@/server/validators/schemas";

export const Route = createFileRoute("/api/measurements")({
  server: {
    handlers: {
      POST: async (ctx) => {
        try {
          const routeCtx = ctx as ApiRouteContext;
          const user = await requireAuth(routeCtx);
          const input = await validateJson(routeCtx.request, measurementInputSchema);
          const measurement = await createMeasurement(routeCtx, input);
          await writeAuditLog(routeCtx, {
            actorId: user.id,
            action: "create",
            entityType: "heart_measurement",
            entityId: measurement.id,
            after: measurement,
          });
          return apiJson({ measurement }, { status: 201 });
        } catch (error) {
          return handleApiError(error);
        }
      },
    },
  },
});
