import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useParams } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { CardContent, Typography, Card, Box } from '@mui/material';


export default function Profile() {
    const [userData, setUserData] = useState(null);
    const { username } = useParams();

    // User is self
    // USer is other

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Get the authToken cookie from the browser's cookies
                const authToken = document.cookie && document.cookie.split('; ')
                .find(row => row.startsWith('authToken=')).split('=')[1];
                // console.log("aa", authToken);
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
        <>
            <div>
                {userData ? (
                    <div>
                        {userData.map((user) => (
                            <div key={user.user_id}>
                                <p>User ID: {user.user_id}</p>
                                <p>Role: {user.role}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Loading user data...</p>
                )}
            </div>
        </>
    );
};