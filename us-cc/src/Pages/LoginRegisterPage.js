import React, { useState, useRef, forwardRef } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Stack,
  Text,
  VStack,
  useDisclosure,
  useMergeRefs,
  Link,
  useToast,
  Alert,
  AlertIcon,
  Checkbox,
  Select
} from "@chakra-ui/react";
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as Logo } from '../Images/crisisCompanionLogo.svg';
import { supabase } from '../supabaseClient';
import LocationSearch from '../Components/LocationSearch';
import LocationMapPreview from '../Components/LocationMapPreview';

const PasswordField = forwardRef((props, ref) => {
  const { isOpen, onToggle } = useDisclosure();
  const inputRef = useRef(null);
  const mergeRefs = useMergeRefs(inputRef, ref);

  const onClickReveal = () => {
    onToggle();
    if (inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  };

  return (
    <FormControl id="password">
      <FormLabel>Password</FormLabel>
      <InputGroup>
        <Input
          ref={mergeRefs}
          type={isOpen ? "text" : "password"}
          placeholder="Enter your password"
          required
          {...props}
        />
        <InputRightElement>
          <IconButton
            variant="ghost"
            aria-label={isOpen ? "Hide password" : "Show password"}
            icon={isOpen ? <HiEyeOff /> : <HiEye />}
            onClick={onClickReveal}
          />
        </InputRightElement>
      </InputGroup>
    </FormControl>
  );
});

PasswordField.displayName = 'PasswordField';

function Register({ onSwitch }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isOrganization, setIsOrganization] = useState(false);
  const [orgType, setOrgType] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!email.includes('@')) newErrors.email = "Invalid email address";
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (isOrganization && !orgType) newErrors.orgType = "Organization type is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            username: email.split('@')[0],
            is_organization: isOrganization,
            organization_type: isOrganization ? orgType : null
          }
        }
      });

      if (error) throw error;

      // Create profile with organization name if it's an organization
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          full_name: name,
          organization_name: isOrganization ? name : null  // Set organization_name for orgs
        }]);

      if (profileError) throw profileError;

      toast({
        title: "Registration successful!",
        description: "Please check your email to confirm your account.",
        status: "success",
        duration: 5000,
      });

      navigate('/login');
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <Stack spacing={4} align="center">
        <Logo style={{ width: '150px', height: '150px' }} />
        <Heading size="lg">Create an account</Heading>
        <VStack spacing={4} bg="bg.surface" p={{ base: '4', sm: '8' }} borderRadius="xl" boxShadow="md" width="100%">
          <FormControl isRequired isInvalid={errors.name}>
            <FormLabel>Name</FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
            {errors.name && <Text color="red.500" fontSize="sm">{errors.name}</Text>}
          </FormControl>

          <FormControl isRequired isInvalid={errors.email}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            {errors.email && <Text color="red.500" fontSize="sm">{errors.email}</Text>}
          </FormControl>

          <FormControl isRequired isInvalid={errors.password}>
            <PasswordField
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <Text color="red.500" fontSize="sm">{errors.password}</Text>}
          </FormControl>

          <FormControl>
            <Checkbox
              isChecked={isOrganization}
              onChange={(e) => setIsOrganization(e.target.checked)}
            >
              Register as an Organization
            </Checkbox>
          </FormControl>

          {isOrganization && (
            <FormControl isRequired isInvalid={errors.orgType}>
              <FormLabel>Organization Type</FormLabel>
              <Select
                value={orgType}
                onChange={(e) => setOrgType(e.target.value)}
                placeholder="Select organization type"
              >
                <option value="police">Police Department</option>
                <option value="fire">Fire Department</option>
                <option value="ems">Emergency Medical Services</option>
                <option value="ngo">Non-Governmental Organization</option>
                <option value="other">Other</option>
              </Select>
              {errors.orgType && <Text color="red.500" fontSize="sm">{errors.orgType}</Text>}
            </FormControl>
          )}

          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isLoading}
            width="100%"
          >
            Sign Up
          </Button>

          <Text mt="4">
            Already have an account? <Link color="blue.500" onClick={onSwitch}>Sign in</Link>
          </Text>
        </VStack>
      </Stack>
    </Container>
  );
}

function Login({ onSwitch }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    if (!email.includes('@')) newErrors.email = "Invalid email address";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: "Login successful!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'demo@demo.com',
        password: 'DemoUser123!'
      });

      if (error) throw error;

      toast({
        title: "Welcome to the Demo!",
        description: "You're now logged in with demo account access",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Demo login failed",
        description: "Please try again or use guest mode",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = () => {
    localStorage.setItem('guestMode', 'true');
    toast({
      title: "Continuing as guest",
      description: "Some features will be limited. Try the demo account for full access!",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
    navigate('/');
  };

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }} centerContent>
      <Stack spacing={4} align="center">
        <Logo style={{ width: '150px', height: '150px' }} />
        <Heading size="lg" mb="8">Log in to your account</Heading>
        <VStack spacing={4} bg="bg.surface" p={{ base: '4', sm: '8' }} borderRadius="xl" boxShadow="md" width="100%">
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">
              👋 Welcome! Try the demo account to explore all features.
            </Text>
          </Alert>

          <FormControl isRequired isInvalid={errors.email}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            {errors.email && <Text color="red.500" fontSize="sm">{errors.email}</Text>}
          </FormControl>

          <FormControl isRequired isInvalid={errors.password}>
            <PasswordField
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <Text color="red.500" fontSize="sm">{errors.password}</Text>}
          </FormControl>

          <Button
            colorScheme="blue"
            onClick={handleLogin}
            isLoading={isLoading}
            width="100%"
          >
            Sign In
          </Button>

          <Button
            colorScheme="green"
            onClick={handleDemoLogin}
            isLoading={isLoading}
            width="100%"
          >
            Try Demo Account
          </Button>

          <Button
            colorScheme="gray"
            onClick={handleGuestMode}
            width="100%"
          >
            Continue as Guest
          </Button>

          <Text mt="4">
            Don't have an account? <Link color="blue.500" onClick={onSwitch}>Sign up</Link>
          </Text>
        </VStack>
      </Stack>
    </Container>
  );
}

function AuthenticationPage({ RegoOrLogin }) {
  const [isRegister, setIsRegister] = useState(RegoOrLogin === "Register");
  const toggleForm = () => setIsRegister(!isRegister);

  return isRegister ? <Register onSwitch={toggleForm} /> : <Login onSwitch={toggleForm} />;
}

export { AuthenticationPage, Login, Register };