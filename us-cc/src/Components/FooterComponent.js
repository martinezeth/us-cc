import React from "react";

export default function FooterComponent() {
    const currentYear = new Date().getFullYear(); // Gets the current year

    return (
        <footer style={{ 
            width: '100%', 
            textAlign: 'center', 
            padding: '20px', 
            backgroundColor: '#f0f0f0', 
            borderTop: '1px solid #ddd',
            position: 'relative',
            bottom: 0,
            left: 0
        }}>
            <p>© {currentYear} Crisis Companion. All Rights Reserved.</p>
            <p style={{ fontWeight: 'bold' }}>This site is for demo purposes only. Do not use it to give or receive emergency information. All content is fictitious.</p>
        </footer>
    );
}
