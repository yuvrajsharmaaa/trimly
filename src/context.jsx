import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "./db/apiAuth";
import useFetch from "./hooks/use-fetch";

const UrlContext = createContext();

const UrlProvider = ({ children }) => {
    const { data: user, loading, fn: fetchUser } = useFetch(getCurrentUser);
    const [isGuest, setIsGuest] = useState(false);

    const isAuthenticated = user?.role === "authenticated" || isGuest;

    useEffect(() => {
        fetchUser();
    }, []);

    const continueAsGuest = () => {
        setIsGuest(true);
    };

    return (
        <UrlContext.Provider value={{ user, fetchUser, loading, isAuthenticated, isGuest, continueAsGuest }}>
            {children}
        </UrlContext.Provider>
    );
};

export const UrlState = () => {
    return useContext(UrlContext);
};

export default UrlProvider;