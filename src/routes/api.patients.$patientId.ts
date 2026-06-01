import { createFileRoute } from "@tanstack/react-router";
import { ApiError, apiJson, handleApiError, validateJson } from "@/server/api/response";
import { requireAuth } from "@/server/auth/session";
import type { ApiRouteContext } from "@/server/db/types";
import { writeAuditLog } from "@/server/middlewares/audit";
import { findPatientById, updatePatient } from "@/server/repositories/patients";
import { patientUpdateSchema } from "@/server/validators/schemas";

type PatientParams = { patientId: string };

export const Route = createFileRoute("/api/patients/$patientId")({
  server: {
    handlers: {
      GET: async (ctx) => {
        try {
          const routeCtx = ctx as ApiRouteContext<PatientParams>;
          await requireAuth(routeCtx);
          const patient = await findPatientById(routeCtx, routeCtx.params.patientId);
          if (!patient) throw new ApiError(404, "patient_not_found", "Paciente nao encontrado.");
          return apiJson({ patient });
        } catch (error) {
          return handleApiError(error);
        }
      },
      PATCH: async (ctx) => {
        try {
          const routeCtx = ctx as ApiRouteContext<PatientParams>;
          const user = await requireAuth(routeCtx, ["admin", "physician", "nurse"]);
          const before = await findPatientById(routeCtx, routeCtx.params.patientId);
          if (!before) throw new ApiError(404, "patient_not_found", "Paciente nao encontrado.");
          const input = await validateJson(routeCtx.request, patientUpdateSchema);
          const patient = await updatePatient(routeCtx, routeCtx.params.patientId, input);
          await writeAuditLog(routeCtx, {
            actorId: user.id,
            action: "update",
            entityType: "patient",
            entityId: routeCtx.params.patientId,
            before,
            after: patient,
          });
          return apiJson({ patient });
        } catch (error) {
          return handleApiError(error);
        }
      },
    },
  },
});
