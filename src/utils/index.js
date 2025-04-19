import { jwtDecode } from 'jwt-decode';

export const scrollIntoSection = (id) => {
    const section = document.getElementById(id);
    if(section) {
        section.scrollIntoView({behavior: "smooth", block: "start"});
    }
}

export const decodeToken = (token) => {
    try {
        if (!token) throw new Error("Token is missing");

        const decodedToken = jwtDecode(token);
        
        // Extract required fields using the correct claim names
        const id = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        const email = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
        const role = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        
        if (!id || !email || !role) {
            throw new Error("Missing required token data");
        }
        console.log("Decoded token data:", { id, email, role });

        return { 
            id, 
            email, 
            role 
        };
    } catch (error) {
        console.error("Token decoding failed:", error.message);
        return null;
    }
};

export const isAuthorized = () => {
    try {
        const token = localStorage.getItem('authToken');
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || !user) {
            return false;
        }

        // Decode token to check if it's still valid
        const decodedToken = decodeToken(token);
        if (!decodedToken) {
            return false;
        }

        // Verify that token data matches stored user data
        return (
            decodedToken.id === user.id &&
            decodedToken.email === user.email &&
            decodedToken.role === user.role
        );
    } catch (error) {
        console.error('Authorization check failed:', error);
        return false;
    }
};