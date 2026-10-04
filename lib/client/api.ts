"use client";

import { useCallback, useEffect, useState } from "react";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function api<T>(url: string, body?: unknown, signal?: AbortSignal): Promise<T> {
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
  return data as T;
}

export function useApi<T>(url: string | null) {
  const [state, setState] = useState<{
    url: string | null;
    data: T | null;
    error: string | null;
    loading: boolean;
  }>({ url, data: null, error: null, loading: true });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    api<T>(url, undefined, controller.signal)
      .then((data) => setState({ url, data, error: null, loading: false }))
      .catch((error) => {
        if (error.name !== "AbortError")
          setState({ url, data: null, error: error.message, loading: false });
      });
    return () => controller.abort();
  }, [url, revision]);
  const retry = useCallback(() => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    setRevision((value) => value + 1);
  }, []);
  return { ...(state.url === url ? state : { data: null, error: null, loading: true }), retry };
}

export function safeDestination(value: string | null, fallback = "/") {
  return value?.startsWith("/") && !value.startsWith("//") && !value.includes("\\")
    ? value
    : fallback;
}
