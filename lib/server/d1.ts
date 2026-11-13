import { isRecord, type CloudflareEnv } from "./kv";

export interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: { last_row_id?: number; rows_written?: number };
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
  first<T = unknown>(): Promise<T | null>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

function isD1Database(value: unknown): value is D1Database {
  return isRecord(value) && typeof value.prepare === "function" && typeof value.batch === "function";
}

export function getD1(env: CloudflareEnv): D1Database | null {
  const db = env.CUSTOM_CREATIONS_DB;
  return isD1Database(db) ? (db as D1Database) : null;
}
