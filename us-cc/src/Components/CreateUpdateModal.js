import React, { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Textarea,
    Select,
    VStack,
} from '@chakra-ui/react';

const CreateUpdateModal = ({ isOpen, onClose, onSubmit }) => {
    const [content, setContent] = useState('');
    const [priority, setPriority] = useState('normal');
    const [updateType] = useState('general');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) return;
        
        setIsSubmitting(true);
        try {
            await onSubmit({
                content: content.trim(),
                priority_level: priority,
                update_type: updateType
            });
            setContent('');
            setPriority('normal');
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Post Update</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel>Priority Level</FormLabel>
                            <Select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <option value="normal">Normal</option>
                                <option value="urgent">Urgent</option>
                                <option value="emergency">Emergency</option>
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Update Content</FormLabel>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Enter your update here..."
                                rows={4}
                            />
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
                        isDisabled={!content.trim()}
                    >
                        Post Update
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreateUpdateModal; 