import {Navigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN} from "../constants";
import {useState, useEffect, type JSX} from "react";

function ProtectedRoute({children}: {children: React.ReactNode}): JSX.Element {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        auth().catch(() => setIsAuthenticated(false));
    }, []);

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post("/api/auth/refresh", {
                refresh: refreshToken
            });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        }catch(e) {
            setIsAuthenticated(false);
        }
    }
    
    const auth = async () => { 
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthenticated(false);
            return;
        }
        try {
            const decoded: {exp: number} = jwtDecode(token);
            const tokenExpiration = decoded.exp;
            const now = Date.now() / 1000;
            
            if (tokenExpiration < now) {
                await refreshToken();
            } else {
                setIsAuthenticated(true);
            }
        } catch (e) {
            console.error("Token Decode Failed: ", e);
            setIsAuthenticated(false);
        }
    };

    if (isAuthenticated === null) {
        return <div>Loading...</div>;
    }

    return isAuthenticated ? (
        <>{children}</>
    ) : (
        <Navigate to="/login" replace />
    );

}

export default ProtectedRoute;