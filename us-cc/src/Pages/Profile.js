import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useParams } from 'react-router-dom';
import { Avatar } from '@chakra-ui/react';
import profilecss from '../Styles/profilecss.css';

export default function Profile() {
    const [userData, setUserData] = useState([]);
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
                   <Avatar ></Avatar>
                </div>
            </div>
            
            {
            userData.length > 0 ? 
                <div className="info-section">
                    <h2>{userData[0].username || 'Username'}</h2>
                    <p>{userData[0].role || 'Role'}</p>
                    <div className="additional-info">
                        <p>Member since: {userData[0].date_joined ? new Date(userData[0].date_joined).toLocaleDateString() : 'XX/XX/XXXX'}</p>
                        {/* Display state and city if available */}
                        {userData[0].region && (
                            <>
                                <p>State: {userData[0].region.state || 'XXXXXXX'}</p>
                                <p>City: {userData[0].region.city || 'XXXXXXX'}</p>
                            </>
                        )}
                    </div>

                    <div className="volunteering-section">
                        <h3>Currently volunteering with:</h3>

                        {userData[0].volunteeringPlaces && userData[0].volunteeringPlaces.length > 0 ? (
                            <ul>
                                {userData[0].volunteeringPlaces.map((place, index) => (
                                    <li key={index}>{place}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No volunteering places listed.</p>
                        )}
                    </div>

                </div> 
            :
                <h1>Unauthorized Access</h1>
            }
            
        </div>
    );
};