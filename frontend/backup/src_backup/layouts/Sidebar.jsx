import {
    FaChartBar,
    FaUserGraduate,
    FaChalkboardTeacher,
    FaBuilding,
    FaBook,
    FaSchool,
    FaCalendarAlt,
    FaClipboardCheck,
    FaChartLine,
    FaMoneyBillWave,
    FaCog,
} from "react-icons/fa";

import { NavLink } from "react-router-dom";

const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: FaChartBar },
    { name: "Students", path: "/students", icon: FaUserGraduate },
    { name: "Teachers", path: "/teachers", icon: FaChalkboardTeacher },
    { name: "Departments", path: "/departments", icon: FaBuilding },
    { name: "Subjects", path: "/subjects", icon: FaBook },
    { name: "Classes", path: "/classes", icon: FaSchool },
    { name: "Academic Years", path: "/academic-years", icon: FaCalendarAlt },
    { name: "Attendance", path: "/attendance", icon: FaClipboardCheck },
    { name: "Results", path: "/results", icon: FaChartLine },
    { name: "Fees", path: "/fees", icon: FaMoneyBillWave },
    { name: "Settings", path: "/settings", icon: FaCog },
];

export default function Sidebar() {
    return (
        <aside
            className="bg-dark text-white p-3"
            style={{
                width: "260px",
                minHeight: "calc(100vh - 56px)",
            }}
        >
            <h5 className="mb-4 fw-bold">
                Navigation
            </h5>

            <div className="nav flex-column">

                {menuItems.map((item) => {

                    const Icon = item.icon;

                    return (

                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-link d-flex align-items-center mb-2 px-3 py-2 ${
                                    isActive
                                        ? "bg-primary text-white rounded"
                                        : "text-light"
                                }`
                            }
                        >

                            <Icon className="me-3" />

                            {item.name}

                        </NavLink>

                    );

                })}

            </div>

        </aside>
    );
}