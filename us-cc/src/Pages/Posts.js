import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    VStack,
    Text,
    Divider,
    Flex,
    HStack,
    Badge,
    Input,
    Icon,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Heading,
    Select,
    useToast,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
    PopoverHeader,
    PopoverCloseButton,
    Portal,
    IconButton,
    useMediaQuery,
} from '@chakra-ui/react';
import { FiFilter } from 'react-icons/fi';
import { supabase } from '../supabaseClient';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { BiComment } from 'react-icons/bi';
import { ChevronUpIcon, ChevronDownIcon, AddIcon } from '@chakra-ui/icons';
import VerifiedBadge from '../Components/VerifiedBadge';
import CreatePostModal from '../Components/CreatePostModal';
import '../Styles/styles.css';

const Comment = ({ comment, onReply, depth = 0, isMobile }) => {
    const navigate = useNavigate();
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState(comment.replies || []);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setIsLoggedIn(!!user);
        };
        checkAuth();
    }, []);

    const handleUsernameClick = (e) => {
        e.stopPropagation();
        navigate(`/profile/${comment.user_email.split('@')[0]}`);
    };

    const handleReplyClick = () => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        setShowReplyInput(!showReplyInput);
    };

    const handleReply = async () => {
        if (!replyContent.trim()) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

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
        <Box pl={depth * (isMobile ? 2 : 4)}>
            <Box
                p={isMobile ? 2 : 3}
                bg="gray.50"
                borderRadius="md"
                borderLeft="2px solid"
                borderLeftColor="blue.200"
            >
                <Text
                    fontSize={isMobile ? "xs" : "sm"}
                    fontWeight="bold"
                    cursor="pointer"
                    color="blue.500"
                    _hover={{ textDecoration: 'underline' }}
                    onClick={handleUsernameClick}
                >
                    {comment.user_name}
                </Text>
                <Text fontSize={isMobile ? "sm" : "md"}>{comment.content}</Text>
                <HStack spacing={4} mt={1}>
                    <Text fontSize={isMobile ? "xs" : "sm"} color="gray.500">
                        {new Date(comment.created_at).toLocaleString()}
                    </Text>
                    <Button
                        size={isMobile ? "xs" : "sm"}
                        variant="ghost"
                        onClick={handleReplyClick}
                    >
                        {isLoggedIn ? 'Reply' : 'Login to Reply'}
                    </Button>
                </HStack>
            </Box>

            {showReplyInput && (
                <Box mt={2} pl={4}>
                    <HStack>
                        <Input
                            size={isMobile ? "sm" : "md"}
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                        />
                        <Button size={isMobile ? "sm" : "md"} onClick={handleReply}>
                            Send
                        </Button>
                    </HStack>
                </Box>
            )}

            {replies.length > 0 && (
                <Button
                    size={isMobile ? "xs" : "sm"}
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
                    <Comment comment={reply} depth={depth + 1} isMobile={isMobile} />
                </Box>
            ))}
        </Box>
    );
};

const Post = ({ postData, isMobile = false }) => {
    const navigate = useNavigate();
    const [likes, setLikes] = useState(0);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [commentCount, setCommentCount] = useState(0);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const toast = useToast();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setIsLoggedIn(!!user);
            if (user) {
                checkIfLiked();
            }
        };
        checkAuth();
    }, []);

    useEffect(() => {
        fetchLikeCount();
        fetchCommentCount();

        const likesSubscription = supabase
            .channel('likes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'post_likes',
                filter: `post_id=eq.${postData.id}`
            }, () => {
                fetchLikeCount();
            })
            .subscribe();

        const commentsSubscription = supabase
            .channel('comments')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'post_comments',
                filter: `post_id=eq.${postData.id}`
            }, () => {
                fetchCommentCount();
            })
            .subscribe();

        return () => {
            likesSubscription.unsubscribe();
            commentsSubscription.unsubscribe();
        };
    }, [postData.id]);

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

    const fetchCommentCount = async () => {
        try {
            const { count, error } = await supabase
                .from('post_comments')
                .select('id', { count: 'exact' })
                .eq('post_id', postData.id);

            if (error) throw error;
            setCommentCount(count || 0);
        } catch (error) {
            console.error('Error fetching comment count:', error);
        }
    };

    const handleModalOpen = async () => {
        onOpen();
        try {
            const { data, error } = await supabase
                .from('post_comments')
                .select('*')
                .eq('post_id', postData.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setComments(data || []);
        } catch (error) {
            console.error('Error in handleModalOpen:', error);
        }
    };

    const checkIfLiked = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setIsLiked(false);
                return;
            }

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
            if (!user) {
                navigate('/login');
                return;
            }

            const newLikeCount = isLiked ? likes - 1 : likes + 1;
            setLikes(newLikeCount);
            setIsLiked(!isLiked);

            if (isLiked) {
                const { error } = await supabase
                    .from('post_likes')
                    .delete()
                    .eq('post_id', postData.id)
                    .eq('user_id', user.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('post_likes')
                    .insert([{
                        post_id: postData.id,
                        user_id: user.id
                    }]);

                if (error) throw error;
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            toast({
                title: "Error",
                description: "Failed to update like status",
                status: "error",
                duration: 3000
            });
        }
    };

    const handleComment = async () => {
        if (!newComment.trim()) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            const { data: commentData, error: commentError } = await supabase
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

            if (commentError) throw commentError;

            setComments([commentData, ...comments]);
            setNewComment('');
            setCommentCount(prev => prev + 1);
        } catch (error) {
            console.error('Error adding comment:', error);
            toast({
                title: "Error",
                description: "Failed to add comment",
                status: "error",
                duration: 3000
            });
        }
    };

    const PostContent = () => (
        <Box>
            <Text fontSize={isMobile ? "lg" : "xl"} fontWeight="bold">
                {postData.title}
            </Text>
            <HStack spacing={2} mt={2}>
                <Text
                    fontSize={isMobile ? "xs" : "sm"}
                    color="blue.500"
                    cursor="pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${postData.user_username}`);
                    }}
                    _hover={{ textDecoration: 'underline' }}
                >
                    {postData.user_name}
                </Text>
                {postData.is_organization && <VerifiedBadge size={isMobile ? "12px" : "16px"} />}
            </HStack>
            <Text mt={2} fontSize={isMobile ? "sm" : "md"}>
                {postData.body}
            </Text>
            {postData.city && postData.state && (
                <Badge colorScheme="blue" mt={2} fontSize={isMobile ? "xs" : "sm"}>
                    📍 {postData.city}, {postData.state}
                </Badge>
            )}
            <HStack spacing={4} mt={4}>
                <Button
                    size={isMobile ? "xs" : "sm"}
                    leftIcon={isLiked ? <Icon as={AiFillHeart} color="red.500" /> : <Icon as={AiOutlineHeart} />}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleLike();
                    }}
                    variant="ghost"
                >
                    {likes} {likes === 1 ? 'Like' : 'Likes'}
                </Button>
                <HStack spacing={1}>
                    <Icon as={BiComment} />
                    <Text fontSize={isMobile ? "xs" : "sm"} color="gray.600">
                        {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
                    </Text>
                </HStack>
            </HStack>
        </Box>
    );

    return (
        <>
            <Box
                p={isMobile ? 3 : 5}
                shadow="md"
                borderWidth="1px"
                borderRadius="md"
                bg="white"
                onClick={handleModalOpen}
                cursor="pointer"
                _hover={{ shadow: 'lg' }}
                width="100%"
            >
                <PostContent />
            </Box>

            <Modal
                isOpen={isOpen}
                onClose={onClose}
                size={isMobile ? "full" : "xl"}
                scrollBehavior="inside"
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        <Text fontSize={isMobile ? "xs" : "sm"} color="gray.500">
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
                                {isLoggedIn ? (
                                    <HStack>
                                        <Input
                                            placeholder="Write a comment..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            size={isMobile ? "sm" : "md"}
                                        />
                                        <Button
                                            colorScheme="blue"
                                            onClick={handleComment}
                                            isDisabled={!newComment.trim()}
                                            size={isMobile ? "sm" : "md"}
                                        >
                                            Post
                                        </Button>
                                    </HStack>
                                ) : (
                                    <Button
                                        onClick={() => navigate('/login')}
                                        colorScheme="blue"
                                        width="fit-content"
                                        size={isMobile ? "sm" : "md"}
                                    >
                                        Login to Comment
                                    </Button>
                                )}

                                {comments.map((comment) => (
                                    <Comment
                                        key={comment.id}
                                        comment={comment}
                                        isMobile={isMobile}
                                    />
                                ))}
                            </VStack>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

const MobileFilterMenu = ({
    searchRadius,
    handleRadiusChange,
    isLoadingLocation
}) => {
    return (
        <Popover placement="bottom-end">
            <PopoverTrigger>
                <IconButton
                    icon={<FiFilter />}
                    variant="ghost"
                    aria-label="Filter posts"
                    size="md"
                />
            </PopoverTrigger>
            <Portal>
                <PopoverContent width="300px">
                    <PopoverHeader fontWeight="semibold">Filter Posts</PopoverHeader>
                    <PopoverCloseButton />
                    <PopoverBody>
                        <VStack spacing={4} align="stretch" p={2}>
                            <Text fontSize="sm" fontWeight="medium">Distance Filter</Text>
                            <Select
                                value={searchRadius}
                                onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                                isDisabled={isLoadingLocation}
                                size="sm"
                            >
                                <option value={0}>Show all posts</option>
                                <option value={5}>Within 5 miles</option>
                                <option value={10}>Within 10 miles</option>
                                <option value={25}>Within 25 miles</option>
                                <option value={50}>Within 50 miles</option>
                                <option value={100}>Within 100 miles</option>
                            </Select>
                            {isLoadingLocation && (
                                <Text fontSize="xs" color="gray.500">
                                    Getting location...
                                </Text>
                            )}
                        </VStack>
                    </PopoverBody>
                </PopoverContent>
            </Portal>
        </Popover>
    );
};

const LocationFilter = ({
    isMobileDrawer = false,
    searchRadius,
    setSearchRadius,
    setUserCoords,
    setPosts,
    isLoadingLocation,
    setIsLoadingLocation,
    calculateDistance,
    fetchPosts
}) => {
    const toast = useToast();
    const navigate = useNavigate();
    const [isMobile] = useMediaQuery("(max-width: 768px)");

    return (
        <Box
            p={3}
            bg="white"
            borderRadius="lg"
            shadow="sm"
            width={isMobileDrawer ? "100%" : "200px"}
            maxHeight="fit-content"
        >
            <VStack spacing={2} align="stretch">
                <Text fontWeight="bold" fontSize="md">Filter by Location</Text>
                <Select
                    value={searchRadius || 0}
                    onChange={async (e) => {
                        const radius = parseInt(e.target.value);
                        if (radius === 0) {
                            setUserCoords(null);
                            fetchPosts();
                            return;
                        }

                        setIsLoadingLocation(true);
                        try {
                            const position = await new Promise((resolve, reject) => {
                                navigator.geolocation.getCurrentPosition(resolve, reject);
                            });

                            const coords = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            };
                            setUserCoords(coords);
                            setSearchRadius(radius);

                            let { data, error } = await supabase.rpc('get_posts_within_radius', {
                                user_lat: coords.lat,
                                user_lng: coords.lng,
                                radius_miles: radius
                            });

                            if (error) {
                                const { data: allPosts, error: fetchError } = await supabase
                                    .from('posts')
                                    .select('*')
                                    .order('date_posted', { ascending: false });

                                if (fetchError) throw fetchError;

                                data = allPosts.filter(post => {
                                    if (!post.city_coords) return false;
                                    const [postLat, postLng] = post.city_coords.split(',').map(Number);
                                    const distance = calculateDistance(
                                        coords.lat,
                                        coords.lng,
                                        postLat,
                                        postLng
                                    );
                                    return distance <= radius;
                                });
                            }

                            setPosts(data || []);
                        } catch (error) {
                            console.error('Error:', error);
                            toast({
                                title: "Location Error",
                                description: "Could not access your location. Please allow location access and try again.",
                                status: "error",
                                duration: 5000
                            });
                        } finally {
                            setIsLoadingLocation(false);
                        }
                    }}
                    placeholder="Filter by distance"
                    isDisabled={isLoadingLocation}
                >
                    <option value={0}>Show all posts</option>
                    <option value={5}>Within 5 miles</option>
                    <option value={10}>Within 10 miles</option>
                    <option value={25}>Within 25 miles</option>
                    <option value={50}>Within 50 miles</option>
                    <option value={100}>Within 100 miles</option>
                </Select>
                {isLoadingLocation && (
                    <Text fontSize="sm" color="gray.500">
                        Getting location...
                    </Text>
                )}
            </VStack>
        </Box>
    );
};

export default function Posts() {
    const [posts, setPosts] = useState([]);
    const { username } = useParams();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [userCoords, setUserCoords] = useState(null);
    const [searchRadius, setSearchRadius] = useState(25);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [isMobile] = useMediaQuery("(max-width: 768px)");
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setIsLoggedIn(true);
            }
            fetchPosts();
        };
        checkAuth();
    }, [username]);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 3959; // Radius of Earth in miles
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
            let query = supabase
                .from('posts')
                .select('*')
                .order('date_posted', { ascending: false });

            if (username) {
                query = query.eq('user_username', username);
            }

            const { data, error } = await query;
            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast({
                title: "Error",
                description: "Failed to load posts",
                status: "error",
                duration: 3000
            });
        }
    };

    const handleRadiusChange = async (radius) => {
        if (radius === 0) {
            setUserCoords(null);
            fetchPosts();
            return;
        }

        setIsLoadingLocation(true);
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            setUserCoords(coords);
            setSearchRadius(radius);

            let { data, error } = await supabase.rpc('get_posts_within_radius', {
                user_lat: coords.lat,
                user_lng: coords.lng,
                radius_miles: radius
            });

            if (error) {
                const { data: allPosts, error: fetchError } = await supabase
                    .from('posts')
                    .select('*')
                    .order('date_posted', { ascending: false });

                if (fetchError) throw fetchError;

                data = allPosts.filter(post => {
                    if (!post.city_coords) return false;
                    const [postLat, postLng] = post.city_coords.split(',').map(Number);
                    const distance = calculateDistance(
                        coords.lat,
                        coords.lng,
                        postLat,
                        postLng
                    );
                    return distance <= radius;
                });
            }

            setPosts(data || []);
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Location Error",
                description: "Could not access your location. Please allow location access and try again.",
                status: "error",
                duration: 5000
            });
        } finally {
            setIsLoadingLocation(false);
        }
    };

    return (
        <Box
            maxW="1200px"
            mx="auto"
            py={isMobile ? 4 : 8}
            px={isMobile ? 2 : 4}
            width="100%"
        >
            <Flex gap={6} alignItems="flex-start" width="100%">
                {!isMobile && (
                    <Box
                        width="200px"
                        flexShrink={0}
                        position="sticky"
                        top="20px"
                        alignSelf="flex-start"
                    >
                        <LocationFilter
                            searchRadius={searchRadius}
                            setSearchRadius={setSearchRadius}
                            setUserCoords={setUserCoords}
                            setPosts={setPosts}
                            isLoadingLocation={isLoadingLocation}
                            setIsLoadingLocation={setIsLoadingLocation}
                            calculateDistance={calculateDistance}
                            fetchPosts={fetchPosts}
                        />
                    </Box>
                )}

                <Box flex="1" width="100%" minWidth="0">
                    <VStack spacing={4} align="stretch" width="100%">
                        <Flex
                            justify="space-between"
                            align="center"
                            width="100%"
                            mb={4}
                        >
                            <Heading size={isMobile ? "md" : "lg"}>Community Posts</Heading>
                            <Flex gap={2} align="center">
                                {isMobile && (
                                    <MobileFilterMenu
                                        searchRadius={searchRadius}
                                        handleRadiusChange={handleRadiusChange}
                                        isLoadingLocation={isLoadingLocation}
                                    />
                                )}
                                <Button
                                    leftIcon={<AddIcon />}
                                    colorScheme="blue"
                                    size={isMobile ? "sm" : "md"}
                                    onClick={() => {
                                        if (!isLoggedIn) {
                                            navigate('/login');
                                        } else {
                                            setIsPostModalOpen(true);
                                        }
                                    }}
                                >
                                    {isMobile ? "New Post" : "Create Post"}
                                </Button>
                            </Flex>
                        </Flex>

                        {posts.length === 0 ? (
                            <Box
                                textAlign="center"
                                p={isMobile ? 4 : 8}
                                bg="white"
                                borderRadius="lg"
                                shadow="sm"
                            >
                                <Text fontSize={isMobile ? "md" : "lg"} color="gray.500">
                                    No posts found in this area.
                                </Text>
                            </Box>
                        ) : (
                            <VStack spacing={isMobile ? 3 : 4} width="100%" align="stretch">
                                {posts.map((post, index) => (
                                    <Post
                                        key={index}
                                        postData={post}
                                        isMobile={isMobile}
                                    />
                                ))}
                            </VStack>
                        )}
                    </VStack>
                </Box>
            </Flex>

            {isLoggedIn && (
                <CreatePostModal
                    isOpen={isPostModalOpen}
                    onClose={() => setIsPostModalOpen(false)}
                    onCreatePost={(newPost) => setPosts([newPost, ...posts])}
                />
            )}
        </Box>
    );
}