"use client"

import { useState, useCallback, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export interface Settings {
    "clipboard-clear-timer": number
    "password-gen-length": number
    "password-gen-uppercase": boolean
    "password-gen-numbers": boolean
    "password-gen-symbols": boolean
    "vault-view": "list" | "grid"
    "compact-mode": boolean
    "reduce-motion": boolean
    "require-password-to-view": boolean
    "require-password-to-copy": boolean
    "security-alerts": boolean
    "login-alerts": boolean
    "breach-alerts": boolean
    "weekly-report": boolean
}

const DEFAULTS: Settings = {
    "clipboard-clear-timer": 30000,
    "password-gen-length": 16,
    "password-gen-uppercase": true,
    "password-gen-numbers": true,
    "password-gen-symbols": true,
    "vault-view": "list",
    "compact-mode": false,
    "reduce-motion": false,
    "require-password-to-view": true,
    "require-password-to-copy": false,
    "security-alerts": true,
    "login-alerts": true,
    "breach-alerts": false,
    "weekly-report": false,
}

const STORAGE_PREFIX = "paxx-settings-"

function readFromStorage<K extends keyof Settings>(key: K): Settings[K] {
    if (typeof window === "undefined") return DEFAULTS[key]
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    if (raw === null) return DEFAULTS[key]
    try {
        return JSON.parse(raw)
    } catch {
        return DEFAULTS[key]
    }
}

function writeToStorage<K extends keyof Settings>(key: K, value: Settings[K]) {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
}

export function useSettings() {
    const [settings, setSettings] = useState<Settings>({ ...DEFAULTS })
    const [isLoading, setIsLoading] = useState(true)

    // Load from localStorage first, then sync from DB
    useEffect(() => {
        const loadSettings = async () => {
            // 1. Initial load from localStorage (fast)
            const loaded = { ...DEFAULTS }
            for (const key of Object.keys(DEFAULTS) as (keyof Settings)[]) {
                (loaded as any)[key] = readFromStorage(key)
            }
            setSettings(loaded)

            // 2. Sync from Supabase if logged in
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data, error } = await supabase
                        .from("user_settings")
                        .select("settings")
                        .eq("user_id", user.id)
                        .maybeSingle()

                    if (data?.settings) {
                        const dbSettings = data.settings as Partial<Settings>
                        const merged = { ...loaded, ...dbSettings }
                        setSettings(merged)
                        // Update local storage to match DB
                        for (const key of Object.keys(merged) as (keyof Settings)[]) {
                            writeToStorage(key, (merged as any)[key])
                        }
                    } else if (!error) {
                        // If no settings in DB, push local settings to DB
                        await supabase
                            .from("user_settings")
                            .upsert({ user_id: user.id, settings: loaded })
                    }
                }
            } catch (err) {
                console.error("Failed to sync settings:", err)
            } finally {
                setIsLoading(false)
            }
        }

        loadSettings()
    }, [])

    const updateSetting = useCallback(async <K extends keyof Settings>(key: K, value: Settings[K]) => {
        // Optimistic update locally
        writeToStorage(key, value)
        setSettings((prev) => {
            const next = { ...prev, [key]: value }

            // Sync to Supabase in background
            supabase.auth.getUser().then(({ data: { user } }) => {
                if (user) {
                    supabase
                        .from("user_settings")
                        .upsert({
                            user_id: user.id,
                            settings: next,
                            updated_at: new Date().toISOString()
                        })
                        .then(({ error }) => {
                            if (error) console.error("Failed to persist setting:", error)
                        })
                }
            })

            return next
        })
    }, [])

    return { settings, updateSetting, isLoading }
}
