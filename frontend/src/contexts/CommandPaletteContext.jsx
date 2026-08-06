import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { getNavigationItems } from "../utils/navigation";
import { useHotkeys } from "../hooks/useHotkeys";

const CommandPaletteContext = createContext(null);

function buildNavCommands() {
  return getNavigationItems().map((item) => ({
    id: `nav.${item.id}`,
    group: "Navigation",
    label: item.label,
    path: item.path,
    icon: item.icon,
    keywords: [item.label, item.path, item.id].filter(Boolean),
  }));
}

/**
 * Extensible Ctrl+K command palette shell (UI only).
 * Modules can register extra commands without changing routing/auth.
 */
export function CommandPaletteProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [extraCommands, setExtraCommands] = useState([]);

  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => setOpen(false), []);
  const togglePalette = useCallback(() => setOpen((value) => !value), []);

  const registerCommand = useCallback((command) => {
    if (!command?.id) return () => {};
    setExtraCommands((prev) => {
      const without = prev.filter((item) => item.id !== command.id);
      return [...without, command];
    });
    return () => {
      setExtraCommands((prev) => prev.filter((item) => item.id !== command.id));
    };
  }, []);

  const commands = useMemo(() => {
    return [...buildNavCommands(), ...extraCommands];
  }, [extraCommands]);

  useHotkeys(
    [
      {
        key: "k",
        mod: true,
        handler: () => togglePalette(),
      },
      {
        key: "escape",
        handler: () => closePalette(),
        enabled: open,
        allowInInputs: true,
      },
    ],
    [open, togglePalette, closePalette]
  );

  const value = useMemo(
    () => ({
      open,
      setOpen,
      openPalette,
      closePalette,
      togglePalette,
      commands,
      registerCommand,
    }),
    [
      open,
      openPalette,
      closePalette,
      togglePalette,
      commands,
      registerCommand,
    ]
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error(
      "useCommandPalette must be used within CommandPaletteProvider"
    );
  }
  return context;
}

export default CommandPaletteProvider;
