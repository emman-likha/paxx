export interface PasswordValidation {
    isValid: boolean;
    strength: 'weak' | 'medium' | 'strong';
    requirements: {
        minLength: boolean;
        hasUppercase: boolean;
        hasLowercase: boolean;
        hasNumber: boolean;
        hasSpecialChar: boolean;
    };
}

/**
 * Validates password strength based on security requirements
 * @param password - The password to validate
 * @returns PasswordValidation object with validation results
 */
export function validatePasswordStrength(password: string): PasswordValidation {
    const requirements = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
    };

    const isValid = Object.values(requirements).every(Boolean);

    // Calculate strength based on requirements met
    const requirementsMet = Object.values(requirements).filter(Boolean).length;
    let strength: 'weak' | 'medium' | 'strong' = 'weak';

    if (requirementsMet === 5) {
        strength = 'strong';
    } else if (requirementsMet >= 3) {
        strength = 'medium';
    }

    return {
        isValid,
        strength,
        requirements,
    };
}

/**
 * Gets a simple strength label for the password
 * @param password - The password to evaluate
 * @returns Strength level as a string
 */
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    return validatePasswordStrength(password).strength;
}

/**
 * Validates username format
 * @param username - The username to validate
 * @returns Object with validation result and error message
 */
export function validateUsername(username: string): { isValid: boolean; error?: string } {
    if (!username) {
        return { isValid: false, error: 'Username is required' };
    }

    if (username.length < 3) {
        return { isValid: false, error: 'Username must be at least 3 characters' };
    }

    if (username.length > 20) {
        return { isValid: false, error: 'Username must be 20 characters or less' };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return { isValid: false, error: 'Username can only contain letters, numbers, underscore, and hyphen' };
    }

    return { isValid: true };
}

/**
 * Detects if input is an email or username
 * @param input - The input string to check
 * @returns 'email' or 'username'
 */
export function detectLoginType(input: string): 'email' | 'username' {
    // Simple email detection (contains @ and .)
    return input.includes('@') && input.includes('.') ? 'email' : 'username';
}
