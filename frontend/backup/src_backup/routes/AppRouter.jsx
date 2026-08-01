// src/routes/AppRouter.jsx

import React from "react";
import {
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import ROUTES from "../constants/routes";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";

import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

const AppRouter = () => {
    return (
        <Routes>
            {/* Authentication */}
            <Route
                path={ROUTES.LOGIN}
                element={
                    <AuthLayout>
                        <Login />
                    </AuthLayout>
                }
            />

            {/* Dashboard */}
            <Route
                path={ROUTES.DASHBOARD}
                element={
                    <DashboardLayout>
                        <Dashboard />
                    </DashboardLayout>
                }
            />

            {/* Catch All */}
            <Route
                path="*"
                element={
                    <Navigate
                        to={ROUTES.DASHBOARD}
                        replace
                    />
                }
            />
        </Routes>
    );
};

export default function AppRouter(){return <h1>TEST APP ROUTER</h1>}