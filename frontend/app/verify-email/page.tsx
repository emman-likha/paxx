"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { VerificationCodeInput } from "@/components/verification-code-input"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Mail, ArrowLeft } from "lucide-react"

export default function VerifyEmailPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get("email") || ""
    const username = searchParams.get("username") || ""
    const salt = searchParams.get("salt") || ""

    const { verifyEmailWithCode } = useAuth()
    const [isVerifying, setIsVerifying] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleCodeComplete = async (code: string) => {
        if (!email) {
            setError("Email not found. Please sign up again.")
            return
        }

        setIsVerifying(true)
        setError("")

        try {
            // 1. Verify the email with OTP code
            const { data } = await verifyEmailWithCode(email, code)

            // 2. Now that user is authenticated, update their profile with username and salt
            if (data?.user && username && salt) {
                const { supabase } = await import('@/lib/supabase')
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        username: username,
                        master_password_salt: salt,
                    })
                    .eq('id', data.user.id)

                if (profileError) {
                    console.error('Profile update error:', profileError)
                    throw new Error('Failed to update profile')
                }

                // 3. Check if user is admin to redirect to appropriate dashboard
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', data.user.id)
                    .single()

                setSuccess(true)

                // Redirect to appropriate dashboard after 2 seconds
                setTimeout(() => {
                    if (profile?.is_admin) {
                        router.push('/dashboard/admin')
                    } else {
                        router.push('/dashboard')
                    }
                }, 2000)
            } else {
                throw new Error('Missing signup data')
            }
        } catch (err: any) {
            setError(err?.message || "Invalid verification code. Please try again.")
            setIsVerifying(false)
        }
    }

    const handleResendCode = async () => {
        // TODO: Implement resend verification email
        alert("Resend code functionality coming soon!")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
            <div className="w-full max-w-md">
                <div className="bg-card border border-border rounded-2xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                            <Mail className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
                        <p className="text-sm text-muted-foreground">
                            We sent an 8-digit code to<br />
                            <span className="font-medium text-foreground">{email}</span>
                        </p>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-sm text-green-600 dark:text-green-400 text-center font-medium">
                                ✓ Email verified successfully! Redirecting...
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400 text-center">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Verification Code Input */}
                    <div className="mb-6">
                        <VerificationCodeInput
                            length={8}
                            onComplete={handleCodeComplete}
                            disabled={isVerifying || success}
                        />
                    </div>

                    {/* Helper Text */}
                    <p className="text-xs text-center text-muted-foreground mb-6">
                        Enter the 8-digit code from your email
                    </p>

                    {/* Resend Code */}
                    <div className="text-center mb-6">
                        <button
                            onClick={handleResendCode}
                            disabled={isVerifying || success}
                            className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Didn't receive the code? Resend
                        </button>
                    </div>

                    {/* Back to Login */}
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push("/login")}
                        disabled={isVerifying}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                    </Button>
                </div>
            </div>
        </div>
    )
}
