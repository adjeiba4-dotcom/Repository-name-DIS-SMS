import toast, { Toaster } from "react-hot-toast";
import { AlertTriangle } from "lucide-react";

const BASE_STYLE = {
  background: "var(--color-surface-default)",
  color: "var(--color-text-primary)",
  border: "1px solid var(--color-border-default)",
  borderRadius: "var(--radius-panel)",
  boxShadow: "var(--shadow-lg)",
  fontFamily: "var(--font-family-sans)",
  fontSize: "var(--font-size-sm)",
  padding: "0.75rem 1rem",
};

/**
 * Token-aware toast helpers for DIS-SMS.
 * Variants: success, info, warning, error — accented via foundation.css.
 */
export function toastSuccess(message) {
  return toast.success(message, {
    duration: 4000,
    className: "ds-toast ds-toast--success",
    style: BASE_STYLE,
  });
}

export function toastError(message) {
  return toast.error(message, {
    duration: 5000,
    className: "ds-toast ds-toast--error",
    style: BASE_STYLE,
  });
}

export function toastInfo(message) {
  return toast(message, {
    duration: 4000,
    className: "ds-toast ds-toast--info",
    style: BASE_STYLE,
    iconTheme: {
      primary: "var(--color-ocean-blue)",
      secondary: "var(--color-surface-default)",
    },
  });
}

export function toastWarning(message) {
  return toast(message, {
    duration: 4500,
    className: "ds-toast ds-toast--warning",
    style: BASE_STYLE,
    icon: (
      <AlertTriangle
        size={18}
        className="text-[color:var(--color-warning-600)]"
        aria-hidden
      />
    ),
  });
}

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      containerStyle={{
        zIndex: "var(--z-toast)",
        top: "calc(var(--header-height) + 0.75rem)",
      }}
      toastOptions={{
        className: "ds-toast",
        style: BASE_STYLE,
        success: {
          className: "ds-toast ds-toast--success",
          iconTheme: {
            primary: "var(--color-success-600)",
            secondary: "var(--color-surface-default)",
          },
        },
        error: {
          className: "ds-toast ds-toast--error",
          iconTheme: {
            primary: "var(--color-danger-600)",
            secondary: "var(--color-surface-default)",
          },
        },
      }}
    />
  );
}
