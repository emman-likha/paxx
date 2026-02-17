"use client"

import Link from "next/link";
import { Shield, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

import { ModeToggle } from "@/components/mode-toggle";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { href: "#features", label: "Features" },
        { href: "#security", label: "Security" },
        { href: "#pricing", label: "Pricing" },
    ];

    return (
        <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled
                ? "bg-background/80 backdrop-blur-md shadow-sm"
                : "bg-transparent"
            }`}>
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Shield className="size-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Paxx</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-8 md:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2 md:gap-4">
                    <ModeToggle />

                    {/* Desktop Action Buttons */}
                    <div className="hidden items-center gap-4 md:flex">
                        <Link href="/login" target="_blank">
                            <Button variant="ghost" size="sm">Log in</Button>
                        </Link>
                        <Link href="/login">
                            <Button size="sm">Get Started</Button>
                        </Link>
                    </div>

                    {/* Mobile Burger Menu */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <Menu className="size-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="flex flex-col gap-6 pt-12">
                                <SheetHeader>
                                    <SheetTitle className="text-left flex items-center gap-2">
                                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                            <Shield className="size-5" />
                                        </div>
                                        <span>Paxx</span>
                                    </SheetTitle>
                                </SheetHeader>
                                <nav className="flex flex-col gap-4">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </nav>
                                <div className="mt-auto flex flex-col gap-4 border-t pt-6">
                                    <Link href="/login" target="_blank" className="w-full">
                                        <Button variant="outline" className="w-full justify-center">Log in</Button>
                                    </Link>
                                    <Link href="/login" className="w-full">
                                        <Button className="w-full justify-center">Get Started</Button>
                                    </Link>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}
