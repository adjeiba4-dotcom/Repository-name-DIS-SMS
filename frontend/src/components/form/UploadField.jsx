// components/form/UploadField.jsx

import { useId, useRef } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";

import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import { Body, Caption } from "../ui/Typography";
import { cn } from "../../utils/cn";
import FieldMessage from "./FieldMessage";
import { fieldLabelClassName } from "./fieldStyles";

/**
 * Generic file upload field with optional image preview.
 */
export default function UploadField({
  label = "Upload file",
  name,
  id,
  accept = "image/png,image/jpeg,image/webp",
  valueName = "",
  previewSrc = "",
  previewName = "",
  error = "",
  helperText = "JPG or PNG",
  disabled = false,
  required = false,
  showAvatarFallback = true,
  avatarName = "Upload",
  onChange,
  onClear,
  className = "",
  chooseLabel = "Choose file",
  clearLabel = "Remove",
  maxSizeMb = 2,
  ...props
}) {
  const generatedId = useId();
  const fieldId = id || name || generatedId;
  const messageId =
    error || helperText ? `${fieldId}-message` : undefined;
  const fileInputRef = useRef(null);
  const hasPreview = Boolean(previewSrc);

  return (
    <div className={cn("ds-field mb-5", className)}>
      {label && (
        <label htmlFor={fieldId} className={fieldLabelClassName}>
          {label}
          {required && (
            <span className="ds-field__required" aria-hidden>
              *
            </span>
          )}
        </label>
      )}

      <div className="flex flex-col gap-[var(--space-4)] sm:flex-row sm:items-center">
        <div className="flex items-center gap-[var(--space-4)]">
          {hasPreview ? (
            <img
              src={previewSrc}
              alt={previewName || "Upload preview"}
              className="h-20 w-20 rounded-[var(--radius-xl)] object-cover ring-1 ring-[var(--color-border-default)]"
            />
          ) : showAvatarFallback ? (
            <Avatar name={avatarName} size="xl" variant="rounded" />
          ) : (
            <div
              className="inline-flex h-20 w-20 items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]"
              aria-hidden
            >
              <Upload size={22} />
            </div>
          )}

          <div className="min-w-0 space-y-[var(--space-1)]">
            <Body
              variant="default"
              size="sm"
              className="m-0 font-[number:var(--font-weight-semibold)]"
            >
              {valueName || previewName || "No file selected"}
            </Body>
            {helperText && !error ? (
              <Caption variant="muted" size="sm" className="m-0">
                {helperText}
                {maxSizeMb ? ` · max ${maxSizeMb}MB` : ""}
              </Caption>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-[var(--space-2)]">
          <input
            ref={fileInputRef}
            id={fieldId}
            name={name}
            type="file"
            accept={accept}
            className="sr-only"
            onChange={onChange}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={messageId}
            {...props}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-auto"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            {accept?.includes("image") ? (
              <ImagePlus size={16} aria-hidden />
            ) : (
              <Upload size={16} aria-hidden />
            )}
            {chooseLabel}
          </Button>
          {(hasPreview || valueName) && onClear ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-auto"
              onClick={onClear}
              disabled={disabled}
            >
              <Trash2 size={16} aria-hidden />
              {clearLabel}
            </Button>
          ) : null}
        </div>
      </div>

      <FieldMessage id={messageId} error={error} />
    </div>
  );
}
