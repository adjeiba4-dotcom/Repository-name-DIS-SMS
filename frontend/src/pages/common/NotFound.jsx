import { Link } from "react-router-dom";

import PageHeader from "../../components/ui/PageHeader";
import { Body } from "../../components/ui/Typography";

export default function NotFound() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Page not found"
        description="This path is not registered in the application routes."
        variant="plain"
        size="sm"
        className="px-0"
      />

      <Body variant="muted" size="sm">
        <Link
          to="/"
          className="text-[var(--color-text-link)] underline-offset-2 hover:underline"
        >
          Return to Dashboard
        </Link>
      </Body>
    </div>
  );
}
