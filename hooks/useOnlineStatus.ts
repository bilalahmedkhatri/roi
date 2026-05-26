"use client"

import { useSyncExternalStore } from "react"

function getOnlineStatus() {
  return typeof navigator !== "undefined" ? navigator.onLine : true
}

function subscribeToOnlineStatus(callback: () => void) {
  window.addEventListener("online", callback)
  window.addEventListener("offline", callback)
  return () => {
    window.removeEventListener("online", callback)
    window.removeEventListener("offline", callback)
  }
}

export function useOnlineStatus() {
  return useSyncExternalStore(subscribeToOnlineStatus, getOnlineStatus, () => true)
}
