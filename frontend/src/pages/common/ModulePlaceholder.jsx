import PageHeader from "../../components/ui/PageHeader";
import { Body } from "../../components/ui/Typography";

/**
 * Durable shell content for modules that are registered in navigation
 * but not yet implemented. Future modules replace the page registry entry
 * only — AppShell is never modified.
 */
export default function ModulePlaceholder({ navItem }) {
  const title = navItem?.label ?? "Module";
  const description =
    navItem?.description ??
    `${title} is reserved in the application shell. Feature delivery will plug into this route without changing AppShell.`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: title },
        ]}
        variant="default"
      />

      <Body variant="muted" size="sm">
        Route: {navItem?.path ?? "—"}
      </Body>
    </div>
  );
}
