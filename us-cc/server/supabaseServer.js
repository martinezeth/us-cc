const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './dbConnection.env' })

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

module.exports = supabase