// components/form/DatePickerField.jsx

import { Calendar } from "lucide-react";

import TextField from "./TextField";

/**
 * Date input field using native date picker with design-system styling.
 */
export default function DatePickerField({
  label,
  name,
  id,
  value,
  onChange,
  placeholder = "",
  error = "",
  helperText = "",
  disabled = false,
  required = false,
  min,
  max,
  className = "",
  ...props
}) {
  return (
    <TextField
      label={label}
      name={name}
      id={id}
      type="date"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      disabled={disabled}
      required={required}
      leftIcon={<Calendar size={16} aria-hidden />}
      className={className}
      min={min}
      max={max}
      {...props}
    />
  );
}
