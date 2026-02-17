"use client"

import { LayoutDashboard } from "lucide-react"

export default function SystemLogsPage() {
    return (
        <div className="p-8">
            <div className="flex flex-col gap-2 mb-8">
                <div className="flex items-center gap-2 text-primary">
                    <LayoutDashboard className="size-6" />
                    <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
                </div>
                <p className="text-muted-foreground">
                    Monitor system events and security audits.
                </p>
            </div>

            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed bg-muted/20 p-8 text-center">
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center">
                    <h2 className="mt-6 text-xl font-semibold">No logs available yet</h2>
                    <p className="mt-2 mb-8 text-center text-sm font-normal leading-6 text-muted-foreground">
                        Security logs and audit trails will appear here once the system starts recording events.
                        This feature is currently under development.
                    </p>
                </div>
            </div>
        </div>
    )
}
