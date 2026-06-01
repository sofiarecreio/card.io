import { createFileRoute } from "@tanstack/react-router";
import { apiJson, handleApiError } from "@/server/api/response";
import { getCurrentUser } from "@/server/auth/session";
import type { ApiRouteContext } from "@/server/db/types";

export const Route = createFileRoute("/api/auth/me")({
  server: {
    handlers: {
      GET: async (ctx) => {
        try {
          const user = await getCurrentUser(ctx as ApiRouteContext);
          return apiJson({ user });
        } catch (error) {
          return handleApiError(error);
        }
      },
    },
  },
});
