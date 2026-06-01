import { createFileRoute } from "@tanstack/react-router";
import { ApiError, apiJson, handleApiError, validateJson } from "@/server/api/response";
import { requireAuth } from "@/server/auth/session";
import type { ApiRouteContext } from "@/server/db/types";
import { writeAuditLog } from "@/server/middlewares/audit";
import { addClinicalEvolution } from "@/server/repositories/records";
import { evolutionInputSchema } from "@/server/validators/schemas";

type PatientParams = { patientId: string };

export const Route = createFileRoute("/api/records/$patientId/evolutions")({
  server: {
    handlers: {
      POST: async (ctx) => {
        try {
          const routeCtx = ctx as ApiRouteContext<PatientParams>;
          const user = await requireAuth(routeCtx, ["admin", "physician", "nurse"]);
          const input = await validateJson(routeCtx.request, evolutionInputSchema);
          const evolution = await addClinicalEvolution(
            routeCtx,
            routeCtx.params.patientId,
            input,
            user.id,
          );
          if (!evolution) {
            throw new ApiError(404, "record_not_found", "Prontuario nao encontrado.");
          }
          await writeAuditLog(routeCtx, {
            actorId: user.id,
            action: "create",
            entityType: "clinical_evolution",
            entityId: evolution.id,
            after: evolution,
          });
          return apiJson({ evolution }, { status: 201 });
        } catch (error) {
          return handleApiError(error);
        }
      },
    },
  },
});
