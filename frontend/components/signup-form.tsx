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

export function SignupForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
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
                        <h1 className="text-xl font-bold">Create your Paxx account</h1>
                        <FieldDescription>
                            Already have an account? <a href="/login" className="font-medium text-primary hover:underline">Log in</a>
                        </FieldDescription>
                    </div>
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
                            placeholder="Create a strong password"
                            required
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                        <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Confirm your password"
                            required
                        />
                    </Field>
                    <Field>
                        <Button type="submit" className="w-full">Create Account</Button>
                    </Field>
                </FieldGroup>
            </form>
            <FieldDescription className="px-6 text-center">
                By creating an account, you agree to our <a href="#" className="font-medium text-primary hover:underline">Terms of Service</a>{" "}
                and <a href="#" className="font-medium text-primary hover:underline">Privacy Policy</a>.
            </FieldDescription>
        </div>
    )
}
