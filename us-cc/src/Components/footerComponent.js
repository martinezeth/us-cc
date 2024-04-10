import React from "react";
import { Container,Grid, Card } from "@mui/material";
import AboutSection from "./AboutSection";
import FeaturesSection from "./FeaturesSection";

export default function FooterComponent(){
    
    return(
        <Container sx={{
            height:"50%",
            width: "75%",
            alignItmes: 'center',
            justifyContent: "ceneter"
        }}>
            <Card>
                <AboutSection />
                <FeaturesSection />
            </Card>
        </Container>
    );
}