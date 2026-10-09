"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { z } from "zod";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function api<T>(
  url: string,
  body?: unknown,
  signal?: AbortSignal,
  schema?: z.ZodType<T>,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: body === undefined ? "GET" : "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ApiError(
      "Le service est injoignable. Vérifie ta connexion puis réessaie. / The service is unreachable. Check your connection and try again.",
      0,
    );
  }
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new ApiError(
      data?.error ||
        "Le service ne peut pas répondre pour le moment. / The service is unavailable right now.",
      response.status,
    );
  if (schema) {
    const result = schema.safeParse(data);
    if (!result.success) throw new ApiError("service_unavailable", 502);
    return result.data;
  }
  return data as T;
}

export interface ApiSeed<T> {
  url: string | null;
  scope: string;
  data: T | null;
  error: string | null;
}
export function useApi<T>(url: string | null, initial?: ApiSeed<T>, scope = "") {
  const seed = useRef(initial);
  const [state, setState] = useState<ApiSeed<T> & { loading: boolean }>(() =>
    initial?.url === url && initial.scope === scope
      ? { ...initial, loading: false }
      : { url, scope, data: null, error: null, loading: !!url },
  );
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!url || (revision === 0 && seed.current?.url === url && seed.current.scope === scope))
      return;
    const controller = new AbortController();
    api<T>(url, undefined, controller.signal)
      .then((data) => setState({ url, scope, data, error: null, loading: false }))
      .catch((error) => {
        if (error.name !== "AbortError")
          setState({ url, scope, data: null, error: error.message, loading: false });
      });
    return () => controller.abort();
  }, [url, scope, revision]);
  const retry = useCallback(() => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    setRevision((value) => value + 1);
  }, []);
  // An identity change hides the previous visitor's data before any new request finishes.
  return {
    ...(state.url === url && state.scope === scope
      ? state
      : { data: null, error: null, loading: !!url }),
    retry,
  };
}

export function safeDestination(value: string | null, fallback = "/") {
  return value?.startsWith("/") && !value.startsWith("//") && !value.includes("\\")
    ? value
    : fallback;
}
