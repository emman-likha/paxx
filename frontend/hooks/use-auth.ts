import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { deriveAuthHash, generateSalt, arrayToBase64, base64ToArray } from '@/lib/security';
import { useRouter } from 'next/navigation';
import { validatePasswordStrength, validateUsername, detectLoginType } from '@/lib/password-validator';

export function useAuth() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const checkUsernameAvailability = async (username: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', username)
                .maybeSingle();

            if (error) throw error;
            return !data; // Available if no data found
        } catch (err) {
            console.error('Error checking username:', err);
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

            // 7. Create the public profile with the salt and username
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    email: email,
                    username: username,
                    master_password_salt: saltBase64,
                });

            if (profileError) throw profileError;

            router.push('/login?message=Account created successfully');
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
            // 1. Detect if input is email or username
            const loginType = detectLoginType(emailOrUsername);
            let email = emailOrUsername;

            // 2. If username, lookup the email
            if (loginType === 'username') {
                const { data: profile, error: lookupError } = await supabase
                    .from('profiles')
                    .select('email')
                    .eq('username', emailOrUsername)
                    .single();

                if (lookupError || !profile) {
                    throw new Error('Invalid username or password');
                }
                email = profile.email;
            }

            // 3. Fetch the user's salt
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('master_password_salt')
                .eq('email', email)
                .single();

            if (profileError || !profile) {
                throw new Error('Invalid credentials');
            }

            const salt = base64ToArray(profile.master_password_salt);

            // 4. Derive the login hash using their salt
            const loginHash = await deriveAuthHash(masterPassword, salt);

            // 5. Sign in with the derived hash
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password: loginHash,
            });

            if (signInError) throw signInError;

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return {
        signUp,
        signIn,
        signOut,
        checkUsernameAvailability,
        isLoading,
        error
    };
}
