/**
 * Type-safe API client for Paxx backend
 * This provides a centralized way to make API calls to the Elysia backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            credentials: 'include', // Important for cookies/sessions
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    }

    // Auth endpoints
    auth = {
        register: (data: {
            email: string;
            password: string;
            masterPassword: string;
        }) =>
            this.request('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        login: (data: { email: string; password: string }) =>
            this.request('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        logout: () =>
            this.request('/api/auth/logout', {
                method: 'POST',
            }),
    };

    // Vault endpoints
    vault = {
        getAll: () => this.request('/api/vault', { method: 'GET' }),

        getById: (id: string) => this.request(`/api/vault/${id}`, { method: 'GET' }),

        create: (data: {
            website: string;
            username: string;
            password: string;
            notes?: string;
        }) =>
            this.request('/api/vault', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        update: (
            id: string,
            data: {
                website?: string;
                username?: string;
                password?: string;
                notes?: string;
            }
        ) =>
            this.request(`/api/vault/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),

        delete: (id: string) =>
            this.request(`/api/vault/${id}`, { method: 'DELETE' }),
    };

    // Breach monitoring endpoints
    breach = {
        checkPasswords: (passwords: { id: string; hash: string }[]) =>
            this.request<{
                results: { id: string; compromised: boolean; exposures: number }[];
            }>('/api/breach/check-passwords', {
                method: 'POST',
                body: JSON.stringify({ passwords }),
            }),
    };

    // Health check
    health = () => this.request('/health', { method: 'GET' });
}

export const api = new ApiClient(API_URL);
