"use client"

import { useEffect, useState } from "react"
import { Wallet, TrendingUp, Gauge } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricsBarChartProps {
  totalCosts: number
  totalBenefits: number
  roa: number
  unitLabel: string
  currencyCode: string
  format: (v: number) => string
  labels: {
    eyebrow: string
    title: string
    cost: string
    benefit: string
    roa: string
  }
  className?: string
}

/**
 * SVG-based horizontal bar chart for the 3 top-level metrics.
 * - Costs & Benefits share the same KRW scale (max of the pair = 100%).
 * - ROA is normalized on a -100% ~ +300% range, centered at 0%.
 */
export function MetricsBarChart({
  totalCosts,
  totalBenefits,
  roa,
  unitLabel,
  currencyCode,
  format,
  labels,
  className,
}: MetricsBarChartProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const krwMax = Math.max(totalCosts, totalBenefits, 1)
  const costPct = (totalCosts / krwMax) * 100
  const benefitPct = (totalBenefits / krwMax) * 100

  // ROA: clamp to -100 ~ +300, map to 0 ~ 100 with 0% baseline at 25% of track
  const roaMin = -100
  const roaMax = 300
  const roaClamped = Math.max(roaMin, Math.min(roaMax, roa))
  const roaTrackPct = ((roaClamped - roaMin) / (roaMax - roaMin)) * 100
  const roaBaselinePct = ((0 - roaMin) / (roaMax - roaMin)) * 100
  const roaIsPositive = roa >= 0
  const roaBarStart = roaIsPositive ? roaBaselinePct : roaTrackPct
  const roaBarEnd = roaIsPositive ? roaTrackPct : roaBaselinePct
  const roaBarWidth = roaBarEnd - roaBarStart

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-stroke-soft bg-card/70 p-6 shadow-sm backdrop-blur-md",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />
      <div className="mb-5 flex items-baseline justify-between">
        <div>
          <p className="text-subheading-xs text-text-soft">{labels.eyebrow}</p>
          <h3 className="mt-0.5 font-display text-[15px] font-bold tracking-wide text-text-strong">
            {labels.title}
          </h3>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-soft">
          {currencyCode} · {unitLabel}
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <BarRow
          icon={Wallet}
          label={labels.cost}
          value={format(totalCosts)}
          unit={unitLabel}
          tone="danger"
          gradientId="grad-cost"
          glowId="glow-cost"
          startPct={0}
          widthPct={mounted ? costPct : 0}
        />
        <BarRow
          icon={TrendingUp}
          label={labels.benefit}
          value={format(totalBenefits)}
          unit={unitLabel}
          tone="success"
          gradientId="grad-benefit"
          glowId="glow-benefit"
          startPct={0}
          widthPct={mounted ? benefitPct : 0}
        />
        <BarRow
          icon={Gauge}
          label={labels.roa}
          value={`${roa.toFixed(1)}%`}
          unit=""
          tone={roaIsPositive ? "primary" : "danger"}
          gradientId="grad-roa"
          glowId="glow-roa"
          startPct={mounted ? roaBarStart : roaBaselinePct}
          widthPct={mounted ? roaBarWidth : 0}
          baselinePct={roaBaselinePct}
          scaleTicks={[
            { pct: 0, label: "-100%" },
            { pct: roaBaselinePct, label: "0%" },
            { pct: 50, label: "100%" },
            { pct: 100, label: "300%" },
          ]}
        />
      </div>
    </div>
  )
}

interface BarRowProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  unit: string
  tone: "primary" | "success" | "danger"
  gradientId: string
  glowId: string
  startPct: number
  widthPct: number
  baselinePct?: number
  scaleTicks?: { pct: number; label: string }[]
}

const toneTokens = {
  primary: {
    chip: "bg-primary/15 text-primary-glow",
    text: "text-primary-glow",
    start: "var(--primary-base)",
    end: "var(--primary-glow)",
  },
  success: {
    chip: "bg-success-alpha text-success",
    text: "text-success",
    start: "var(--success-base)",
    end: "oklch(from var(--success-base) calc(l + 0.12) c h)",
  },
  danger: {
    chip: "bg-error-alpha text-error",
    text: "text-error",
    start: "var(--error-base)",
    end: "oklch(from var(--error-base) calc(l + 0.12) c h)",
  },
} as const

function BarRow({
  icon: Icon,
  label,
  value,
  unit,
  tone,
  gradientId,
  glowId,
  startPct,
  widthPct,
  baselinePct,
  scaleTicks,
}: BarRowProps) {
  const t = toneTokens[tone]
  const safeWidth = Math.max(0, widthPct)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={cn("flex size-7 items-center justify-center rounded-md", t.chip)}>
            <Icon className="size-3.5" />
          </div>
          <span className="text-label-sm text-text-sub">{label}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={cn("font-display text-[18px] font-bold tabular-nums", t.text)}>
            {value}
          </span>
          {unit ? <span className="font-mono text-[11px] text-text-soft">{unit}</span> : null}
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
          width="100%"
          height="14"
          className="block overflow-visible"
          aria-hidden
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={t.start} stopOpacity="0.85" />
              <stop offset="100%" stopColor={t.end} stopOpacity="1" />
            </linearGradient>
            <filter id={glowId} x="-20%" y="-60%" width="140%" height="220%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* track */}
          <rect x="0" y="3" width="100" height="4" rx="2" fill="var(--bg-soft)" />

          {/* baseline marker for signed scales */}
          {baselinePct != null ? (
            <line
              x1={baselinePct}
              x2={baselinePct}
              y1="1"
              y2="9"
              stroke="var(--stroke-sub)"
              strokeWidth="0.3"
              strokeDasharray="0.6 0.6"
            />
          ) : null}

          {/* filled portion */}
          <rect
            x={startPct}
            y="3"
            width={safeWidth}
            height="4"
            rx="2"
            fill={`url(#${gradientId})`}
            filter={`url(#${glowId})`}
            style={{
              transition: "width 1000ms cubic-bezier(0.22, 1, 0.36, 1), x 1000ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />

          {/* leading edge dot */}
          {safeWidth > 0 ? (
            <circle
              cx={startPct + safeWidth}
              cy="5"
              r="0.9"
              fill={t.end}
              style={{
                transition: "cx 1000ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          ) : null}
        </svg>

        {scaleTicks && scaleTicks.length > 0 ? (
          <div className="relative mt-1 h-3">
            {scaleTicks.map((tick) => (
              <span
                key={tick.label}
                className="absolute -translate-x-1/2 font-mono text-[9px] uppercase tracking-wider text-text-soft"
                style={{ left: `${tick.pct}%` }}
              >
                {tick.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
