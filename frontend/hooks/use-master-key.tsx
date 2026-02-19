"use client"

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react"
import { deriveKey, base64ToArray } from "@/lib/security"
import { supabase } from "@/lib/supabase"

const LOCK_TIMEOUT_KEY = "vault-lock-timeout"
const DEFAULT_TIMEOUT = 60000 // 1 minute

function getStoredTimeout(): number {
    if (typeof window === "undefined") return DEFAULT_TIMEOUT
    const stored = localStorage.getItem(LOCK_TIMEOUT_KEY)
    return stored ? Number(stored) : DEFAULT_TIMEOUT
}

interface MasterKeyContextValue {
    masterKey: CryptoKey | null
    setMasterKey: (key: CryptoKey | null) => void
    unlockVault: (masterPassword: string) => Promise<void>
    isUnlocking: boolean
    needsUnlock: boolean
    lockTimeout: number
    setLockTimeout: (ms: number) => void
}

const MasterKeyContext = createContext<MasterKeyContextValue | null>(null)

export function MasterKeyProvider({ children }: { children: ReactNode }) {
    const [masterKey, setMasterKey] = useState<CryptoKey | null>(null)
    const [isUnlocking, setIsUnlocking] = useState(false)
    const [lockTimeout, setLockTimeoutState] = useState(DEFAULT_TIMEOUT)
    const lastActivityRef = useRef(Date.now())

    // Load stored timeout on mount
    useEffect(() => {
        setLockTimeoutState(getStoredTimeout())
    }, [])

    const setLockTimeout = useCallback((ms: number) => {
        setLockTimeoutState(ms)
        localStorage.setItem(LOCK_TIMEOUT_KEY, String(ms))
    }, [])

    // Track user activity
    useEffect(() => {
        const resetActivity = () => {
            lastActivityRef.current = Date.now()
        }

        const events = ["mousemove", "keydown", "click", "scroll", "touchstart"]
        events.forEach((e) => window.addEventListener(e, resetActivity, { passive: true }))

        return () => {
            events.forEach((e) => window.removeEventListener(e, resetActivity))
        }
    }, [])

    // Check idle timeout
    useEffect(() => {
        if (!masterKey || lockTimeout === 0) return

        const interval = setInterval(() => {
            const idle = Date.now() - lastActivityRef.current
            if (idle >= lockTimeout) {
                setMasterKey(null)
            }
        }, 5000) // check every 5 seconds

        return () => clearInterval(interval)
    }, [masterKey, lockTimeout])

    const unlockVault = useCallback(async (masterPassword: string) => {
        setIsUnlocking(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const { data: profile } = await supabase
                .from("profiles")
                .select("master_password_salt")
                .eq("id", user.id)
                .single()

            if (!profile?.master_password_salt) throw new Error("No salt found")

            const salt = base64ToArray(profile.master_password_salt)
            const key = await deriveKey(masterPassword, salt)
            setMasterKey(key)
            lastActivityRef.current = Date.now()
        } finally {
            setIsUnlocking(false)
        }
    }, [])

    return (
        <MasterKeyContext.Provider value={{
            masterKey,
            setMasterKey,
            unlockVault,
            isUnlocking,
            needsUnlock: !masterKey,
            lockTimeout,
            setLockTimeout,
        }}>
            {children}
        </MasterKeyContext.Provider>
    )
}

export function useMasterKey() {
    const ctx = useContext(MasterKeyContext)
    if (!ctx) throw new Error("useMasterKey must be used within MasterKeyProvider")
    return ctx
}
