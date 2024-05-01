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
        <div className="user-profile">
            <div className="avatar-section">
                <div className="avatar">
                    {/* Placeholder for avatar image, replace 'avatarUrl' with your dynamic source */}
                    <img src={'../Images/Icons/warningCircle.svg'} alt="User Avatar" />
                </div>
            </div>
            <div className="info-section">
                <h2>{userData.username || 'Username'}</h2>
                <p>{userData.role || 'Role'}</p>
                <div className="additional-info">
                    <p>Member since: {userData.memberSince || 'XX/XX/XXXX'}</p>
                    <p>State: {userData.state || 'XXXXXXX'}</p>
                    <p>City: {userData.city || 'XXXXXXX'}</p>
                </div>
                <div className="volunteering-section">
                    <h3>Currently volunteering with:</h3>
                    <ul>
                        {userData.volunteeringPlaces && userData.volunteeringPlaces.length > 0 ? (
                            userData.volunteeringPlaces.map((place, index) => (
                                <li key={index}>{place}</li>
                            ))
                        ) : (
                            <p>No volunteering places listed.</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};