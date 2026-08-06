import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CornerDownLeft, Search } from "lucide-react";

import { useCommandPalette } from "../../contexts/CommandPaletteContext";
import { useModKeyLabel } from "../../hooks/useHotkeys";
import { getSearchPlaceholder } from "../../utils/searchPlaceholders";
import { cn } from "../../utils/cn";

function groupCommands(commands) {
  const groups = new Map();
  for (const command of commands) {
    const group = command.group || "Commands";
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(command);
  }
  return Array.from(groups.entries());
}

function filterCommands(commands, query) {
  const q = query.trim().toLowerCase();
  if (!q) return commands;
  return commands.filter((command) => {
    const haystack = [
      command.label,
      command.path,
      ...(command.keywords || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

/**
 * Extensible Ctrl+K command palette shell — navigation UI only.
 */
export default function CommandPalette({ placeholderPath = "/" }) {
  const navigate = useNavigate();
  const { open, closePalette, commands } = useCommandPalette();
  const modKey = useModKeyLabel();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const placeholder = getSearchPlaceholder(placeholderPath);
  const filtered = useMemo(
    () => filterCommands(commands, query),
    [commands, query]
  );
  const grouped = useMemo(() => groupCommands(filtered), [filtered]);
  const flat = filtered;

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
      return undefined;
    }
    const id = window.setTimeout(() => inputRef.current?.focus(), 10);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!open) return null;

  const runCommand = (command) => {
    if (!command) return;
    closePalette();
    if (typeof command.onSelect === "function") {
      command.onSelect(command);
      return;
    }
    if (command.path) {
      navigate(command.path);
    }
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        flat.length ? (index + 1) % flat.length : 0
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        flat.length ? (index - 1 + flat.length) % flat.length : 0
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      runCommand(flat[activeIndex]);
    }
  };

  let runningIndex = -1;

  return (
    <div className="ds-command-overlay" role="presentation">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close command palette"
        onClick={closePalette}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="ds-command relative z-10"
        onKeyDown={onKeyDown}
      >
        <div className="ds-command__search">
          <Search size={18} className="text-[var(--color-text-muted)]" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            className="ds-command__input"
            aria-autocomplete="list"
            aria-controls="command-palette-list"
          />
          <span className="ds-kbd">Esc</span>
        </div>

        <div id="command-palette-list" className="ds-command__list" role="listbox">
          {flat.length === 0 ? (
            <div className="ds-command__empty">
              No matching commands. Try another keyword.
            </div>
          ) : (
            grouped.map(([group, items]) => (
              <div key={group}>
                <div className="ds-command__group">{group}</div>
                {items.map((command) => {
                  runningIndex += 1;
                  const index = runningIndex;
                  const Icon = command.icon;
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={command.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      className={cn(
                        "ds-command__item",
                        isActive && "is-active"
                      )}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => runCommand(command)}
                    >
                      {Icon ? (
                        <Icon size={16} className="shrink-0" aria-hidden />
                      ) : null}
                      <span className="min-w-0 truncate">{command.label}</span>
                      {command.path ? (
                        <span className="ds-command__item-meta">
                          {command.path}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="ds-command__footer">
          <span className="ds-command__hint">
            <span className="ds-kbd">{modKey}</span>
            <span className="ds-kbd">K</span>
            <span>to toggle</span>
          </span>
          <span className="ds-command__hint">
            <span className="ds-kbd">↑</span>
            <span className="ds-kbd">↓</span>
            <span>to navigate</span>
          </span>
          <span className="ds-command__hint">
            <span className="ds-kbd inline-flex gap-0.5">
              <CornerDownLeft size={10} aria-hidden />
            </span>
            <span>to open</span>
          </span>
        </div>
      </div>
    </div>
  );
}
