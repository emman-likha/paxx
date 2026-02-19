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
import { Search, Star, Copy, MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from "lucide-react"

function PasswordCell({ password }: { password: string }) {
    const [visible, setVisible] = useState(false)
    return (
        <div className="flex items-center gap-2">
            <span className="font-mono text-sm">
                {visible ? password : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
            </span>
            <button onClick={() => setVisible(!visible)} className="text-muted-foreground hover:text-foreground">
                {visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
        </div>
    )
}

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
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10"></TableHead>
                                <TableHead>Website</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Password</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <button
                                            onClick={() => toggleFavorite.mutate({ id: item.id, favorite: false })}
                                            className="text-yellow-500"
                                        >
                                            <Star className="size-4" fill="currentColor" />
                                        </button>
                                    </TableCell>
                                    <TableCell className="font-medium">{item.website}</TableCell>
                                    <TableCell>{item.username}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <PasswordCell password={item.password} />
                                            <button onClick={() => copyToClipboard(item.password)} className="text-muted-foreground hover:text-foreground" title="Copy password">
                                                <Copy className="size-3.5" />
                                            </button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="size-8">
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingItem(item)}>
                                                    <Pencil className="size-4 mr-2" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => deleteItem.mutate(item.id)}>
                                                    <Trash2 className="size-4 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
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
