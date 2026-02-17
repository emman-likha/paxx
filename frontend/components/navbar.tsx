"use client"

import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
    return (
        <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Shield className="size-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Paxx</span>
                </Link>
                <nav className="hidden items-center gap-8 md:flex">
                    <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Features</Link>
                    <Link href="#security" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Security</Link>
                    <Link href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Pricing</Link>
                </nav>
                <div className="flex items-center gap-4">
                    <Link href="/login" target="_blank">
                        <Button variant="ghost" size="sm">Log in</Button>
                    </Link>
                    <Link href="/login">
                        <Button size="sm">Get Started</Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
