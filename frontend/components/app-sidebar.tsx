"use client"

import * as React from "react"
import Link from "next/link"
import {
    Lock,
    Star,
    FolderOpen,
    Clock,
    Trash2,
    Search,
    KeyRound,
    Shield,
    ShieldAlert,
    Activity,
    Settings,
    HelpCircle,
    LogOut,
    Users,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"

const vaultItems = [
    { title: "All Passwords", url: "/dashboard", icon: Lock },
    { title: "Favorites", url: "/dashboard/favorites", icon: Star },
    { title: "Categories", url: "/dashboard/categories", icon: FolderOpen },
    { title: "Trash", url: "/dashboard/trash", icon: Trash2 },
]

const toolsItems = [
    { title: "Password Generator", url: "/dashboard/generator", icon: KeyRound },
    { title: "Security Center", url: "/dashboard/security", icon: Shield },
    { title: "Breach Monitor", url: "/dashboard/breach-monitor", icon: ShieldAlert },
    { title: "Activity Log", url: "/dashboard/activity", icon: Activity },
]

const adminItems = [
    { title: "User Management", url: "/dashboard/admin", icon: Users },
]

const accountItems = [
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
    { title: "Help & Support", url: "/dashboard/help", icon: HelpCircle },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: profile } = useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null
            const { data } = await supabase
                .from("profiles")
                .select("is_admin")
                .eq("id", user.id)
                .single()
            return data
        },
    })

    const { signOut } = useAuth()
    const isAdmin = profile?.is_admin

    const groups = [
        { label: "Vault", items: vaultItems, show: true },
        { label: "Tools", items: toolsItems, show: true },
        { label: "Administration", items: adminItems, show: isAdmin },
        { label: "Account", items: accountItems, show: true },
    ]

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Shield className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Paxx</span>
                                    <span className="truncate text-xs">Password Manager</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {groups.map((group) =>
                    group.show ? (
                        <SidebarGroup key={group.label}>
                            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {group.items.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild>
                                                <Link href={item.url}>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    ) : null
                )}
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => signOut()}>
                            <LogOut />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
