"use client"

import { useState, useCallback } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useTheme } from "next-themes"
import { supabase } from "@/lib/supabase"
import { useMasterKey } from "@/hooks/use-master-key"
import { useSettings } from "@/hooks/use-settings"
import { useAuth } from "@/hooks/use-auth"
import {
    deriveAuthHash,
    deriveKey,
    generateSalt,
    arrayToBase64,
    base64ToArray,
    encrypt,
    decrypt,
} from "@/lib/security"
import { validatePasswordStrength } from "@/lib/password-validator"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import {
    User,
    Shield,
    Lock,
    Palette,
    Database,
    Bell,
    AlertTriangle,
    Monitor,
    Moon,
    Sun,
    Download,
    Upload,
    Trash2,
    KeyRound,
    Eye,
    EyeOff,
    Smartphone,
    Fingerprint,
    Clock,
    Clipboard,
    LayoutGrid,
    LayoutList,
    Laptop,
    Globe,
    RefreshCw,
} from "lucide-react"

// ─── Timeout Options ──────────────────────────────────────────────
const TIMEOUT_OPTIONS = [
    { label: "30s", value: 30000 },
    { label: "1 min", value: 60000 },
    { label: "5 min", value: 300000 },
    { label: "15 min", value: 900000 },
    { label: "1 hour", value: 3600000 },
    { label: "Never", value: 0 },
]

const CLIPBOARD_OPTIONS = [
    { label: "15 seconds", value: 15000 },
    { label: "30 seconds", value: 30000 },
    { label: "1 minute", value: 60000 },
    { label: "Never", value: 0 },
]

// ─── Simulated Active Sessions ────────────────────────────────────
const SIMULATED_SESSIONS = [
    { device: "Chrome on Windows", location: "Current session", current: true, lastActive: "Now" },
    { device: "Firefox on macOS", location: "San Francisco, US", current: false, lastActive: "2 hours ago" },
    { device: "Safari on iPhone", location: "New York, US", current: false, lastActive: "1 day ago" },
]

// ─── Strength Meter Component ─────────────────────────────────────
function StrengthMeter({ password }: { password: string }) {
    if (!password) return null
    const { strength, requirements } = validatePasswordStrength(password)
    const colors = { weak: "bg-red-500", medium: "bg-yellow-500", strong: "bg-green-500" }
    const widths = { weak: "w-1/3", medium: "w-2/3", strong: "w-full" }

    return (
        <div className="space-y-2">
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full transition-all ${colors[strength]} ${widths[strength]}`} />
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                <span className={requirements.minLength ? "text-green-500" : ""}>8+ characters</span>
                <span className={requirements.hasUppercase ? "text-green-500" : ""}>Uppercase</span>
                <span className={requirements.hasNumber ? "text-green-500" : ""}>Number</span>
                <span className={requirements.hasSpecialChar ? "text-green-500" : ""}>Special char</span>
            </div>
        </div>
    )
}

// ─── Coming Soon Badge ────────────────────────────────────────────
function ComingSoonBadge() {
    return (
        <span className="ml-2 inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            Coming soon
        </span>
    )
}

// ─── Section Header ───────────────────────────────────────────────
function SectionIcon({ icon: Icon, color }: { icon: React.ComponentType<{ className?: string }>; color: string }) {
    return (
        <div className={`flex size-9 items-center justify-center rounded-lg ${color}`}>
            <Icon className="size-4 text-white" />
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════
// Main Settings Page
// ═══════════════════════════════════════════════════════════════════
export default function SettingsPage() {
    const { lockTimeout, setLockTimeout, masterKey } = useMasterKey()
    const { settings, updateSetting } = useSettings()
    const { signOut } = useAuth()
    const { theme, setTheme } = useTheme()
    const queryClient = useQueryClient()

    // ── Profile Data ──────────────────────────────────────────────
    const { data: profile } = useQuery({
        queryKey: ["profile-full"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null
            const { data } = await supabase
                .from("profiles")
                .select("email, username, master_password_salt, is_admin")
                .eq("id", user.id)
                .single()
            return {
                ...data,
                lastSignIn: user.last_sign_in_at,
                userId: user.id,
            }
        },
    })

    // ── Dialog States ─────────────────────────────────────────────
    const [changePwOpen, setChangePwOpen] = useState(false)
    const [clearVaultOpen, setClearVaultOpen] = useState(false)
    const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
    const [resetEncryptionOpen, setResetEncryptionOpen] = useState(false)
    const [exportLoading, setExportLoading] = useState(false)
    const [importLoading, setImportLoading] = useState(false)

    // ── Change Master Password State ──────────────────────────────
    const [currentPw, setCurrentPw] = useState("")
    const [newPw, setNewPw] = useState("")
    const [confirmPw, setConfirmPw] = useState("")
    const [showCurrentPw, setShowCurrentPw] = useState(false)
    const [showNewPw, setShowNewPw] = useState(false)
    const [changePwLoading, setChangePwLoading] = useState(false)
    const [changePwError, setChangePwError] = useState<string | null>(null)

    // ── Delete Account State ──────────────────────────────────────
    const [deleteConfirmText, setDeleteConfirmText] = useState("")
    const [deleteLoading, setDeleteLoading] = useState(false)

    // ── Clear Vault State ─────────────────────────────────────────
    const [clearLoading, setClearLoading] = useState(false)

    // ── Change Master Password Handler ────────────────────────────
    const handleChangeMasterPassword = useCallback(async () => {
        setChangePwError(null)

        if (newPw !== confirmPw) {
            setChangePwError("Passwords do not match")
            return
        }

        const validation = validatePasswordStrength(newPw)
        if (!validation.isValid) {
            setChangePwError("New password does not meet security requirements")
            return
        }

        setChangePwLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const { data: profileData } = await supabase
                .from("profiles")
                .select("master_password_salt")
                .eq("id", user.id)
                .single()
            if (!profileData?.master_password_salt) throw new Error("No salt found")

            // Verify current password by trying to derive auth hash and re-sign in
            const oldSalt = base64ToArray(profileData.master_password_salt)
            const oldAuthHash = await deriveAuthHash(currentPw, oldSalt)

            // Test current password by re-authenticating
            const { error: verifyError } = await supabase.auth.signInWithPassword({
                email: user.email!,
                password: oldAuthHash,
            })
            if (verifyError) throw new Error("Current password is incorrect")

            // Generate new salt and derive new keys
            const newSalt = generateSalt()
            const newSaltBase64 = arrayToBase64(newSalt)
            const newAuthHash = await deriveAuthHash(newPw, newSalt)
            const newKey = await deriveKey(newPw, newSalt)

            // Re-encrypt all vault items
            if (masterKey) {
                const { data: vault } = await supabase
                    .from("vaults")
                    .select("items")
                    .eq("user_id", user.id)
                    .maybeSingle()

                const items = (vault?.items as any[]) || []

                if (items.length > 0) {
                    const decryptField = async (stored: string) => {
                        if (!stored) return ""
                        const [iv, ciphertext] = stored.split(":")
                        if (!iv || !ciphertext) return stored
                        return decrypt(ciphertext, iv, masterKey)
                    }

                    const encryptField = async (text: string) => {
                        if (!text) return ""
                        const { ciphertext, iv } = await encrypt(text, newKey)
                        return `${iv}:${ciphertext}`
                    }

                    const reEncryptedItems = await Promise.all(
                        items.map(async (item: any) => ({
                            ...item,
                            website: await encryptField(await decryptField(item.website)),
                            username: await encryptField(await decryptField(item.username)),
                            password: await encryptField(await decryptField(item.password)),
                            notes: await encryptField(await decryptField(item.notes || "")),
                        }))
                    )

                    await supabase
                        .from("vaults")
                        .upsert({
                            user_id: user.id,
                            items: reEncryptedItems,
                            updated_at: new Date().toISOString(),
                        })
                }
            }

            // Update Supabase auth password
            await supabase.auth.updateUser({ password: newAuthHash })

            // Update profile salt
            await supabase
                .from("profiles")
                .update({ master_password_salt: newSaltBase64 })
                .eq("id", user.id)

            // Close dialog and reset
            setChangePwOpen(false)
            setCurrentPw("")
            setNewPw("")
            setConfirmPw("")
            queryClient.invalidateQueries({ queryKey: ["profile-full"] })
        } catch (err: any) {
            setChangePwError(err.message || "Failed to change password")
        } finally {
            setChangePwLoading(false)
        }
    }, [currentPw, newPw, confirmPw, masterKey, queryClient])

    // ── Export Vault Handler ──────────────────────────────────────
    const handleExportVault = useCallback(async () => {
        if (!masterKey) return
        setExportLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const { data: vault } = await supabase
                .from("vaults")
                .select("items")
                .eq("user_id", user.id)
                .maybeSingle()

            const items = (vault?.items as any[]) || []
            if (items.length === 0) throw new Error("No items found")

            const decrypted = await Promise.all(
                items.map(async (item: any) => {
                    const decryptField = async (stored: string) => {
                        if (!stored) return ""
                        const [iv, ciphertext] = stored.split(":")
                        if (!iv || !ciphertext) return stored
                        return decrypt(ciphertext, iv, masterKey)
                    }
                    return {
                        website: await decryptField(item.website),
                        username: await decryptField(item.username),
                        password: await decryptField(item.password),
                        notes: await decryptField(item.notes || ""),
                        favorite: item.favorite,
                        created_at: item.created_at,
                    }
                })
            )

            const exportData = {
                version: 1,
                exported_at: new Date().toISOString(),
                item_count: decrypted.length,
                items: decrypted,
            }

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `paxx-vault-export-${new Date().toISOString().slice(0, 10)}.json`
            a.click()
            URL.revokeObjectURL(url)
        } catch (err: any) {
            console.error("Export failed:", err)
        } finally {
            setExportLoading(false)
        }
    }, [masterKey])

    // ── Import Vault Handler ──────────────────────────────────────
    const handleImportVault = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !masterKey) return
        setImportLoading(true)
        try {
            const text = await file.text()
            const data = JSON.parse(text)

            if (!data.items || !Array.isArray(data.items)) {
                throw new Error("Invalid export file format")
            }

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            // Read existing items from vaults
            const { data: vault } = await supabase
                .from("vaults")
                .select("items")
                .eq("user_id", user.id)
                .maybeSingle()

            const existingItems = (vault?.items as any[]) || []

            const encryptField = async (text: string) => {
                if (!text) return ""
                const { ciphertext, iv } = await encrypt(text, masterKey)
                return `${iv}:${ciphertext}`
            }

            const newItems = await Promise.all(
                data.items.map(async (item: any) => {
                    const now = new Date().toISOString()
                    return {
                        id: crypto.randomUUID(),
                        website: await encryptField(item.website || ""),
                        username: await encryptField(item.username || ""),
                        password: await encryptField(item.password || ""),
                        notes: await encryptField(item.notes || ""),
                        favorite: item.favorite || false,
                        category: item.category || "other",
                        deleted_at: null,
                        created_at: item.created_at || now,
                        updated_at: now,
                    }
                })
            )

            await supabase
                .from("vaults")
                .upsert({
                    user_id: user.id,
                    items: [...existingItems, ...newItems],
                    updated_at: new Date().toISOString(),
                })

            queryClient.invalidateQueries({ queryKey: ["vault-items"] })
        } catch (err: any) {
            console.error("Import failed:", err)
        } finally {
            setImportLoading(false)
            e.target.value = ""
        }
    }, [masterKey, queryClient])

    // ── Clear Vault Handler ───────────────────────────────────────
    const handleClearVault = useCallback(async () => {
        setClearLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            await supabase
                .from("vaults")
                .upsert({
                    user_id: user.id,
                    items: [],
                    updated_at: new Date().toISOString(),
                })
            queryClient.invalidateQueries({ queryKey: ["vault-items"] })
            setClearVaultOpen(false)
        } catch (err: any) {
            console.error("Clear vault failed:", err)
        } finally {
            setClearLoading(false)
        }
    }, [queryClient])

    // ── Delete Account Handler ────────────────────────────────────
    const handleDeleteAccount = useCallback(async () => {
        if (deleteConfirmText !== "DELETE") return
        setDeleteLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            // Delete vault first
            await supabase.from("vaults").delete().eq("user_id", user.id)
            // Delete profile
            await supabase.from("profiles").delete().eq("id", user.id)
            // Sign out
            await signOut()
        } catch (err: any) {
            console.error("Delete account failed:", err)
        } finally {
            setDeleteLoading(false)
        }
    }, [deleteConfirmText, signOut])

    // ── Logout All Sessions Handler ───────────────────────────────
    const handleLogoutAll = useCallback(async () => {
        await supabase.auth.signOut({ scope: "global" })
        window.location.href = "/login"
    }, [])

    return (
        <div className="flex flex-1 flex-col gap-6 pb-10">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account, security, and preferences
                </p>
            </div>

            {/* ═══ Section 1: Account ═══════════════════════════════ */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <SectionIcon icon={User} color="bg-blue-600" />
                        <div>
                            <CardTitle>Account</CardTitle>
                            <CardDescription>Your profile and session information</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Profile info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Email</Label>
                            <p className="text-sm font-medium">{profile?.email || "Loading..."}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Username</Label>
                            <p className="text-sm font-medium">{profile?.username || "Loading..."}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Last Sign In</Label>
                            <p className="text-sm font-medium">
                                {profile?.lastSignIn
                                    ? new Date(profile.lastSignIn).toLocaleString()
                                    : "—"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Account Type</Label>
                            <p className="text-sm font-medium">
                                {profile?.is_admin ? "Administrator" : "Standard User"}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Active Sessions (simulated) */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-sm font-semibold">Active Sessions</h3>
                            <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                Simulated
                            </span>
                        </div>
                        <div className="space-y-2">
                            {SIMULATED_SESSIONS.map((session, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                                            {session.device.includes("iPhone") ? (
                                                <Smartphone className="size-4" />
                                            ) : (
                                                <Monitor className="size-4" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{session.device}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {session.location}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {session.current ? (
                                            <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                                                Current
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                {session.lastActive}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={handleLogoutAll}
                        >
                            Logout All Sessions
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ═══ Section 2: Security ══════════════════════════════ */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <SectionIcon icon={Shield} color="bg-emerald-600" />
                        <div>
                            <CardTitle>Security</CardTitle>
                            <CardDescription>Vault protection and authentication settings</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Auto-lock timeout */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="size-4 text-muted-foreground" />
                            <Label className="text-sm font-medium">Auto-Lock Timeout</Label>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                            Automatically lock your vault after inactivity
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {TIMEOUT_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setLockTimeout(option.value)}
                                    className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                                        lockTimeout === option.value
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border bg-background hover:bg-muted"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Require master password to view */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <Eye className="size-4 text-muted-foreground" />
                                <Label className="text-sm font-medium">Require password to reveal</Label>
                            </div>
                            <p className="text-xs text-muted-foreground ml-6">
                                Ask for master password before showing passwords
                            </p>
                        </div>
                        <Switch
                            checked={settings["require-password-to-view"]}
                            onCheckedChange={(v) => updateSetting("require-password-to-view", v)}
                        />
                    </div>

                    {/* Require master password to copy */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <Clipboard className="size-4 text-muted-foreground" />
                                <Label className="text-sm font-medium">Require password to copy</Label>
                            </div>
                            <p className="text-xs text-muted-foreground ml-6">
                                Ask for master password before copying to clipboard
                            </p>
                        </div>
                        <Switch
                            checked={settings["require-password-to-copy"]}
                            onCheckedChange={(v) => updateSetting("require-password-to-copy", v)}
                        />
                    </div>

                    <Separator />

                    {/* Change Master Password */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <KeyRound className="size-4 text-muted-foreground" />
                                <Label className="text-sm font-medium">Change Master Password</Label>
                            </div>
                            <p className="text-xs text-muted-foreground ml-6">
                                Update your master password and re-encrypt all vault items
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setChangePwOpen(true)}>
                            Change
                        </Button>
                    </div>

                    <Separator />

                    {/* 2FA Toggle (simulated) */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <Smartphone className="size-4 text-muted-foreground" />
                                <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                                <ComingSoonBadge />
                            </div>
                            <p className="text-xs text-muted-foreground ml-6">
                                Add an extra layer of security with TOTP
                            </p>
                        </div>
                        <Switch disabled />
                    </div>

                    {/* Biometric (simulated) */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <Fingerprint className="size-4 text-muted-foreground" />
                                <Label className="text-sm font-medium">Biometric Unlock</Label>
                                <ComingSoonBadge />
                            </div>
                            <p className="text-xs text-muted-foreground ml-6">
                                Use fingerprint or face recognition to unlock
                            </p>
                        </div>
                        <Switch disabled />
                    </div>
                </CardContent>
            </Card>

            {/* ═══ Section 3: Vault Preferences ═════════════════════ */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <SectionIcon icon={Lock} color="bg-violet-600" />
                        <div>
                            <CardTitle>Vault Preferences</CardTitle>
                            <CardDescription>Default views and password generation</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Default View */}
                    <div>
                        <Label className="text-sm font-medium mb-3 block">Default View</Label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => updateSetting("vault-view", "list")}
                                className={`flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                                    settings["vault-view"] === "list"
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-background hover:bg-muted"
                                }`}
                            >
                                <LayoutList className="size-4" />
                                List
                            </button>
                            <button
                                onClick={() => updateSetting("vault-view", "grid")}
                                className={`flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                                    settings["vault-view"] === "grid"
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-background hover:bg-muted"
                                }`}
                            >
                                <LayoutGrid className="size-4" />
                                Grid
                            </button>
                        </div>
                    </div>

                    <Separator />

                    {/* Password Generator Defaults */}
                    <div>
                        <Label className="text-sm font-medium mb-3 block">Password Generator Defaults</Label>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">Length</span>
                                    <span className="text-sm font-mono font-medium">
                                        {settings["password-gen-length"]}
                                    </span>
                                </div>
                                <Slider
                                    value={[settings["password-gen-length"]]}
                                    onValueChange={([v]) => updateSetting("password-gen-length", v)}
                                    min={8}
                                    max={64}
                                    step={1}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Include uppercase</span>
                                <Switch
                                    checked={settings["password-gen-uppercase"]}
                                    onCheckedChange={(v) => updateSetting("password-gen-uppercase", v)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Include numbers</span>
                                <Switch
                                    checked={settings["password-gen-numbers"]}
                                    onCheckedChange={(v) => updateSetting("password-gen-numbers", v)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Include symbols</span>
                                <Switch
                                    checked={settings["password-gen-symbols"]}
                                    onCheckedChange={(v) => updateSetting("password-gen-symbols", v)}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Clipboard Auto-Clear */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Clipboard className="size-4 text-muted-foreground" />
                            <Label className="text-sm font-medium">Clipboard Auto-Clear</Label>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                            Automatically clear clipboard after copying a password
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {CLIPBOARD_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => updateSetting("clipboard-clear-timer", option.value)}
                                    className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                                        settings["clipboard-clear-timer"] === option.value
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border bg-background hover:bg-muted"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ═══ Section 4: Appearance ═════════════════════════════ */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <SectionIcon icon={Palette} color="bg-pink-600" />
                        <div>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Theme and display preferences</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Theme */}
                    <div>
                        <Label className="text-sm font-medium mb-3 block">Theme</Label>
                        <div className="flex gap-2">
                            {[
                                { value: "light", label: "Light", icon: Sun },
                                { value: "dark", label: "Dark", icon: Moon },
                                { value: "system", label: "System", icon: Laptop },
                            ].map((t) => (
                                <button
                                    key={t.value}
                                    onClick={() => setTheme(t.value)}
                                    className={`flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                                        theme === t.value
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border bg-background hover:bg-muted"
                                    }`}
                                >
                                    <t.icon className="size-4" />
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Compact Mode */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-medium">Compact Mode</Label>
                            <p className="text-xs text-muted-foreground">
                                Reduce spacing for a denser layout
                            </p>
                        </div>
                        <Switch
                            checked={settings["compact-mode"]}
                            onCheckedChange={(v) => updateSetting("compact-mode", v)}
                        />
                    </div>

                    {/* Reduce Motion */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-medium">Reduce Motion</Label>
                            <p className="text-xs text-muted-foreground">
                                Minimize animations throughout the app
                            </p>
                        </div>
                        <Switch
                            checked={settings["reduce-motion"]}
                            onCheckedChange={(v) => updateSetting("reduce-motion", v)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* ═══ Section 5: Data Management ═══════════════════════ */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <SectionIcon icon={Database} color="bg-amber-600" />
                        <div>
                            <CardTitle>Data Management</CardTitle>
                            <CardDescription>Export, import, and backup your vault</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Button
                            variant="outline"
                            className="justify-start gap-2"
                            onClick={handleExportVault}
                            disabled={exportLoading || !masterKey}
                        >
                            <Download className="size-4" />
                            {exportLoading ? "Exporting..." : "Export Vault"}
                        </Button>

                        <Button
                            variant="outline"
                            className="justify-start gap-2 relative"
                            disabled={importLoading || !masterKey}
                            asChild
                        >
                            <label>
                                <Upload className="size-4" />
                                {importLoading ? "Importing..." : "Import Vault"}
                                <input
                                    type="file"
                                    accept=".json"
                                    className="absolute inset-0 cursor-pointer opacity-0"
                                    onChange={handleImportVault}
                                    disabled={importLoading || !masterKey}
                                />
                            </label>
                        </Button>

                        <Button
                            variant="outline"
                            className="justify-start gap-2"
                            onClick={handleExportVault}
                            disabled={exportLoading || !masterKey}
                        >
                            <Download className="size-4" />
                            {exportLoading ? "Downloading..." : "Download Backup"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ═══ Section 6: Notifications ═════════════════════════ */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <SectionIcon icon={Bell} color="bg-cyan-600" />
                        <div>
                            <CardTitle>
                                Notifications
                                <span className="ml-2 inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                    Simulated for demo
                                </span>
                            </CardTitle>
                            <CardDescription>Configure security and activity alerts</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-medium">Security Alerts</Label>
                            <p className="text-xs text-muted-foreground">
                                Notify on suspicious activity
                            </p>
                        </div>
                        <Switch
                            checked={settings["security-alerts"]}
                            onCheckedChange={(v) => updateSetting("security-alerts", v)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-medium">New Login Alerts</Label>
                            <p className="text-xs text-muted-foreground">
                                Notify when signing in from a new device
                            </p>
                        </div>
                        <Switch
                            checked={settings["login-alerts"]}
                            onCheckedChange={(v) => updateSetting("login-alerts", v)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-medium">Breach Notifications</Label>
                            <p className="text-xs text-muted-foreground">
                                Alert if your credentials appear in a data breach
                            </p>
                        </div>
                        <Switch
                            checked={settings["breach-alerts"]}
                            onCheckedChange={(v) => updateSetting("breach-alerts", v)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-medium">Weekly Security Report</Label>
                            <p className="text-xs text-muted-foreground">
                                Receive a weekly summary of your vault security
                            </p>
                        </div>
                        <Switch
                            checked={settings["weekly-report"]}
                            onCheckedChange={(v) => updateSetting("weekly-report", v)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* ═══ Section 7: Danger Zone ═══════════════════════════ */}
            <Card className="border-red-500/30">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <SectionIcon icon={AlertTriangle} color="bg-red-600" />
                        <div>
                            <CardTitle className="text-red-500">Danger Zone</CardTitle>
                            <CardDescription>Irreversible actions — proceed with caution</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-red-500/20 px-4 py-3">
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium">Clear All Vault Data</p>
                            <p className="text-xs text-muted-foreground">
                                Permanently delete all saved passwords
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                            onClick={() => setClearVaultOpen(true)}
                        >
                            <Trash2 className="size-4 mr-1" />
                            Clear
                        </Button>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-red-500/20 px-4 py-3">
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium">Reset Vault Encryption</p>
                            <p className="text-xs text-muted-foreground">
                                Re-generate encryption keys and re-encrypt all items
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                            onClick={() => setResetEncryptionOpen(true)}
                        >
                            <RefreshCw className="size-4 mr-1" />
                            Reset
                        </Button>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-red-500/20 px-4 py-3">
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium">Delete Account</p>
                            <p className="text-xs text-muted-foreground">
                                Permanently delete your account and all data
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                            onClick={() => setDeleteAccountOpen(true)}
                        >
                            <Trash2 className="size-4 mr-1" />
                            Delete
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ═══ Dialogs ══════════════════════════════════════════ */}

            {/* Change Master Password Dialog */}
            <Dialog open={changePwOpen} onOpenChange={(open) => {
                setChangePwOpen(open)
                if (!open) {
                    setCurrentPw("")
                    setNewPw("")
                    setConfirmPw("")
                    setChangePwError(null)
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Master Password</DialogTitle>
                        <DialogDescription>
                            This will re-encrypt all vault items with your new password.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="current-pw">Current Master Password</Label>
                            <div className="relative">
                                <Input
                                    id="current-pw"
                                    type={showCurrentPw ? "text" : "password"}
                                    value={currentPw}
                                    onChange={(e) => setCurrentPw(e.target.value)}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showCurrentPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-pw">New Master Password</Label>
                            <div className="relative">
                                <Input
                                    id="new-pw"
                                    type={showNewPw ? "text" : "password"}
                                    value={newPw}
                                    onChange={(e) => setNewPw(e.target.value)}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPw(!showNewPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showNewPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                            <StrengthMeter password={newPw} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-pw">Confirm New Password</Label>
                            <Input
                                id="confirm-pw"
                                type="password"
                                value={confirmPw}
                                onChange={(e) => setConfirmPw(e.target.value)}
                            />
                            {confirmPw && newPw !== confirmPw && (
                                <p className="text-xs text-red-500">Passwords do not match</p>
                            )}
                        </div>
                        {changePwError && (
                            <p className="text-sm text-red-500">{changePwError}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setChangePwOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleChangeMasterPassword}
                            disabled={changePwLoading || !currentPw || !newPw || !confirmPw}
                        >
                            {changePwLoading ? "Updating..." : "Update Password"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Clear Vault Dialog */}
            <Dialog open={clearVaultOpen} onOpenChange={setClearVaultOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clear All Vault Data</DialogTitle>
                        <DialogDescription>
                            This will permanently delete all saved passwords. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setClearVaultOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleClearVault}
                            disabled={clearLoading}
                        >
                            {clearLoading ? "Clearing..." : "Clear All Data"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Account Dialog */}
            <Dialog open={deleteAccountOpen} onOpenChange={(open) => {
                setDeleteAccountOpen(open)
                if (!open) setDeleteConfirmText("")
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Account</DialogTitle>
                        <DialogDescription>
                            This will permanently delete your account, vault data, and all associated information.
                            Type <strong>DELETE</strong> to confirm.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <Input
                            placeholder="Type DELETE to confirm"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteAccountOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirmText !== "DELETE" || deleteLoading}
                        >
                            {deleteLoading ? "Deleting..." : "Delete Account"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reset Encryption Dialog */}
            <Dialog open={resetEncryptionOpen} onOpenChange={setResetEncryptionOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset Vault Encryption</DialogTitle>
                        <DialogDescription>
                            This will generate a new encryption salt and re-encrypt all vault items.
                            You will need to re-enter your master password after this operation.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setResetEncryptionOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={async () => {
                                if (!masterKey) return
                                try {
                                    const { data: { user } } = await supabase.auth.getUser()
                                    if (!user) return

                                    // This would require the user's current master password
                                    // For now, close the dialog since re-encryption needs the plain password
                                    setResetEncryptionOpen(false)
                                    setChangePwOpen(true) // Redirect to change password flow
                                } catch (err) {
                                    console.error("Reset encryption failed:", err)
                                }
                            }}
                        >
                            Continue to Change Password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
