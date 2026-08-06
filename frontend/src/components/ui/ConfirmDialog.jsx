import { Archive, LogOut, RotateCcw, Trash2 } from "lucide-react";

import Button from "./Button";
import Modal from "./Modal";
import { cn } from "../../utils/cn";

const INTENT_CONFIG = {
  archive: {
    title: "Archive record?",
    confirmLabel: "Archive",
    cancelLabel: "Cancel",
    confirmVariant: "danger",
    icon: Archive,
    iconTone: "warning",
    defaultMessage:
      "This record will be archived and can be restored later from the archived list.",
  },
  delete: {
    title: "Delete permanently?",
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
    confirmVariant: "danger",
    icon: Trash2,
    iconTone: "danger",
    defaultMessage:
      "This action cannot be undone. The record will be permanently removed.",
  },
  restore: {
    title: "Restore record?",
    confirmLabel: "Restore",
    cancelLabel: "Cancel",
    confirmVariant: "primary",
    icon: RotateCcw,
    iconTone: "success",
    defaultMessage:
      "This record will be restored and return to the active list.",
  },
  logout: {
    title: "Sign out?",
    confirmLabel: "Sign out",
    cancelLabel: "Stay signed in",
    confirmVariant: "danger",
    icon: LogOut,
    iconTone: "info",
    defaultMessage:
      "You will be signed out of DIS-SMS. Unsaved work on this device may be lost.",
  },
};

/**
 * Reusable confirmation dialog for archive, delete, restore, and logout.
 * Presentation only — callers supply open/loading handlers and side effects.
 */
export default function ConfirmDialog({
  open = false,
  intent = "delete",
  title,
  description,
  confirmLabel,
  cancelLabel,
  loading = false,
  error = "",
  entityName,
  onConfirm,
  onCancel,
  className = "",
}) {
  const config = INTENT_CONFIG[intent] ?? INTENT_CONFIG.delete;
  const Icon = config.icon;
  const resolvedTitle = title || config.title;
  const resolvedConfirm = confirmLabel || config.confirmLabel;
  const resolvedCancel = cancelLabel || config.cancelLabel;

  let message = description || config.defaultMessage;
  if (entityName && !description) {
    message = (
      <>
        You are about to {intent} <strong>{entityName}</strong>.{" "}
        {config.defaultMessage}
      </>
    );
  }

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onCancel}
      title={resolvedTitle}
      size="sm"
      disabled={loading}
      className={className}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-auto"
            onClick={onCancel}
            disabled={loading}
          >
            {resolvedCancel}
          </Button>
          <Button
            type="button"
            variant={config.confirmVariant}
            size="sm"
            className="w-auto"
            loading={loading}
            onClick={onConfirm}
          >
            {resolvedConfirm}
          </Button>
        </>
      }
    >
      <div className="ds-confirm">
        <div
          className={cn(
            "ds-confirm__icon",
            `ds-confirm__icon--${config.iconTone}`
          )}
          aria-hidden
        >
          <Icon size={20} />
        </div>
        <div className="ds-confirm__body">
          <p className="ds-confirm__message">{message}</p>
          {error ? (
            <p role="alert" className="ds-confirm__error">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

export { INTENT_CONFIG as CONFIRM_INTENTS };
