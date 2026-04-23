"use client"

import { cn } from "@/lib/utils"
import { CURRENCY_META, type Currency, type Language, t } from "@/lib/i18n"

interface CurrencyToggleProps {
  value: Currency
  onChange: (c: Currency) => void
  lang: Language
  className?: string
}

const ORDER: Currency[] = ["KRW", "USD", "JPY", "CNY"]

export function CurrencyToggle({ value, onChange, lang, className }: CurrencyToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label={t(lang, "currency.label")}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-stroke-soft bg-card/70 p-1 shadow-xs backdrop-blur-md",
        className,
      )}
    >
      <span className="px-2 text-paragraph-xs font-medium text-text-soft">
        {t(lang, "currency.label")}
      </span>
      {ORDER.map((c) => {
        const active = c === value
        const meta = CURRENCY_META[c]
        return (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(c)}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              active
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-text-sub hover:bg-bg-weak hover:text-text-strong",
            )}
          >
            <span className="font-mono text-[11px]">{meta.symbol}</span>
            <span className="text-[12px]">{t(lang, `currency.${c}`)}</span>
          </button>
        )
      })}
    </div>
  )
}
