"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 text-sm">Failed to load login page.</p>
        <button onClick={reset} className="mt-2 text-xs text-primary hover:underline">Try again</button>
      </div>
    </div>
  );
}
