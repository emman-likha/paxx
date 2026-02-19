"use client"

import { useState, useCallback } from "react"
import { useSettings } from "@/hooks/use-settings"
import { generatePassword } from "@/components/vault-item-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Copy, RefreshCw, Check } from "lucide-react"

export default function GeneratorPage() {
    const { settings, updateSetting } = useSettings()
    const [length, setLength] = useState(settings["password-gen-length"])
    const [uppercase, setUppercase] = useState(settings["password-gen-uppercase"])
    const [numbers, setNumbers] = useState(settings["password-gen-numbers"])
    const [symbols, setSymbols] = useState(settings["password-gen-symbols"])
    const [password, setPassword] = useState(() =>
        generatePassword({ length, uppercase, numbers, symbols })
    )
    const [copied, setCopied] = useState(false)
    const [history, setHistory] = useState<string[]>([])

    const generate = useCallback(() => {
        const pw = generatePassword({ length, uppercase, numbers, symbols })
        setPassword(pw)
        setHistory((prev) => [pw, ...prev].slice(0, 10))
        setCopied(false)
    }, [length, uppercase, numbers, symbols])

    const copyToClipboard = useCallback((text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)

        const timer = settings["clipboard-clear-timer"]
        if (timer > 0) {
            setTimeout(() => navigator.clipboard.writeText(""), timer)
        }
    }, [settings])

    const saveAsDefaults = useCallback(() => {
        updateSetting("password-gen-length", length)
        updateSetting("password-gen-uppercase", uppercase)
        updateSetting("password-gen-numbers", numbers)
        updateSetting("password-gen-symbols", symbols)
    }, [length, uppercase, numbers, symbols, updateSetting])

    // Character composition breakdown
    const charCount = {
        lowercase: 26,
        uppercase: uppercase ? 26 : 0,
        numbers: numbers ? 10 : 0,
        symbols: symbols ? 14 : 0,
    }
    const totalChars = Object.values(charCount).reduce((a, b) => a + b, 0)
    const entropy = Math.floor(length * Math.log2(totalChars))

    const strengthLabel = entropy >= 128 ? "Very Strong" : entropy >= 80 ? "Strong" : entropy >= 60 ? "Good" : entropy >= 40 ? "Fair" : "Weak"
    const strengthColor = entropy >= 128 ? "text-green-500" : entropy >= 80 ? "text-green-500" : entropy >= 60 ? "text-yellow-500" : entropy >= 40 ? "text-orange-500" : "text-red-500"
    const strengthBarColor = entropy >= 128 ? "bg-green-500" : entropy >= 80 ? "bg-green-500" : entropy >= 60 ? "bg-yellow-500" : entropy >= 40 ? "bg-orange-500" : "bg-red-500"
    const strengthPercent = Math.min(100, (entropy / 128) * 100)

    return (
        <div className="flex flex-1 flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold">Password Generator</h1>
                <p className="text-muted-foreground">
                    Generate strong, random passwords
                </p>
            </div>

            {/* Generated Password Display */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 rounded-lg border bg-muted/50 px-4 py-3">
                            <p className="font-mono text-lg break-all select-all">{password}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(password)}
                                title="Copy"
                            >
                                {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={generate}
                                title="Regenerate"
                            >
                                <RefreshCw className="size-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Strength indicator */}
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Strength</span>
                            <span className={`font-medium ${strengthColor}`}>{strengthLabel}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${strengthBarColor}`}
                                style={{ width: `${strengthPercent}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{length} characters</span>
                            <span>{entropy} bits of entropy</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Options */}
            <Card>
                <CardHeader>
                    <CardTitle>Options</CardTitle>
                    <CardDescription>Customize your generated passwords</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <Label className="text-sm font-medium">Length</Label>
                            <span className="text-sm font-mono font-medium bg-muted px-2 py-0.5 rounded">
                                {length}
                            </span>
                        </div>
                        <Slider
                            value={[length]}
                            onValueChange={([v]) => {
                                setLength(v)
                                setPassword(generatePassword({ length: v, uppercase, numbers, symbols }))
                            }}
                            min={4}
                            max={128}
                            step={1}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>4</span>
                            <span>128</span>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-sm font-medium">Uppercase Letters</Label>
                                <p className="text-xs text-muted-foreground">A-Z</p>
                            </div>
                            <Switch
                                checked={uppercase}
                                onCheckedChange={(v) => {
                                    setUppercase(v)
                                    setPassword(generatePassword({ length, uppercase: v, numbers, symbols }))
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-sm font-medium">Numbers</Label>
                                <p className="text-xs text-muted-foreground">0-9</p>
                            </div>
                            <Switch
                                checked={numbers}
                                onCheckedChange={(v) => {
                                    setNumbers(v)
                                    setPassword(generatePassword({ length, uppercase, numbers: v, symbols }))
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-sm font-medium">Symbols</Label>
                                <p className="text-xs text-muted-foreground">{"!@#$%^&*()-_=+"}</p>
                            </div>
                            <Switch
                                checked={symbols}
                                onCheckedChange={(v) => {
                                    setSymbols(v)
                                    setPassword(generatePassword({ length, uppercase, numbers, symbols: v }))
                                }}
                            />
                        </div>
                    </div>

                    <Separator />

                    <Button variant="outline" size="sm" onClick={saveAsDefaults}>
                        Save as Defaults
                    </Button>
                </CardContent>
            </Card>

            {/* History */}
            {history.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent</CardTitle>
                        <CardDescription>Previously generated passwords (this session only)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {history.map((pw, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                                >
                                    <span className="font-mono text-sm truncate mr-3">{pw}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7 shrink-0"
                                        onClick={() => copyToClipboard(pw)}
                                    >
                                        <Copy className="size-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
