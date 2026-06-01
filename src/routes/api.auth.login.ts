import { createFileRoute } from "@tanstack/react-router";
import { apiJson, handleApiError, validateJson } from "@/server/api/response";
import { buildSessionCookie } from "@/server/auth/session";
import type { ApiRouteContext } from "@/server/db/types";
import { login } from "@/server/services/auth";
import { loginSchema } from "@/server/validators/schemas";

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      POST: async (ctx) => {
        try {
          const routeCtx = ctx as ApiRouteContext;
          const input = await validateJson(routeCtx.request, loginSchema);
          const { user, token } = await login(routeCtx, input);
          return apiJson(
            { user },
            { headers: { "set-cookie": buildSessionCookie(routeCtx.request, token) } },
          );
        } catch (error) {
          return handleApiError(error);
        }
      },
    },
  },
});
