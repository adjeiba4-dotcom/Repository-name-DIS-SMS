import PageHeader from "../../components/ui/PageHeader";
import { Body } from "../../components/ui/Typography";

/**
 * Dashboard 2.0 placeholder.
 * Widgets and layout composition land in a dedicated Dashboard 2.0 batch —
 * this page intentionally stays a stable shell entry point.
 */
export default function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Dashboard 2.0 placeholder. Overview widgets and personalized layouts will be delivered in the Dashboard 2.0 batch."
        variant="plain"
        size="sm"
        className="px-0"
      />

      <Body variant="muted" size="sm">
        The application shell is ready. This route remains reserved for Dashboard
        2.0 — no temporary widget scaffolding is installed here.
      </Body>
    </div>
  );
}
