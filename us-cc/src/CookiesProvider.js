import React from 'react';
import { CookiesProvider } from 'react-cookie';

const CookieProvider = ({ children }) => {
    return (
        <CookiesProvider>
            {children}
        </CookiesProvider>
    );
};

export default CookieProvider;
