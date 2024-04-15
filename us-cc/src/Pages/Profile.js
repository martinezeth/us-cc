import * as React from 'react';
import { useLocation } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { CardContent, Typography, Card, Box } from '@mui/material';


export default function Profile() {
    return(
        <>
            <CssBaseline>
                <Box>
                    <Card>
                        <CardContent>
                            <Typography>
                                <h1>Profile Name</h1>
                                <h2> Profile Information</h2>
                            </Typography>
                        </CardContent>
                        <Typography>Add more information about the users profile. This can include things such as gender, age, or a bio of our user</Typography>
                    </Card>
                </Box>
            </CssBaseline>
        </>
    )
};