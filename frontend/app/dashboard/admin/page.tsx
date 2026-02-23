"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Shield, User, MoreHorizontal, CreditCard, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function AdminPage() {
    const queryClient = useQueryClient()

    const { data: users, isLoading } = useQuery({
        queryKey: ["admin-users"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) throw error
            return data
        },
    })

    const updatePlanMutation = useMutation({
        mutationFn: async ({ userId, plan }: { userId: string, plan: string }) => {
            const { error } = await supabase
                .from("profiles")
                .update({ subscription_tier: plan })
                .eq("id", userId)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] })
            toast.success("User plan updated successfully")
        },
        onError: (error: any) => {
            toast.error(`Error updating plan: ${error.message}`)
        }
    })

    const updateStatusMutation = useMutation({
        mutationFn: async ({ userId, status }: { userId: string, status: string }) => {
            const { error } = await supabase
                .from("profiles")
                .update({ subscription_status: status })
                .eq("id", userId)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] })
            toast.success("User status updated successfully")
        },
        onError: (error: any) => {
            toast.error(`Error updating status: ${error.message}`)
        }
    })

    if (isLoading) {
        return <div className="p-4">Loading users...</div>
    }

    return (
        <div className="flex flex-1 flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage Paxx users, roles, and account statuses.
                    </p>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users?.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{user.email}</span>
                                        <span className="text-xs text-muted-foreground font-normal">{user.id}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {user.is_admin ? (
                                        <div className="flex items-center gap-1.5 text-primary font-semibold">
                                            <Shield className="size-4" />
                                            <span>Admin</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <User className="size-4" />
                                            <span>User</span>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        user.subscription_tier === 'pro' ? 'default' :
                                            user.subscription_tier === 'plus' ? 'secondary' :
                                                'outline'
                                    } className="capitalize">
                                        {user.subscription_tier}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 capitalize text-xs">
                                        {user.subscription_status === 'active' ? (
                                            <CheckCircle className="size-3 text-green-500" />
                                        ) : (
                                            <AlertCircle className="size-3 text-amber-500" />
                                        )}
                                        <span>{user.subscription_status}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {new Date(user.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem>View details</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Change Plan</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => updatePlanMutation.mutate({ userId: user.id, plan: 'free' })}>
                                                Set to Free
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => updatePlanMutation.mutate({ userId: user.id, plan: 'plus' })}>
                                                Set to Plus
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => updatePlanMutation.mutate({ userId: user.id, plan: 'pro' })}>
                                                Set to Pro
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Change Status</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ userId: user.id, status: 'active' })}>
                                                Activate
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ userId: user.id, status: 'canceled' })} className="text-destructive">
                                                Cancel Subscription
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Permissions</DropdownMenuLabel>
                                            {user.is_admin ? (
                                                <DropdownMenuItem>Demote from Admin</DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem>Promote to Admin</DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive">
                                                Suspend account
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
