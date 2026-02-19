"use client"

import { useState } from "react"
import { useVault } from "@/hooks/use-vault"
import { useMasterKey } from "@/hooks/use-master-key"
import { UnlockPrompt } from "@/components/unlock-prompt"
import { api } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, Loader2, Globe, Eye, Hash,
} from "lucide-react"

interface BreachResult {
    website: string
    username: string
    compromised: boolean
    exposures: number
}

async function sha1(text: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest("SHA-1", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export default function BreachMonitorPage() {
    const { needsUnlock } = useMasterKey()
    const { items } = useVault()
    const [scanning, setScanning] = useState(false)
    const [scanned, setScanned] = useState(false)
    const [results, setResults] = useState<BreachResult[]>([])
    const [error, setError] = useState<string | null>(null)

    const handleScan = async () => {
        setScanning(true)
        setResults([])
        setError(null)

        try {
            // SHA-1 hash passwords client-side — plaintext never leaves the browser
            const hashed = await Promise.all(
                items.map(async (item) => ({
                    id: item.id,
                    hash: await sha1(item.password),
                }))
            )

            const { results: apiResults } = await api.breach.checkPasswords(hashed)

            // Map results back to vault items
            const scanResults: BreachResult[] = apiResults.map((r) => {
                const item = items.find((i) => i.id === r.id)
                return {
                    website: item?.website || "Unknown",
                    username: item?.username || "",
                    compromised: r.compromised,
                    exposures: r.exposures,
                }
            })

            setResults(scanResults)
            setScanned(true)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to reach breach monitor service. Is the backend running?"
            )
        } finally {
            setScanning(false)
        }
    }

    const compromisedCount = results.filter((r) => r.compromised).length
    const safeCount = results.filter((r) => !r.compromised).length

    if (needsUnlock) return <UnlockPrompt />

    return (
        <div className="flex flex-1 flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold">Breach Monitor</h1>
                <p className="text-muted-foreground">
                    Check if your passwords have appeared in known data breaches
                </p>
            </div>

            {/* Error Banner */}
            {error && (
                <Card className="border-yellow-500/30">
                    <CardContent className="flex items-center gap-3 pt-6">
                        <AlertTriangle className="size-5 text-yellow-500 shrink-0" />
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Scan Card */}
            <Card>
                <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
                    {!scanned ? (
                        <>
                            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                                <ShieldAlert className="size-8 text-muted-foreground" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Scan Your Vault</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Check {items.length} saved password{items.length !== 1 ? "s" : ""} against known data breaches
                                </p>
                            </div>
                            <Button onClick={handleScan} disabled={scanning || items.length === 0} size="lg">
                                {scanning ? (
                                    <>
                                        <Loader2 className="size-4 mr-2 animate-spin" />
                                        Scanning...
                                    </>
                                ) : (
                                    <>
                                        <ShieldAlert className="size-4 mr-2" />
                                        Start Scan
                                    </>
                                )}
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                Powered by Have I Been Pwned &middot; Your passwords never leave your browser
                            </p>
                        </>
                    ) : (
                        <>
                            <div className={`flex size-16 items-center justify-center rounded-full ${compromisedCount > 0 ? "bg-red-500/10" : "bg-green-500/10"}`}>
                                {compromisedCount > 0 ? (
                                    <ShieldAlert className="size-8 text-red-500" />
                                ) : (
                                    <ShieldCheck className="size-8 text-green-500" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">
                                    {compromisedCount > 0
                                        ? `${compromisedCount} Compromised Password${compromisedCount !== 1 ? "s" : ""}`
                                        : "All Passwords Safe"}
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {safeCount} of {results.length} passwords are clean
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button onClick={handleScan} variant="outline" disabled={scanning}>
                                    <ShieldAlert className="size-4 mr-2" />
                                    Re-Scan
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Scanning progress */}
            {scanning && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <Loader2 className="size-5 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                Checking passwords against breach databases...
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Compromised Results */}
            {results.filter((r) => r.compromised).length > 0 && (
                <Card className="border-red-500/30">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="size-5 text-red-500" />
                            <div>
                                <CardTitle className="text-red-500">Compromised Passwords</CardTitle>
                                <CardDescription>These passwords have been found in data breaches — change them immediately</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {results.filter((r) => r.compromised).map((result, i) => (
                            <div key={i} className="rounded-lg border border-red-500/20 px-4 py-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">{result.website}</span>
                                    <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500">
                                        Compromised
                                    </span>
                                </div>
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Globe className="size-3.5" />
                                        {result.username}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Eye className="size-3.5" />
                                        Seen {result.exposures.toLocaleString()} times in breaches
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Safe Results */}
            {results.filter((r) => !r.compromised).length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="size-5 text-green-500" />
                            <div>
                                <CardTitle>Safe Passwords</CardTitle>
                                <CardDescription>These passwords have not been found in any known breaches</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {results.filter((r) => !r.compromised).map((result, i) => (
                                <div key={i} className="flex items-center justify-between rounded-lg border px-4 py-2.5">
                                    <span className="text-sm font-medium">{result.website}</span>
                                    <CheckCircle2 className="size-4 text-green-500" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
