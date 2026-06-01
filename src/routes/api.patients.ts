import { createFileRoute } from "@tanstack/react-router";
import { apiJson, handleApiError, validateJson } from "@/server/api/response";
import { requireAuth } from "@/server/auth/session";
import type { ApiRouteContext } from "@/server/db/types";
import { writeAuditLog } from "@/server/middlewares/audit";
import { createPatient, listPatients } from "@/server/repositories/patients";
import { patientInputSchema } from "@/server/validators/schemas";

export const Route = createFileRoute("/api/patients")({
  server: {
    handlers: {
      GET: async (ctx) => {
        try {
          const routeCtx = ctx as ApiRouteContext;
          await requireAuth(routeCtx);
          return apiJson({ patients: await listPatients(routeCtx) });
        } catch (error) {
          return handleApiError(error);
        }
      },
      POST: async (ctx) => {
        try {
          const routeCtx = ctx as ApiRouteContext;
          const user = await requireAuth(routeCtx, ["admin", "physician", "nurse"]);
          const input = await validateJson(routeCtx.request, patientInputSchema);
          const patient = await createPatient(routeCtx, input);
          await writeAuditLog(routeCtx, {
            actorId: user.id,
            action: "create",
            entityType: "patient",
            entityId: patient.id,
            after: patient,
          });
          return apiJson({ patient }, { status: 201 });
        } catch (error) {
          return handleApiError(error);
        }
      },
    },
  },
});
