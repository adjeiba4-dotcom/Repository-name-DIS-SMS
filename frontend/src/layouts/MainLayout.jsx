import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function MainLayout({ children }) {
    return (
        <div
            className="d-flex flex-column"
            style={{ minHeight: "100vh" }}
        >
            <Navbar />

            <div className="d-flex flex-grow-1">

                <Sidebar />

                <main
                    className="flex-grow-1 bg-light"
                    style={{
                        padding: "30px",
                        overflowY: "auto",
                    }}
                >
                    <div className="container-fluid">
                        {children}
                    </div>
                </main>

            </div>

            <Footer />

        </div>
    );
}