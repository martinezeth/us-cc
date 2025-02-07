const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './dbConnection.env' });

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

async function getUserPostData(userId) {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('user_id', userId);
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching user post data:', error);
        throw error;
    }
}


module.exports = { getUserPostData, };