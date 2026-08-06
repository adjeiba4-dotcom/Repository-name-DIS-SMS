import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "../../utils/cn";

/**
 * Parse display values like "1,248", "94.6%", "$128K" into animatable parts.
 */
export function parseMetricValue(value) {
  const raw = value == null ? "" : String(value).trim();
  if (!raw || raw === "—" || raw === "-") {
    return { prefix: "", number: null, suffix: raw, decimals: 0, raw };
  }

  const match = raw.match(/^(.*?)(-?[\d,]*\.?\d+)(.*)$/);
  if (!match) {
    return { prefix: "", number: null, suffix: "", decimals: 0, raw };
  }

  const [, prefix, numeric, suffix] = match;
  const normalized = numeric.replace(/,/g, "");
  const number = Number(normalized);
  if (!Number.isFinite(number)) {
    return { prefix: "", number: null, suffix: "", decimals: 0, raw };
  }

  const decimals = normalized.includes(".")
    ? normalized.split(".")[1].length
    : 0;

  return {
    prefix: prefix ?? "",
    number,
    suffix: suffix ?? "",
    decimals,
    raw,
  };
}

function formatAnimated(value, decimals, useGrouping) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping,
  }).format(value);
}

/**
 * Animated KPI counter — respects prefers-reduced-motion.
 */
export default function AnimatedCounter({
  value,
  duration = 900,
  className = "",
  animate = true,
  ...props
}) {
  const parsed = useMemo(() => parseMetricValue(value), [value]);
  const [display, setDisplay] = useState(
    parsed.number == null ? parsed.raw : parsed.number
  );
  const frameRef = useRef(null);
  const previousRef = useRef(parsed.number ?? 0);

  useEffect(() => {
    if (parsed.number == null || !animate) {
      setDisplay(parsed.number == null ? parsed.raw : parsed.number);
      previousRef.current = parsed.number ?? 0;
      return undefined;
    }

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setDisplay(parsed.number);
      previousRef.current = parsed.number;
      return undefined;
    }

    const from = previousRef.current;
    const to = parsed.number;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      setDisplay(current);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        previousRef.current = to;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [parsed, animate, duration]);

  if (parsed.number == null) {
    return (
      <span className={cn("tabular-nums", className)} {...props}>
        {parsed.raw}
      </span>
    );
  }

  const useGrouping = String(value).includes(",");
  const formatted = formatAnimated(
    typeof display === "number" ? display : parsed.number,
    parsed.decimals,
    useGrouping
  );

  return (
    <span className={cn("tabular-nums", className)} {...props}>
      {parsed.prefix}
      {formatted}
      {parsed.suffix}
    </span>
  );
}
