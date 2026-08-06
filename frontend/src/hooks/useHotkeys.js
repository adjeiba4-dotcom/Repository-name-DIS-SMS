import { useCallback, useEffect, useMemo, useRef } from "react";

/**
 * Register keyboard shortcuts.
 *
 * bindings: [{
 *   key: 'k',
 *   ctrl?: true, meta?: true, shift?: true, alt?: true,
 *   handler: (event) => void,
 *   enabled?: boolean,
 *   preventDefault?: boolean,
 * }]
 *
 * Prepare extensible shortcut support without coupling to business logic.
 */
export function useHotkeys(bindings = [], deps = []) {
  const bindingsRef = useRef(bindings);
  bindingsRef.current = bindings;

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.defaultPrevented) return;

      const target = event.target;
      const tag = target?.tagName?.toLowerCase();
      const isEditable =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        target?.isContentEditable;

      for (const binding of bindingsRef.current) {
        if (binding.enabled === false) continue;

        const key = String(binding.key || "").toLowerCase();
        const eventKey = String(event.key || "").toLowerCase();
        if (eventKey !== key) continue;

        const ctrlOrMeta = Boolean(event.ctrlKey || event.metaKey);
        const wantsMod = Boolean(binding.ctrl || binding.meta || binding.mod);
        if (wantsMod && !ctrlOrMeta) continue;
        if (!wantsMod && ctrlOrMeta && !binding.allowWithMod) continue;
        if (Boolean(binding.shift) !== Boolean(event.shiftKey)) continue;
        if (Boolean(binding.alt) !== Boolean(event.altKey)) continue;

        // Allow Ctrl/Cmd+K even from inputs; skip plain letter shortcuts while typing
        if (isEditable && !wantsMod && !binding.allowInInputs) continue;

        if (binding.preventDefault !== false) {
          event.preventDefault();
        }
        binding.handler?.(event);
        break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Detect platform modifier label for UI hints.
 */
export function useModKeyLabel() {
  return useMemo(() => {
    if (typeof navigator === "undefined") return "Ctrl";
    return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent)
      ? "⌘"
      : "Ctrl";
  }, []);
}

/**
 * Stable register helper for command/shortcut catalogs.
 */
export function createShortcutId(parts = []) {
  return parts.filter(Boolean).join(".");
}

export function useShortcutCatalog(entries = []) {
  return useMemo(
    () =>
      entries.map((entry) => ({
        id: entry.id || createShortcutId([entry.scope, entry.key]),
        ...entry,
      })),
    [entries]
  );
}

export default useHotkeys;
