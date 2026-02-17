import { UnifiedAuthForm } from "@/components/unified-auth-form"

export default function SignupPage() {
    return (
        <div className="bg-background relative min-h-svh flex flex-col items-center justify-center p-6 md:p-10 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.15),transparent_50%)] pointer-events-none" />
            <div className="w-full max-w-lg z-10">
                <UnifiedAuthForm initialMode="signup" />
            </div>
        </div>
    )
}
