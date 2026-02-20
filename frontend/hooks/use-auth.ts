import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { deriveAuthHash, deriveKey, generateSalt, arrayToBase64, base64ToArray } from '@/lib/security';
import { useRouter } from 'next/navigation';
import { validatePasswordStrength, validateUsername } from '@/lib/password-validator';
import { useMasterKey } from './use-master-key';

export function useAuth() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { setMasterKey } = useMasterKey();

    const checkUsernameAvailability = async (username: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', username)
                .maybeSingle();

            if (error) throw error;
            return !data; // Available if no data found
        } catch (err: any) {
            console.error('Error checking username:', {
                message: err?.message || 'Unknown error',
                code: err?.code,
                details: err?.details,
                username: username, // Safe to log, not sensitive
            });
            return false;
        }
    };

    const signUp = async (email: string, username: string, masterPassword: string) => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Validate username format
            const usernameValidation = validateUsername(username);
            if (!usernameValidation.isValid) {
                throw new Error(usernameValidation.error);
            }

            // 2. Validate password strength
            const passwordValidation = validatePasswordStrength(masterPassword);
            if (!passwordValidation.isValid) {
                throw new Error('Password does not meet security requirements');
            }

            // 3. Check username availability
            const isAvailable = await checkUsernameAvailability(username);
            if (!isAvailable) {
                throw new Error('Username is already taken');
            }

            // 4. Generate a unique salt for this user
            const salt = generateSalt();
            const saltBase64 = arrayToBase64(salt);

            // 5. Derive the login hash (this is what gets sent as the "password")
            const loginHash = await deriveAuthHash(masterPassword, salt);

            // 6. Create the account in Supabase Auth
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password: loginHash,
            });

            if (signUpError) throw signUpError;
            if (!data.user) throw new Error('Sign up failed');

            // Redirect to verification page with email, username, and salt
            // The profile will be updated AFTER email verification when user is authenticated
            const params = new URLSearchParams({
                email: email,
                username: username,
                salt: saltBase64,
            });
            router.push(`/verify-email?${params.toString()}`);
        } catch (err: any) {
            setError(err.message || 'An error occurred during sign up');
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (emailOrUsername: string, masterPassword: string) => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Use the RPC function to look up email + salt (bypasses RLS)
            const { data: lookup, error: lookupError } = await supabase
                .rpc('lookup_user_for_signin', { login_input: emailOrUsername })
                .single<{ email: string; master_password_salt: string }>();

            if (lookupError || !lookup) {
                throw new Error('Invalid username or password');
            }

            const email = lookup.email;
            const salt = base64ToArray(lookup.master_password_salt);

            // 4. Derive the login hash using their salt
            const loginHash = await deriveAuthHash(masterPassword, salt);

            // 5. Sign in with the derived hash
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password: loginHash,
            });

            if (signInError) throw signInError;

            // 6. Derive the encryption key and store in context
            const encryptionKey = await deriveKey(masterPassword, salt);
            setMasterKey(encryptionKey);

            // Mark session for tab-close detection (sessionStorage clears on tab close)
            sessionStorage.setItem('paxx-tab-session', 'true');

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    const verifyEmailWithCode = async (email: string, token: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'signup'
            });

            if (error) throw error;
            return data;
        } catch (err: any) {
            setError(err.message || 'Verification failed');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        setMasterKey(null);
        sessionStorage.removeItem('paxx-tab-session');
        sessionStorage.removeItem('paxx-preload-shown');
        await supabase.auth.signOut();
        router.push('/login');
    };

    return {
        signUp,
        signIn,
        signOut,
        checkUsernameAvailability,
        verifyEmailWithCode,
        isLoading,
        error
    };
}
