import { createContext, useState, useEffect } from "react";
import { validateToken, logoutApi } from "../services/authService";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [user, setUser] = useState(null);
    const [isValidating, setIsValidating] = useState(true);

    // Validate token on load
    useEffect(() => {
        const checkToken = async () => {
            const savedToken = localStorage.getItem("token");

            if (savedToken) {
                try {
                    const userData = await validateToken();
                    setToken(savedToken);
                    setUser(userData);
                } catch (error) {
                    console.log("Token validation failed, clearing token");
                    localStorage.removeItem("token");
                    setToken(null);
                    setUser(null);
                }
            }

            setIsValidating(false);
        };

        checkToken();
    }, []);

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
        } else {
            localStorage.removeItem("token");
        }
    }, [token]);

    const login = async (newToken) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        try {
            const userData = await validateToken();
            setUser(userData);
        } catch (error) {
            console.error("Failed to fetch user data after login:", error);
        }
    };

    const logout = async () => {
        try {
            await logoutApi();
        } catch {
            // proceed with local logout even if the API call fails
        }
        setToken(null);
        setUser(null);
    };

    if (isValidating) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px',
                color: '#64748b'
            }}>
                Loading...
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
