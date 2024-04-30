import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useParams } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { CardContent, Typography, Card, Box } from '@mui/material';


export default function Profile() {
    const [userData, setUserData] = useState(null);
    const { username } = useParams();



    return (
        <div>
            <h1>User Profile: {username}</h1>
            {userData ? (
                <div>
                    <p>Name: {userData.name}</p>
                    <p>Email: {userData.email}</p>
                    {/* Add other user profile information here */}
                </div>
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
};