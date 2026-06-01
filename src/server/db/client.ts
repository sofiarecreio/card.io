import type { ApiRouteContext, AppEnv, D1Database } from "./types";

export function getEnv(ctx: ApiRouteContext): AppEnv {
  return ctx.context?.env ?? {};
}

export function getDb(ctx: ApiRouteContext): D1Database | null {
  return getEnv(ctx).DB ?? null;
}

export function hasDb(ctx: ApiRouteContext): boolean {
  return Boolean(getDb(ctx));
}

export function jsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function nowIso() {
  return new Date().toISOString();
}

export function createId(prefix: string) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}-${random}`;
}
