import React, { useState } from 'react';
import {
    Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalFooter, ModalBody, ModalCloseButton,
    FormControl, FormLabel, Input, Textarea,
    Button, VStack, Text
} from '@chakra-ui/react';
import { supabase } from '../supabaseClient';
import LocationSearch from './LocationSearch';

export default function CreatePostModal({ isOpen, onClose, onCreatePost }) {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [location, setLocation] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim() || !body.trim() || !location) {
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const newPost = {
                user_id: user.id,
                user_name: user.user_metadata?.name || user.email,
                user_username: user.email.split('@')[0],
                title: title.trim(),
                body: body.trim(),
                city: location.city,
                state: location.state,
                city_coords: `${location.lat},${location.lng}`,
                date_posted: new Date()
            };

            const { data, error } = await supabase
                .from('posts')
                .insert([newPost])
                .select();

            if (error) throw error;

            onCreatePost(data[0]);
            handleClose();
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setTitle('');
        setBody('');
        setLocation(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Create New Post</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Title</FormLabel>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Give your post a title"
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Content</FormLabel>
                            <Textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="What's on your mind?"
                                rows={4}
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Location</FormLabel>
                            <Text fontSize="sm" color="gray.600" mb={2}>
                                Please select your city to help others find relevant posts in their area
                            </Text>
                            <LocationSearch
                                mode="city"
                                placeholder="Search for your city..."
                                onSelect={(locationData) => {
                                    setLocation({
                                        city: locationData.city,
                                        state: locationData.state,
                                        lat: locationData.lat,
                                        lng: locationData.lng
                                    });
                                }}
                            />
                            {location && (
                                <Text fontSize="sm" color="blue.500" mt={2}>
                                    📍 {location.city}, {location.state}
                                </Text>
                            )}
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        isDisabled={!title.trim() || !body.trim() || !location}
                    >
                        Post
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}