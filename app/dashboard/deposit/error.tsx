"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-sm text-red-500">Failed to load deposit page. <button onClick={reset} className="underline">Reload</button></p>
    </div>
  );
}
