import React, { useState, useRef, forwardRef } from "react";
import { Box, Button, Container, FormControl, FormLabel, Heading,
  Input, InputGroup, InputRightElement, IconButton, Stack, Text,
  VStack, useDisclosure, useMergeRefs, Link, } from "@chakra-ui/react";
import { HiEye, HiEyeOff } from 'react-icons/hi';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { ReactComponent as Logo } from '../Images/crisisCompanionLogo.svg';

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
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const userName = (event) => setUser(event.target.value);
  const passWord = (event) => setPass(event.target.value);

  const registerCheck = () => {
    axios.post('http://localhost:8000/api/register', {
      username: user,
      password: pass
    })
      .then(() => {
        navigate('/login');
      })
      .catch(() => {
        console.log("User exists already");
      });
  };

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }} centerContent>
      <Stack spacing={4} align="center">
        <Logo />
        <Heading size="lg" mb="8">Create an account</Heading>
        <VStack spacing={4} bg="bg.surface" p={{ base: '4', sm: '8' }} borderRadius="xl" boxShadow="md">
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input placeholder="Create a username" onChange={userName} />
          </FormControl>
          <PasswordField onChange={passWord} />
          <Button colorScheme="blue" onClick={registerCheck}>Register</Button>
          <Text mt="4">
            Already have an account? <Link color="teal.500" onClick={onSwitch}>Log in</Link>
          </Text>
        </VStack>
      </Stack>
    </Container>
  );
}

function Login({ onSwitch }) {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const userName = (event) => setUser(event.target.value);
  const passWord = (event) => setPass(event.target.value);

  const loginCheck = () => {
    axios.post('http://localhost:8000/api/login', {
      username: user,
      password: pass
    })
      .then(response => {
        document.cookie = `authToken=${response.data.authToken}; path=/`;
        navigate('/');
      })
      .catch(() => {
        console.log("User does not exist");
      });
  };

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }} centerContent>
      <Stack spacing={4} align="center">
        <Logo />
        <Heading size="lg" mb="8">Log in to your account</Heading>
        <VStack spacing={4} bg="bg.surface" p={{ base: '4', sm: '8' }} borderRadius="xl" boxShadow="md">
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input placeholder="Enter your username" onChange={userName} />
          </FormControl>
          <PasswordField onChange={passWord} />
          <Button colorScheme="blue" onClick={loginCheck}>Sign In</Button>
          <Text mt="4">
            Don't have an account? <Link color="teal.500" onClick={onSwitch}>Sign up</Link>
          </Text>
        </VStack>
      </Stack>
    </Container>
  );
}

function AuthenticationPage() {
  const [isRegister, setIsRegister] = useState(false);
  const toggleForm = () => setIsRegister(!isRegister);

  return isRegister ? <Register onSwitch={toggleForm} /> : <Login onSwitch={toggleForm} />;
}

export { AuthenticationPage, Login, Register };