# Crisis Companion

## About Crisis Companion
Crisis Companion is a comprehensive disaster response and community coordination platform that bridges the gap between local organizations, volunteers, and communities during times of crisis. Built with React and powered by Supabase, it provides real-time incident tracking, volunteer coordination, and community communication tools.

## Live Demo Access
Visit the live demo at: [Crisis Companion Demo](https://martinezeth.github.io/us-cc/)

### Demo Accounts
From the landing page, you can click the "Try Demo Accounts" button, or simply click 'Login' on the header component to be greeted with the
option to choose from a demo 'Organization' account or a demo 'Volunteer' account.

## Key Features

### 🗺️ Interactive Incident Map
- Real-time incident visualization and reporting
- Location-based filtering and incident details
- Support for multiple incident types (fires, wildfires, floods, earthquakes, etc.)

### 👥 Community Posts & Engagement
- Location-based community posts
- Real-time commenting and discussion system
- Post filtering by proximity
- Like and interaction features

### 🤝 Volunteer Management System
#### For Organizations:
- Create and manage volunteer opportunities
- Track volunteer responses and applications
- Direct messaging with volunteers
- Analytics dashboard for volunteer engagement
- Opportunity status tracking (active/archived)


#### For Volunteers:
- Skill-based opportunity matching
- Real-time messaging with organizations
- Response tracking and history
- Customizable volunteer profile
- Location-based opportunity discovery


### 📱 Responsive Design
- Responsive mobile design


## Technical Features
- **Frontend**: React.js with Chakra UI
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time Updates**: Supabase Real-time subscriptions
- **Mapping**: Leaflet.js integration
- **State Management**: React Hooks
- **Styling**: Chakra UI

## User Guide

### Each Account Type:
1. **Report Incidents**: Use the incident reporting feature
2. **View Incidents**: Use the map view of georeferenced incident reports
3. **Create Community Posts**: Post on the community forums
4. **Interact with Community Posts**: Like and comment on community forum posts

### For Organizations
1. **Sign In**: Use the 'Organization Demo' account
2. **Create Opportunities**: Navigate to the Organization Dashboard
3. **Manage Volunteers**: Track responses and communicate with volunteers
4. **Verified check**: Showcased on incident reports and posts
5. **Track**: Monitor organization opportunities and volunteer engagement

### For Volunteers
1. **Sign In**: Use the 'Volunteer Demo' account
2. **Browse Opportunities**: Explore available volunteer positions
3. **Apply**: Sign up for opportunities matching your skills
4. **Communicate**: Use the messaging system to coordinate with organizations
5. **Track**: Monitor your volunteer history and engagement

## Local Development

### Prerequisites
- Node.js and npm installed
- Supabase account (for backend services)

### Environment Setup
Create a `.env` file in the root directory with the following variables:
`REACT_APP_SUPABASE_URL=your_supabase_url`
`REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key`

### Installation
```bash
# Clone the repository
git clone https://github.com/martinezeth/us-cc

# Install dependencies
cd crisis-companion
npm install

# Start the development server
npm start
```

### Note
No separate backend server setup is required as the application uses Supabase for all backend services including authentication, database, and real-time features.
