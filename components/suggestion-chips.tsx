"use client"

import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SuggestionChip {
  id: string
  name: string
  description: string
  value: number
}

interface SuggestionChipsProps {
  items: SuggestionChip[]
  onPick: (chip: SuggestionChip) => void
  tone?: "cost" | "benefit"
  label?: string
}

export function SuggestionChips({ items, onPick, tone = "cost", label = "추천 항목" }: SuggestionChipsProps) {
  if (items.length === 0) return null

  const toneClasses =
    tone === "cost"
      ? "border-error-alpha/60 bg-error-alpha/30 text-error hover:border-error/50 hover:bg-error-alpha"
      : "border-success-alpha/60 bg-success-alpha/30 text-success hover:border-success/40 hover:bg-success-alpha"

  return (
    <div className="space-y-2">
      <p className="text-subheading-xs text-text-soft">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => onPick(chip)}
            title={chip.description}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-paragraph-xs font-medium transition-colors",
              toneClasses,
            )}
          >
            <Plus className="size-3" />
            {chip.name}
          </button>
        ))}
      </div>
    </div>
  )
}
