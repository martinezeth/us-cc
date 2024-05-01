import React from "react";

export default function FooterComponent() {
    const currentYear = new Date().getFullYear(); // Gets the current year

    return (
        <footer style={{ textAlign: 'center', padding: '20px', marginTop: '20px', backgroundColor: '#f0f0f0' }}>
            <p>© {currentYear} US-CC. All Rights Reserved.</p>
            <p>Contact us: US-CC@sonoma.edu</p>
            <p>Privacy Policy | Terms of Service</p>
        </footer>
    );
}
