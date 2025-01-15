import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Button, VStack, Text, Divider, Flex,
    HStack, NumberInput, NumberInputField,
    NumberInputStepper, NumberIncrementStepper,
    NumberDecrementStepper, Badge, Input, Icon,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure
} from '@chakra-ui/react';
import '../Styles/styles.css';
import CreatePostModal from '../Components/CreatePostModal';
import { supabase } from '../supabaseClient';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { BiComment } from 'react-icons/bi';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';

const Comment = ({ comment, onReply, depth = 0 }) => {
    const navigate = useNavigate();
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState(comment.replies || []);

    const handleUsernameClick = (e) => {
        e.stopPropagation();
        navigate(`/profile/${comment.user_email.split('@')[0]}`);
    };

    const handleReply = async () => {
        if (!replyContent.trim()) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const newReply = {
                post_id: comment.post_id,
                parent_id: comment.id,
                user_id: user.id,
                content: replyContent,
                user_email: user.email,
                user_name: user.user_metadata?.name || user.email
            };

            const { data, error } = await supabase
                .from('post_comments')
                .insert([newReply])
                .select()
                .single();

            if (error) throw error;

            setReplies([...replies, data]);
            setReplyContent('');
            setShowReplyInput(false);
            setShowReplies(true);
        } catch (error) {
            console.error('Error adding reply:', error);
        }
    };

    return (
        <Box pl={depth * 4}>
            <Box
                p={2}
                bg="gray.50"
                borderRadius="md"
                borderLeft="2px solid"
                borderLeftColor="blue.200"
            >
                <Text
                    fontSize="sm"
                    fontWeight="bold"
                    cursor="pointer"
                    color="blue.500"
                    _hover={{ textDecoration: 'underline' }}
                    onClick={handleUsernameClick}
                >
                    {comment.user_name}
                </Text>
                <Text>{comment.content}</Text>
                <HStack spacing={4} mt={1}>
                    <Text fontSize="xs" color="gray.500">
                        {new Date(comment.created_at).toLocaleString()}
                    </Text>
                    <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setShowReplyInput(!showReplyInput)}
                    >
                        Reply
                    </Button>
                </HStack>
            </Box>

            {showReplyInput && (
                <Box mt={2} pl={4}>
                    <HStack>
                        <Input
                            size="sm"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                        />
                        <Button size="sm" onClick={handleReply}>
                            Send
                        </Button>
                    </HStack>
                </Box>
            )}

            {replies.length > 0 && (
                <Button
                    size="xs"
                    variant="ghost"
                    leftIcon={showReplies ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    onClick={() => setShowReplies(!showReplies)}
                    mt={2}
                >
                    {showReplies ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                </Button>
            )}

            {showReplies && replies.map(reply => (
                <Box mt={2} key={reply.id}>
                    <Comment comment={reply} depth={depth + 1} />
                </Box>
            ))}
        </Box>
    );
};

export const Post = ({ postData, isDetailView = false }) => {
    const navigate = useNavigate();
    const [likes, setLikes] = useState(0);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [commentCount, setCommentCount] = useState(0);
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        fetchLikeCount();
        checkIfLiked();
        fetchCommentCount();
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchComments();
        }
    }, [isOpen]);

    const fetchLikeCount = async () => {
        try {
            const { count, error } = await supabase
                .from('post_likes')
                .select('id', { count: 'exact' })
                .eq('post_id', postData.id);

            if (error) throw error;
            setLikes(count || 0);
        } catch (error) {
            console.error('Error fetching like count:', error);
        }
    };

    const checkIfLiked = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase
                .from('post_likes')
                .select('id')
                .eq('post_id', postData.id)
                .eq('user_id', user.id);

            if (error) throw error;
            setIsLiked(data && data.length > 0);
        } catch (error) {
            console.error('Error checking like status:', error);
        }
    };

    const handleLike = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (isLiked) {
                // Unlike
                const { error } = await supabase
                    .from('post_likes')
                    .delete()
                    .eq('post_id', postData.id)
                    .eq('user_id', user.id);

                if (error) throw error;
                setLikes(prev => Math.max(0, prev - 1));
            } else {
                // Like
                const { error } = await supabase
                    .from('post_likes')
                    .insert([{
                        post_id: postData.id,
                        user_id: user.id
                    }]);

                if (error) throw error;
                setLikes(prev => prev + 1);
            }
            setIsLiked(!isLiked);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleComment = async () => {
        if (!newComment.trim()) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase
                .from('post_comments')
                .insert([{
                    post_id: postData.id,
                    user_id: user.id,
                    content: newComment,
                    user_email: user.email,
                    user_name: user.user_metadata?.name || user.email
                }])
                .select()
                .single();

            if (error) throw error;

            setComments([data, ...comments]);
            setNewComment('');
            setCommentCount(prev => prev + 1);
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const fetchCommentCount = async () => {
        try {
            const { count, error } = await supabase
                .from('post_comments')
                .select('id', { count: 'exact' })
                .eq('post_id', postData.id)
                .is('parent_id', null);

            if (error) throw error;
            setCommentCount(count || 0);
        } catch (error) {
            console.error('Error fetching comment count:', error);
        }
    };

    const fetchComments = async () => {
        try {
            const { data, error } = await supabase
                .from('post_comments')
                .select(`
                    *,
                    replies:post_comments!parent_id(*)
                `)
                .eq('post_id', postData.id)
                .is('parent_id', null)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const commentsWithReplies = data?.map(comment => ({
                ...comment,
                replies: comment.replies || []
            })) || [];

            setComments(commentsWithReplies);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handlePostClick = (e) => {
        if (e.target.closest('button')) return;
        onOpen();
    };

    const PostContent = () => (
        <Box>
            <Text fontSize="xl" fontWeight="bold">{postData.title}</Text>
            <Text mt={2}>{postData.body}</Text>
            {postData.city && postData.state && (
                <Badge colorScheme="blue" mt={2}>
                    📍 {postData.city}, {postData.state}
                </Badge>
            )}
            <HStack spacing={4} mt={4}>
                <Button
                    size="sm"
                    leftIcon={isLiked ? <Icon as={AiFillHeart} color="red.500" /> : <Icon as={AiOutlineHeart} />}
                    onClick={handleLike}
                    variant="ghost"
                >
                    {likes} {likes === 1 ? 'Like' : 'Likes'}
                </Button>
                <HStack spacing={1}>
                    <Icon as={BiComment} />
                    <Text fontSize="sm" color="gray.600">
                        {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
                    </Text>
                </HStack>
            </HStack>
        </Box>
    );

    return (
        <>
            <Box
                p={5}
                shadow="md"
                borderWidth="1px"
                borderRadius="md"
                bg="white"
                onClick={handlePostClick}
                cursor="pointer"
                _hover={{ shadow: 'lg' }}
                width="100%"
            >
                <PostContent />
            </Box>

            <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        <Text fontSize="sm" color="gray.500">
                            Posted by{' '}
                            <Text
                                as="span"
                                color="blue.500"
                                cursor="pointer"
                                _hover={{ textDecoration: 'underline' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/profile/${postData.user_username}`);
                                }}
                            >
                                {postData.user_name}
                            </Text>
                            {' '}on {new Date(postData.date_posted).toLocaleDateString()}
                        </Text>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack align="stretch" spacing={4}>
                            <PostContent />

                            <Divider my={4} />

                            <VStack align="stretch" spacing={4}>
                                <HStack>
                                    <Input
                                        placeholder="Write a comment..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                    <Button
                                        colorScheme="blue"
                                        onClick={handleComment}
                                        isDisabled={!newComment.trim()}
                                    >
                                        Post
                                    </Button>
                                </HStack>

                                {comments.map((comment) => (
                                    <Comment key={comment.id} comment={comment} />
                                ))}
                            </VStack>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default function Posts() {
    const [posts, setPosts] = useState([]);
    const { username } = useParams();
    const [loggedIn, setLoggedIn] = useState(false);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [userCoords, setUserCoords] = useState(null);
    const [searchRadius, setSearchRadius] = useState(25);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [isApplyingFilter, setIsApplyingFilter] = useState(false);

    const LocationFilter = () => (
        <Box
            p={3}
            bg="white"
            borderRadius="lg"
            shadow="sm"
            width="200px"
            maxHeight="fit-content"
        >
            <VStack spacing={2} align="stretch">
                <Text fontWeight="bold" fontSize="md">Filter by Location</Text>
                {!userCoords ? (
                    <Button
                        onClick={getUserLocation}
                        isLoading={isLoadingLocation}
                        colorScheme="blue"
                        size="sm"
                    >
                        Use My Location
                    </Button>
                ) : (
                    <VStack align="stretch" spacing={2}>
                        <Text fontSize="sm">Distance (miles)</Text>
                        <HStack spacing={2}>
                            <NumberInput
                                value={searchRadius}
                                onChange={(value) => setSearchRadius(parseInt(value))}
                                min={1}
                                max={100}
                                size="sm"
                                w="70px"
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                            <Text fontSize="sm">miles</Text>
                        </HStack>
                        <Button
                            colorScheme="blue"
                            onClick={applyFilter}
                            isLoading={isApplyingFilter}
                            size="sm"
                        >
                            Apply
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setUserCoords(null);
                                setSearchRadius(25);
                                fetchPosts();
                            }}
                            size="sm"
                        >
                            Clear
                        </Button>
                    </VStack>
                )}
            </VStack>
        </Box>
    );

    const applyFilter = async () => {
        if (!userCoords) return;
        setIsApplyingFilter(true);
        try {
            let { data, error } = await supabase.rpc('get_posts_within_radius', {
                user_lat: userCoords.lat,
                user_lng: userCoords.lng,
                radius_miles: Math.round(searchRadius)
            });

            if (error) {
                console.error('RPC Error:', error);
                const { data: allPosts, error: fetchError } = await supabase
                    .from('posts')
                    .select('*')
                    .order('date_posted', { ascending: false });

                if (fetchError) throw fetchError;

                data = allPosts.filter(post => {
                    if (!post.city_coords) return false;
                    const [postLat, postLng] = post.city_coords.split(',').map(Number);
                    const distance = calculateDistance(
                        userCoords.lat,
                        userCoords.lng,
                        postLat,
                        postLng
                    );
                    return distance <= searchRadius;
                });
            }

            setPosts(data || []);
        } catch (error) {
            console.error('Error applying filter:', error);
        } finally {
            setIsApplyingFilter(false);
        }
    };

    // Helper function for distance calculation
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 3959; // Constant for calculating distance in miles
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const fetchPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .order('date_posted', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setLoggedIn(true);
                fetchPosts();
            }
        };
        checkAuth();
    }, [username]);

    const getUserLocation = () => {
        setIsLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setIsLoadingLocation(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setIsLoadingLocation(false);
                }
            );
        }
    };

    const togglePostModal = () => {
        setIsPostModalOpen(!isPostModalOpen);
    };

    return (
        <Box maxW="1200px" mx="auto" py={8} px={4} width="100%">
            <Flex gap={6} alignItems="flex-start" width="100%">
                {loggedIn && (
                    <Box
                        width="200px"
                        flexShrink={0}
                        position="sticky"
                        top="20px"
                        alignSelf="flex-start"
                    >
                        <LocationFilter />
                    </Box>
                )}

                <Box
                    flex="1"
                    width="100%"
                    minWidth="0"
                >
                    <VStack spacing={4} align="stretch" width="100%">
                        <Button
                            colorScheme="blue"
                            size="lg"
                            onClick={togglePostModal}
                            borderRadius="full"
                            shadow="md"
                            width="100%"
                            p={6}
                            fontSize="lg"
                        >
                            Create New Post
                        </Button>

                        {posts.length === 0 ? (
                            <Box
                                textAlign="center"
                                p={8}
                                bg="white"
                                borderRadius="lg"
                                shadow="sm"
                                width="100%"
                            >
                                <Text fontSize="lg" color="gray.500">
                                    No posts found in this area.
                                </Text>
                            </Box>
                        ) : (
                            <VStack spacing={4} width="100%" align="stretch">
                                {posts.map((post, index) => (
                                    <Post key={index} postData={post} />
                                ))}
                            </VStack>
                        )}
                    </VStack>
                </Box>
            </Flex>

            <CreatePostModal
                isOpen={isPostModalOpen}
                onClose={togglePostModal}
                onCreatePost={(newPost) => setPosts([newPost, ...posts])}
            />
        </Box>
    );
}