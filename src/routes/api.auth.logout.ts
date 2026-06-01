import { createFileRoute } from "@tanstack/react-router";
import { apiJson } from "@/server/api/response";
import { buildClearSessionCookie } from "@/server/auth/session";

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      POST: async () =>
        apiJson({ ok: true }, { headers: { "set-cookie": buildClearSessionCookie() } }),
    },
  },
});
