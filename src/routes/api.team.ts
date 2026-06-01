import { createFileRoute } from "@tanstack/react-router";
import { apiJson, handleApiError } from "@/server/api/response";
import { requireAuth } from "@/server/auth/session";
import type { ApiRouteContext } from "@/server/db/types";
import { listTeamUsers } from "@/server/repositories/users";

export const Route = createFileRoute("/api/team")({
  server: {
    handlers: {
      GET: async (ctx) => {
        try {
          const routeCtx = ctx as ApiRouteContext;
          await requireAuth(routeCtx);
          const team = await listTeamUsers(routeCtx);
          return apiJson({ team });
        } catch (error) {
          return handleApiError(error);
        }
      },
    },
  },
});
