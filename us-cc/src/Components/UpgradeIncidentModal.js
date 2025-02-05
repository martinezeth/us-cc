import React, { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Textarea,
    VStack,
    Alert,
    AlertIcon,
    FormErrorMessage,
    useToast
} from '@chakra-ui/react';
import { supabase } from '../supabaseClient';

/*
    This component is used for Organizations to UPGRADE an existing incident to a major incident.
*/

const UpgradeIncidentModal = ({ isOpen, onClose, incident, onUpgradeSuccess }) => {
    const [formData, setFormData] = useState({
        title: incident?.description || '',
        description: '',
        severity_level: 'medium',
        radius_miles: 50,
        expected_duration_days: 7
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        if (formData.radius_miles < 1) newErrors.radius_miles = "Radius must be at least 1 mile";
        if (formData.expected_duration_days < 1) newErrors.expected_duration_days = "Duration must be at least 1 day";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Verify user is from an organization
            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_name')
                .eq('id', user.id)
                .single();

            if (!profile?.organization_name) {
                throw new Error('Only organizations can upgrade incidents');
            }

            // Create major incident
            const { data: majorIncident, error: majorIncidentError } = await supabase
                .from('major_incidents')
                .insert([{
                    title: formData.title,
                    description: formData.description,
                    severity_level: formData.severity_level,
                    radius_miles: formData.radius_miles,
                    expected_duration: `${formData.expected_duration_days} days`,
                    created_by: user.id,
                    original_incident_id: incident.incident_id,
                    location_lat: incident.location_lat,
                    location_lng: incident.location_lng,
                    status: 'active'
                }])
                .select()
                .single();

            if (majorIncidentError) throw majorIncidentError;

            // Add creating organization as participant
            const { error: orgError } = await supabase
                .from('major_incident_organizations')
                .insert([{
                    major_incident_id: majorIncident.id,
                    organization_id: user.id,
                    role: 'coordinator'
                }]);

            if (orgError) throw orgError;

            // Create initial update
            const { error: updateError } = await supabase
                .from('major_incident_updates')
                .insert([{
                    major_incident_id: majorIncident.id,
                    organization_id: user.id,
                    update_type: 'status',
                    content: 'Major incident created and response coordination initiated.',
                    priority_level: 'important',
                    is_public: true
                }]);

            if (updateError) throw updateError;

            // Create coordination channel
            const { error: channelError } = await supabase
                .from('coordination_channels')
                .insert([{
                    major_incident_id: majorIncident.id,
                    name: 'General',
                    description: 'Main coordination channel for this incident',
                    channel_type: 'general'
                }]);

            if (channelError) throw channelError;

            toast({
                title: "Success",
                description: "Incident has been upgraded to major incident status",
                status: "success",
                duration: 5000
            });

            if (onUpgradeSuccess) {
                onUpgradeSuccess(majorIncident);
            }
            onClose();

        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 5000
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Upgrade to Major Incident</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <Alert status="info">
                            <AlertIcon />
                            Upgrading this incident will create a coordinated response platform for multiple organizations.
                        </Alert>

                        <FormControl isRequired isInvalid={errors.title}>
                            <FormLabel>Incident Title</FormLabel>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    title: e.target.value
                                }))}
                                placeholder="Enter a clear, descriptive title"
                            />
                            {errors.title && <FormErrorMessage>{errors.title}</FormErrorMessage>}
                        </FormControl>

                        <FormControl isRequired isInvalid={errors.description}>
                            <FormLabel>Detailed Description</FormLabel>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    description: e.target.value
                                }))}
                                placeholder="Provide comprehensive details about the incident"
                                rows={4}
                            />
                            {errors.description && <FormErrorMessage>{errors.description}</FormErrorMessage>}
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Severity Level</FormLabel>
                            <Select
                                value={formData.severity_level}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    severity_level: e.target.value
                                }))}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </Select>
                        </FormControl>

                        <FormControl isRequired isInvalid={errors.radius_miles}>
                            <FormLabel>Impact Radius (miles)</FormLabel>
                            <NumberInput
                                value={formData.radius_miles}
                                onChange={(value) => setFormData(prev => ({
                                    ...prev,
                                    radius_miles: parseInt(value)
                                }))}
                                min={1}
                                max={500}
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                            {errors.radius_miles && <FormErrorMessage>{errors.radius_miles}</FormErrorMessage>}
                        </FormControl>

                        <FormControl isRequired isInvalid={errors.expected_duration_days}>
                            <FormLabel>Expected Duration (days)</FormLabel>
                            <NumberInput
                                value={formData.expected_duration_days}
                                onChange={(value) => setFormData(prev => ({
                                    ...prev,
                                    expected_duration_days: parseInt(value)
                                }))}
                                min={1}
                                max={365}
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                            {errors.expected_duration_days &&
                                <FormErrorMessage>{errors.expected_duration_days}</FormErrorMessage>}
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                    >
                        Upgrade Incident
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default UpgradeIncidentModal;