import { z, ZodError, type ZodTypeAny } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function apiJson<T>(data: T, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function apiNoContent(init: ResponseInit = {}) {
  return new Response(null, { status: 204, ...init });
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "invalid_json", "JSON invalido.");
  }
}

export async function validateJson<Schema extends ZodTypeAny>(
  request: Request,
  schema: Schema,
): Promise<z.output<Schema>> {
  const body = await readJson(request);
  return schema.parse(body);
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return apiJson(
      { error: { code: error.code, message: error.message, details: error.details } },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return apiJson(
      {
        error: {
          code: "validation_error",
          message: "Payload invalido.",
          details: error.flatten(),
        },
      },
      { status: 422 },
    );
  }

  console.error(error);
  return apiJson(
    { error: { code: "internal_error", message: "Erro interno do servidor." } },
    { status: 500 },
  );
}
