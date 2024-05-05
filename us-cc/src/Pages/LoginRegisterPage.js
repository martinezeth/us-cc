import React, { useState, useRef, forwardRef } from "react";
import { Box, Button, Container, FormControl, FormLabel, Heading,
  Input, InputGroup, InputRightElement, IconButton, Stack, Text,
  VStack, useDisclosure, useMergeRefs,} from "@chakra-ui/react";
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

function Register() {
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
        <VStack spacing={4} bg="bg.surface" p={{ base: '4', sm: '8' }} borderRadius="xl" boxShadow="md">
          <Heading size="sm">Register</Heading>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input placeholder="Enter your username" onChange={userName} />
          </FormControl>
          <PasswordField onChange={passWord} />
          <Button colorScheme="blue" onClick={registerCheck}>Register</Button>
        </VStack>
      </Stack>
    </Container>
  );
}

function Login() {
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
        <VStack spacing={4} bg="bg.surface" p={{ base: '4', sm: '8' }} borderRadius="xl" boxShadow="md">
          <Heading size="sm">Login</Heading>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input placeholder="Enter your username" onChange={userName} />
          </FormControl>
          <PasswordField onChange={passWord} />
          <Button colorScheme="blue" onClick={loginCheck}>Login</Button>
        </VStack>
      </Stack>
    </Container>
  );
}

function AuthenticationPage({ RegoOrLogin }) {
  return (
    <>
      {RegoOrLogin === "Register" ? <Register /> : <Login />}
    </>
  );
}

export { AuthenticationPage, Login, Register };