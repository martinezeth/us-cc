export const getProfileUsername = (profile) => {
    if (profile.organization_name === 'Demo Organization') return 'demo';
    if (profile.full_name === 'Demo Volunteer') return 'demovolunteer';
    // For regular users, create a URL-friendly username
    return (profile.organization_name || profile.full_name)
        .toLowerCase()
        .replace(/\s+/g, '-');
};

export const isDemoProfile = (profile) => {
    return profile.organization_name === 'Demo Organization' ||
        profile.full_name === 'Demo Volunteer';
};