import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  icon?: LucideIcon
  title: string
  caption?: string
  tone?: "default" | "primary" | "success" | "danger"
  action?: ReactNode
  className?: string
}

const toneStyles: Record<NonNullable<SectionHeaderProps["tone"]>, string> = {
  default: "bg-bg-soft text-text-sub",
  primary: "bg-primary/10 text-primary-darker",
  success: "bg-success-alpha text-success",
  danger: "bg-error-alpha text-error",
}

export function SectionHeader({
  icon: Icon,
  title,
  caption,
  tone = "default",
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex items-start gap-3">
        {Icon ? (
          <div
            className={cn(
              "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
              toneStyles[tone],
            )}
          >
            <Icon className="size-[18px]" />
          </div>
        ) : null}
        <div className="flex flex-col gap-0.5">
          <h3 className="text-title-h6 text-text-strong">{title}</h3>
          {caption ? <p className="text-paragraph-sm text-text-sub">{caption}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
