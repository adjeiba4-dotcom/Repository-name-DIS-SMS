import toast, { Toaster } from "react-hot-toast";

/**
 * Token-aware toast helpers for DIS-SMS.
 */
export function toastSuccess(message) {
  return toast.success(message, {
    duration: 4000,
  });
}

export function toastError(message) {
  return toast.error(message, {
    duration: 5000,
  });
}

export function toastInfo(message) {
  return toast(message, {
    duration: 4000,
  });
}

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      containerStyle={{
        zIndex: "var(--z-toast)",
        top: "calc(var(--header-height) + 0.75rem)",
      }}
      toastOptions={{
        className: "",
        style: {
          background: "var(--color-surface-default)",
          color: "var(--color-text-primary)",
          border: "1px solid var(--color-border-default)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-lg)",
          fontFamily: "var(--font-family-sans)",
          fontSize: "var(--font-size-sm)",
          padding: "0.75rem 1rem",
        },
        success: {
          iconTheme: {
            primary: "var(--color-success-600)",
            secondary: "var(--color-surface-default)",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--color-danger-600)",
            secondary: "var(--color-surface-default)",
          },
        },
      }}
    />
  );
}
