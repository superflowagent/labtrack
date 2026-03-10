import { supabase } from '@/services/supabase/client'

export async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/login';
}

function getPasswordResetRedirectUrl() {
    return `${window.location.origin}/login`;
}

export async function sendPasswordResetEmail(email: string) {
    return supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getPasswordResetRedirectUrl(),
    });
}
