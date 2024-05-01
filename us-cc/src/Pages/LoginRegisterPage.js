import React, { useState } from "react";
import { Box, Button, Input, VStack, Text, Container } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const userName = (event) => {
    setUser(event.target.value);
    // console.log(user);
  };
  const passWord = (event) => {
    setPass(event.target.value);
    // console.log(pass);
  };

  const registerCheck = () => {
    axios.post('http://localhost:5000/api/register', {
      username: user,
      password: pass
    })
      .then(() => {
       
        // document.cookie = `authToken=${response.data.authToken}; path=/`;
        navigate('/login'); // redirect login after registering.. remember your password

      })
      .catch(error => {
        // console.error("error fetching data in LoginRegisterPage: ", error);
        console.log("User exists already");
      });
  };

  return (
    <Container centerContent>
      <VStack spacing={4}>
        <Text fontSize="lg">Register</Text>
        <Input placeholder="Username" onChange={userName} />
        <Input placeholder="Password" type="password" onChange={passWord} />
        <Button colorScheme="blue" onClick={registerCheck}>Register</Button>
      </VStack>
    </Container>
  );
}


function Login() {
  const navigate = useNavigate();
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
      // console.log(response.data);
      document.cookie = `authToken=${response.data.authToken}; path=/`;
      // console.log("cookieee:", document.cookie);
      navigate('/'); // redirect to home page after login
      
    })
    .catch(() => {
      // TODO ASAP:
      // Turn username and password boxes red
      // console.error("error fetching data in LoginRegisterPage: ", error);
      console.log("User does not exist");
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
