import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import Students from "../pages/students/Students";
import Teachers from "../pages/teachers/Teachers";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
    return (
        <Routes>
            <Route
                path="/"
                element={<Navigate to="/login" replace />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <Dashboard />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/students"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <Students />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
<Route
    path="/teachers"
    element={
        <ProtectedRoute>
            <MainLayout>
                <Teachers />
            </MainLayout>
        </ProtectedRoute>
    }
/>
            <Route
                path="*"
                element={<Navigate to="/login" replace />}
            />
        </Routes>
    );
}