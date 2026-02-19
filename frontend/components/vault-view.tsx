"use client"

import { useSettings } from "@/hooks/use-settings"
import { VaultGrid } from "./vault-grid"
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
import { Button } from "@/components/ui/button"
import { Star, MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react"
import { PasswordCell, CopyButton, ensureAbsoluteUrl, WebsiteIcon } from "./vault-shared"
import type { VaultItem } from "@/hooks/use-vault"

interface VaultViewProps {
    items: VaultItem[]
    onCopy: (text: string) => void
    onEdit: (item: VaultItem) => void
    onDelete: (id: string) => void
    onToggleFavorite: (id: string, favorite: boolean) => void
    showCategory?: boolean
    showTimestamp?: boolean
    timeAgo?: (dateStr: string) => string
}

export function VaultView({
    items,
    onCopy,
    onEdit,
    onDelete,
    onToggleFavorite,
    showCategory = false,
    showTimestamp = false,
    timeAgo
}: VaultViewProps) {
    const { settings } = useSettings()
    const view = settings["vault-view"] || "list"

    if (view === "grid") {
        return (
            <VaultGrid
                items={items}
                onCopy={onCopy}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
            />
        )
    }

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10"></TableHead>
                        <TableHead>Website</TableHead>
                        {showCategory && <TableHead>Category</TableHead>}
                        <TableHead>Credentials</TableHead>
                        {showTimestamp && <TableHead>Modified</TableHead>}
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id} className="group">
                            <TableCell>
                                <button
                                    onClick={() => onToggleFavorite(item.id, !item.favorite)}
                                    className={item.favorite ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"}
                                >
                                    <Star className="size-4" fill={item.favorite ? "currentColor" : "none"} />
                                </button>
                            </TableCell>
                            <TableCell className="max-w-[150px] font-medium sm:max-w-[200px] lg:max-w-[300px]">
                                <a
                                    href={ensureAbsoluteUrl(item.website)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-2.5 hover:text-primary transition-colors hover:underline"
                                >
                                    <div className="flex size-7 shrink-0 items-center justify-center rounded border bg-muted/50 overflow-hidden">
                                        <WebsiteIcon url={item.website} className="size-4" />
                                    </div>
                                    <span className="truncate" title={item.website}>{item.website}</span>
                                    <ExternalLink className="size-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            </TableCell>
                            {showCategory && (
                                <TableCell>
                                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        {item.category || "other"}
                                    </span>
                                </TableCell>
                            )}
                            <TableCell>
                                <div className="space-y-1 py-1">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground leading-none">
                                        <span className="truncate max-w-[150px]">{item.username}</span>
                                        <CopyButton text={item.username} onCopy={onCopy} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <PasswordCell password={item.password} />
                                        <CopyButton text={item.password} onCopy={onCopy} />
                                    </div>
                                </div>
                            </TableCell>
                            {showTimestamp && timeAgo && (
                                <TableCell>
                                    <span className="text-sm text-muted-foreground">
                                        {timeAgo(item.updated_at || item.created_at)}
                                    </span>
                                </TableCell>
                            )}
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="size-8">
                                            <MoreHorizontal className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(item)}>
                                            <Pencil className="size-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => onDelete(item.id)}
                                        >
                                            <Trash2 className="size-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
