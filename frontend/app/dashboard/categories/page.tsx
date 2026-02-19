"use client"

import { useState, useCallback } from "react"
import { useVault, VAULT_CATEGORIES, type VaultItem, type VaultCategory } from "@/hooks/use-vault"
import { useSettings } from "@/hooks/use-settings"
import { VaultItemForm } from "@/components/vault-item-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Search, Star, Copy, MoreHorizontal, Pencil, Trash2, Eye, EyeOff,
    Users, Briefcase, Landmark, ShoppingCart, Tv, Plane, Heart, GraduationCap, FolderOpen,
} from "lucide-react"

const CATEGORY_ICONS: Record<VaultCategory, React.ComponentType<{ className?: string }>> = {
    social: Users,
    work: Briefcase,
    finance: Landmark,
    shopping: ShoppingCart,
    entertainment: Tv,
    travel: Plane,
    health: Heart,
    education: GraduationCap,
    other: FolderOpen,
}

const CATEGORY_COLORS: Record<VaultCategory, string> = {
    social: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    work: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    finance: "bg-green-500/10 text-green-500 border-green-500/20",
    shopping: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    entertainment: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    travel: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    health: "bg-red-500/10 text-red-500 border-red-500/20",
    education: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    other: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

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

export default function CategoriesPage() {
    const { items, updateItem, deleteItem, toggleFavorite } = useVault()
    const { settings } = useSettings()
    const [selectedCategory, setSelectedCategory] = useState<VaultCategory | "all">("all")
    const [search, setSearch] = useState("")
    const [editingItem, setEditingItem] = useState<VaultItem | null>(null)

    // Count items per category
    const categoryCounts = VAULT_CATEGORIES.map((cat) => ({
        ...cat,
        count: items.filter((i) => i.category === cat.value).length,
    }))

    const filtered = items
        .filter((i) => selectedCategory === "all" || i.category === selectedCategory)
        .filter((item) => {
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
                <h1 className="text-3xl font-bold">Categories</h1>
                <p className="text-muted-foreground">
                    Browse passwords organized by category
                </p>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                <button
                    onClick={() => setSelectedCategory("all")}
                    className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                        selectedCategory === "all"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted"
                    }`}
                >
                    <p className="text-sm font-medium">All</p>
                    <p className="text-2xl font-bold">{items.length}</p>
                </button>
                {categoryCounts.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat.value]
                    return (
                        <button
                            key={cat.value}
                            onClick={() => setSelectedCategory(cat.value)}
                            className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                                selectedCategory === cat.value
                                    ? `border-primary bg-primary/5`
                                    : "border-border hover:bg-muted"
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Icon className="size-4 text-muted-foreground" />
                                <p className="text-sm font-medium">{cat.label}</p>
                            </div>
                            <p className="text-2xl font-bold">{cat.count}</p>
                        </button>
                    )
                })}
            </div>

            {/* Search */}
            {filtered.length > 0 && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search in category..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            )}

            {/* Items Table */}
            {filtered.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed">
                    <div className="flex flex-col items-center gap-1 text-center">
                        <FolderOpen className="size-10 text-muted-foreground mb-2" />
                        <h3 className="text-2xl font-bold tracking-tight">No items</h3>
                        <p className="text-sm text-muted-foreground">
                            {selectedCategory === "all"
                                ? "Add passwords to see them organized by category."
                                : `No passwords in the ${selectedCategory} category.`}
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
                                <TableHead>Category</TableHead>
                                <TableHead>Password</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((item) => {
                                const CatIcon = CATEGORY_ICONS[item.category]
                                return (
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
                                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[item.category]}`}>
                                                <CatIcon className="size-3" />
                                                {VAULT_CATEGORIES.find((c) => c.value === item.category)?.label}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <PasswordCell password={item.password} />
                                                <button onClick={() => copyToClipboard(item.password)} className="text-muted-foreground hover:text-foreground" title="Copy">
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
                                )
                            })}
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
