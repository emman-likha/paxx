"use client"

import { useMemo } from "react"
import { useVault } from "@/hooks/use-vault"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Activity, Plus, Pencil, Trash2, Star, Clock, Shield,
} from "lucide-react"

interface ActivityEvent {
    id: string
    type: "created" | "updated" | "deleted" | "favorited"
    website: string
    timestamp: string
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
    if (days < 30) return `${Math.floor(days / 7)}w ago`
    return new Date(dateStr).toLocaleDateString()
}

const EVENT_CONFIG = {
    created: { icon: Plus, color: "text-green-500 bg-green-500/10", label: "Added" },
    updated: { icon: Pencil, color: "text-blue-500 bg-blue-500/10", label: "Updated" },
    deleted: { icon: Trash2, color: "text-red-500 bg-red-500/10", label: "Deleted" },
    favorited: { icon: Star, color: "text-yellow-500 bg-yellow-500/10", label: "Starred" },
}

export default function ActivityPage() {
    const { items, trashedItems } = useVault()

    // Generate activity timeline from vault data
    const events = useMemo(() => {
        const all: ActivityEvent[] = []

        // Active items
        for (const item of items) {
            all.push({
                id: `${item.id}-created`,
                type: "created",
                website: item.website,
                timestamp: item.created_at,
            })
            if (item.updated_at && item.updated_at !== item.created_at) {
                all.push({
                    id: `${item.id}-updated`,
                    type: "updated",
                    website: item.website,
                    timestamp: item.updated_at,
                })
            }
            if (item.favorite) {
                all.push({
                    id: `${item.id}-favorited`,
                    type: "favorited",
                    website: item.website,
                    timestamp: item.updated_at || item.created_at,
                })
            }
        }

        // Trashed items
        for (const item of trashedItems) {
            all.push({
                id: `${item.id}-created`,
                type: "created",
                website: item.website,
                timestamp: item.created_at,
            })
            if (item.deleted_at) {
                all.push({
                    id: `${item.id}-deleted`,
                    type: "deleted",
                    website: item.website,
                    timestamp: item.deleted_at,
                })
            }
        }

        // Sort by most recent
        return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50)
    }, [items, trashedItems])

    // Group events by date
    const grouped = useMemo(() => {
        const groups: { date: string; events: ActivityEvent[] }[] = []
        for (const event of events) {
            const date = new Date(event.timestamp).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            })
            const existing = groups.find((g) => g.date === date)
            if (existing) existing.events.push(event)
            else groups.push({ date, events: [event] })
        }
        return groups
    }, [events])

    return (
        <div className="flex flex-1 flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold">Activity Log</h1>
                <p className="text-muted-foreground">
                    A timeline of changes to your vault
                </p>
            </div>

            {events.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed">
                    <div className="flex flex-col items-center gap-1 text-center">
                        <Activity className="size-10 text-muted-foreground mb-2" />
                        <h3 className="text-2xl font-bold tracking-tight">No activity yet</h3>
                        <p className="text-sm text-muted-foreground">
                            Your vault activity will be tracked here.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {grouped.map((group) => (
                        <div key={group.date}>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-3">{group.date}</h3>
                            <div className="space-y-1">
                                {group.events.map((event) => {
                                    const config = EVENT_CONFIG[event.type]
                                    const Icon = config.icon
                                    return (
                                        <div
                                            key={event.id}
                                            className="flex items-center gap-3 rounded-lg border px-4 py-2.5"
                                        >
                                            <div className={`flex size-8 items-center justify-center rounded-full ${config.color}`}>
                                                <Icon className="size-3.5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm">
                                                    <span className="font-medium">{config.label}</span>
                                                    {" "}
                                                    <span className="text-muted-foreground">{event.website}</span>
                                                </p>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {timeAgo(event.timestamp)}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
