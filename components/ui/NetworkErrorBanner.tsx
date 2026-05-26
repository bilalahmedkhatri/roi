"use client"

import { useOnlineStatus } from "@/hooks/useOnlineStatus"

export default function NetworkErrorBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-3">
      <svg className="h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
      <div>
        <p className="text-sm font-medium text-red-800 dark:text-red-300">Network connection lost</p>
        <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">Please check your internet connection and try again.</p>
      </div>
    </div>
  )
}
