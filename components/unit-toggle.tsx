"use client"

import { cn } from "@/lib/utils"
import {
  UNIT_LABELS,
  UNIT_SCALES,
  t,
  type Currency,
  type Language,
  type UnitScale,
} from "@/lib/i18n"

// Re-export for convenience so existing imports from this module keep working.
export type UnitValue = UnitScale
export { UNIT_SCALES }

interface UnitToggleProps {
  value: UnitScale
  onChange: (v: UnitScale) => void
  currency: Currency
  lang: Language
  className?: string
}

export function UnitToggle({ value, onChange, currency, lang, className }: UnitToggleProps) {
  const labels = UNIT_LABELS[currency]

  return (
    <div
      role="radiogroup"
      aria-label={t(lang, "unit.label")}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-stroke-soft bg-card/70 p-1 shadow-xs backdrop-blur-md",
        className,
      )}
    >
      <span className="px-2 text-paragraph-xs font-medium text-text-soft">
        {t(lang, "unit.label")}
      </span>
      {UNIT_SCALES.map((scale) => {
        const active = scale === value
        return (
          <button
            key={scale}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(scale)}
            className={cn(
              "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              active
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-text-sub hover:bg-bg-weak hover:text-text-strong",
            )}
          >
            {labels[scale]}
          </button>
        )
      })}
    </div>
  )
}
