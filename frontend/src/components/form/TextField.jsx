// components/form/TextField.jsx

import Input from "../ui/Input";
import { cn } from "../../utils/cn";
import { fieldHelperClassName } from "./fieldStyles";

/**
 * Generic text input field with validation/helper message support.
 * Builds on the shared Input primitive.
 */
export default function TextField({
  label,
  name,
  id,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = "",
  helperText = "",
  disabled = false,
  required = false,
  leftIcon = null,
  rightIcon = null,
  variant = "default",
  size = "sm",
  className = "",
  ...props
}) {
  const messageId =
    helperText && !error ? `${id || name || "field"}-helper` : undefined;

  return (
    <div className={cn("mb-5", className)}>
      <Input
        label={label}
        name={name}
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        required={required}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        variant={variant}
        size={size}
        className="mb-0"
        aria-describedby={messageId}
        {...props}
      />
      {helperText && !error ? (
        <p id={messageId} className={fieldHelperClassName}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
