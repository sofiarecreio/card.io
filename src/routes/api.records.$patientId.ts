import { createFileRoute } from "@tanstack/react-router";
import { ApiError, apiJson, handleApiError, validateJson } from "@/server/api/response";
import { requireAuth } from "@/server/auth/session";
import type { ApiRouteContext } from "@/server/db/types";
import { writeAuditLog } from "@/server/middlewares/audit";
import { findPatientById } from "@/server/repositories/patients";
import { getRecordByPatientId, updateClinicalSummary } from "@/server/repositories/records";
import { clinicalSummarySchema } from "@/server/validators/schemas";

type PatientParams = { patientId: string };

export const Route = createFileRoute("/api/records/$patientId")({
  server: {
    handlers: {
      GET: async (ctx) => {
        try {
          const routeCtx = ctx as ApiRouteContext<PatientParams>;
          await requireAuth(routeCtx);
          const [patient, record] = await Promise.all([
            findPatientById(routeCtx, routeCtx.params.patientId),
            getRecordByPatientId(routeCtx, routeCtx.params.patientId),
          ]);
          if (!patient || !record) {
            throw new ApiError(404, "record_not_found", "Prontuario nao encontrado.");
          }
          return apiJson({ patient, record });
        } catch (error) {
          return handleApiError(error);
        }
      },
      PATCH: async (ctx) => {
        try {
          const routeCtx = ctx as ApiRouteContext<PatientParams>;
          const user = await requireAuth(routeCtx, ["admin", "physician", "nurse"]);
          const input = await validateJson(routeCtx.request, clinicalSummarySchema);
          const record = await updateClinicalSummary(
            routeCtx,
            routeCtx.params.patientId,
            input.summary,
          );
          if (!record) throw new ApiError(404, "record_not_found", "Prontuario nao encontrado.");
          await writeAuditLog(routeCtx, {
            actorId: user.id,
            action: "update-summary",
            entityType: "medical_record",
            entityId: record.id,
            after: { summary: record.summary },
          });
          return apiJson({ record });
        } catch (error) {
          return handleApiError(error);
        }
      },
    },
  },
});
