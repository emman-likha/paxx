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
import { Clock, Star, Copy, MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from "lucide-react"

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

function timeAgo(dateStr: string): string {
    const now = Date.now()
    const then = new Date(dateStr).getTime()
    const diff = now - then
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString()
}

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
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10"></TableHead>
                                <TableHead>Website</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Password</TableHead>
                                <TableHead>Modified</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentItems.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <button
                                            onClick={() => toggleFavorite.mutate({ id: item.id, favorite: !item.favorite })}
                                            className={item.favorite ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"}
                                        >
                                            <Star className="size-4" fill={item.favorite ? "currentColor" : "none"} />
                                        </button>
                                    </TableCell>
                                    <TableCell className="font-medium">{item.website}</TableCell>
                                    <TableCell>{item.username}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <PasswordCell password={item.password} />
                                            <button onClick={() => copyToClipboard(item.password)} className="text-muted-foreground hover:text-foreground" title="Copy">
                                                <Copy className="size-3.5" />
                                            </button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {timeAgo(item.updated_at || item.created_at)}
                                        </span>
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
