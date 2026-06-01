import { createFileRoute } from "@tanstack/react-router";
import { apiJson, handleApiError, validateJson } from "@/server/api/response";
import { requireAuth } from "@/server/auth/session";
import type { ApiRouteContext } from "@/server/db/types";
import { writeAuditLog } from "@/server/middlewares/audit";
import { createAppointment, listAppointments } from "@/server/repositories/appointments";
import { agendaQuerySchema, appointmentInputSchema } from "@/server/validators/schemas";

export const Route = createFileRoute("/api/appointments")({
  server: {
    handlers: {
      GET: async (ctx) => {
        try {
          const routeCtx = ctx as ApiRouteContext;
          await requireAuth(routeCtx);
          const query = agendaQuerySchema.parse(
            Object.fromEntries(new URL(routeCtx.request.url).searchParams),
          );
          return apiJson({ appointments: await listAppointments(routeCtx, query) });
        } catch (error) {
          return handleApiError(error);
        }
      },
      POST: async (ctx) => {
        try {
          const routeCtx = ctx as ApiRouteContext;
          const user = await requireAuth(routeCtx);
          const input = await validateJson(routeCtx.request, appointmentInputSchema);
          const appointment = await createAppointment(routeCtx, input, user.id);
          await writeAuditLog(routeCtx, {
            actorId: user.id,
            action: "create",
            entityType: "appointment",
            entityId: appointment?.id,
            after: appointment,
          });
          return apiJson({ appointment }, { status: 201 });
        } catch (error) {
          return handleApiError(error);
        }
      },
    },
  },
});
