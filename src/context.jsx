import { createContext, useContext, useState, useMemo, useCallback } from "react";

const UrlContext = createContext();

/**
 * Optimized URL Context Provider
 * Uses memoization patterns to prevent unnecessary re-renders
 * Implements efficient state management without authentication overhead
 */
const UrlProvider = ({ children }) => {
    const [urlCache, setUrlCache] = useState(new Map());
    const [globalError, setGlobalError] = useState(null);

    // Memoized cache operations for optimal performance
    const cacheOperations = useMemo(() => ({
        get: (key) => urlCache.get(key),
        set: (key, value) => setUrlCache(prev => new Map(prev).set(key, value)),
        delete: (key) => setUrlCache(prev => {
            const newMap = new Map(prev);
            newMap.delete(key);
            return newMap;
        }),
        clear: () => setUrlCache(new Map()),
        has: (key) => urlCache.has(key),
    }), [urlCache]);

    // Error handler with automatic clearing
    const handleError = useCallback((error) => {
        setGlobalError(error);
        setTimeout(() => setGlobalError(null), 5000);
    }, []);

    // Clear error manually
    const clearError = useCallback(() => setGlobalError(null), []);

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        cache: cacheOperations,
        error: globalError,
        handleError,
        clearError,
    }), [cacheOperations, globalError, handleError, clearError]);

    return (
        <UrlContext.Provider value={contextValue}>
            {children}
        </UrlContext.Provider>
    );
};

export const UrlState = () => {
    const context = useContext(UrlContext);
    if (!context) {
        throw new Error("UrlState must be used within UrlProvider");
    }
    return context;
};

export default UrlProvider;