import React, { useState } from "react";
import { Box, Button, Input, VStack, Text, Container } from "@chakra-ui/react";
import axios from 'axios';

function Register() {
  return (
    <Container centerContent>
      <VStack spacing={4}>
        <Text fontSize="lg">Register</Text>
        <Input placeholder="Username" />
        <Input placeholder="Password" type="password" />
        <Button colorScheme="blue">Register</Button>
      </VStack>
    </Container>
  );
}


function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const userName = (event) => {
    setUser(event.target.value);
  };
  const passWord = (event) => {
    setPass(event.target.value);
  };
  
  return (
    <Container centerContent>
      <VStack spacing={4}>
        <Text fontSize="lg">Login</Text>
        <Input placeholder="Username" onChange={userName}/>
        <Input placeholder="Password" type="password" onChange={passWord}/>
        <Button colorScheme="blue">Login</Button>
      </VStack>
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
