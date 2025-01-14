import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

console.log('Initializing Supabase with URL:', supabaseUrl);

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage
    },
    global: {
        headers: {
            'x-custom-trace': 'debug-session'
        }
    }
});

// Add an interceptor for all requests
const originalAuthBearer = supabase.rest.authBearer;
supabase.rest.authBearer = () => {
    const token = originalAuthBearer.call(supabase.rest);
    console.log('Debug - Token being used for request:', token);
    return token;
};

// Debug session handling
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth State Change Event:', event);
    console.log('Auth State Change Session:', session?.user?.email);

    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const token = session?.access_token;
        console.log('Token from session:', token?.slice(0, 10) + '...');

        // Store token in localStorage
        window.localStorage.setItem('supabase-auth-token', token);
    }

    if (event === 'SIGNED_OUT') {
        console.log('Signed out - clearing token');
        window.localStorage.removeItem('supabase-auth-token');
    }
});

// Initial session check
supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
        console.log('Initial session found for:', session.user.email);
        console.log('Token exists:', !!session.access_token);
    } else {
        console.log('No initial session found');
    }
});

export const checkAuthStatus = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Auth check error:', error);
            return null;
        }
        if (session) {
            console.log('Auth check - session found for:', session.user.email);
            return session;
        }
        console.log('Auth check - no session found');
        return null;
    } catch (err) {
        console.error('Auth check error:', err);
        return null;
    }
};

// Make debug functions available globally
window.debugSupabase = {
    checkSession: async () => {
        const { data } = await supabase.auth.getSession();
        console.log('Current session:', data.session);
        return data.session;
    },
    getToken: () => {
        return window.localStorage.getItem('supabase-auth-token');
    }
};