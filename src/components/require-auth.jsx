import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { UrlState } from "@/context";
import { BarLoader } from "react-spinners";

function RequireAuth({ children }) {
    const navigate = useNavigate();
    const { loading, isAuthenticated, isGuest } = UrlState();

    useEffect(() => {
        if (!isAuthenticated && !isGuest && loading === false) navigate("/auth");
    }, [isAuthenticated, isGuest, loading]);

    if (loading) return <BarLoader width={"100%"} color="#36d7b7" />;

    if (isAuthenticated || isGuest) return children;
}

export default RequireAuth;