const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './dbConnection.env' });

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

function isGuestMode(req) {
    return req.headers['x-guest-mode'] === 'true';
}

async function validateCredentials(username, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: username,
            password: password,
        });
        if (error) throw error;
        return data.user !== null;
    } catch (error) {
        console.error('Error validating credentials:', error);
        return false;
    }
}

async function createUser(username, password, name) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: username,
            password: password,
            options: {
                data: { name: name }
            }
        });
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

function decodeToken(token, secret) {
    return jwt.verify(token, secret);
}

module.exports = { validateCredentials, createUser, decodeToken, isGuestMode };