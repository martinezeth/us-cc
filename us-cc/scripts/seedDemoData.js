const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function seedDemoData() {
  try {
    // Create demo users
    const { data: { user: orgUser }, error: orgError } = await supabase.auth.signInWithPassword({
      email: 'demo@organization.com',
      password: 'demoOrg123!'
    });
    if (orgError) throw orgError;

    const { data: { user: volUser }, error: volError } = await supabase.auth.signInWithPassword({
      email: 'demo@volunteer.com',
      password: 'demoVolunteer123!'
    });
    if (volError) throw volError;

    // Create profiles
    await supabase.from('profiles').upsert([
      {
        id: orgUser.id,
        full_name: 'Demo Relief Organization',
        organization_name: 'Demo Relief Organization',
        city: 'San Francisco',
        state: 'California',
        location_lat: 37.7749,
        location_lng: -122.4194,
        is_organization: true
      },
      {
        id: volUser.id,
        full_name: 'Demo Volunteer',
        city: 'San Francisco',
        state: 'California',
        location_lat: 37.7749,
        location_lng: -122.4194,
        is_organization: false
      }
    ]);

    // Create volunteer signup
    await supabase.from('volunteer_signups').insert([
      {
        user_id: volUser.id,
        status: 'active',
        skills: ['Emergency Response', 'First Aid', 'Search and Rescue'],
        availability: ['Weekends', 'Evenings', 'Emergency Response'],
        city: 'San Francisco',
        state: 'California',
        country: 'United States',
        location_lat: 37.7749,
        location_lng: -122.4194
      }
    ]);

    // Create sample opportunities
    const { data: opportunities } = await supabase.from('volunteer_opportunities').insert([
      {
        organization_id: orgUser.id,
        title: 'Fire Response Team Needed',
        description: 'Looking for volunteers with fire response experience. Must have emergency response training.',
        location: 'Golden Gate Park, San Francisco, CA',
        required_skills: ['Emergency Response', 'First Aid'],
        status: 'open',
        location_lat: 37.7694,
        location_lng: -122.4862,
        radius_miles: 10
      },
      {
        organization_id: orgUser.id,
        title: 'Flood Relief Volunteers',
        description: 'Help needed with flood response and cleanup in Mission District.',
        location: 'Mission District, San Francisco, CA',
        required_skills: ['Emergency Response'],
        status: 'open',
        location_lat: 37.7599,
        location_lng: -122.4148,
        radius_miles: 5
      }
    ]).select();

    // Create sample posts
    const { data: posts } = await supabase.from('posts').insert([
      {
        user_id: orgUser.id,
        user_name: 'Demo Relief Organization',
        user_username: 'demo-org',
        title: 'Fire Safety Tips',
        body: 'Important fire safety information for the community.',
        city: 'San Francisco',
        state: 'California',
        location_lat: 37.7749,
        location_lng: -122.4194
      },
      {
        user_id: volUser.id,
        user_name: 'Demo Volunteer',
        user_username: 'demo-volunteer',
        title: 'Volunteer Experience',
        body: 'Sharing my experience helping with the recent flood response.',
        city: 'San Francisco',
        state: 'California',
        location_lat: 37.7749,
        location_lng: -122.4194
      }
    ]).select();

    // Create sample post interactions
    await supabase.from('post_comments').insert([
      {
        post_id: posts[0].id,
        user_id: volUser.id,
        content: 'Great tips! Thanks for sharing.',
        user_email: 'demo@volunteer.com',
        user_name: 'Demo Volunteer'
      }
    ]);

    await supabase.from('post_likes').insert([
      {
        post_id: posts[0].id,
        user_id: volUser.id
      }
    ]);

    console.log('Demo data seeded successfully!');
  } catch (error) {
    console.error('Error seeding demo data:', error);
  }
}

seedDemoData();