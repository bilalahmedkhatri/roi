"use client";

const isDevelopment = process.env.NODE_ENV === "development";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4">
        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold">Dashboard Error</h2>
      <p className="text-sm text-zinc-500">
        {isDevelopment
          ? "A technical error occurred while rendering the dashboard. Review the details below."
          : "We’re having trouble loading your dashboard right now. Please try again in a few moments."}
      </p>

      {isDevelopment ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-left text-xs text-red-700 max-w-2xl w-full">
          <p className="font-medium">Error details:</p>
          <p className="mt-2 break-words">{error?.message ?? "No additional error message provided."}</p>
          {error?.stack ? (
            <pre className="mt-3 overflow-x-auto text-[11px] leading-5">{error.stack}</pre>
          ) : null}
        </div>
      ) : null}

      <button
        onClick={reset}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Reload
      </button>
    </div>
  );
}
