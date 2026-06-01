export type D1Result<T = unknown> = {
  results?: T[];
  success?: boolean;
  meta?: unknown;
  error?: string;
};

export type D1PreparedStatement = {
  bind: (...values: unknown[]) => D1PreparedStatement;
  first: <T = unknown>(columnName?: string) => Promise<T | null>;
  all: <T = unknown>() => Promise<D1Result<T>>;
  run: () => Promise<D1Result>;
};

export type D1Database = {
  prepare: (query: string) => D1PreparedStatement;
  batch?: <T = unknown>(statements: D1PreparedStatement[]) => Promise<T[]>;
};

export type AppEnv = {
  DB?: D1Database;
  SESSION_SECRET?: string;
  ENVIRONMENT?: string;
};

export type RouteExecutionContext = {
  waitUntil?: (promise: Promise<unknown>) => void;
  passThroughOnException?: () => void;
};

export type ApiRouteContext<Params extends Record<string, string> = Record<string, string>> = {
  request: Request;
  params: Params;
  pathname?: string;
  context?: {
    env?: AppEnv;
    executionContext?: RouteExecutionContext;
  };
};
