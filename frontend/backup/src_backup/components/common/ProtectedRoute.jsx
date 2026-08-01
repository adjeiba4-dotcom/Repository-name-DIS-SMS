import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import ROUTES from "../../constants/routes";

const ProtectedRoute = ({ children }) => {
    const auth = useAuth();
    const location = useLocation();

    console.log("ProtectedRoute Debug:", auth);

    if (!auth.isAuthenticated) {
        return (
            <Navigate
                to={ROUTES.LOGIN}
                replace
                state={{ from: location }}
            />
        );
    }

    return children;
};

export default ProtectedRoute;