import { createId, getDb } from "@/server/db/client";
import type { ApiRouteContext } from "@/server/db/types";

export async function writeAuditLog(
  ctx: ApiRouteContext,
  input: {
    actorId: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    before?: unknown;
    after?: unknown;
  },
) {
  const db = getDb(ctx);
  if (!db) return;

  const headers = ctx.request.headers;
  await db
    .prepare(
      `
      INSERT INTO audit_logs (
        id, actor_id, action, entity_type, entity_id, before_json, after_json, ip, user_agent
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    )
    .bind(
      createId("audit"),
      input.actorId,
      input.action,
      input.entityType,
      input.entityId ?? null,
      input.before === undefined ? null : JSON.stringify(input.before),
      input.after === undefined ? null : JSON.stringify(input.after),
      headers.get("cf-connecting-ip") ?? headers.get("x-forwarded-for"),
      headers.get("user-agent"),
    )
    .run();
}
