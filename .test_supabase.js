const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.error('=== Supabase Connection Test ===');
console.error('URL:', url ? url.substring(0, 30) + '...' : 'NOT SET');
console.error('ANON KEY starts with:', anonKey ? anonKey.substring(0, 30) + '...' : 'NOT SET');
console.error('ANON KEY length:', anonKey ? anonKey.length : 0);

if (!url || !anonKey) {
    console.error('ERROR: Missing configuration');
    process.exit(1);
}

// Create Supabase client
const supabase = createClient(url, anonKey);

// Test the connection
async function test() {
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error('AUTH ERROR:', error.message);
        } else {
            console.error('AUTH SESSION OK:', data.session ? 'YES' : 'NO SESSION');
        }
        
        // Try to list users
        const { data: users, error: userErr } = await supabase
            .from('profiles')
            .select('id, email')
            .limit(1);
        
        if (userErr) {
            console.error('DB ERROR:', userErr.message);
            if (userErr.message.toLowerCase().includes('jwt') || userErr.message.toLowerCase().includes('api key') || userErr.message.toLowerCase().includes('key')) {
                console.error('\n!!! ANON KEY IS INVALID !!!');
                process.exit(2);
            }
        } else {
            console.error('DB OK: Tables accessible');
            console.error('Users:', JSON.stringify(users));
        }
    } catch (e) {
        console.error('EXCEPTION:', e.message);
        process.exit(3);
    }
}

test();
