"use client"

import { useTabCloseLogout } from "@/hooks/use-tab-close-logout"

export function TabCloseGuard() {
    useTabCloseLogout()
    return null
}
