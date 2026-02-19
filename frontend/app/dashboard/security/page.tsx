"use client"

import { useMemo } from "react"
import { useVault } from "@/hooks/use-vault"
import { validatePasswordStrength } from "@/lib/password-validator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    Shield, AlertTriangle, CheckCircle2, XCircle, Copy, RefreshCw, Lock,
} from "lucide-react"

function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
    const radius = (size - 16) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference
    const color = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : score >= 40 ? "#f97316" : "#ef4444"

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
                <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth="8" fill="none"
                    strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                    className="transition-all duration-700"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{score}</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
        </div>
    )
}

export default function SecurityPage() {
    const { items } = useVault()

    const analysis = useMemo(() => {
        if (items.length === 0) {
            return { score: 100, weak: [], reused: [], old: [], strong: 0, medium: 0, weakCount: 0, total: 0 }
        }

        const passwords = items.map((i) => ({ id: i.id, website: i.website, password: i.password, updatedAt: i.updated_at }))

        // Strength analysis
        let strong = 0, medium = 0, weakCount = 0
        const weak: typeof passwords = []
        for (const p of passwords) {
            const v = validatePasswordStrength(p.password)
            if (v.strength === "strong") strong++
            else if (v.strength === "medium") medium++
            else { weakCount++; weak.push(p) }
        }

        // Reuse detection
        const pwCounts = new Map<string, string[]>()
        for (const p of passwords) {
            const sites = pwCounts.get(p.password) || []
            sites.push(p.website)
            pwCounts.set(p.password, sites)
        }
        const reused = [...pwCounts.entries()]
            .filter(([, sites]) => sites.length > 1)
            .map(([pw, sites]) => ({ password: pw, sites }))

        // Old passwords (> 90 days)
        const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000
        const old = passwords.filter((p) => new Date(p.updatedAt).getTime() < ninetyDaysAgo)

        // Calculate score
        const total = passwords.length
        const strengthScore = total > 0 ? ((strong * 1 + medium * 0.6) / total) * 40 : 40
        const reuseScore = reused.length === 0 ? 30 : Math.max(0, 30 - reused.length * 10)
        const freshnessScore = total > 0 ? ((total - old.length) / total) * 30 : 30
        const score = Math.round(strengthScore + reuseScore + freshnessScore)

        return { score, weak, reused, old, strong, medium, weakCount, total }
    }, [items])

    const scoreLabel = analysis.score >= 80 ? "Excellent" : analysis.score >= 60 ? "Good" : analysis.score >= 40 ? "Fair" : "Needs Improvement"

    return (
        <div className="flex flex-1 flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold">Security Center</h1>
                <p className="text-muted-foreground">
                    Audit your vault security and find vulnerabilities
                </p>
            </div>

            {/* Overall Score */}
            <Card>
                <CardContent className="flex flex-col sm:flex-row items-center gap-8 pt-6">
                    <ScoreRing score={analysis.score} />
                    <div className="flex-1 space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold">{scoreLabel}</h2>
                            <p className="text-muted-foreground">
                                {analysis.total} passwords analyzed
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center rounded-lg border p-3">
                                <p className="text-2xl font-bold text-green-500">{analysis.strong}</p>
                                <p className="text-xs text-muted-foreground">Strong</p>
                            </div>
                            <div className="text-center rounded-lg border p-3">
                                <p className="text-2xl font-bold text-yellow-500">{analysis.medium}</p>
                                <p className="text-xs text-muted-foreground">Medium</p>
                            </div>
                            <div className="text-center rounded-lg border p-3">
                                <p className="text-2xl font-bold text-red-500">{analysis.weakCount}</p>
                                <p className="text-xs text-muted-foreground">Weak</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Weak Passwords */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="size-5 text-red-500" />
                        <div>
                            <CardTitle>Weak Passwords</CardTitle>
                            <CardDescription>
                                {analysis.weak.length === 0
                                    ? "All passwords meet strength requirements"
                                    : `${analysis.weak.length} password${analysis.weak.length !== 1 ? "s" : ""} need${analysis.weak.length === 1 ? "s" : ""} improvement`}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                {analysis.weak.length > 0 && (
                    <CardContent>
                        <div className="space-y-2">
                            {analysis.weak.map((item) => (
                                <div key={item.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <XCircle className="size-4 text-red-500" />
                                        <span className="font-medium">{item.website}</span>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href="/dashboard">
                                            <RefreshCw className="size-3.5 mr-1" /> Update
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Reused Passwords */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Copy className="size-5 text-orange-500" />
                        <div>
                            <CardTitle>Reused Passwords</CardTitle>
                            <CardDescription>
                                {analysis.reused.length === 0
                                    ? "No passwords are reused across sites"
                                    : `${analysis.reused.length} password${analysis.reused.length !== 1 ? "s" : ""} used on multiple sites`}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                {analysis.reused.length > 0 && (
                    <CardContent>
                        <div className="space-y-2">
                            {analysis.reused.map((group, i) => (
                                <div key={i} className="rounded-lg border px-4 py-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertTriangle className="size-3.5 text-orange-500" />
                                        <span className="text-sm font-medium">
                                            Same password used on {group.sites.length} sites
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {group.sites.map((site) => (
                                            <span key={site} className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs">
                                                {site}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Old Passwords */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Lock className="size-5 text-yellow-500" />
                        <div>
                            <CardTitle>Aging Passwords</CardTitle>
                            <CardDescription>
                                {analysis.old.length === 0
                                    ? "All passwords have been updated recently"
                                    : `${analysis.old.length} password${analysis.old.length !== 1 ? "s" : ""} older than 90 days`}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                {analysis.old.length > 0 && (
                    <CardContent>
                        <div className="space-y-2">
                            {analysis.old.map((item) => (
                                <div key={item.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                                    <div>
                                        <span className="font-medium">{item.website}</span>
                                        <p className="text-xs text-muted-foreground">
                                            Last updated {new Date(item.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href="/dashboard">
                                            <RefreshCw className="size-3.5 mr-1" /> Update
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* All clear message */}
            {analysis.weak.length === 0 && analysis.reused.length === 0 && analysis.old.length === 0 && analysis.total > 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
                        <CheckCircle2 className="size-12 text-green-500" />
                        <h3 className="text-xl font-bold">All Clear!</h3>
                        <p className="text-muted-foreground">
                            Your vault is in great shape. All passwords are strong, unique, and up to date.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
