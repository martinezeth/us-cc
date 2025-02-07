const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './dbConnection.env' });

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

async function fetchIncidents() {
    try {
        const { data, error } = await supabase
            .from('incidents')
            .select('*');
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching incidents:', error);
        throw error;
    }
}


module.exports = { fetchIncidents, };