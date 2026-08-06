// components/form/FormSection.jsx

import { cn } from "../../utils/cn";
import FormGrid from "./FormGrid";

/**
 * Form section with title, optional description, and two-column field grid.
 */
export default function FormSection({
  title,
  description,
  children,
  className = "",
  gridClassName = "",
  ...props
}) {
  return (
    <section className={cn("ds-form-section", className)} {...props}>
      {(title || description) && (
        <div>
          {title ? <h3 className="ds-form-section__title">{title}</h3> : null}
          {description ? (
            <p className="ds-form-section__description">{description}</p>
          ) : null}
        </div>
      )}
      <FormGrid className={gridClassName}>{children}</FormGrid>
    </section>
  );
}
