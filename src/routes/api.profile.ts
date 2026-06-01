import { createFileRoute } from "@tanstack/react-router";
import { apiJson, handleApiError } from "@/server/api/response";
import { requireAuth } from "@/server/auth/session";
import type { ApiRouteContext } from "@/server/db/types";

export const Route = createFileRoute("/api/profile")({
  server: {
    handlers: {
      GET: async (ctx) => {
        try {
          const user = await requireAuth(ctx as ApiRouteContext);
          return apiJson({ profile: user.accessProfile, user });
        } catch (error) {
          return handleApiError(error);
        }
      },
    },
  },
});
