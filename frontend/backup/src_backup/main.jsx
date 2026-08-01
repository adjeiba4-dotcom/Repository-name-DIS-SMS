import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App";

import QueryProvider from "./providers/QueryProvider";
import { AuthProvider } from "./contexts/AuthContext";

import "./styles/variables.css";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <QueryProvider>
                <AuthProvider>
                    <App />
                    <Toaster position="top-right" />
                </AuthProvider>
            </QueryProvider>
        </BrowserRouter>
    </React.StrictMode>
);