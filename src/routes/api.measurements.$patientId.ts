import { createFileRoute } from "@tanstack/react-router";
import { apiJson, handleApiError } from "@/server/api/response";
import { requireAuth } from "@/server/auth/session";
import type { ApiRouteContext } from "@/server/db/types";
import { listMeasurementsByPatient } from "@/server/repositories/measurements";

type PatientParams = { patientId: string };

export const Route = createFileRoute("/api/measurements/$patientId")({
  server: {
    handlers: {
      GET: async (ctx) => {
        try {
          const routeCtx = ctx as ApiRouteContext<PatientParams>;
          await requireAuth(routeCtx);
          const measurements = await listMeasurementsByPatient(routeCtx, routeCtx.params.patientId);
          return apiJson({ measurements });
        } catch (error) {
          return handleApiError(error);
        }
      },
    },
  },
});
