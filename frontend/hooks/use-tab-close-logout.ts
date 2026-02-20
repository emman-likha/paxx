"use client"

import { useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useMasterKey } from "./use-master-key"

const SESSION_TAB_KEY = "paxx-tab-session"

/**
 * Signs out the user when the browser tab is closed.
 *
 * sessionStorage persists across page refreshes but is cleared when the
 * tab closes. On dashboard mount:
 * - Flag exists → refresh, session continues normally
 * - Flag missing → new tab after a close, sign out immediately
 */
export function useTabCloseLogout() {
    const router = useRouter()
    const { setMasterKey } = useMasterKey()
    const didRun = useRef(false)

    useEffect(() => {
        // Prevent double-firing in React strict mode
        if (didRun.current) return
        didRun.current = true

        const hasTabSession = sessionStorage.getItem(SESSION_TAB_KEY)

        if (!hasTabSession) {
            // No tab marker — this is a fresh tab (previous tab was closed).
            // If there's a lingering Supabase session, revoke it.
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session) {
                    setMasterKey(null)
                    supabase.auth.signOut().then(() => {
                        router.push("/login")
                    })
                    return
                }
            })
        }

        // Mark this tab as having an active session
        sessionStorage.setItem(SESSION_TAB_KEY, "true")
    }, [router, setMasterKey])
}
