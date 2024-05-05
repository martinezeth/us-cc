import React from "react";

export default function FooterComponent() {
    const currentYear = new Date().getFullYear(); // Gets the current year

    return (
        <footer style={{ textAlign: 'center', padding: '20px', marginTop: '20px', backgroundColor: '#f0f0f0' }}>
            <p>© {currentYear} Crisis Companion. All Rights Reserved.</p>
            <p>Contact us: crisis-companion@sonoma.edu</p>
            {/* <p>Privacy Policy | Terms of Service</p> */}
        </footer>
    );
}
