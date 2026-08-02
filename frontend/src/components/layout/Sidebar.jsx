import { NavLink } from "react-router-dom";

import navigationConfig from "../../config/navigation.config";

export default function Sidebar() {
    return (
        <aside className="flex h-screen w-72 flex-col bg-slate-900 text-white shadow-2xl">

            {/* Logo */}

            <div className="border-b border-slate-700 bg-blue-600 px-8 py-6">

                <h1 className="text-3xl font-bold tracking-wide">
                    DIS-SMS
                </h1>

                <p className="mt-1 text-sm text-blue-100">
                    Enterprise ERP
                </p>

            </div>

            {/* Navigation */}

            <div className="flex-1 overflow-y-auto px-4 py-6">

                {navigationConfig.map((group) => (

                    <div
                        key={group.title}
                        className="mb-8"
                    >

                        <h2 className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
                            {group.title}
                        </h2>

                        {group.items
                            .filter((item) => item.enabled !== false)
                            .map((item) => {

                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.id}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `
                                        mb-2 flex items-center gap-3 rounded-xl px-4 py-3
                                        transition-all duration-200

                                        ${
                                            isActive
                                                ? "bg-blue-600 text-white shadow-lg"
                                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                        }
                                        `
                                    }
                                >
                                    <Icon size={20} />

                                    <span className="font-medium">
                                        {item.label}
                                    </span>

                                </NavLink>
                            );
                        })}

                    </div>

                ))}

            </div>

            {/* Footer */}

            <div className="border-t border-slate-700 p-5">

                <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold">
                        E
                    </div>

                    <div>

                        <h3 className="font-semibold">
                            Emmanuel
                        </h3>

                        <p className="text-sm text-slate-400">
                            System Administrator
                        </p>

                    </div>

                </div>

            </div>

        </aside>
    );
}
