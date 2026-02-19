# Vault JSONB Migration

## Overview

Migrated from a per-row `vault_items` table (1 row per password) to a single-row `vaults` table with a JSONB `items` column (1 row per user).

## Why JSONB?

- **Fewer queries**: All vault operations are 1 read + 1 write instead of N queries
- **Atomic updates**: The entire vault is written in a single upsert — no partial states
- **Simpler RLS**: One policy on one row per user
- **Better for small-to-medium vaults**: Typical password managers hold <500 entries, well within JSONB limits

## Schema

```sql
CREATE TABLE public.vaults (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  items JSONB DEFAULT '[]'::jsonb NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

Each item in the JSONB array:

```json
{
  "id": "uuid",
  "website": "encrypted",
  "username": "encrypted",
  "password": "encrypted",
  "notes": "encrypted",
  "favorite": false,
  "category": "other",
  "deleted_at": null,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

## Mutation Pattern (Read-Modify-Write)

All mutations follow the same pattern:

1. `readEncryptedItems(userId)` — fetch the JSONB array from `vaults`
2. Apply the change in memory (append, map, or filter)
3. `writeEncryptedItems(userId, items)` — upsert the modified array back

| Mutation | In-memory operation | Needs decrypt? |
|---|---|---|
| `addItem` | Append new encrypted item | No |
| `updateItem` | Map array, re-encrypt target | Yes (target only) |
| `deleteItem` | Map array, set `deleted_at` | No |
| `restoreItem` | Map array, clear `deleted_at` | No |
| `permanentDeleteItem` | Filter out target | No |
| `emptyTrash` | Filter out all with `deleted_at` | No |
| `toggleFavorite` | Map array, flip `favorite` | No |

## Security

- Encryption is unchanged: AES-256-GCM per field, PBKDF2 key derivation
- Master password never leaves the browser
- RLS ensures `auth.uid() = user_id` for all operations
- Zero-knowledge architecture preserved — server only sees encrypted JSONB

## Migration

Migration `0009_migrate_to_jsonb_vault.sql`:
1. Creates `vaults` table
2. Enables RLS with owner-only policy
3. Aggregates existing `vault_items` rows into JSONB per user
4. Drops old `vault_items` table
