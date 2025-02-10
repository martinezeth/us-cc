import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    GridItem,
    VStack,
    Text,
    Avatar,
    Badge,
    Button,
    useToast,
    Alert,
    AlertIcon,
    useDisclosure,
    Heading
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { supabase } from '../supabaseClient';
import ProfileTabs from '../Components/ProfileTabs';
import EditProfileModal from '../Components/EditProfileModal';
import { getProfileUsername, isDemoProfile } from '../Components/ProfileHelpers';

const SectionCard = ({ children, title }) => (
    <Box
        bg="white"
        borderRadius="lg"
        boxShadow="sm"
        p={6}
        border="1px solid"
        borderColor="gray.100"
    >
        {title && (
            <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.700">
                {title}
            </Text>
        )}
        {children}
    </Box>
);

const StatCard = ({ label, value, helpText }) => (
    <Box
        bg="white"
        borderRadius="lg"
        boxShadow="sm"
        p={6}
        border="1px solid"
        borderColor="gray.100"
        w="100%"
    >
        <VStack spacing={1} align="start">
            <Text color="gray.500" fontSize="sm">{label}</Text>
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                {value}
            </Text>
            {helpText && (
                <Text fontSize="xs" color="gray.500">
                    {helpText}
                </Text>
            )}
        </VStack>
    </Box>
);

export default function Profile() {
    const [profileData, setProfileData] = useState(null);
    const [volunteerData, setVolunteerData] = useState(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const { username } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        fetchProfileData();
    }, [username]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);

            // Authentication check
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) {
                toast({
                    title: "Authentication required",
                    description: "Please login to view profiles",
                    status: "error",
                    duration: 5000,
                });
                navigate('/login');
                return;
            }

            // Determine if user is viewing their own profile
            // by comparing the URL username with current user's email prefix
            const isOwn = currentUser.email.split('@')[0] === username;
            setIsOwnProfile(isOwn);

            // Set initial targetUserId - if viewing own profile, use current user's ID
            let targetUserId = isOwn ? currentUser.id : null;

            // Profile lookup logic for other users' profiles
            if (!isOwn) {
                // First check if it's a demo profile or organization
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('*')
                    .or(`organization_name.eq.'Demo Organization',full_name.eq.'Demo Volunteer'`);

                // Try to find the demo profile first
                let targetProfile = profiles?.find(p => getProfileUsername(p) === username);

                if (!targetProfile) {
                    // If not a demo profile, try to find by organization name
                    const { data: orgProfiles } = await supabase
                        .from('profiles')
                        .select('*')
                        .not('organization_name', 'is', null);

                    targetProfile = orgProfiles?.find(p => getProfileUsername(p) === username);

                    // If still not found, try email prefix lookup
                    if (!targetProfile) {
                        const { data: userId } = await supabase.rpc('get_user_id_by_email_prefix', {
                            prefix_param: username
                        });

                        if (!userId) throw new Error("User not found");
                        targetUserId = userId;
                    }
                }

                if (targetProfile) {
                    targetUserId = targetProfile.id;
                }
            }

            // Final check to ensure we have a valid user ID
            if (!targetUserId) throw new Error("User not found");

            // Now fetch the profile data
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', targetUserId)
                .single();

            if (profileError) throw profileError;

            // Set profile data
            setProfileData({
                id: targetUserId,
                name: profile.organization_name || profile.full_name || username,
                username: username,
                date_joined: currentUser.created_at,
                city: profile.city || null,
                state: profile.state || null,
                phone: profile.phone || null,
                address: profile.address || null,
                mission_statement: profile.mission_statement || null,
                organization_name: profile.organization_name || null,
                is_organization: !!profile.organization_name
            });

            // Only fetch volunteer data if not an organization
            if (!currentUser.user_metadata?.is_organization) {
                const { data: volunteerInfo } = await supabase
                    .from('volunteer_signups')
                    .select('*')
                    .eq('user_id', targetUserId)
                    .single();

                if (volunteerInfo) {
                    // Get total incident responses count
                    const { count: totalResponses } = await supabase
                        .from('opportunity_responses')
                        .select('*', { count: 'exact', head: true })
                        .eq('volunteer_id', targetUserId);

                    // Get active opportunities count - include both accepted and pending
                    const { data: activeOpps } = await supabase
                        .from('opportunity_responses')
                        .select('id')
                        .eq('volunteer_id', targetUserId)
                        .in('status', ['accepted', 'pending']);

                    setVolunteerData({
                        ...volunteerInfo,
                        total_responses: totalResponses || 0,
                        active_opportunities: activeOpps?.length || 0
                    });
                }
            }

        } catch (error) {
            console.error('Error fetching profile:', error);
            toast({
                title: "Error",
                description: error.message === "User not found" ?
                    `Could not find profile for user "${username}"` :
                    "Failed to load profile data",
                status: "error",
                duration: 5000,
            });
            if (error.message === "User not found") {
                setTimeout(() => navigate('/'), 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSuccess = (updatedData) => {
        // Update profile data while preserving the name and username
        setProfileData(prev => ({
            ...prev,
            ...updatedData,
            name: prev.name || updatedData.full_name,
            username: prev.username, // Preserve username
            is_organization: prev.is_organization // Preserve organization status
        }));

        // Update volunteer data if it exists
        if (volunteerData) {
            setVolunteerData(prev => ({
                ...prev,
                skills: updatedData.skills,
                availability: updatedData.availability,
                city: updatedData.city
            }));
        }
    };

    if (loading) {
        return (
            <Box minH="90vh" display="flex" alignItems="center" justifyContent="center">
                <Text>Loading...</Text>
            </Box>
        );
    }

    if (!profileData) {
        return (
            <Box minH="90vh" display="flex" alignItems="center" justifyContent="center">
                <Alert status="error">
                    <AlertIcon />
                    Profile not found
                </Alert>
            </Box>
        );
    }

    return (
        <Box minH="90vh" bg="gray.50" pt={{ base: 4, md: 8 }} pb={{ base: 8, md: 12 }}>
            <Box maxW="7xl" mx="auto" px={{ base: 2, md: 4 }}>
                <Grid
                    templateColumns={{ base: "1fr", lg: "300px 1fr" }}
                    gap={{ base: 4, md: 8 }}
                    overflowX="hidden"
                >
                    {/* Left Sidebar */}
                    <GridItem>
                        <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                            <SectionCard>
                                <VStack spacing={{ base: 3, md: 4 }} align="center">
                                    <Avatar
                                        size={{ base: "lg", md: "2xl" }}
                                        name={profileData.name}
                                        bg={isOwnProfile ? "gray.500" : "blue.500"}
                                    />
                                    <VStack spacing={{ base: 0.5, md: 1 }}>
                                        <Text
                                            fontSize={{ base: "md", md: "xl" }}
                                            fontWeight="bold"
                                            textAlign="center"
                                        >
                                            {profileData.name}
                                        </Text>
                                        <Text
                                            color="gray.500"
                                            fontSize={{ base: "sm", md: "md" }}
                                        >
                                            @{profileData.username}
                                        </Text>
                                        {profileData.city && profileData.state && (
                                            <Text
                                                color="gray.500"
                                                fontSize={{ base: "xs", md: "sm" }}
                                                textAlign="center"
                                            >
                                                📍 {profileData.city}, {profileData.state}
                                            </Text>
                                        )}
                                        {volunteerData && (
                                            <Badge
                                                colorScheme="green"
                                                px={2}
                                                py={1}
                                                fontSize={{ base: "xs", md: "sm" }}
                                            >
                                                Volunteer
                                            </Badge>
                                        )}
                                        {profileData.is_organization && (
                                            <Badge
                                                colorScheme="blue"
                                                px={2}
                                                py={1}
                                                fontSize={{ base: "xs", md: "sm" }}
                                            >
                                                Organization
                                            </Badge>
                                        )}
                                    </VStack>
                                    {isOwnProfile && (
                                        <>
                                            <Button
                                                leftIcon={<EditIcon />}
                                                size={{ base: "sm", md: "md" }}
                                                onClick={onOpen}
                                                width={{ base: "full", md: "auto" }}
                                            >
                                                Edit Profile
                                            </Button>
                                            <EditProfileModal
                                                isOpen={isOpen}
                                                onClose={onClose}
                                                userData={profileData}
                                                volunteerData={volunteerData}
                                                onUpdateSuccess={handleUpdateSuccess}
                                                isOrganization={profileData.is_organization}
                                            />
                                        </>
                                    )}
                                </VStack>
                            </SectionCard>

                            {volunteerData && (
                                <SectionCard title="Volunteer Stats">
                                    <VStack
                                        spacing={{ base: 3, md: 4 }}
                                        align="stretch"
                                        width="100%"
                                    >
                                        <StatCard
                                            label="Total Responses"
                                            value={volunteerData.total_responses || "0"}
                                            helpText="All time"
                                        />
                                        <StatCard
                                            label="Active Opportunities"
                                            value={volunteerData.active_opportunities || "0"}
                                            helpText="Currently participating"
                                        />
                                    </VStack>
                                </SectionCard>
                            )}
                        </VStack>
                    </GridItem>

                    <GridItem>
                        <ProfileTabs
                            profileData={profileData}
                            volunteerData={volunteerData}
                            isOwnProfile={isOwnProfile}
                        />
                    </GridItem>
                </Grid>
            </Box>
        </Box>
    );
}