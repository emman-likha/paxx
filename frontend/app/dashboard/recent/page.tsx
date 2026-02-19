"use client"

import { useState, useCallback, useMemo } from "react"
import { useVault, type VaultItem } from "@/hooks/use-vault"
import { useSettings } from "@/hooks/use-settings"
import { VaultItemForm } from "@/components/vault-item-form"
import { Button } from "@/components/ui/button"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Clock } from "lucide-react"

import { VaultView } from "@/components/vault-view"
import { timeAgo } from "@/components/vault-shared"

export default function RecentPage() {
    const { items, updateItem, deleteItem, toggleFavorite } = useVault()
    const { settings } = useSettings()
    const [editingItem, setEditingItem] = useState<VaultItem | null>(null)

    // Sort by most recently updated/created, take top 20
    const recentItems = useMemo(() => {
        return [...items]
            .sort((a, b) => {
                const aTime = new Date(a.updated_at || a.created_at).getTime()
                const bTime = new Date(b.updated_at || b.created_at).getTime()
                return bTime - aTime
            })
            .slice(0, 20)
    }, [items])

    const handleEdit = (data: { website: string; username: string; password: string; notes: string }) => {
        if (!editingItem) return
        updateItem.mutate({ id: editingItem.id, ...data }, { onSuccess: () => setEditingItem(null) })
    }

    const copyToClipboard = useCallback((text: string) => {
        navigator.clipboard.writeText(text)
        const timer = settings["clipboard-clear-timer"]
        if (timer > 0) setTimeout(() => navigator.clipboard.writeText(""), timer)
    }, [settings])

    return (
        <div className="flex flex-1 flex-col gap-4">
            <div>
                <h1 className="text-3xl font-bold">Recent Items</h1>
                <p className="text-muted-foreground">
                    Recently added or modified passwords
                </p>
            </div>

            {recentItems.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed">
                    <div className="flex flex-col items-center gap-1 text-center">
                        <Clock className="size-10 text-muted-foreground mb-2" />
                        <h3 className="text-2xl font-bold tracking-tight">No recent items</h3>
                        <p className="text-sm text-muted-foreground">
                            Your recently added or modified passwords will appear here.
                        </p>
                    </div>
                </div>
            ) : (
                <VaultView
                    items={recentItems}
                    onCopy={copyToClipboard}
                    onEdit={setEditingItem}
                    onDelete={(id) => deleteItem.mutate(id)}
                    onToggleFavorite={(id, favorite) => toggleFavorite.mutate({ id, favorite })}
                    showTimestamp
                    timeAgo={timeAgo}
                />
            )}

            <VaultItemForm
                open={!!editingItem}
                onOpenChange={(open) => { if (!open) setEditingItem(null) }}
                item={editingItem}
                onSubmit={handleEdit}
                isSubmitting={updateItem.isPending}
            />
        </div>
    )
}
