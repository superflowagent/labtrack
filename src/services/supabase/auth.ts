import { supabase } from '@/services/supabase/client'

export async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/login';
}
