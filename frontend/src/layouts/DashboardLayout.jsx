import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";

export default function DashboardLayout({ children }) {
    return (
        <div className="flex h-screen bg-slate-100">

            {/* Sidebar */}
            <Sidebar />

            {/* Main Area */}
            <div className="flex flex-1 flex-col overflow-hidden">

                {/* Header */}
                <Header />

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-8">

                    <div className="mx-auto max-w-7xl">

                        {children}

                    </div>

                </main>

            </div>

        </div>
    );
}