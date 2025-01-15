const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const supabase = require('./supabaseServer');
const app = express();
require('dotenv').config({ path: './dbConnection.env' });

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Middleware to check if the user is in guest mode
const checkGuestMode = (req, res, next) => {
  if (req.headers['x-guest-mode'] === 'true') {
    req.isGuest = true;
  }
  next();
};

app.use(checkGuestMode);

// Update routes to handle guest mode and use Supabase
app.post('/api/create-event', async (req, res) => {
  if (req.isGuest) {
    return res.status(403).json({ error: 'Please log in to create an event' });
  }
  try {
    const { data, error } = await supabase
      .from('incidents')
      .insert([req.body]);
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/volunteer-signup', async (req, res) => {
  if (req.isGuest) {
    return res.status(403).json({ error: 'Please log in to sign up as a volunteer' });
  }
  try {
    const { data, error } = await supabase
      .from('volunteer_signups')
      .insert([req.body]);
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    console.log('Fetching posts...');
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('date_posted', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    // Transform the data to match frontend expectations if needed
    const transformedData = (data || []).map(post => ({
      id: post.id,
      user_name: post.user_name,
      user_username: post.user_username,
      title: post.title,
      body: post.body,
      date_posted: post.date_posted
    }));

    res.json(transformedData);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/posts/:username', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_username', req.params.username)
      .order('date_posted', { ascending: false });
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data || []); // Return empty array if no data
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/incidents', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});