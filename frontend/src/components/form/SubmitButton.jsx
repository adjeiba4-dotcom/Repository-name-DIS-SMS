// components/form/SubmitButton.jsx

import Button from "../ui/Button";
import { cn } from "../../utils/cn";

/**
 * Form submit button with loading state.
 */
export default function SubmitButton({
  children = "Save",
  loading = false,
  disabled = false,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      loading={loading}
      disabled={disabled || loading}
      className={cn("w-auto", className)}
      {...props}
    >
      {children}
    </Button>
  );
}
