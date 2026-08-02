import { Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import AppShell from "../layouts/AppShell";

import Login from "../pages/auth/Login";
import NotFound from "../pages/common/NotFound";
import UIShowcase from "../pages/ui/UIShowcase";

import ProtectedRoute from "../components/common/ProtectedRoute";
import { buildAppRoutes } from "./app.routes";

export default function AppRouter() {
  const appRoutes = buildAppRoutes();

  return (
    <Routes>
      <Route path="/ui" element={<UIShowcase />} />

      <Route
        path="/login"
        element={
          <AuthLayout>
            <Login />
          </AuthLayout>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        {appRoutes.map((route) =>
          route.index ? (
            <Route key={route.id} index element={route.element} />
          ) : (
            <Route key={route.id} path={route.path} element={route.element} />
          )
        )}

        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
