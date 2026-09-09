type RuntimeErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

declare global {
  interface Window {
    __primeformRuntimeError?: (payload: {
      message: string;
      stack?: string;
      filename?: string;
      source?: string;
    }) => void;
  }
}

export function reportRuntimeError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  window.__primeformRuntimeError?.({
    message,
    ...(stack !== undefined && { stack }),
    filename: window.location.pathname,
    source: "react_error_boundary",
  });

  console.error("Runtime error:", {
    ...context,
    message,
    stack,
    pathname: window.location.pathname,
  });
}

export type { RuntimeErrorOptions };
