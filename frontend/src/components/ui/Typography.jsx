import { cn } from "../../utils/cn";

const textVariants = {
  default: "text-[var(--color-text-primary)]",
  secondary: "text-[var(--color-text-secondary)]",
  muted: "text-[var(--color-text-muted)]",
  inverse: "text-[var(--color-text-inverse)]",
  link: "text-[var(--color-text-link)]",
};

const h1Sizes = {
  sm: "text-[length:var(--font-size-2xl)]",
  md: "text-[length:var(--font-size-3xl)]",
  lg: "text-[length:var(--font-size-3xl)] md:text-4xl",
};

const h2Sizes = {
  sm: "text-[length:var(--font-size-xl)]",
  md: "text-[length:var(--font-size-2xl)]",
  lg: "text-[length:var(--font-size-3xl)]",
};

const h3Sizes = {
  sm: "text-[length:var(--font-size-lg)]",
  md: "text-[length:var(--font-size-xl)]",
  lg: "text-[length:var(--font-size-2xl)]",
};

const bodySizes = {
  sm: "text-[length:var(--font-size-sm)]",
  md: "text-[length:var(--font-size-base)]",
  lg: "text-[length:var(--font-size-lg)]",
};

const captionSizes = {
  sm: "text-[length:var(--font-size-xs)]",
  md: "text-[length:var(--font-size-sm)]",
  lg: "text-[length:var(--font-size-base)]",
};

const labelSizes = {
  sm: "text-[length:var(--font-size-xs)]",
  md: "text-[length:var(--font-size-sm)]",
  lg: "text-[length:var(--font-size-base)]",
};

function TypographyBase({
  as: Component = "p",
  children,
  variant = "default",
  size = "md",
  disabled = false,
  className = "",
  sizeMap,
  baseClassName = "",
  ...props
}) {
  return (
    <Component
      aria-disabled={disabled || undefined}
      className={cn(
        "font-[family-name:var(--font-family-sans)]",
        baseClassName,
        textVariants[variant] ?? textVariants.default,
        sizeMap?.[size] ?? sizeMap?.md,
        disabled && "text-[var(--color-text-disabled)]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function H1({
  children,
  variant = "default",
  size = "lg",
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <TypographyBase
      as="h1"
      variant={variant}
      size={size}
      disabled={disabled}
      className={className}
      sizeMap={h1Sizes}
      baseClassName="font-[number:var(--font-weight-bold)] tracking-tight leading-[var(--line-height-tight)]"
      {...props}
    >
      {children}
    </TypographyBase>
  );
}

export function H2({
  children,
  variant = "default",
  size = "lg",
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <TypographyBase
      as="h2"
      variant={variant}
      size={size}
      disabled={disabled}
      className={className}
      sizeMap={h2Sizes}
      baseClassName="font-[number:var(--font-weight-semibold)] leading-[var(--line-height-tight)]"
      {...props}
    >
      {children}
    </TypographyBase>
  );
}

export function H3({
  children,
  variant = "default",
  size = "lg",
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <TypographyBase
      as="h3"
      variant={variant}
      size={size}
      disabled={disabled}
      className={className}
      sizeMap={h3Sizes}
      baseClassName="font-[number:var(--font-weight-semibold)] leading-[var(--line-height-tight)]"
      {...props}
    >
      {children}
    </TypographyBase>
  );
}

export function Body({
  children,
  variant = "secondary",
  size = "md",
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <TypographyBase
      as="p"
      variant={variant}
      size={size}
      disabled={disabled}
      className={className}
      sizeMap={bodySizes}
      baseClassName="font-[number:var(--font-weight-normal)] leading-[var(--line-height-normal)]"
      {...props}
    >
      {children}
    </TypographyBase>
  );
}

export function Caption({
  children,
  variant = "muted",
  size = "md",
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <TypographyBase
      as="p"
      variant={variant}
      size={size}
      disabled={disabled}
      className={className}
      sizeMap={captionSizes}
      baseClassName="font-[number:var(--font-weight-normal)] leading-[var(--line-height-normal)]"
      {...props}
    >
      {children}
    </TypographyBase>
  );
}

export function Label({
  children,
  variant = "secondary",
  size = "md",
  disabled = false,
  className = "",
  htmlFor,
  ...props
}) {
  return (
    <TypographyBase
      as="label"
      variant={variant}
      size={size}
      disabled={disabled}
      className={className}
      sizeMap={labelSizes}
      baseClassName="inline-block font-[number:var(--font-weight-semibold)] leading-[var(--line-height-normal)]"
      htmlFor={htmlFor}
      {...props}
    >
      {children}
    </TypographyBase>
  );
}
