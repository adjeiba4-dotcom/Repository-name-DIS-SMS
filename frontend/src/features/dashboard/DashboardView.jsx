import AnalyticsPlaceholders from "./components/AnalyticsPlaceholders";
import Announcements from "./components/Announcements";
import KpiGrid from "./components/KpiGrid";
import QuickActions from "./components/QuickActions";
import RecentActivity from "./components/RecentActivity";
import WelcomeBanner from "./components/WelcomeBanner";

/**
 * Dashboard 2.0 foundation composition.
 * Presentational placeholders only — no live charts or backend data.
 */
export default function DashboardView() {
  return (
    <div className="space-y-[var(--space-8)]">
      <WelcomeBanner />
      <KpiGrid />
      <AnalyticsPlaceholders />

      <section
        aria-label="Operations panels"
        className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-3"
      >
        <QuickActions />
        <RecentActivity />
        <Announcements />
      </section>
    </div>
  );
}
