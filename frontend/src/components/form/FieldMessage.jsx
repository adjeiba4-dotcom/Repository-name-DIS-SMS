// components/form/FieldMessage.jsx

import { cn } from "../../utils/cn";
import {
  fieldErrorClassName,
  fieldHelperClassName,
} from "./fieldStyles";

/**
 * Validation or helper text under a form field.
 */
export default function FieldMessage({
  id,
  error = "",
  helperText = "",
  className = "",
}) {
  if (error) {
    return (
      <p
        id={id}
        role="alert"
        className={cn(fieldErrorClassName, className)}
      >
        {error}
      </p>
    );
  }

  if (!helperText) return null;

  return (
    <p id={id} className={cn(fieldHelperClassName, className)}>
      {helperText}
    </p>
  );
}
