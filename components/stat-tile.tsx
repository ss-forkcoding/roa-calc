import type { LucideIcon } from "lucide-react"
import { AnimatedNumber } from "@/components/animated-number"
import { cn } from "@/lib/utils"

interface StatTileProps {
  label: string
  value: number
  unit?: string
  icon?: LucideIcon
  tone?: "default" | "primary" | "success" | "danger"
  sublabel?: string
  format?: (v: number) => string
  delay?: number
}

const toneStyles: Record<
  NonNullable<StatTileProps["tone"]>,
  { wrapper: string; chip: string; value: string; label: string; sublabel: string; accent: string }
> = {
  default: {
    wrapper:
      "border-stroke-soft/70 bg-card/70 backdrop-blur-md hover:border-primary/40 hover:shadow-sm",
    chip: "bg-bg-soft text-text-sub",
    value: "text-text-strong",
    label: "text-text-sub",
    sublabel: "text-text-soft",
    accent: "from-primary/30 to-transparent",
  },
  primary: {
    wrapper:
      "border-primary/40 bg-gradient-to-br from-primary via-primary-dark to-primary-darker text-primary-foreground shadow-glow",
    chip: "bg-white/15 text-primary-foreground backdrop-blur-sm",
    value: "text-primary-foreground",
    label: "text-primary-foreground/80",
    sublabel: "text-primary-foreground/75",
    accent: "from-white/50 to-transparent",
  },
  success: {
    wrapper:
      "border-success/30 bg-card/70 backdrop-blur-md hover:border-success/50 hover:shadow-sm",
    chip: "bg-success-alpha text-success",
    value: "text-text-strong",
    label: "text-text-sub",
    sublabel: "text-success",
    accent: "from-success/40 to-transparent",
  },
  danger: {
    wrapper:
      "border-error/30 bg-card/70 backdrop-blur-md hover:border-error/50 hover:shadow-sm",
    chip: "bg-error-alpha text-error",
    value: "text-text-strong",
    label: "text-text-sub",
    sublabel: "text-error",
    accent: "from-error/40 to-transparent",
  },
}

export function StatTile({
  label,
  value,
  unit,
  icon: Icon,
  tone = "default",
  sublabel,
  format,
}: StatTileProps) {
  const styles = toneStyles[tone]
  const formatter =
    format ?? ((v: number) => new Intl.NumberFormat("ko-KR").format(Math.round(v)))

  return (
    <div
      className={cn(
        "shine group relative flex flex-col gap-3 overflow-hidden rounded-xl border p-5 transition-all duration-300",
        styles.wrapper,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r",
          styles.accent,
        )}
      />
      <div className="flex items-center justify-between">
        <span className={cn("text-subheading-xs", styles.label)}>{label}</span>
        {Icon ? (
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
              styles.chip,
            )}
          >
            <Icon className="size-4" />
          </div>
        ) : null}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-display text-[2.25rem] font-bold leading-none tabular-nums",
            styles.value,
          )}
        >
          <AnimatedNumber value={value} formatFn={formatter} trigger={true} />
        </span>
        {unit ? <span className={cn("font-mono text-paragraph-sm", styles.label)}>{unit}</span> : null}
      </div>
      {sublabel ? (
        <span className={cn("text-paragraph-xs", styles.sublabel)}>{sublabel}</span>
      ) : null}
    </div>
  )
}
