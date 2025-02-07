import { getProfileUsername } from '../Components/ProfileHelpers';

/**
 * Helper function to handle profile navigation when clicking on user/organization names
 */
export const handleProfileClick = (e, user, navigate) => {
    e.stopPropagation();
    if (user) {
        navigate(`/profile/${getProfileUsername(user)}`);
    }
}; 