// components/form/SubmitButton.jsx

import Button from "../ui/Button";
import { cn } from "../../utils/cn";

/**
 * Form submit button with loading state.
 * Always renders type="submit". Must be placed inside its <form>
 * (do not use the HTML form="" attribute).
 */
export default function SubmitButton({
  children = "Save",
  loading = false,
  disabled = false,
  variant = "primary",
  size = "md",
  className = "",
  form: _form,
  type: _type,
  ...props
}) {
  return (
    <Button
      {...props}
      type="submit"
      variant={variant}
      size={size}
      loading={loading}
      disabled={disabled || loading}
      className={cn("w-auto", className)}
    >
      {children}
    </Button>
  );
}
