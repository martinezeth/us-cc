import React from "react";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import HeaderComponent from "./headerComponent";
import { Button, Container } from "@mui/material";

function Register() {
    return (
        <>
            <Container>
                <Typography>

                </Typography>
                <input type="textbox" placeholder="Username" />
                <input type="password" placeholder="Password" />
                <Button>Register</Button>
            </Container>
        </>
    );  
}
 // CAN COMBINE THESE TWO METHODS INTO ONE, JUST ADD A PARAMETER FOR THE TEXT
function Login(){
    return (
        <>
        <Container>
            <Typography>

            </Typography>
            <input type="textbox" placeholder="Username" />
            <input type="password" placeholder="Password" />
            <Button>Login</Button>
        </Container>
        </>
    );
}

function AuthenticationPage(RegoOrLogin){
    if(RegoOrLogin === "Register") {
            return (
            <>
            <Register />
            </>);
        }
    else {
        return (
            <>
                <Login />
            </>
        )
    }

}

export {AuthenticationPage, Login, Register};