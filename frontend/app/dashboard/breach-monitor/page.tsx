"use client"

import { useState, useMemo } from "react"
import { useVault } from "@/hooks/use-vault"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, Loader2, Globe, Calendar, Eye,
} from "lucide-react"

// Simulated breach database for demo purposes
const SIMULATED_BREACHES: Record<string, { date: string; records: string; dataTypes: string[] }> = {
    "linkedin.com": { date: "2021-06-22", records: "700M", dataTypes: ["Email", "Name", "Phone"] },
    "facebook.com": { date: "2021-04-03", records: "533M", dataTypes: ["Email", "Phone", "DOB"] },
    "twitter.com": { date: "2023-01-05", records: "200M", dataTypes: ["Email", "Username"] },
    "adobe.com": { date: "2013-10-04", records: "153M", dataTypes: ["Email", "Password hints"] },
    "dropbox.com": { date: "2012-07-01", records: "68M", dataTypes: ["Email", "Password"] },
    "yahoo.com": { date: "2017-10-03", records: "3B", dataTypes: ["Email", "Password", "Security Q&A"] },
    "myspace.com": { date: "2016-05-31", records: "360M", dataTypes: ["Email", "Password"] },
}

interface BreachResult {
    website: string
    breached: boolean
    breach?: { date: string; records: string; dataTypes: string[] }
}

export default function BreachMonitorPage() {
    const { items } = useVault()
    const [scanning, setScanning] = useState(false)
    const [scanned, setScanned] = useState(false)
    const [results, setResults] = useState<BreachResult[]>([])

    const handleScan = async () => {
        setScanning(true)
        setResults([])

        // Simulate scanning delay for each item
        const scanResults: BreachResult[] = []
        for (const item of items) {
            await new Promise((r) => setTimeout(r, 300 + Math.random() * 200))

            const domain = item.website.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0]
            const breach = SIMULATED_BREACHES[domain]

            scanResults.push({
                website: item.website,
                breached: !!breach,
                breach,
            })
        }

        setResults(scanResults)
        setScanning(false)
        setScanned(true)
    }

    const breachedCount = results.filter((r) => r.breached).length
    const safeCount = results.filter((r) => !r.breached).length

    return (
        <div className="flex flex-1 flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold">Breach Monitor</h1>
                <p className="text-muted-foreground">
                    Check if your accounts have appeared in known data breaches
                </p>
            </div>

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
                                    Check {items.length} saved site{items.length !== 1 ? "s" : ""} against known data breaches
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
                                Demo: Uses simulated breach data for portfolio demonstration
                            </p>
                        </>
                    ) : (
                        <>
                            <div className={`flex size-16 items-center justify-center rounded-full ${breachedCount > 0 ? "bg-red-500/10" : "bg-green-500/10"}`}>
                                {breachedCount > 0 ? (
                                    <ShieldAlert className="size-8 text-red-500" />
                                ) : (
                                    <ShieldCheck className="size-8 text-green-500" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">
                                    {breachedCount > 0
                                        ? `${breachedCount} Breach${breachedCount !== 1 ? "es" : ""} Found`
                                        : "No Breaches Found"}
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {safeCount} of {results.length} sites are clean
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
                                Checking sites against breach databases...
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Breached Results */}
            {results.filter((r) => r.breached).length > 0 && (
                <Card className="border-red-500/30">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="size-5 text-red-500" />
                            <div>
                                <CardTitle className="text-red-500">Breached Sites</CardTitle>
                                <CardDescription>These sites have had known data breaches</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {results.filter((r) => r.breached).map((result, i) => (
                            <div key={i} className="rounded-lg border border-red-500/20 px-4 py-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">{result.website}</span>
                                    <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500">
                                        Breached
                                    </span>
                                </div>
                                {result.breach && (
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Calendar className="size-3.5" />
                                            {new Date(result.breach.date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Globe className="size-3.5" />
                                            {result.breach.records} records
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Eye className="size-3.5" />
                                            {result.breach.dataTypes.join(", ")}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Safe Results */}
            {results.filter((r) => !r.breached).length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="size-5 text-green-500" />
                            <div>
                                <CardTitle>Safe Sites</CardTitle>
                                <CardDescription>No known breaches found for these sites</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {results.filter((r) => !r.breached).map((result, i) => (
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
