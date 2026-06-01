import { ApiError } from "@/server/api/response";
import type { ApiRouteContext } from "@/server/db/types";
import { findUserByEmail } from "@/server/repositories/users";
import type { LoginInput } from "@/server/validators/schemas";
import { createSessionToken, stripPrivateUser, verifyPassword } from "@/server/auth/session";

export async function login(ctx: ApiRouteContext, input: LoginInput) {
  const user = await findUserByEmail(ctx, input.email);
  if (!user || !verifyPassword(input.password, user.passwordHash)) {
    throw new ApiError(401, "invalid_credentials", "E-mail ou senha invalidos.");
  }

  const safeUser = stripPrivateUser(user);
  const token = await createSessionToken(ctx, safeUser);
  return { user: safeUser, token };
}
