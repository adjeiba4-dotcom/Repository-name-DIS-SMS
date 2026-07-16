import { useEffect, useState } from "react";

import KPICard from "../../components/dashboard/KPICard";
import StatisticsCards from "../../components/dashboard/StatisticsCards";
import QuickActions from "../../components/dashboard/QuickActions";
import RecentActivities from "../../components/dashboard/RecentActivities";

import { getDashboardStatistics } from "../../services/dashboard.service";

export default function Dashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const response = await getDashboardStatistics();

            setStats(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    if (!stats) {
        return (
            <div className="text-center mt-5">
                Loading dashboard...
            </div>
        );
    }

    return (
        <div className="container-fluid">

            <h2 className="mb-4">
                Dashboard
            </h2>

            <div className="row g-4">

                <div className="col-md-3">
                    <KPICard
                        title="Students"
                        value={stats.totalStudents}
                        color="primary"
                    />
                </div>

                <div className="col-md-3">
                    <KPICard
                        title="Teachers"
                        value={stats.totalTeachers}
                        color="success"
                    />
                </div>

                <div className="col-md-3">
                    <KPICard
                        title="Departments"
                        value={stats.totalDepartments}
                        color="warning"
                    />
                </div>

                <div className="col-md-3">
                    <KPICard
                        title="Classes"
                        value={stats.totalClasses}
                        color="danger"
                    />
                </div>

            </div>

            <div className="row mt-4">

                <div className="col-lg-8">
                    <StatisticsCards />
                    <RecentActivities />
                </div>

                <div className="col-lg-4">
                    <QuickActions />
                </div>

            </div>

        </div>
    );
}