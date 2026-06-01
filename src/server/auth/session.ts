import type { AccessRole, TeamUser } from "@/lib/api/types";
import { ApiError } from "@/server/api/response";
import { getEnv } from "@/server/db/client";
import type { ApiRouteContext } from "@/server/db/types";
import { findUserById, type UserWithPassword } from "@/server/repositories/users";

const SESSION_COOKIE = "cardio_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const FALLBACK_SECRET = "dev-session-secret-change-me";

type SessionPayload = {
  sub: string;
  email: string;
  role: AccessRole;
  exp: number;
};

export async function createSessionToken(ctx: ApiRouteContext, user: TeamUser) {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    } satisfies SessionPayload),
  );
  const unsigned = `${header}.${payload}`;
  const signature = await sign(unsigned, getSessionSecret(ctx));
  return `${unsigned}.${signature}`;
}

export async function verifySessionToken(ctx: ApiRouteContext, token: string) {
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;

  const unsigned = `${header}.${payload}`;
  const valid = await verify(unsigned, signature, getSessionSecret(ctx));
  if (!valid) return null;

  const parsed = parsePayload(payload);
  if (!parsed || parsed.exp < Math.floor(Date.now() / 1000)) return null;
  return parsed;
}

export async function getCurrentUser(ctx: ApiRouteContext): Promise<TeamUser | null> {
  const token = getSessionToken(ctx.request);
  if (!token) return null;

  const payload = await verifySessionToken(ctx, token);
  if (!payload) return null;

  return findUserById(ctx, payload.sub);
}

export async function requireAuth(ctx: ApiRouteContext, roles?: AccessRole[]): Promise<TeamUser> {
  const user = await getCurrentUser(ctx);
  if (!user) throw new ApiError(401, "unauthorized", "Sessao ausente ou expirada.");
  if (roles?.length && !roles.includes(user.role)) {
    throw new ApiError(403, "forbidden", "Perfil sem permissao para esta acao.");
  }
  return user;
}

export function verifyPassword(password: string, storedHash: string) {
  if (storedHash.startsWith("plain:")) return password === storedHash.slice("plain:".length);
  return password === storedHash;
}

export function buildSessionCookie(request: Request, token: string) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Max-Age=${SESSION_TTL_SECONDS}; Path=/; HttpOnly; SameSite=Lax${secure}`;
}

export function buildClearSessionCookie() {
  return `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`;
}

export function getSessionToken(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  return (
    cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${SESSION_COOKIE}=`))
      ?.slice(SESSION_COOKIE.length + 1) ?? null
  );
}

export function stripPrivateUser(user: UserWithPassword): TeamUser {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

function getSessionSecret(ctx: ApiRouteContext) {
  return getEnv(ctx).SESSION_SECRET ?? FALLBACK_SECRET;
}

function parsePayload(encodedPayload: string): SessionPayload | null {
  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;
    if (!payload.sub || !payload.email || !payload.role || !payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

async function sign(value: string, secret: string) {
  const key = await createKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

async function verify(value: string, signature: string, secret: string) {
  const key = await createKey(secret);
  return crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlToBytes(signature),
    new TextEncoder().encode(value),
  );
}

function createKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function base64UrlEncode(value: string) {
  return bytesToBase64Url(new TextEncoder().encode(value));
}

function base64UrlDecode(value: string) {
  return new TextDecoder().decode(base64UrlToBytes(value));
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
