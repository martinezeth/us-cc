import React from "react";
import { Box, Button, Input, VStack, Text, Container } from "@chakra-ui/react";

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
  return (
    <Container centerContent>
      <VStack spacing={4}>
        <Text fontSize="lg">Login</Text>
        <Input placeholder="Username" />
        <Input placeholder="Password" type="password" />
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
