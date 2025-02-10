const handleUnregister = async (opportunityId) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        // Delete the opportunity response first
        const { error: responseError } = await supabase
            .from('opportunity_responses')
            .delete()
            .eq('opportunity_id', opportunityId)
            .eq('volunteer_id', user.id);

        if (responseError) throw responseError;

        // Delete the assignment
        const { error: assignmentError } = await supabase
            .from('major_incident_volunteer_assignments')
            .delete()
            .eq('opportunity_id', opportunityId)
            .eq('volunteer_id', user.id);

        if (assignmentError) throw assignmentError;

        toast({
            title: "Success",
            description: "Successfully unregistered from opportunity",
            status: "success",
            duration: 3000
        });

        // Refresh the opportunities list
        fetchOpportunities();
    } catch (error) {
        console.error('Error unregistering:', error);
        toast({
            title: "Error",
            description: "Failed to unregister from opportunity",
            status: "error",
            duration: 5000
        });
    }
}; 