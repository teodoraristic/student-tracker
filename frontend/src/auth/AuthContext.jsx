import { createContext, useState, useEffect, useRef } from "react";
import { validateToken, logoutApi } from "../services/authService";
import { logError } from "../utils/logger";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

// Token validation cache TTL in milliseconds (5 minutes)
const TOKEN_VALIDATION_CACHE_TTL = 5 * 60 * 1000;

export function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(() => localStorage.getItem("accessToken"));
    const [user, setUser] = useState(null);
    const [isValidating, setIsValidating] = useState(true);
    const lastValidationTimeRef = useRef(null);

    const clearTokens = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setAccessToken(null);
        setUser(null);
        lastValidationTimeRef.current = null;
    };

    // Validate token on load (with caching to prevent redundant API calls)
    useEffect(() => {
        const checkToken = async () => {
            const savedAccessToken = localStorage.getItem("accessToken");
            const now = Date.now();
            const lastValidationTime = lastValidationTimeRef.current;

            if (savedAccessToken) {
                // Only validate if cache expired or first time checking
                if (!lastValidationTime || now - lastValidationTime > TOKEN_VALIDATION_CACHE_TTL) {
                    try {
                        const userData = await validateToken();
                        setAccessToken(savedAccessToken);
                        setUser(userData);
                        lastValidationTimeRef.current = now;
                    } catch (error) {
                        logError("AuthContext", "Token validation failed");
                        clearTokens();
                    }
                } else {
                    // Cache is still valid, use cached state
                    setAccessToken(savedAccessToken);
                }
            }

            setIsValidating(false);
        };

        checkToken();
    }, []);

    useEffect(() => {
        if (accessToken) {
            localStorage.setItem("accessToken", accessToken);
        } else {
            localStorage.removeItem("accessToken");
        }
    }, [accessToken]);

    const login = async ({ accessToken: newAccessToken, refreshToken: newRefreshToken }) => {
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        setAccessToken(newAccessToken);
        try {
            const userData = await validateToken();
            setUser(userData);
            lastValidationTimeRef.current = Date.now(); // Reset validation cache on successful login
        } catch (error) {
            logError("AuthContext", "Failed to fetch user data after login", error);
        }
    };

    const logout = async () => {
        try {
            await logoutApi();
        } catch {
            // proceed with local logout even if the API call fails
        }
        clearTokens();
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
        <AuthContext.Provider value={{ token: accessToken, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
