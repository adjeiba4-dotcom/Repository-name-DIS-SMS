// components/form/FormGrid.jsx

import { cn } from "../../utils/cn";

/**
 * Responsive two-column form layout.
 * Children inherit square field spacing from foundation (.ds-form-grid).
 * Wrap a full-width control with FormGrid.Full or className="ds-form-grid__full".
 */
export default function FormGrid({ children, className = "", ...props }) {
  return (
    <div className={cn("ds-form-grid", className)} {...props}>
      {children}
    </div>
  );
}

export function FormGridFull({ children, className = "", ...props }) {
  return (
    <div className={cn("ds-form-grid__full", className)} {...props}>
      {children}
    </div>
  );
}

FormGrid.Full = FormGridFull;
