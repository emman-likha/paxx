"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Mail, Lock, User, Check, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { validatePasswordStrength, validateUsername } from "@/lib/password-validator"
import Link from "next/link"

type AuthMode = "login" | "signup"

export function UnifiedAuthForm({
    initialMode = "login",
    className,
}: {
    initialMode?: AuthMode
    className?: string
}) {
    const [mode, setMode] = useState<AuthMode>(initialMode)
    const { signIn, signUp, checkUsernameAvailability, isLoading, error: authError } = useAuth()

    // Form fields
    const [emailOrUsername, setEmailOrUsername] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    // Validation states
    const [localError, setLocalError] = useState<string | null>(null)
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
    const [checkingUsername, setCheckingUsername] = useState(false)
    const [passwordValidation, setPasswordValidation] = useState(validatePasswordStrength(""))

    // Check username availability with debounce
    useEffect(() => {
        if (mode === "signup" && username.length >= 3) {
            // Reset availability state when username changes (while typing)
            setUsernameAvailable(null)
            setCheckingUsername(false)

            // Validate username format first
            const validation = validateUsername(username)
            if (!validation.isValid) {
                // Don't set to false - keep it null so format rules show
                return
            }

            const timer = setTimeout(async () => {
                setCheckingUsername(true)
                const available = await checkUsernameAvailability(username)
                setUsernameAvailable(available)
                setCheckingUsername(false)
            }, 500)

            return () => clearTimeout(timer)
        } else {
            setUsernameAvailable(null)
            setCheckingUsername(false)
        }
    }, [username, mode]) // eslint-disable-line react-hooks/exhaustive-deps

    // Validate password in real-time
    useEffect(() => {
        if (mode === "signup") {
            setPasswordValidation(validatePasswordStrength(password))
        }
    }, [password, mode])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLocalError(null)

        if (mode === "signup") {
            // Validate username
            const usernameVal = validateUsername(username)
            if (!usernameVal.isValid) {
                setLocalError(usernameVal.error || "Invalid username")
                return
            }

            // Check username availability
            if (!usernameAvailable) {
                setLocalError("Username is not available")
                return
            }

            // Validate password
            if (!passwordValidation.isValid) {
                setLocalError("Password does not meet security requirements")
                return
            }

            // Check password confirmation
            if (password !== confirmPassword) {
                setLocalError("Passwords do not match")
                return
            }

            await signUp(email, username, password)
        } else {
            await signIn(emailOrUsername, password)
        }
    }

    const toggleMode = () => {
        setMode(mode === "login" ? "signup" : "login")
        setLocalError(null)
        setEmailOrUsername("")
        setUsername("")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
    }

    const displayError = localError || authError

    const getStrengthColor = () => {
        switch (passwordValidation.strength) {
            case 'strong': return 'text-green-600 dark:text-green-400'
            case 'medium': return 'text-yellow-600 dark:text-yellow-400'
            default: return 'text-red-600 dark:text-red-400'
        }
    }

    return (
        <div className={cn("grid w-full max-w-lg gap-6", className)}>
            <Card className="border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/10 pointer-events-none" />

                <CardHeader className="text-center relative pt-8">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    >
                        <Shield className="size-6" />
                    </motion.div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <CardTitle className="text-2xl font-bold tracking-tight">
                                {mode === "login" ? "Welcome Back" : "Create Account"}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground mt-2">
                                {mode === "login"
                                    ? "Access your secure vault and manage your passwords."
                                    : "Join Paxx today for a next-level secure experience."}
                            </CardDescription>
                        </motion.div>
                    </AnimatePresence>
                </CardHeader>

                <CardContent className="relative px-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {displayError && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 mb-4">
                                        <AlertDescription className="text-xs">
                                            {displayError}
                                        </AlertDescription>
                                    </Alert>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Login Mode: Email or Username */}
                        {mode === "login" && (
                            <div className="space-y-2">
                                <Label htmlFor="emailOrUsername" className="text-sm font-medium">Email or Username</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 flex size-4 -translate-y-1/2 text-muted-foreground transition-colors" />
                                    <Input
                                        id="emailOrUsername"
                                        type="text"
                                        placeholder="name@example.com or username"
                                        className="pl-10 h-11 bg-muted/50 focus:bg-background transition-all"
                                        value={emailOrUsername}
                                        onChange={(e) => setEmailOrUsername(e.target.value)}
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Signup Mode: Username + Email */}
                        <AnimatePresence>
                            {mode === "signup" && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="space-y-4 overflow-hidden"
                                >
                                    {/* Username Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 flex size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="username"
                                                type="text"
                                                placeholder="john_doe"
                                                className="pl-10 pr-10 h-11 bg-muted/50 focus:bg-background transition-all"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                                                disabled={isLoading}
                                                required
                                            />
                                            {username.length >= 3 && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    {checkingUsername ? (
                                                        <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                                    ) : usernameAvailable ? (
                                                        <Check className="size-4 text-green-600" />
                                                    ) : (
                                                        <X className="size-4 text-red-600" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">
                                            {checkingUsername ? (
                                                "Checking availability..."
                                            ) : usernameAvailable === true ? (
                                                <span className="text-green-600 dark:text-green-400 font-medium">✓ Username is available</span>
                                            ) : usernameAvailable === false ? (
                                                <span className="text-red-600 dark:text-red-400 font-medium">✗ Username is taken. Choose another</span>
                                            ) : (
                                                "3-20 characters, letters, numbers, underscore, or hyphen"
                                            )}
                                        </p>
                                    </div>

                                    {/* Email Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 flex size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="name@example.com"
                                                className="pl-10 h-11 bg-muted/50 focus:bg-background transition-all"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={isLoading}
                                                required
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-medium">Master Password</Label>
                                {mode === "login" && (
                                    <button type="button" className="text-xs text-primary hover:underline font-medium">
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 flex size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-11 bg-muted/50 focus:bg-background transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Signup: Password Strength & Confirmation */}
                        <AnimatePresence>
                            {mode === "signup" && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="space-y-4 overflow-hidden"
                                >
                                    {/* Password Strength Indicator */}
                                    {password.length > 0 && (
                                        <div className="rounded-lg bg-muted/50 border p-3 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium">Password Strength:</span>
                                                <span className={cn("text-xs font-bold uppercase", getStrengthColor())}>
                                                    {passwordValidation.strength}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                {Object.entries(passwordValidation.requirements).map(([key, met]) => (
                                                    <div key={key} className="flex items-center gap-2 text-[11px]">
                                                        {met ? (
                                                            <Check className="size-3 text-green-600" />
                                                        ) : (
                                                            <X className="size-3 text-muted-foreground" />
                                                        )}
                                                        <span className={met ? "text-foreground" : "text-muted-foreground"}>
                                                            {key === 'minLength' && '8+ characters'}
                                                            {key === 'hasUppercase' && 'Uppercase letter'}
                                                            {key === 'hasLowercase' && 'Lowercase letter'}
                                                            {key === 'hasNumber' && 'Number'}
                                                            {key === 'hasSpecialChar' && 'Special character'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm Master Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 flex size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="confirm-password"
                                                type="password"
                                                placeholder="••••••••"
                                                className="pl-10 h-11 bg-muted/50 focus:bg-background transition-all"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                disabled={isLoading}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Zero-Knowledge Warning */}
                                    <div className="rounded-lg bg-orange-500/5 border border-orange-500/10 p-3">
                                        <p className="text-[11px] leading-relaxed text-orange-600 dark:text-orange-400">
                                            <strong>Zero-Knowledge:</strong> We never see your master password. If you lose it, your data cannot be recovered.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-11 text-sm font-semibold transition-all shadow-lg active:scale-[0.98]"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    <span>{mode === "login" ? "Signing in..." : "Creating account..."}</span>
                                </div>
                            ) : (
                                <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
                            )}
                        </Button>

                        {/* Toggle Mode */}
                        <div className="text-center pt-4">
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                disabled={isLoading}
                            >
                                {mode === "login" ? (
                                    <>Don't have an account? <span className="font-semibold">Sign up</span></>
                                ) : (
                                    <>Already have an account? <span className="font-semibold">Sign in</span></>
                                )}
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
