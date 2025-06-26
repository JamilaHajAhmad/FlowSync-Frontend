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

export const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
}

export const formatString = (str) => {
    if (!str) return '';
    return str.replace(/_/g, ' ');
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

export const adjustTimezone = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];
};