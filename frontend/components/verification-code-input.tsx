"use client"

import { useRef, useState, KeyboardEvent, ClipboardEvent, ChangeEvent } from "react"

interface VerificationCodeInputProps {
    length?: number
    onComplete: (code: string) => void
    disabled?: boolean
}

export function VerificationCodeInput({
    length = 6,
    onComplete,
    disabled = false
}: VerificationCodeInputProps) {
    const [values, setValues] = useState<string[]>(Array(length).fill(""))
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const handleChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return

        const newValues = [...values]
        newValues[index] = value
        setValues(newValues)

        // Auto-focus next input
        if (value && index < length - 1) {
            inputRefs.current[index + 1]?.focus()
        }

        // Check if complete
        if (newValues.every(v => v !== "")) {
            onComplete(newValues.join(""))
        }
    }

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace
        if (e.key === "Backspace") {
            if (!values[index] && index > 0) {
                // If current is empty, focus previous and clear it
                inputRefs.current[index - 1]?.focus()
                const newValues = [...values]
                newValues[index - 1] = ""
                setValues(newValues)
            } else {
                // Clear current
                const newValues = [...values]
                newValues[index] = ""
                setValues(newValues)
            }
        }

        // Handle arrow keys
        if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
        if (e.key === "ArrowRight" && index < length - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData("text/plain").trim()

        // Only accept digits
        const digits = pastedData.replace(/\D/g, "").slice(0, length)

        if (digits.length === length) {
            const newValues = digits.split("")
            setValues(newValues)

            // Focus last input
            inputRefs.current[length - 1]?.focus()

            // Trigger completion
            onComplete(digits)
        }
    }

    return (
        <div className="flex gap-2 justify-center">
            {values.map((value, index) => (
                <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg 
                             bg-muted/50 border-border
                             focus:border-primary focus:bg-background focus:outline-none
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all"
                    aria-label={`Digit ${index + 1}`}
                />
            ))}
        </div>
    )
}
