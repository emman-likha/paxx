"use client"

import { useState } from "react"
import { useVault } from "@/hooks/use-vault"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Search, Trash2, RotateCcw, AlertTriangle } from "lucide-react"

export default function TrashPage() {
    const { trashedItems, restoreItem, permanentDeleteItem, emptyTrash } = useVault()
    const [search, setSearch] = useState("")
    const [emptyDialogOpen, setEmptyDialogOpen] = useState(false)

    const filtered = trashedItems.filter((item) => {
        const q = search.toLowerCase()
        return item.website.toLowerCase().includes(q) || item.username.toLowerCase().includes(q)
    })

    return (
        <div className="flex flex-1 flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Trash</h1>
                    <p className="text-muted-foreground">
                        Deleted items — restore or permanently remove
                    </p>
                </div>
                {trashedItems.length > 0 && (
                    <Button
                        variant="outline"
                        className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                        onClick={() => setEmptyDialogOpen(true)}
                    >
                        <Trash2 className="size-4 mr-2" />
                        Empty Trash
                    </Button>
                )}
            </div>

            {trashedItems.length > 0 && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search trash..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            )}

            {trashedItems.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed">
                    <div className="flex flex-col items-center gap-1 text-center">
                        <Trash2 className="size-10 text-muted-foreground mb-2" />
                        <h3 className="text-2xl font-bold tracking-tight">Trash is empty</h3>
                        <p className="text-sm text-muted-foreground">
                            Deleted passwords will appear here for recovery.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Website</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Deleted</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((item) => (
                                <TableRow key={item.id} className="opacity-70">
                                    <TableCell className="font-medium">{item.website}</TableCell>
                                    <TableCell>{item.username}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {item.deleted_at
                                            ? new Date(item.deleted_at).toLocaleDateString()
                                            : "—"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => restoreItem.mutate(item.id)}
                                                title="Restore"
                                            >
                                                <RotateCcw className="size-4 mr-1" />
                                                Restore
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => permanentDeleteItem.mutate(item.id)}
                                                title="Delete permanently"
                                            >
                                                <Trash2 className="size-4 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Empty Trash Dialog */}
            <Dialog open={emptyDialogOpen} onOpenChange={setEmptyDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="size-5 text-red-500" />
                            Empty Trash
                        </DialogTitle>
                        <DialogDescription>
                            This will permanently delete {trashedItems.length} item{trashedItems.length !== 1 ? "s" : ""}.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEmptyDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                emptyTrash.mutate()
                                setEmptyDialogOpen(false)
                            }}
                        >
                            Empty Trash
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
