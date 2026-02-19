"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    HelpCircle, ChevronDown, ChevronUp, Shield, Lock, KeyRound, Download, Keyboard, Mail,
} from "lucide-react"

interface FAQItem {
    question: string
    answer: string
}

const FAQ_ITEMS: FAQItem[] = [
    {
        question: "How does Paxx keep my passwords secure?",
        answer: "Paxx uses zero-knowledge encryption. Your master password never leaves your browser. We derive an encryption key using PBKDF2 with 600,000 iterations and encrypt all vault data with AES-256-GCM. Even Paxx servers cannot read your passwords.",
    },
    {
        question: "What happens if I forget my master password?",
        answer: "Because Paxx uses zero-knowledge encryption, we cannot recover your master password. If you forget it, your vault data cannot be decrypted. We recommend storing a backup of your master password in a secure physical location.",
    },
    {
        question: "How does the password generator work?",
        answer: "The password generator uses the Web Crypto API (crypto.getRandomValues) to generate cryptographically secure random passwords. You can customize length, and include/exclude uppercase letters, numbers, and symbols.",
    },
    {
        question: "Can I export my passwords?",
        answer: "Yes. Go to Settings > Data Management > Export Vault. Your passwords will be decrypted and downloaded as a JSON file. Make sure to store this file securely, as it contains your passwords in plain text.",
    },
    {
        question: "What is the auto-lock feature?",
        answer: "Auto-lock automatically locks your vault after a period of inactivity. When locked, you'll need to enter your master password again to access your passwords. You can configure the timeout in Settings > Security.",
    },
    {
        question: "How do categories work?",
        answer: "Categories let you organize your passwords by type — Social, Work, Finance, Shopping, etc. You can assign a category when adding or editing a password, and filter by category on the Categories page.",
    },
    {
        question: "Is the Breach Monitor real?",
        answer: "The Breach Monitor in Paxx is a demo feature that checks your saved sites against a simulated database of known breaches. In a production deployment, this would integrate with services like HaveIBeenPwned's API.",
    },
    {
        question: "How does the Security Center score work?",
        answer: "Your security score is calculated based on three factors: password strength (40%), uniqueness/no reuse (30%), and freshness/age (30%). Maintaining strong, unique, and regularly updated passwords will give you a perfect score.",
    },
]

const SHORTCUTS = [
    { keys: ["Ctrl", "K"], description: "Global search" },
    { keys: ["Ctrl", "N"], description: "Add new password" },
    { keys: ["Ctrl", ","], description: "Open settings" },
]

function FAQAccordion({ item }: { item: FAQItem }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="border-b last:border-b-0">
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between py-4 text-left"
            >
                <span className="text-sm font-medium pr-4">{item.question}</span>
                {open ? (
                    <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                )}
            </button>
            {open && (
                <p className="pb-4 text-sm text-muted-foreground leading-relaxed">
                    {item.answer}
                </p>
            )}
        </div>
    )
}

export default function HelpPage() {
    return (
        <div className="flex flex-1 flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold">Help & Support</h1>
                <p className="text-muted-foreground">
                    Learn how to use Paxx and get answers to common questions
                </p>
            </div>

            {/* Quick Start */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
                            <Shield className="size-4 text-primary-foreground" />
                        </div>
                        <div>
                            <CardTitle>Quick Start Guide</CardTitle>
                            <CardDescription>Get up and running in minutes</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex gap-3 rounded-lg border p-4">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 text-sm font-bold">
                                1
                            </div>
                            <div>
                                <p className="text-sm font-medium">Add Passwords</p>
                                <p className="text-xs text-muted-foreground">
                                    Click "Add Password" on the dashboard to save your first credentials.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 rounded-lg border p-4">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-500 text-sm font-bold">
                                2
                            </div>
                            <div>
                                <p className="text-sm font-medium">Generate Strong Passwords</p>
                                <p className="text-xs text-muted-foreground">
                                    Use the Password Generator to create unique, secure passwords.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 rounded-lg border p-4">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-500 text-sm font-bold">
                                3
                            </div>
                            <div>
                                <p className="text-sm font-medium">Organize with Categories</p>
                                <p className="text-xs text-muted-foreground">
                                    Assign categories to keep your vault organized and easy to browse.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 rounded-lg border p-4">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 text-sm font-bold">
                                4
                            </div>
                            <div>
                                <p className="text-sm font-medium">Check Security</p>
                                <p className="text-xs text-muted-foreground">
                                    Visit Security Center to audit password strength and find vulnerabilities.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-cyan-600">
                            <HelpCircle className="size-4 text-white" />
                        </div>
                        <div>
                            <CardTitle>Frequently Asked Questions</CardTitle>
                            <CardDescription>Common questions about Paxx</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {FAQ_ITEMS.map((item, i) => (
                        <FAQAccordion key={i} item={item} />
                    ))}
                </CardContent>
            </Card>

            {/* Keyboard Shortcuts */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-violet-600">
                            <Keyboard className="size-4 text-white" />
                        </div>
                        <div>
                            <CardTitle>Keyboard Shortcuts</CardTitle>
                            <CardDescription>Navigate Paxx faster</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {SHORTCUTS.map((shortcut, i) => (
                            <div key={i} className="flex items-center justify-between py-2">
                                <span className="text-sm">{shortcut.description}</span>
                                <div className="flex gap-1">
                                    {shortcut.keys.map((key) => (
                                        <kbd
                                            key={key}
                                            className="inline-flex items-center rounded border bg-muted px-2 py-0.5 text-xs font-mono font-medium"
                                        >
                                            {key}
                                        </kbd>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Contact */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-pink-600">
                            <Mail className="size-4 text-white" />
                        </div>
                        <div>
                            <CardTitle>Contact Support</CardTitle>
                            <CardDescription>Need more help?</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Paxx is an open-source project. For bug reports, feature requests, or questions,
                        please visit the project repository or reach out via email.
                    </p>
                    <div className="mt-4 flex gap-3 text-sm">
                        <span className="rounded-lg border px-4 py-2 text-muted-foreground">
                            support@paxx.app
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
