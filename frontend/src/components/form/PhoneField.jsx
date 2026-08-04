// components/form/PhoneField.jsx

import { Phone } from "lucide-react";

import TextField from "./TextField";

/**
 * Telephone input field with phone icon affordance.
 */
export default function PhoneField({
  label = "Phone",
  name,
  id,
  value,
  onChange,
  placeholder = "e.g. 0244123456",
  error = "",
  helperText = "",
  disabled = false,
  required = false,
  className = "",
  ...props
}) {
  return (
    <TextField
      label={label}
      name={name}
      id={id}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      disabled={disabled}
      required={required}
      leftIcon={<Phone size={16} aria-hidden />}
      className={className}
      {...props}
    />
  );
}
