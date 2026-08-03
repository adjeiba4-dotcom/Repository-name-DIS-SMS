import Card from "../ui/Card";
import { cn } from "../../utils/cn";
import SectionHeader from "./SectionHeader";

/**
 * Card panel with optional section header for dashboard widgets.
 */
export default function DashboardPanel({
  title,
  description,
  eyebrow,
  titleId,
  actions,
  size = "md",
  variant = "default",
  className = "",
  headerClassName = "",
  children,
  ...props
}) {
  const showHeader = Boolean(title || description || eyebrow || actions);

  return (
    <Card
      variant={variant}
      size={size}
      className={className}
      {...props}
    >
      {showHeader && (
        <SectionHeader
          title={title}
          description={description}
          eyebrow={eyebrow}
          titleId={titleId}
          actions={actions}
          className={cn(
            children ? "mb-[var(--space-5)]" : undefined,
            headerClassName
          )}
        />
      )}
      {children}
    </Card>
  );
}
