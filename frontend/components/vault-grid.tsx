"use client"

import { Star, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PasswordCell, CopyButton, ensureAbsoluteUrl, WebsiteIcon } from "./vault-shared"
import { ExternalLink } from "lucide-react"
import type { VaultItem } from "@/hooks/use-vault"

interface VaultGridProps {
    items: VaultItem[]
    onCopy: (text: string) => void
    onEdit: (item: VaultItem) => void
    onDelete: (id: string) => void
    onToggleFavorite: (id: string, favorite: boolean) => void
}

export function VaultGrid({ items, onCopy, onEdit, onDelete, onToggleFavorite }: VaultGridProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
                <Card key={item.id} className="group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
                    <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between gap-2 overflow-hidden">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50 group-hover:bg-primary/5 overflow-hidden">
                                    <WebsiteIcon url={item.website} className="size-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <a
                                        href={ensureAbsoluteUrl(item.website)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex max-w-full items-center gap-1 font-semibold leading-tight hover:text-primary transition-colors hover:underline"
                                    >
                                        <span className="truncate" title={item.website}>{item.website}</span>
                                        <ExternalLink className="size-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </div>
                            </div>
                            <button
                                onClick={() => onToggleFavorite(item.id, !item.favorite)}
                                className={`shrink-0 transition-colors ${item.favorite ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"}`}
                            >
                                <Star className="size-4" fill={item.favorite ? "currentColor" : "none"} />
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                        <div className="mb-2 flex items-center justify-between px-1">
                            <span className="truncate text-xs text-muted-foreground" title={item.username}>
                                {item.username}
                            </span>
                            <CopyButton text={item.username} onCopy={onCopy} />
                        </div>
                        <div className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
                            <PasswordCell password={item.password} />
                            <CopyButton text={item.password} onCopy={onCopy} />
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                {item.category || "other"}
                            </span>
                            <div className="flex items-center gap-1">
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
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
