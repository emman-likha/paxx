"use client"

import { useState, useCallback } from "react"
import { useVault, type VaultItem } from "@/hooks/use-vault"
import { useSettings } from "@/hooks/use-settings"
import { VaultItemForm } from "@/components/vault-item-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Star } from "lucide-react"

import { VaultView } from "@/components/vault-view"

export default function FavoritesPage() {
    const { items, updateItem, deleteItem, toggleFavorite } = useVault()
    const { settings } = useSettings()
    const [search, setSearch] = useState("")
    const [editingItem, setEditingItem] = useState<VaultItem | null>(null)

    const favorites = items.filter((i) => i.favorite)
    const filtered = favorites.filter((item) => {
        const q = search.toLowerCase()
        return item.website.toLowerCase().includes(q) || item.username.toLowerCase().includes(q)
    })

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
                <h1 className="text-3xl font-bold">Favorites</h1>
                <p className="text-muted-foreground">
                    Your starred passwords for quick access
                </p>
            </div>

            {favorites.length > 0 && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search favorites..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            )}

            {favorites.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed">
                    <div className="flex flex-col items-center gap-1 text-center">
                        <Star className="size-10 text-muted-foreground mb-2" />
                        <h3 className="text-2xl font-bold tracking-tight">No favorites yet</h3>
                        <p className="text-sm text-muted-foreground">
                            Star passwords from your vault to see them here.
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
                open={!!editingItem}
                onOpenChange={(open) => { if (!open) setEditingItem(null) }}
                item={editingItem}
                onSubmit={handleEdit}
                isSubmitting={updateItem.isPending}
            />
        </div>
    )
}
