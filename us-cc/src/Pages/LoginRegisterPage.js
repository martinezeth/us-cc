import React, { useState } from "react";
import { Box, Button, Input, VStack, Text, Container } from "@chakra-ui/react";
import axios from "axios";
import { Axios } from "axios";

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

  const loginCheck = () => {
    axios.post('http://localhost:5000/api/login', {
      username: user,
      password: pass
    })
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.error("error fetching data in LoginRegisterPage: ", error);
    });
  };
  
  
  return (
    <Container centerContent>
      <VStack spacing={4}>
        <Text fontSize="lg">Login</Text>
        <Input placeholder="Username" onChange={userName}/>
        <Input placeholder="Password" type="password" onChange={passWord}/>
        <Button colorScheme="blue" onClick={loginCheck}>Login</Button>
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
