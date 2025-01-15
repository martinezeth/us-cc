const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../dbConnection.env' });

const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_ANON_KEY
);

const INCIDENT_TYPES = ['earthquake', 'fire', 'flood', 'firstAid', 'hail', 'windy', 'blizzard', 'lightning'];

async function seedDemoData() {
    try {
        // Create demo organization user
        const { data: orgUser, error: orgError } = await supabase.auth.signUp({
            email: 'demo@organization.com',
            password: 'demoOrg123!',
            options: {
                data: {
                    name: 'Demo Relief Organization',
                    is_organization: true
                }
            }
        });
        if (orgError) throw orgError;

        // Create demo volunteer user
        const { data: volUser, error: volError } = await supabase.auth.signUp({
            email: 'demo@volunteer.com',
            password: 'demoVolunteer123!',
            options: {
                data: {
                    name: 'Demo Volunteer',
                    is_organization: false
                }
            }
        });
        if (volError) throw volError;

        // Create profiles
        await supabase.from('profiles').upsert([
            {
                id: orgUser.user.id,
                full_name: 'Demo Relief Organization',
                organization_name: 'Demo Relief Organization',
                city: 'San Francisco',
                state: 'California',
                location_lat: 37.7749,
                location_lng: -122.4194
            },
            {
                id: volUser.user.id,
                full_name: 'Demo Volunteer',
                city: 'San Francisco',
                state: 'California',
                location_lat: 37.7749,
                location_lng: -122.4194
            }
        ]);

        // Create volunteer signup
        await supabase.from('volunteer_signups').insert([
            {
                user_id: volUser.user.id,
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

        // Create sample incidents
        const { data: incidents } = await supabase.from('incidents').insert([
            {
                incident_type: 'fire',
                description: 'Brush fire reported near Golden Gate Park',
                location_lat: 37.7694,
                location_lng: -122.4862,
                created_by: orgUser.user.id
            },
            {
                incident_type: 'flood',
                description: 'Flash flooding in Mission District',
                location_lat: 37.7599,
                location_lng: -122.4148,
                created_by: volUser.user.id
            },
            {
                incident_type: 'earthquake',
                description: 'Minor tremors reported in Downtown SF',
                location_lat: 37.7879,
                location_lng: -122.4075,
                created_by: volUser.user.id
            }
        ]).select();

        // Create volunteer opportunities
        const { data: opportunities } = await supabase.from('volunteer_opportunities').insert([
            {
                organization_id: orgUser.user.id,
                title: 'Fire Response Team Needed',
                description: 'Looking for volunteers with fire response experience. Must have emergency response training and be available for immediate deployment.',
                location: 'Golden Gate Park, San Francisco, CA',
                required_skills: ['Emergency Response', 'First Aid'],
                status: 'open',
                location_lat: 37.7694,
                location_lng: -122.4862,
                radius_miles: 10
            },
            {
                organization_id: orgUser.user.id,
                title: 'Flood Relief Volunteers',
                description: 'Help needed with flood response and cleanup in Mission District. Experience with water damage mitigation preferred.',
                location: 'Mission District, San Francisco, CA',
                required_skills: ['Emergency Response'],
                status: 'open',
                location_lat: 37.7599,
                location_lng: -122.4148,
                radius_miles: 5
            },
            {
                organization_id: orgUser.user.id,
                title: 'Emergency Medical Support',
                description: 'Seeking medical professionals for emergency response team. Must have current medical certification.',
                location: 'Downtown San Francisco, CA',
                required_skills: ['Medical Aid', 'First Aid'],
                status: 'open',
                location_lat: 37.7879,
                location_lng: -122.4075,
                radius_miles: 8
            }
        ]).select();

        // Create volunteer responses
        await supabase.from('opportunity_responses').insert([
            {
                opportunity_id: opportunities[0].id,
                volunteer_id: volUser.user.id,
                status: 'accepted'
            },
            {
                opportunity_id: opportunities[1].id,
                volunteer_id: volUser.user.id,
                status: 'pending'
            }
        ]);

        // Create sample posts
        const { data: posts } = await supabase.from('posts').insert([
            {
                user_id: orgUser.user.id,
                user_name: 'Demo Relief Organization',
                user_username: 'demo-org',
                title: 'Fire Safety Tips',
                body: 'Important fire safety information for the community. Please ensure you have an evacuation plan and emergency kit ready.',
                city: 'San Francisco',
                state: 'California',
                location_lat: 37.7749,
                location_lng: -122.4194
            },
            {
                user_id: volUser.user.id,
                user_name: 'Demo Volunteer',
                user_username: 'demo-volunteer',
                title: 'Volunteer Experience',
                body: 'Sharing my experience helping with the recent flood response. The community really came together!',
                city: 'San Francisco',
                state: 'California',
                location_lat: 37.7749,
                location_lng: -122.4194
            }
        ]).select();

        // Create sample messages
        // Create messages (only after volunteer response exists)
        await supabase.from('messages').insert([
            // Direct message to specific volunteer
            {
                organization_id: orgUser.user.id,
                volunteer_id: volUser.user.id,
                opportunity_id: opportunities[0].id,  // This is where volunteer has 'accepted' status
                message: 'Thank you for accepting the opportunity! Can you arrive at 9 AM tomorrow?',
                is_group_message: false
            },
            // Group message to all volunteers for this opportunity
            {
                organization_id: orgUser.user.id,
                volunteer_id: null,  // null volunteer_id indicates group message
                opportunity_id: opportunities[0].id,
                message: 'Important update for all volunteers: Meeting point has been moved to the north entrance.',
                is_group_message: true
            }
        ]);

        // Create sample post comments and likes
        await supabase.from('post_comments').insert([
            {
                post_id: posts[0].id,
                user_id: volUser.user.id,
                content: 'Great tips! Thanks for sharing.',
                user_email: 'demo@volunteer.com',
                user_name: 'Demo Volunteer'
            }
        ]);

        await supabase.from('post_likes').insert([
            {
                post_id: posts[0].id,
                user_id: volUser.user.id
            }
        ]);

        console.log('Demo data seeded successfully!');
    } catch (error) {
        console.error('Error seeding demo data:', error);
    }
}

seedDemoData();