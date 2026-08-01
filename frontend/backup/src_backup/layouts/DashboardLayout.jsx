import React from "react";

const DashboardLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-100">
            {children}
        </div>
    );
};

export default DashboardLayout;