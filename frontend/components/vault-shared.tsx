"use client"

import { useState } from "react"
import { Eye, EyeOff, Check, Copy } from "lucide-react"

export function PasswordCell({ password }: { password: string }) {
    const [visible, setVisible] = useState(false)

    return (
        <div className="flex items-center gap-2">
            <span className="font-mono text-sm leading-none pt-0.5">
                {visible ? password : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
            </span>
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    setVisible(!visible)
                }}
                className="text-muted-foreground hover:text-foreground outline-none"
            >
                {visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
        </div>
    )
}

export function CopyButton({ text, onCopy }: { text: string; onCopy: (t: string) => void }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation()
        onCopy(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    return (
        <button
            onClick={handleCopy}
            className="text-muted-foreground hover:text-foreground outline-none"
            title="Copy password"
        >
            {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
        </button>
    )
}

export function timeAgo(dateStr: string): string {
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

export function ensureAbsoluteUrl(url: string): string {
    if (!url) return "#"
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url
    }
    return `https://${url}`
}
