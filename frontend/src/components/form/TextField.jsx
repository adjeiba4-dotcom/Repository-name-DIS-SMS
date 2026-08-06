// components/form/TextField.jsx

import Input from "../ui/Input";
import { cn } from "../../utils/cn";
import FieldMessage from "./FieldMessage";

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
  const fieldId = id || name;
  const messageId =
    error || helperText ? `${fieldId || "field"}-message` : undefined;

  return (
    <div className={cn("ds-field mb-5", className)}>
      <Input
        label={label}
        name={name}
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        error=""
        disabled={disabled}
        required={required}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        variant={variant}
        size={size}
        className="mb-0"
        aria-invalid={error ? true : undefined}
        aria-describedby={messageId}
        {...props}
      />
      <FieldMessage id={messageId} error={error} helperText={helperText} />
    </div>
  );
}
