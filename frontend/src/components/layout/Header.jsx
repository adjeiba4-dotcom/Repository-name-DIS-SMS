import {
    Bell,
    LogOut,
    Menu,
    Search,
    Settings,
    UserCircle,
} from "lucide-react";

export default function Header() {
    return (
        <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm">

            {/* Left */}

            <div className="flex items-center gap-5">

                <button className="rounded-lg p-2 transition hover:bg-slate-100">

                    <Menu size={22} />

                </button>

                <h1 className="text-2xl font-bold text-slate-800">
                    Dashboard
                </h1>

            </div>

            {/* Center */}

            <div className="hidden w-full max-w-md lg:block">

                <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 px-4 py-3">

                    <Search
                        size={18}
                        className="text-slate-500"
                    />

                    <input
                        type="text"
                        placeholder="Search students, teachers, classes..."
                        className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />

                </div>

            </div>

            {/* Right */}

            <div className="flex items-center gap-4">

                <button className="relative rounded-xl p-3 transition hover:bg-slate-100">

                    <Bell size={20} />

                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500"></span>

                </button>

                <button className="rounded-xl p-3 transition hover:bg-slate-100">

                    <Settings size={20} />

                </button>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-2">

                    <UserCircle
                        size={36}
                        className="text-blue-600"
                    />

                    <div>

                        <h3 className="text-sm font-semibold text-slate-800">
                            Emmanuel
                        </h3>

                        <p className="text-xs text-slate-500">
                            System Administrator
                        </p>

                    </div>

                </div>

                <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700">

                    <LogOut size={18} />

                    Logout

                </button>

            </div>

        </header>
    );
}