"use client"

import { useState } from "react"
import { useMasterKey } from "@/hooks/use-master-key"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock } from "lucide-react"

export function UnlockPrompt() {
    const { unlockVault, isUnlocking } = useMasterKey()
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        try {
            await unlockVault(password)
        } catch {
            setError("Failed to unlock. Check your master password.")
        }
    }

    return (
        <div className="flex flex-1 items-center justify-center">
            <form onSubmit={handleUnlock} className="flex flex-col items-center gap-4 w-full max-w-sm">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <Lock className="size-6 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold">Unlock Your Vault</h2>
                <p className="text-sm text-muted-foreground text-center">
                    Enter your master password to decrypt your saved credentials.
                </p>
                <Input
                    type="password"
                    placeholder="Master password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    required
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isUnlocking}>
                    {isUnlocking ? "Unlocking..." : "Unlock"}
                </Button>
            </form>
        </div>
    )
}
