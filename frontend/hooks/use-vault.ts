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

interface EncryptedVaultItem {
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

async function getUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")
    return user.id
}

async function readEncryptedItems(userId: string): Promise<EncryptedVaultItem[]> {
    const { data, error } = await supabase
        .from("vaults")
        .select("items")
        .eq("user_id", userId)
        .maybeSingle()

    if (error) throw error
    if (!data) return []
    return (data.items as EncryptedVaultItem[]) || []
}

async function writeEncryptedItems(userId: string, items: EncryptedVaultItem[]): Promise<void> {
    const { error } = await supabase
        .from("vaults")
        .upsert({
            user_id: userId,
            items: items as any,
            updated_at: new Date().toISOString(),
        })

    if (error) throw error
}

export function useVault() {
    const queryClient = useQueryClient()
    const { masterKey } = useMasterKey()

    // Fetch the single JSONB row, decrypt all items
    const query = useQuery({
        queryKey: ["vault-items"],
        enabled: !!masterKey,
        queryFn: async () => {
            const userId = await getUserId()
            const encryptedItems = await readEncryptedItems(userId)
            if (!masterKey || encryptedItems.length === 0) return []

            const decrypted = await Promise.all(
                encryptedItems.map(async (item) => ({
                    ...item,
                    website: await decryptField(item.website, masterKey),
                    username: await decryptField(item.username, masterKey),
                    password: await decryptField(item.password, masterKey),
                    notes: await decryptField(item.notes || "", masterKey),
                    category: item.category || "other",
                    deleted_at: item.deleted_at || null,
                }))
            )

            // Sort by created_at DESC client-side
            decrypted.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )

            return decrypted as VaultItem[]
        },
    })

    const allItems = query.data ?? []
    const items = allItems.filter((i) => !i.deleted_at)
    const trashedItems = allItems.filter((i) => !!i.deleted_at)

    const addItem = useMutation({
        mutationFn: async (input: VaultItemInput) => {
            if (!masterKey) throw new Error("Vault is locked")
            const userId = await getUserId()
            const existing = await readEncryptedItems(userId)

            const now = new Date().toISOString()
            const newItem: EncryptedVaultItem = {
                id: crypto.randomUUID(),
                website: await encryptField(input.website, masterKey),
                username: await encryptField(input.username, masterKey),
                password: await encryptField(input.password, masterKey),
                notes: await encryptField(input.notes, masterKey),
                favorite: false,
                category: input.category || "other",
                deleted_at: null,
                created_at: now,
                updated_at: now,
            }

            await writeEncryptedItems(userId, [...existing, newItem])
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vault-items"] }),
    })

    const updateItem = useMutation({
        mutationFn: async ({ id, ...input }: VaultItemInput & { id: string }) => {
            if (!masterKey) throw new Error("Vault is locked")
            const userId = await getUserId()
            const existing = await readEncryptedItems(userId)

            const updated = await Promise.all(
                existing.map(async (item) => {
                    if (item.id !== id) return item
                    return {
                        ...item,
                        website: await encryptField(input.website, masterKey),
                        username: await encryptField(input.username, masterKey),
                        password: await encryptField(input.password, masterKey),
                        notes: await encryptField(input.notes, masterKey),
                        category: input.category || "other",
                        updated_at: new Date().toISOString(),
                    }
                })
            )

            await writeEncryptedItems(userId, updated)
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vault-items"] }),
    })

    const deleteItem = useMutation({
        mutationFn: async (id: string) => {
            const userId = await getUserId()
            const existing = await readEncryptedItems(userId)

            const updated = existing.map((item) =>
                item.id === id
                    ? { ...item, deleted_at: new Date().toISOString() }
                    : item
            )

            await writeEncryptedItems(userId, updated)
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vault-items"] }),
    })

    const restoreItem = useMutation({
        mutationFn: async (id: string) => {
            const userId = await getUserId()
            const existing = await readEncryptedItems(userId)

            const updated = existing.map((item) =>
                item.id === id
                    ? { ...item, deleted_at: null }
                    : item
            )

            await writeEncryptedItems(userId, updated)
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vault-items"] }),
    })

    const permanentDeleteItem = useMutation({
        mutationFn: async (id: string) => {
            const userId = await getUserId()
            const existing = await readEncryptedItems(userId)
            const filtered = existing.filter((item) => item.id !== id)
            await writeEncryptedItems(userId, filtered)
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vault-items"] }),
    })

    const emptyTrash = useMutation({
        mutationFn: async () => {
            const userId = await getUserId()
            const existing = await readEncryptedItems(userId)
            const filtered = existing.filter((item) => !item.deleted_at)
            await writeEncryptedItems(userId, filtered)
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vault-items"] }),
    })

    const toggleFavorite = useMutation({
        mutationFn: async ({ id, favorite }: { id: string; favorite: boolean }) => {
            const userId = await getUserId()
            const existing = await readEncryptedItems(userId)

            const updated = existing.map((item) =>
                item.id === id
                    ? { ...item, favorite, updated_at: new Date().toISOString() }
                    : item
            )

            await writeEncryptedItems(userId, updated)
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
