"use client"

import { useState, useCallback, useEffect } from "react"

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
    const [settings, setSettings] = useState<Settings>(() => {
        const initial = { ...DEFAULTS }
        if (typeof window !== "undefined") {
            for (const key of Object.keys(DEFAULTS) as (keyof Settings)[]) {
                (initial as any)[key] = readFromStorage(key)
            }
        }
        return initial
    })

    // Sync with localStorage on mount (handles SSR hydration)
    useEffect(() => {
        const loaded = { ...DEFAULTS }
        for (const key of Object.keys(DEFAULTS) as (keyof Settings)[]) {
            (loaded as any)[key] = readFromStorage(key)
        }
        setSettings(loaded)
    }, [])

    const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
        writeToStorage(key, value)
        setSettings((prev) => ({ ...prev, [key]: value }))
    }, [])

    return { settings, updateSetting }
}
