import { Routes, Route } from "react-router-dom";

const Home = () => {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                background: "#f8fafc",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <h1
                style={{
                    color: "#2563eb",
                    fontSize: "3rem",
                    marginBottom: "1rem",
                }}
            >
                DIS-SMS ERP Frontend v2.0
            </h1>

            <p
                style={{
                    color: "#64748b",
                    fontSize: "1.2rem",
                }}
            >
                Foundation Ready ✅
            </p>
        </div>
    );
};

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
        </Routes>
    );
}