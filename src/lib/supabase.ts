import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get Supabase URL and Anon Key from environment variables (Vite / Vercel) or localStorage
export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('whieda_supabase_url') : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('whieda_supabase_anon_key') : null;

  const url = (storedUrl || envUrl || '').trim();
  const anonKey = (storedKey || envKey || '').trim();

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey && url.startsWith('http') && !url.includes('YOUR_SUPABASE_URL')),
  };
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem('whieda_supabase_url', url.trim());
    } else {
      localStorage.removeItem('whieda_supabase_url');
    }
    if (anonKey.trim()) {
      localStorage.setItem('whieda_supabase_anon_key', anonKey.trim());
    } else {
      localStorage.removeItem('whieda_supabase_anon_key');
    }
  }
};

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return null;
  }

  if (cachedClient && lastUsedUrl === url && lastUsedKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    lastUsedUrl = url;
    lastUsedKey = anonKey;
    return cachedClient;
  } catch (error) {
    console.error('Erreur initialisation Supabase client:', error);
    return null;
  }
};

export const testSupabaseConnection = async (customUrl?: string, customKey?: string): Promise<{ success: boolean; message: string; details?: any }> => {
  const url = customUrl || getSupabaseConfig().url;
  const key = customKey || getSupabaseConfig().anonKey;

  if (!url || !key) {
    return {
      success: false,
      message: 'URL Supabase ou clé API Anon manquante.',
    };
  }

  try {
    const testClient = createClient(url, key);
    // Ping a lightweight query or check auth session
    const { data, error } = await testClient.from('products').select('count', { count: 'exact', head: true });
    
    if (error && error.code !== 'PGRST116') {
      // If table 'products' doesn't exist yet, test connection with auth
      const authTest = await testClient.auth.getSession();
      if (authTest.error) {
        return {
          success: false,
          message: `Échec de connexion Supabase : ${error.message || authTest.error.message}`,
          details: error,
        };
      }
      return {
        success: true,
        message: 'Connexion Supabase établie avec succès (les tables peuvent nécessiter d’exécuter le script schema.sql).',
        details: { note: 'Auth OK, table check returned: ' + error.message },
      };
    }

    return {
      success: true,
      message: 'Connexion Supabase et accès à la base de données réussis !',
      details: data,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erreur inattendue : ${err.message || String(err)}`,
      details: err,
    };
  }
};
