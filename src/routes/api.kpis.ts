import { createFileRoute } from "@tanstack/react-router";
import { apiJson, handleApiError } from "@/server/api/response";
import { requireAuth } from "@/server/auth/session";
import type { ApiRouteContext } from "@/server/db/types";
import { getDashboardKpis } from "@/server/services/dashboard";

export const Route = createFileRoute("/api/kpis")({
  server: {
    handlers: {
      GET: async (ctx) => {
        try {
          const routeCtx = ctx as ApiRouteContext;
          await requireAuth(routeCtx);
          return apiJson(await getDashboardKpis(routeCtx));
        } catch (error) {
          return handleApiError(error);
        }
      },
    },
  },
});
