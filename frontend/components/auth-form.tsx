"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type AuthMode = "login" | "signup"

export function AuthForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [mode, setMode] = useState<AuthMode>("login")

    const isLogin = mode === "login"

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0,
        }),
    }

    const [direction, setDirection] = useState(0)

    const switchMode = (newMode: AuthMode) => {
        setDirection(newMode === "signup" ? 1 : -1)
        setMode(newMode)
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <form>
                <FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <a
                            href="/"
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Shield className="size-6" />
                            </div>
                            <span className="sr-only">Paxx</span>
                        </a>

                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={mode}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 },
                                }}
                                className="w-full"
                            >
                                <h1 className="text-xl font-bold">
                                    {isLogin ? "Welcome to Paxx" : "Create your Paxx account"}
                                </h1>
                                <FieldDescription className="mt-2">
                                    {isLogin ? (
                                        <>
                                            Don&apos;t have an account?{" "}
                                            <button
                                                type="button"
                                                onClick={() => switchMode("signup")}
                                                className="font-medium text-primary hover:underline"
                                            >
                                                Sign up
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            Already have an account?{" "}
                                            <button
                                                type="button"
                                                onClick={() => switchMode("login")}
                                                className="font-medium text-primary hover:underline"
                                            >
                                                Log in
                                            </button>
                                        </>
                                    )}
                                </FieldDescription>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={mode}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 },
                            }}
                            className="flex flex-col gap-4"
                        >
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                                    required
                                />
                            </Field>

                            {!isLogin && (
                                <Field>
                                    <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        placeholder="Confirm your password"
                                        required
                                    />
                                </Field>
                            )}

                            <Field>
                                <Button type="submit" className="w-full">
                                    {isLogin ? "Login" : "Create Account"}
                                </Button>
                            </Field>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <Field>
                                <Button type="button" variant="outline" className="w-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                                        <path
                                            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    Continue with Google
                                </Button>
                            </Field>
                        </motion.div>
                    </AnimatePresence>
                </FieldGroup>
            </form>

            <FieldDescription className="px-6 text-center">
                By {isLogin ? "logging in" : "creating an account"}, you agree to our{" "}
                <a href="#" className="font-medium text-primary hover:underline">
                    Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="font-medium text-primary hover:underline">
                    Privacy Policy
                </a>
                .
            </FieldDescription>
        </div>
    )
}
