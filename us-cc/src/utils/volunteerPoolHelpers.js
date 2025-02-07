// Utility functions for managing volunteer pool status and assignments in major incidents

// Filter volunteers based on their assignment status and other criteria
export const filterVolunteers = (volunteers, filters) => {
    return volunteers.filter(volunteer => {
        // First apply status filter
        const matchesStatus = filters.status === 'all' ? true :
            filters.status === 'available' ? !volunteer.isAssigned :
                filters.status === 'assigned' ? volunteer.isAssigned : true;

        // Then apply skill filter if specified
        const matchesSkill = !filters.skill ||
            volunteer.skills?.includes(filters.skill);

        return matchesStatus && matchesSkill;
    });
};

// Process raw volunteer data to include assignment status and organization details
export const processVolunteerData = (poolData, assignments, profiles, signups, organizationProfiles) => {
    const orgNameMap = {};
    organizationProfiles?.forEach(org => {
        orgNameMap[org.id] = org.organization_name || org.full_name || 'Unknown Organization';
    });

    return poolData.map(entry => {
        const profile = profiles.find(p => p.id === entry.volunteer_id) || {};
        const signup = signups.find(s => s.user_id === entry.volunteer_id) || {};
        const assignment = assignments.find(a =>
            a.pool_entry_id === entry.id &&
            a.status === 'active'
        );

        return {
            id: entry.volunteer_id,
            poolEntryId: entry.id,
            name: profile.full_name || 'Unknown',
            location: `${profile.city || 'Unknown'}, ${profile.state || 'Unknown'}`,
            skills: signup.skills || [],
            availability: signup.availability || [],
            isAssigned: !!assignment,
            assignment: assignment ? {
                id: assignment.id,
                organizationId: assignment.organization_id,
                organizationName: orgNameMap[assignment.organization_id],
                status: assignment.status,
                assignedAt: assignment.assigned_at
            } : null,
            city: profile.city,
            state: profile.state
        };
    });
};


// Get distribution of skills across the volunteer pool
export const getSkillsDistribution = (volunteers) => {
    const distribution = {};
    volunteers.forEach(volunteer => {
        volunteer.skills?.forEach(skill => {
            distribution[skill] = (distribution[skill] || 0) + 1;
        });
    });
    return distribution;
};


// Check if a volunteer matches required skills for an opportunity
export const getSkillMatch = (volunteer, requiredSkills) => {
    if (!volunteer.skills || !requiredSkills) return { matches: [], percentage: 0 };

    const matches = volunteer.skills.filter(skill =>
        requiredSkills.includes(skill)
    );

    return {
        matches,
        percentage: (matches.length / requiredSkills.length) * 100
    };
};


// Calculate pool statistics
export const calculatePoolStats = (volunteers) => {
    if (!volunteers?.length) {
        return {
            totalVolunteers: 0,
            assignedVolunteers: 0,
            availableVolunteers: 0,
            skillDistribution: {},
            responseRate: 0,
            availabilityDistribution: {}
        };
    }

    const total = volunteers.length;
    const assigned = volunteers.filter(v => v.isAssigned).length;
    const available = total - assigned;

    // Calculate skill distribution
    const skillDistribution = getSkillsDistribution(volunteers);

    // Calculate availability distribution
    const availabilityDistribution = {};
    volunteers.forEach(volunteer => {
        volunteer.availability?.forEach(time => {
            availabilityDistribution[time] = (availabilityDistribution[time] || 0) + 1;
        });
    });

    return {
        totalVolunteers: total,
        assignedVolunteers: assigned,
        availableVolunteers: available,
        skillDistribution,
        availabilityDistribution,
        responseRate: total ? ((assigned / total) * 100).toFixed(1) : 0
    };
};

// Sort volunteers based on specific criteria
export const sortVolunteers = (volunteers, sortBy, opportunity = null) => {
    switch (sortBy) {
        case 'skills':
            if (opportunity?.required_skills) {
                return [...volunteers].sort((a, b) => {
                    const aMatch = getSkillMatch(a, opportunity.required_skills).percentage;
                    const bMatch = getSkillMatch(b, opportunity.required_skills).percentage;
                    return bMatch - aMatch;
                });
            }
            return [...volunteers].sort((a, b) =>
                (b.skills?.length || 0) - (a.skills?.length || 0)
            );

        case 'availability':
            return [...volunteers].sort((a, b) =>
                (b.availability?.length || 0) - (a.availability?.length || 0)
            );

        case 'location':
            if (opportunity?.location_lat && opportunity?.location_lng) {
                // Sort by distance to opportunity if coordinates available
                return [...volunteers].sort((a, b) => {
                    // Implementation of distance calculation would go here
                    // For now, return original order
                    return 0;
                });
            }
            return volunteers;

        default:
            return volunteers;
    }
};

// Get suggested volunteers for an opportunity based on skills and availability
export const getSuggestedVolunteers = (volunteers, opportunity, limit = 5) => {
    if (!opportunity?.required_skills) return [];

    return sortVolunteers([...volunteers], 'skills', opportunity)
        .filter(v => !v.isAssigned)
        .slice(0, limit);
};