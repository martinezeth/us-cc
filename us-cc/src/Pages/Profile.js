import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useParams } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { CardContent, Typography, Card, Box } from '@mui/material';


export default function Profile() {
    const [userData, setUserData] = useState(null);
    const { username } = useParams();

    

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Get the authToken cookie from the browser's cookies
                const authToken = document.cookie.split('; ').find(row => row.startsWith('authToken=')).split('=')[1]
                console.log("aa", authToken);
                // Make the HTTP GET request to the profile endpoint
                const response = await axios.get(`http://localhost:5000/api/userinfo/${username}`, {
                    headers: {
                        Authorization: `${authToken}` // Include the authToken in the Authorization header
                    }
                });

                // Update the component's state with the fetched user data
                setUserData(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, [username]);

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