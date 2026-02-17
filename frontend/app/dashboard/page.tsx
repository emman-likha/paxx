export default function DashboardPage() {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">All Passwords</h1>
                    <p className="text-muted-foreground">
                        Manage your secure passwords
                    </p>
                </div>
                <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    + Add Password
                </button>
            </div>

            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed">
                <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">
                        No passwords yet
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        You haven't added any passwords yet. Add one to get started!
                    </p>
                </div>
            </div>
        </div>
    )
}
