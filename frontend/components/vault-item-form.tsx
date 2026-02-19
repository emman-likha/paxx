"use client"

import { useState } from "react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, RefreshCw } from "lucide-react"
import type { VaultItem } from "@/hooks/use-vault"

interface VaultItemFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    item?: VaultItem | null
    onSubmit: (data: { website: string; username: string; password: string; notes: string }) => void
    isSubmitting?: boolean
}

function generatePassword(length = 20): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+"
    const array = crypto.getRandomValues(new Uint8Array(length))
    return Array.from(array, (byte) => chars[byte % chars.length]).join("")
}

export function VaultItemForm({ open, onOpenChange, item, onSubmit, isSubmitting }: VaultItemFormProps) {
    const [website, setWebsite] = useState(item?.website ?? "")
    const [username, setUsername] = useState(item?.username ?? "")
    const [password, setPassword] = useState(item?.password ?? "")
    const [notes, setNotes] = useState(item?.notes ?? "")
    const [showPassword, setShowPassword] = useState(false)

    const isEdit = !!item

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({ website, username, password, notes })
    }

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            setWebsite("")
            setUsername("")
            setPassword("")
            setNotes("")
            setShowPassword(false)
        }
        onOpenChange(next)
    }

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{isEdit ? "Edit Password" : "Add Password"}</SheetTitle>
                    <SheetDescription>
                        {isEdit ? "Update your saved credentials." : "Save new credentials to your vault."}
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 flex-1">
                    <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                            id="website"
                            placeholder="example.com"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">Username / Email</Label>
                        <Input
                            id="username"
                            placeholder="user@example.com"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => setPassword(generatePassword())}
                                title="Generate password"
                            >
                                <RefreshCw className="size-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Input
                            id="notes"
                            placeholder="Optional notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                    <SheetFooter className="px-0 mt-auto">
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? "Saving..." : isEdit ? "Update" : "Save"}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}
