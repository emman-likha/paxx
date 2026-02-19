"use client"

import { useState, useCallback } from "react"
import { useVault, type VaultItem, type VaultCategory } from "@/hooks/use-vault"
import { useMasterKey } from "@/hooks/use-master-key"
import { useSettings } from "@/hooks/use-settings"
import { VaultItemForm } from "@/components/vault-item-form"
import { UnlockPrompt } from "@/components/unlock-prompt"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search } from "lucide-react"

import { VaultView } from "@/components/vault-view"

export default function DashboardPage() {
    const { needsUnlock } = useMasterKey()
    const { items, isLoading, addItem, updateItem, deleteItem, toggleFavorite } = useVault()
    const { settings } = useSettings()
    const [search, setSearch] = useState("")
    const [formOpen, setFormOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<VaultItem | null>(null)

    const filtered = items.filter((item) => {
        const q = search.toLowerCase()
        return (
            item.website.toLowerCase().includes(q) ||
            item.username.toLowerCase().includes(q)
        )
    })

    const handleAdd = (data: { website: string; username: string; password: string; notes: string; category?: VaultCategory }) => {
        addItem.mutate(data, { onSuccess: () => setFormOpen(false) })
    }

    const handleEdit = (data: { website: string; username: string; password: string; notes: string; category?: VaultCategory }) => {
        if (!editingItem) return
        updateItem.mutate({ id: editingItem.id, ...data }, {
            onSuccess: () => setEditingItem(null),
        })
    }

    const copyToClipboard = useCallback((text: string) => {
        navigator.clipboard.writeText(text)
        const timer = settings["clipboard-clear-timer"]
        if (timer > 0) {
            setTimeout(() => {
                navigator.clipboard.writeText("")
            }, timer)
        }
    }, [settings])

    if (needsUnlock) return <UnlockPrompt />

    return (
        <div className="flex flex-1 flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">All Passwords</h1>
                    <p className="text-muted-foreground">
                        Manage your secure passwords
                    </p>
                </div>
                <Button onClick={() => setFormOpen(true)}>
                    <Plus className="size-4 mr-2" />
                    Add Password
                </Button>
            </div>

            {items.length > 0 && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search passwords..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            )}

            {isLoading ? (
                <div className="flex flex-1 items-center justify-center">
                    <p className="text-muted-foreground">Loading vault...</p>
                </div>
            ) : items.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed">
                    <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-2xl font-bold tracking-tight">
                            No passwords yet
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Add your first password to get started!
                        </p>
                    </div>
                </div>
            ) : (
                <VaultView
                    items={filtered}
                    onCopy={copyToClipboard}
                    onEdit={setEditingItem}
                    onDelete={(id) => deleteItem.mutate(id)}
                    onToggleFavorite={(id, favorite) => toggleFavorite.mutate({ id, favorite })}
                />
            )}

            <VaultItemForm
                open={formOpen}
                onOpenChange={setFormOpen}
                onSubmit={handleAdd}
                isSubmitting={addItem.isPending}
            />

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
