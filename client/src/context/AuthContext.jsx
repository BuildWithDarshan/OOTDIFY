import { createContext, useContext, useState, useEffect } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/react";
import { getCurrentUser } from "../services/authService.js";
import { setAuthTokenGetter } from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const { isLoaded, isSignedIn, getToken, signOut } = useClerkAuth();
    const { user: clerkUser } = useUser();
    const [user, setUser] = useState(null);
    const [profileOwnerId, setProfileOwnerId] = useState(null);

    useEffect(() => {
        if (!isLoaded) return;

        if (!isSignedIn) {
            setAuthTokenGetter(null);
            return;
        }

        setAuthTokenGetter(() => getToken());
        if (!clerkUser?.id) return;

        const currentClerkUserId = clerkUser.id;
        let cancelled = false;

        const loadProfile = async () => {
            try {
                const data = await getCurrentUser();
                if (!cancelled) {
                    setUser(data.user);
                    setProfileOwnerId(currentClerkUserId);
                }
            } catch (error) {
                if (!cancelled) {
                    setUser(null);
                    setProfileOwnerId(currentClerkUserId);
                    console.error("Unable to load the OOTDIFY profile", error);
                }
            }
        };

        loadProfile();

        return () => {
            cancelled = true;
        };
    }, [getToken, isLoaded, isSignedIn, clerkUser?.id]);

    const logout = async () => {
        try {
            await signOut({ redirectUrl: "/" });
        } finally {
            setUser(null);
            setProfileOwnerId(null);
            setAuthTokenGetter(null);
        }
    };

    const updateUserInfo = (updatedFields) => {
        setUser((previousUser) => previousUser
            ? { ...previousUser, ...updatedFields }
            : previousUser,
        );
    };

    const loading = !isLoaded
        || (Boolean(isSignedIn) && profileOwnerId !== clerkUser?.id);

    const value = {
        user,
        clerkUser,
        isAuthenticated: Boolean(isLoaded && isSignedIn && user),
        loading,
        logout,
        updateUserInfo,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Auth hooks intentionally share this module with their provider.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
