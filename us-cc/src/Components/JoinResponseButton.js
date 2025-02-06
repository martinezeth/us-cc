import React, { useState, useEffect } from 'react';
import {
    Button,
    useToast,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
} from '@chakra-ui/react';
import { supabase } from '../supabaseClient';

const JoinResponseButton = ({ majorIncidentId, onJoinSuccess }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isParticipating, setIsParticipating] = useState(false);
    const cancelRef = React.useRef();
    const toast = useToast();

    useEffect(() => {
        checkParticipationStatus();
    }, [majorIncidentId]);

    const checkParticipationStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data } = await supabase
                .from('major_incident_organizations')
                .select('id')
                .eq('major_incident_id', majorIncidentId)
                .eq('organization_id', user.id)
                .single();

            setIsParticipating(!!data);
        } catch (error) {
            console.error('Error checking participation:', error);
        }
    };

    const handleJoin = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('major_incident_organizations')
                .insert([{
                    major_incident_id: majorIncidentId,
                    organization_id: user.id,
                    role: 'responder'
                }]);

            if (error) throw error;

            toast({
                title: "Joined successfully",
                description: "You are now part of the response effort",
                status: "success",
                duration: 5000
            });

            setIsParticipating(true);
            if (onJoinSuccess) onJoinSuccess();
        } catch (error) {
            toast({
                title: "Error joining response",
                description: error.message,
                status: "error",
                duration: 5000
            });
        } finally {
            setIsLoading(false);
            setIsOpen(false);
        }
    };

    if (isParticipating) {
        return null;
    }

    return (
        <>
            <Button
                colorScheme="green"
                onClick={() => setIsOpen(true)}
                size="lg"
                width="full"
            >
                Join Response Effort
            </Button>

            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={() => setIsOpen(false)}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            Join Response Effort
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to join this response effort?
                            Your organization will be added as a participating responder.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="green"
                                onClick={handleJoin}
                                ml={3}
                                isLoading={isLoading}
                            >
                                Join Response
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
};

export default JoinResponseButton;