import { Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import UIShowcase from "../pages/ui/UIShowcase";

import ProtectedRoute from "../components/common/ProtectedRoute";

export default function AppRouter() {
    return (
        <Routes>

            {/* ===========================
                UI Showcase
            =========================== */}
            <Route
                path="/ui"
                element={<UIShowcase />}
            />

            {/* ===========================
                Login
            =========================== */}
            <Route
                path="/login"
                element={
                    <AuthLayout>
                        <Login />
                    </AuthLayout>
                }
            />

            {/* ===========================
                Dashboard
            =========================== */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <Dashboard />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            />

            {/* ===========================
                404 Redirect
            =========================== */}
            <Route
                path="*"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

        </Routes>
    );
}