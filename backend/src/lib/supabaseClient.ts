
import { createClient } from '@supabase/supabase-js';

// Helper pour accéder aux variables d'environnement en toute sécurité
const getEnvVar = (key: string): string => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key] || '';
    }
  } catch (e) {
    // Ignorer les erreurs d'accès
  }
  return '';
};

// Configuration avec les valeurs fournies (Fallback si .env non chargé)
const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL') || 'https://qtffbljwgikuahtffuko.supabase.co';
const SUPABASE_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'sb_publishable_tU2lNq4N6gW4NfDVW3chkg_ItoLUzzb';

if (!SUPABASE_KEY || SUPABASE_KEY === 'MISSING_ANON_KEY_PLACEHOLDER') {
  console.warn("VITE_SUPABASE_ANON_KEY est manquante. Vérifiez votre fichier .env");
}

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
