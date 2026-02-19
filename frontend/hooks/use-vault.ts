"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { encrypt, decrypt } from "@/lib/security"
import { useMasterKey } from "./use-master-key"

export type VaultCategory = "social" | "work" | "finance" | "shopping" | "entertainment" | "travel" | "health" | "education" | "other"

export const VAULT_CATEGORIES: { value: VaultCategory; label: string }[] = [
    { value: "social", label: "Social" },
    { value: "work", label: "Work" },
    { value: "finance", label: "Finance" },
    { value: "shopping", label: "Shopping" },
    { value: "entertainment", label: "Entertainment" },
    { value: "travel", label: "Travel" },
    { value: "health", label: "Health" },
    { value: "education", label: "Education" },
    { value: "other", label: "Other" },
]

export interface VaultItem {
    id: string
    website: string
    username: string
    password: string
    notes: string
    favorite: boolean
    category: VaultCategory
    deleted_at: string | null
    created_at: string
    updated_at: string
}

interface VaultItemInput {
    website: string
    username: string
    password: string
    notes: string
    category?: VaultCategory
}

async function encryptField(text: string, key: CryptoKey): Promise<string> {
    if (!text) return ""
    const { ciphertext, iv } = await encrypt(text, key)
    return `${iv}:${ciphertext}`
}

async function decryptField(stored: string, key: CryptoKey): Promise<string> {
    if (!stored) return ""
    const [iv, ciphertext] = stored.split(":")
    if (!iv || !ciphertext) return stored
    return decrypt(ciphertext, iv, key)
}

export function useVault() {
    const queryClient = useQueryClient()
    const { masterKey } = useMasterKey()

    // Fetch ALL items (including soft-deleted) so trash page can use the same cache
    const query = useQuery({
        queryKey: ["vault-items"],
        enabled: !!masterKey,
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const { data, error } = await supabase
                .from("vault_items")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })

            if (error) throw error
            if (!data || !masterKey) return []

            const decrypted = await Promise.all(
                data.map(async (item) => ({
                    ...item,
                    website: await decryptField(item.website, masterKey),
                    username: await decryptField(item.username, masterKey),
                    password: await decryptField(item.password, masterKey),
                    notes: await decryptField(item.notes || "", masterKey),
                    category: item.category || "other",
                    deleted_at: item.deleted_at || null,
                }))
            )
            return decrypted as VaultItem[]
        },
    })

    const allItems = query.data ?? []
    // Active items = not soft-deleted
    const items = allItems.filter((i) => !i.deleted_at)
    // Trashed items = soft-deleted
    const trashedItems = allItems.filter((i) => !!i.deleted_at)

    const addItem = useMutation({
        mutationFn: async (input: VaultItemInput) => {
            if (!masterKey) throw new Error("Vault is locked")
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const encrypted = {
                user_id: user.id,
                website: await encryptField(input.website, masterKey),
                username: await encryptField(input.username, masterKey),
                password: await encryptField(input.password, masterKey),
                notes: await encryptField(input.notes, masterKey),
                category: input.category || "other",
            }

            const { error } = await supabase.from("vault_items").insert(encrypted)
            if (error) throw error
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vault-items"] }),
    })

    const updateItem = useMutation({
        mutationFn: async ({ id, ...input }: VaultItemInput & { id: string }) => {
            if (!masterKey) throw new Error("Vault is locked")

            const encrypted = {
                website: await encryptField(input.website, masterKey),
                username: await encryptField(input.username, masterKey),
                password: await encryptField(input.password, masterKey),
                notes: await encryptField(input.notes, masterKey),
                category: input.category || "other",
                updated_at: new Date().toISOString(),
            }

            const { error } = await supabase.from("vault_items").update(encrypted).eq("id", id)
            if (error) throw error
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vault-items"] }),
    })

    // Soft delete — set deleted_at timestamp
    const deleteItem = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("vault_items")
                .update({ deleted_at: new Date().toISOString() })
                .eq("id", id)
            if (error) throw error
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vault-items"] }),
    })

    // Restore from trash
    const restoreItem = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("vault_items")
                .update({ deleted_at: null })
                .eq("id", id)
            if (error) throw error
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vault-items"] }),
    })

    // Permanent delete
    const permanentDeleteItem = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("vault_items").delete().eq("id", id)
            if (error) throw error
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vault-items"] }),
    })

    // Empty trash — permanently delete all trashed items
    const emptyTrash = useMutation({
        mutationFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const { error } = await supabase
                .from("vault_items")
                .delete()
                .eq("user_id", user.id)
                .not("deleted_at", "is", null)
            if (error) throw error
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vault-items"] }),
    })

    const toggleFavorite = useMutation({
        mutationFn: async ({ id, favorite }: { id: string; favorite: boolean }) => {
            const { error } = await supabase
                .from("vault_items")
                .update({ favorite, updated_at: new Date().toISOString() })
                .eq("id", id)
            if (error) throw error
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vault-items"] }),
    })

    return {
        items,
        trashedItems,
        allItems,
        isLoading: query.isLoading,
        error: query.error,
        addItem,
        updateItem,
        deleteItem,
        restoreItem,
        permanentDeleteItem,
        emptyTrash,
        toggleFavorite,
    }
}
