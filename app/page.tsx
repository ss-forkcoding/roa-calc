"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Copy,
  Plus,
  Trash2,
  BarChart3,
  Building2,
  Wallet,
  TrendingUp,
  Gauge,
  PieChart,
  LineChart,
  FileText,
  FileDown,
  Sparkles,
  RotateCcw,
  GripVertical,
} from "lucide-react"
import { toast } from "sonner"
import { AnimatedCard } from "@/components/animated-card"
import { AnimatedNumber } from "@/components/animated-number"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { TopBar } from "@/components/top-bar"
import { SectionHeader } from "@/components/section-header"
import { StatTile } from "@/components/stat-tile"
import { UnitToggle, type UnitValue } from "@/components/unit-toggle"
import { CurrencyToggle } from "@/components/currency-toggle"
import { SuggestionChips } from "@/components/suggestion-chips"
import { MetricsBarChart } from "@/components/metrics-bar-chart"
import { cn } from "@/lib/utils"
import {
  CURRENCY_META,
  UNIT_LABELS,
  sampleText,
  t,
  type Currency,
  type Language,
} from "@/lib/i18n"

interface CostItem {
  id: string
  name: string
  description: string
  value: number // 원 단위 canonical
  isDefault: boolean
}

interface BenefitItem {
  id: string
  name: string
  description: string
  value: number // 원 단위 canonical
  isDefault: boolean
  department: string
}

// 예시 카탈로그 (값은 천원 단위로 기재 — 주입 시 × 1000 해서 원 단위로 확장)
const sampleCatalog = {
  전체: {
    costs: [
      { id: "solution", name: "AI 솔루션 구매 비용", description: "AI 플랫폼 라이선스 및 구매 비용", value: 50000 },
      { id: "training", name: "모델 학습/튜닝/유지 비용", description: "AI 모델 개발 및 지속적인 개선 비용", value: 30000 },
      { id: "infrastructure", name: "인프라 구축 및 운영 비용", description: "클라우드, GPU 등 하드웨어 인프라 비용", value: 40000 },
      { id: "data", name: "데이터 수집 및 정제 비용", description: "학습용 데이터 확보 및 전처리 비용", value: 20000 },
      { id: "personnel", name: "전문가 인건비", description: "AI 개발자, 데이터 사이언티스트 인건비", value: 80000 },
      { id: "consulting", name: "외주비/컨설팅 비용", description: "외부 전문업체 컨설팅 및 개발 비용", value: 25000 },
    ],
    benefits: [
      { id: "automation", name: "업무 자동화 효과", description: "반복 업무 자동화로 인한 인건비 절감", value: 120000 },
      { id: "error_reduction", name: "오류 감소 효과", description: "AI를 통한 정확도 향상으로 오류 비용 감소", value: 30000 },
      { id: "process_improvement", name: "프로세스 개선 효과", description: "업무 프로세스 최적화로 인한 효율성 증대", value: 45000 },
      { id: "decision_support", name: "의사결정 지원 효과", description: "데이터 기반 의사결정으로 인한 성과 향상", value: 35000 },
    ],
  },
  마케팅: {
    costs: [
      { id: "marketing_solution", name: "마케팅 AI 솔루션", description: "개인화 추천, 타겟팅 AI 도구", value: 15000 },
      { id: "marketing_data", name: "고객 데이터 분석 비용", description: "고객 행동 데이터 수집 및 분석", value: 8000 },
      { id: "marketing_personnel", name: "마케팅 AI 전문가", description: "마케팅 AI 운영 전담 인력", value: 12000 },
    ],
    benefits: [
      { id: "personalization", name: "개인화 마케팅", description: "고객별 맞춤 마케팅으로 전환율 향상", value: 60000 },
      { id: "targeting", name: "정밀 타겟팅", description: "AI 기반 고객 세분화로 마케팅 ROI 개선", value: 40000 },
      { id: "content_optimization", name: "콘텐츠 최적화", description: "AI 기반 콘텐츠 생성 및 최적화", value: 25000 },
      { id: "campaign_automation", name: "캠페인 자동화", description: "마케팅 캠페인 자동 실행 및 최적화", value: 35000 },
      { id: "customer_insights", name: "고객 인사이트 분석", description: "고객 행동 패턴 분석을 통한 전략 수립", value: 30000 },
    ],
  },
  기획: {
    costs: [
      { id: "planning_solution", name: "기획 분석 AI 도구", description: "시장 분석, 예측 모델링 도구", value: 12000 },
      { id: "planning_data", name: "시장 데이터 구매", description: "외부 시장 데이터 및 리서치 비용", value: 10000 },
      { id: "planning_personnel", name: "기획 분석 전문가", description: "데이터 기반 기획 전담 인력", value: 15000 },
    ],
    benefits: [
      { id: "market_analysis", name: "시장 분석 자동화", description: "AI 기반 시장 트렌드 및 경쟁사 분석", value: 35000 },
      { id: "demand_forecasting", name: "수요 예측", description: "정확한 수요 예측으로 재고 최적화", value: 50000 },
      { id: "strategic_planning", name: "전략 기획 지원", description: "데이터 기반 전략 수립 및 시뮬레이션", value: 40000 },
      { id: "risk_assessment", name: "리스크 평가", description: "AI 기반 사업 리스크 분석 및 대응", value: 25000 },
      { id: "resource_optimization", name: "자원 최적화", description: "인력 및 예산 배분 최적화", value: 30000 },
    ],
  },
  영업: {
    costs: [
      { id: "sales_solution", name: "영업 AI 플랫폼", description: "CRM 연동 AI 영업 지원 도구", value: 18000 },
      { id: "sales_data", name: "고객 데이터베이스", description: "잠재 고객 데이터 구축 및 관리", value: 7000 },
      { id: "sales_personnel", name: "영업 AI 운영팀", description: "AI 영업 도구 운영 전담 인력", value: 13000 },
    ],
    benefits: [
      { id: "lead_scoring", name: "리드 스코링", description: "잠재 고객 우선순위 자동 평가", value: 45000 },
      { id: "sales_forecasting", name: "매출 예측", description: "AI 기반 정확한 매출 예측", value: 40000 },
      { id: "customer_churn", name: "고객 이탈 방지", description: "이탈 위험 고객 사전 감지 및 대응", value: 55000 },
      { id: "price_optimization", name: "가격 최적화", description: "동적 가격 책정으로 수익성 향상", value: 35000 },
      { id: "sales_automation", name: "영업 프로세스 자동화", description: "영업 활동 자동화로 효율성 증대", value: 30000 },
    ],
  },
  디자인: {
    costs: [
      { id: "design_solution", name: "디자인 AI 도구", description: "자동 디자인 생성 및 최적화 도구", value: 10000 },
      { id: "design_data", name: "디자인 에셋 라이브러리", description: "AI 학습용 디자인 데이터 구축", value: 5000 },
      { id: "design_personnel", name: "AI 디자인 전문가", description: "AI 디자인 도구 운영 전문가", value: 8000 },
    ],
    benefits: [
      { id: "design_automation", name: "디자인 자동화", description: "AI 기반 디자인 생성 및 변형", value: 40000 },
      { id: "ab_testing", name: "A/B 테스트 최적화", description: "디자인 요소별 성과 분석 및 최적화", value: 25000 },
      { id: "user_experience", name: "사용자 경험 개선", description: "사용자 행동 분석을 통한 UX 최적화", value: 35000 },
      { id: "brand_consistency", name: "브랜드 일관성 관리", description: "AI 기반 브랜드 가이드라인 자동 검증", value: 20000 },
      { id: "creative_efficiency", name: "크리에이티브 효율성", description: "디자인 작업 시간 단축 및 품질 향상", value: 30000 },
    ],
  },
  개발: {
    costs: [
      { id: "dev_solution", name: "개발 AI 도구", description: "코드 생성, 테스트 자동화 도구", value: 25000 },
      { id: "dev_infrastructure", name: "개발 인프라", description: "AI 개발 환경 구축 및 운영", value: 20000 },
      { id: "dev_personnel", name: "AI 개발팀", description: "AI 기반 개발 도구 운영팀", value: 18000 },
    ],
    benefits: [
      { id: "code_generation", name: "코드 자동 생성", description: "AI 기반 코드 생성으로 개발 속도 향상", value: 60000 },
      { id: "bug_detection", name: "버그 자동 탐지", description: "AI 기반 코드 품질 검사 및 버그 예방", value: 35000 },
      { id: "testing_automation", name: "테스트 자동화", description: "AI 기반 자동 테스트 케이스 생성", value: 40000 },
      { id: "performance_optimization", name: "성능 최적화", description: "AI 기반 시스템 성능 모니터링 및 최적화", value: 45000 },
      { id: "deployment_automation", name: "배포 자동화", description: "AI 기반 지능형 배포 및 롤백", value: 25000 },
    ],
  },
  기업지원: {
    costs: [
      { id: "support_solution", name: "기업지원 AI 시스템", description: "HR, 재무 자동화 AI 도구", value: 14000 },
      { id: "support_data", name: "내부 데이터 정제", description: "인사, 재무 데이터 표준화 작업", value: 6000 },
      { id: "support_personnel", name: "기업지원 AI 운영팀", description: "AI 시스템 운영 전담 인력", value: 10000 },
    ],
    benefits: [
      { id: "hr_automation", name: "인사 업무 자동화", description: "채용, 평가, 교육 등 인사 프로세스 자동화", value: 50000 },
      { id: "document_processing", name: "문서 처리 자동화", description: "계약서, 보고서 등 문서 자동 분석 및 처리", value: 35000 },
      { id: "compliance_monitoring", name: "컴플라이언스 모니터링", description: "규정 준수 자동 모니터링 및 리스크 관리", value: 30000 },
      { id: "financial_analysis", name: "재무 분석 자동화", description: "AI 기반 재무 데이터 분석 및 예측", value: 40000 },
      { id: "facility_management", name: "시설 관리 최적화", description: "스마트 빌딩 관리 및 에너지 효율화", value: 25000 },
    ],
  },
  고객센터: {
    costs: [
      { id: "cs_solution", name: "고객센터 AI 솔루션", description: "챗봇, 음성인식 AI 도구", value: 16000 },
      { id: "cs_data", name: "고객 상담 데이터", description: "상담 이력 데이터 구축 및 분석", value: 4000 },
      { id: "cs_personnel", name: "고객센터 AI 운영팀", description: "AI 상담 시스템 운영 인력", value: 9000 },
    ],
    benefits: [
      { id: "chatbot_service", name: "챗봇 고객 서비스", description: "24시간 자동 고객 상담 서비스", value: 45000 },
      { id: "sentiment_analysis", name: "고객 감정 분석", description: "고객 피드백 감정 분석을 통한 서비스 개선", value: 30000 },
      { id: "ticket_routing", name: "티켓 자동 라우팅", description: "고객 문의 자동 분류 및 담당자 배정", value: 25000 },
      { id: "knowledge_management", name: "지식 관리 시스템", description: "AI 기반 FAQ 자동 생성 및 관리", value: 20000 },
      { id: "response_optimization", name: "응답 최적화", description: "고객 문의 유형별 최적 응답 제안", value: 35000 },
    ],
  },
} as const

const DEPT_LIST = ["마케팅", "기획", "영업", "디자인", "개발", "기업지원", "고객센터"] as const
type DeptKey = (typeof DEPT_LIST)[number] | "전체"

// AlignUI palette for charts
const CHART_BLUE = "oklch(0.58 0.17 258)"
const CHART_GREEN = "oklch(0.7 0.17 155)"
const CHART_PURPLE = "oklch(0.62 0.2 305)"
const CHART_ORANGE = "oklch(0.75 0.15 60)"
const CHART_RED = "oklch(0.63 0.22 25)"
const COST_PALETTE = [CHART_BLUE, CHART_PURPLE, CHART_ORANGE, CHART_GREEN, CHART_RED, "oklch(0.66 0.13 195)"]
const BENEFIT_PALETTE = [CHART_GREEN, CHART_BLUE, CHART_PURPLE, CHART_ORANGE, "oklch(0.66 0.13 195)", CHART_RED]

type EditingField = { id: string; field: "name" | "description" } | null

interface SortableItemRowProps {
  id: string
  item: { id: string; name: string; description: string; value: number; isDefault: boolean }
  deptTag?: string
  unitLabel: string
  editing: EditingField
  setEditing: (e: EditingField) => void
  formatDisplay: (v: number) => string
  fromInput: (input: number) => number
  toDisplay: (v: number) => number
  onValueChange: (v: number) => void
  onNameChange: (name: string) => void
  onDescChange: (desc: string) => void
  onRemove: () => void
  /** Translated display name for default items (falls back to item.name if null). */
  displayName?: string
  /** Translated display description for default items (falls back to item.description). */
  displayDesc?: string
  editTooltip: string
  handleLabel: string
}

function SortableItemRow(props: SortableItemRowProps) {
  const {
    id,
    item,
    deptTag,
    unitLabel,
    editing,
    setEditing,
    formatDisplay,
    fromInput,
    onValueChange,
    onNameChange,
    onDescChange,
    onRemove,
    displayName,
    displayDesc,
    editTooltip,
    handleLabel,
  } = props
  const shownName = displayName ?? item.name
  const shownDesc = displayDesc ?? item.description
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  }

  const isEditingName = editing?.id === item.id && editing.field === "name"
  const isEditingDesc = editing?.id === item.id && editing.field === "description"

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "group flex gap-2 rounded-lg border border-stroke-soft bg-bg-white p-4 transition-colors",
        isDragging
          ? "border-primary/60 shadow-md ring-2 ring-primary/20"
          : "hover:border-stroke-sub",
      )}
    >
      <button
        type="button"
        aria-label={handleLabel}
        {...listeners}
        className="-ml-1 mt-0.5 flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-text-soft opacity-50 transition-all hover:bg-bg-soft hover:opacity-100 active:cursor-grabbing group-hover:opacity-100"
      >
        <GripVertical className="size-4" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <Input
                autoFocus
                defaultValue={shownName}
                onFocus={(e) => e.currentTarget.select()}
                onBlur={(e) => {
                  const v = e.currentTarget.value.trim()
                  if (v && v !== shownName) onNameChange(v)
                  setEditing(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const v = e.currentTarget.value.trim()
                    if (v && v !== shownName) onNameChange(v)
                    setEditing(null)
                  } else if (e.key === "Escape") {
                    setEditing(null)
                  }
                }}
                className="h-8 px-2 text-label-md"
              />
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span
                  onDoubleClick={() => setEditing({ id: item.id, field: "name" })}
                  title={editTooltip}
                  className="cursor-text select-text text-label-md text-text-strong transition-colors hover:text-primary"
                >
                  {shownName}
                </span>
                {deptTag ? (
                  <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-darker">
                    {deptTag}
                  </span>
                ) : null}
              </div>
            )}

            {isEditingDesc ? (
              <Input
                autoFocus
                defaultValue={shownDesc}
                onFocus={(e) => e.currentTarget.select()}
                onBlur={(e) => {
                  const v = e.currentTarget.value
                  if (v !== shownDesc) onDescChange(v)
                  setEditing(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const v = e.currentTarget.value
                    if (v !== shownDesc) onDescChange(v)
                    setEditing(null)
                  } else if (e.key === "Escape") {
                    setEditing(null)
                  }
                }}
                className="mt-1 h-7 px-2 text-paragraph-xs"
              />
            ) : (
              <p
                onDoubleClick={() => setEditing({ id: item.id, field: "description" })}
                title={editTooltip}
                className="mt-1 cursor-text select-text text-paragraph-xs text-text-soft transition-colors hover:text-text-sub line-clamp-2"
              >
                {shownDesc}
              </p>
            )}
          </div>
          {!item.isDefault ? (
            <Button
              onClick={onRemove}
              size="icon"
              variant="ghost"
              className="size-7 shrink-0 text-text-soft opacity-0 transition-opacity hover:bg-error-alpha hover:text-error group-hover:opacity-100"
            >
              <Trash2 className="size-3.5" />
            </Button>
          ) : null}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              id={item.id}
              type="text"
              inputMode="decimal"
              value={item.value === 0 ? "" : formatDisplay(item.value)}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9.]/g, "")
                const num = raw === "" ? 0 : parseFloat(raw)
                onValueChange(isNaN(num) ? 0 : fromInput(num))
              }}
              placeholder="0"
              className="pr-14 text-right tabular-nums"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-paragraph-xs text-text-soft">
              {unitLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ROACalculator() {
  const reportRef = useRef<HTMLDivElement>(null)
  const [viewMode, setViewMode] = useState<"전체" | "부서별">("전체")
  const [activeTab, setActiveTab] = useState<DeptKey>("전체")
  const [reportViewMode, setReportViewMode] = useState<"전체" | "부서별">("전체")
  const [reportActiveTab, setReportActiveTab] = useState<DeptKey>("마케팅")
  const [animationTrigger, setAnimationTrigger] = useState(0)
  const [unit, setUnit] = useState<UnitValue>(1) // 원 단위

  const [costs, setCosts] = useState<CostItem[]>([])
  const [benefits, setBenefits] = useState<BenefitItem[]>([])
  const [departmentCosts, setDepartmentCosts] = useState<{ [key: string]: CostItem[] }>({})
  const [editing, setEditing] = useState<EditingField>(null)
  const [manualOrderKeys, setManualOrderKeys] = useState<Set<string>>(new Set())
  const [currency, setCurrency] = useState<Currency>("KRW")
  const [translating, setTranslating] = useState(false)
  const lang: Language = CURRENCY_META[currency].language
  const krwPerUnit = CURRENCY_META[currency].krwPerUnit
  const locale = CURRENCY_META[currency].locale
  const tr = useCallback(
    (key: string, vars?: Record<string, string | number>) => t(lang, key, vars),
    [lang],
  )

  const changeCurrency = (next: Currency) => {
    if (next === currency) return
    setTranslating(true)
    // After blur takes effect, swap the language + currency, then clear blur
    window.setTimeout(() => {
      setCurrency(next)
      window.setTimeout(() => setTranslating(false), 240)
    }, 260)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => {
    setAnimationTrigger((prev) => prev + 1)
  }, [viewMode, activeTab])

  const hasAnyData =
    costs.length > 0 ||
    benefits.length > 0 ||
    Object.values(departmentCosts).some((arr) => arr && arr.length > 0)

  // ─────────────── currency + unit helpers
  const unitLabel = useMemo(
    () => UNIT_LABELS[currency][unit as keyof (typeof UNIT_LABELS)[typeof currency]] ?? "",
    [currency, unit],
  )
  const toDisplay = (won: number) => won / krwPerUnit / unit
  const fromInput = (input: number) => Math.round(input * unit * krwPerUnit)
  const formatDisplay = (won: number) => {
    const display = toDisplay(won)
    const big = unit >= 1_000_000 || krwPerUnit > 100
    const fractionDigits = big ? (Number.isInteger(display) ? 0 : 2) : 0
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: fractionDigits,
    }).format(display)
  }

  // ─────────────── sort-aware data accessors
  const costOrderKey = (mode: "전체" | "부서별", tab: DeptKey) =>
    `cost_${mode === "전체" ? "전체" : tab}`
  const benefitOrderKey = (mode: "전체" | "부서별", tab: DeptKey) =>
    `benefit_${mode === "전체" ? "전체" : tab}`

  const sortedCostsFor = useCallback(
    (mode: "전체" | "부서별", tab: DeptKey): CostItem[] => {
      const base = mode === "전체" ? costs : departmentCosts[tab] || []
      const key = costOrderKey(mode, tab)
      return manualOrderKeys.has(key) ? base : [...base].sort((a, b) => b.value - a.value)
    },
    [costs, departmentCosts, manualOrderKeys],
  )

  const sortedBenefitsFor = useCallback(
    (mode: "전체" | "부서별", tab: DeptKey): BenefitItem[] => {
      const base = mode === "전체" ? benefits : benefits.filter((b) => b.department === tab)
      const key = benefitOrderKey(mode, tab)
      return manualOrderKeys.has(key) ? base : [...base].sort((a, b) => b.value - a.value)
    },
    [benefits, manualOrderKeys],
  )

  const currentCosts = sortedCostsFor(viewMode, activeTab)
  const currentBenefits = sortedBenefitsFor(viewMode, activeTab)

  const totalCosts = currentCosts.reduce((sum, cost) => sum + cost.value, 0)
  const totalBenefits = currentBenefits.reduce((sum, benefit) => sum + benefit.value, 0)
  const netBenefit = totalBenefits - totalCosts
  const roa = totalCosts > 0 ? (netBenefit / totalCosts) * 100 : 0
  const paybackMonths = totalBenefits > 0 ? (totalCosts / totalBenefits) * 12 : null

  // 리포트 전용 — 동일한 정렬 규칙 적용
  const reportCosts: CostItem[] = sortedCostsFor(reportViewMode, reportActiveTab)
  const reportBenefits: BenefitItem[] = sortedBenefitsFor(reportViewMode, reportActiveTab)
  const reportTotalCosts = reportCosts.reduce((s, c) => s + c.value, 0)
  const reportTotalBenefits = reportBenefits.reduce((s, b) => s + b.value, 0)
  const reportNetBenefit = reportTotalBenefits - reportTotalCosts
  const reportRoa = reportTotalCosts > 0 ? (reportNetBenefit / reportTotalCosts) * 100 : 0
  const reportPaybackMonths =
    reportTotalBenefits > 0 ? (reportTotalCosts / reportTotalBenefits) * 12 : null
  const reportChartData = [
    { name: tr("chart.totalCost"), value: reportTotalCosts, fill: CHART_RED },
    { name: tr("chart.totalBenefit"), value: reportTotalBenefits, fill: CHART_GREEN },
    {
      name: tr("chart.netBenefit"),
      value: Math.abs(reportNetBenefit),
      fill: reportNetBenefit >= 0 ? CHART_BLUE : "oklch(0.7 0.05 258)",
    },
  ]
  const reportCostPieData = reportCosts
    .filter((c) => c.value > 0)
    .map((c, i) => ({ name: c.name, value: c.value, fill: COST_PALETTE[i % COST_PALETTE.length] }))
  const reportBenefitPieData = reportBenefits
    .filter((b) => b.value > 0)
    .map((b, i) => ({ name: b.name, value: b.value, fill: BENEFIT_PALETTE[i % BENEFIT_PALETTE.length] }))

  // ─────────────── mutations
  const updateCost = (id: string, value: number) => {
    if (viewMode === "전체") {
      setCosts(costs.map((c) => (c.id === id ? { ...c, value } : c)))
    } else {
      setDepartmentCosts({
        ...departmentCosts,
        [activeTab]: (departmentCosts[activeTab] || []).map((c) => (c.id === id ? { ...c, value } : c)),
      })
    }
  }

  const updateBenefit = (id: string, value: number) => {
    setBenefits(benefits.map((b) => (b.id === id ? { ...b, value } : b)))
  }

  const updateCostName = (id: string, name: string) => {
    if (viewMode === "전체") {
      setCosts(costs.map((c) => (c.id === id ? { ...c, name } : c)))
    } else {
      setDepartmentCosts({
        ...departmentCosts,
        [activeTab]: (departmentCosts[activeTab] || []).map((c) => (c.id === id ? { ...c, name } : c)),
      })
    }
  }

  const updateBenefitName = (id: string, name: string) => {
    setBenefits(benefits.map((b) => (b.id === id ? { ...b, name } : b)))
  }

  const updateCostDescription = (id: string, description: string) => {
    if (viewMode === "전체") {
      setCosts(costs.map((c) => (c.id === id ? { ...c, description } : c)))
    } else {
      setDepartmentCosts({
        ...departmentCosts,
        [activeTab]: (departmentCosts[activeTab] || []).map((c) =>
          c.id === id ? { ...c, description } : c,
        ),
      })
    }
  }

  const updateBenefitDescription = (id: string, description: string) => {
    setBenefits(benefits.map((b) => (b.id === id ? { ...b, description } : b)))
  }

  // ─────────────── drag-and-drop reordering
  const handleCostDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = currentCosts.findIndex((c) => c.id === active.id)
    const newIdx = currentCosts.findIndex((c) => c.id === over.id)
    if (oldIdx < 0 || newIdx < 0) return
    const reordered = arrayMove(currentCosts, oldIdx, newIdx)
    if (viewMode === "전체") {
      setCosts(reordered)
    } else {
      setDepartmentCosts({ ...departmentCosts, [activeTab]: reordered })
    }
    const key = costOrderKey(viewMode, activeTab)
    setManualOrderKeys((prev) => new Set(prev).add(key))
  }

  const handleBenefitDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = currentBenefits.findIndex((b) => b.id === active.id)
    const newIdx = currentBenefits.findIndex((b) => b.id === over.id)
    if (oldIdx < 0 || newIdx < 0) return
    const reorderedSubset = arrayMove(currentBenefits, oldIdx, newIdx)
    if (viewMode === "전체") {
      setBenefits(reorderedSubset)
    } else {
      // 부서별: 플랫 benefits 배열에서 현 부서의 위치들을 순서대로 재할당
      const filterPred = (b: BenefitItem) => b.department === activeTab
      const positions: number[] = []
      benefits.forEach((b, i) => {
        if (filterPred(b)) positions.push(i)
      })
      const newFlat = [...benefits]
      positions.forEach((pos, rank) => {
        newFlat[pos] = reorderedSubset[rank]
      })
      setBenefits(newFlat)
    }
    const key = benefitOrderKey(viewMode, activeTab)
    setManualOrderKeys((prev) => new Set(prev).add(key))
  }

  const addCustomCost = () => {
    const newCost: CostItem = {
      id: `cost_${Date.now()}`,
      name: "새로운 비용 항목",
      description: "비용 설명을 입력하세요",
      value: 0,
      isDefault: false,
    }
    if (viewMode === "전체") {
      setCosts([...costs, newCost])
    } else {
      setDepartmentCosts({
        ...departmentCosts,
        [activeTab]: [...(departmentCosts[activeTab] || []), newCost],
      })
    }
  }

  const addCustomBenefit = (department: string) => {
    setBenefits([
      ...benefits,
      {
        id: `benefit_${Date.now()}`,
        name: "새로운 효과 항목",
        description: "효과 설명을 입력하세요",
        value: 0,
        isDefault: false,
        department,
      },
    ])
  }

  const removeCost = (id: string) => {
    if (viewMode === "전체") {
      setCosts(costs.filter((c) => c.id !== id))
    } else {
      setDepartmentCosts({
        ...departmentCosts,
        [activeTab]: (departmentCosts[activeTab] || []).filter((c) => c.id !== id),
      })
    }
  }

  const removeBenefit = (id: string) => {
    setBenefits(benefits.filter((b) => b.id !== id))
  }

  // ─────────────── chip picker
  const addCostFromSample = (sample: { id: string; name: string; description: string; value: number }) => {
    const newCost: CostItem = {
      id: sample.id,
      name: sample.name,
      description: sample.description,
      value: sample.value * 1000, // 천원 → 원
      isDefault: true,
    }
    if (viewMode === "전체") {
      if (costs.some((c) => c.id === sample.id)) return
      setCosts([...costs, newCost])
    } else {
      const list = departmentCosts[activeTab] || []
      if (list.some((c) => c.id === sample.id)) return
      setDepartmentCosts({ ...departmentCosts, [activeTab]: [...list, newCost] })
    }
  }

  const addBenefitFromSample = (
    sample: { id: string; name: string; description: string; value: number },
    department: string,
  ) => {
    if (benefits.some((b) => b.id === sample.id && b.department === department)) return
    setBenefits([
      ...benefits,
      {
        id: sample.id,
        name: sample.name,
        description: sample.description,
        value: sample.value * 1000,
        isDefault: true,
        department,
      },
    ])
  }

  // ─────────────── sample inject / clear toggle
  const loadSample = () => {
    // 전체
    setCosts(
      sampleCatalog.전체.costs.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        value: c.value * 1000,
        isDefault: true,
      })),
    )
    const allBenefits: BenefitItem[] = []
    ;(Object.entries(sampleCatalog) as [DeptKey, typeof sampleCatalog["전체"]][]).forEach(([dept, data]) => {
      data.benefits.forEach((b) => {
        allBenefits.push({
          id: b.id,
          name: b.name,
          description: b.description,
          value: b.value * 1000,
          isDefault: true,
          department: dept,
        })
      })
    })
    setBenefits(allBenefits)

    const deptCosts: { [key: string]: CostItem[] } = {}
    DEPT_LIST.forEach((dept) => {
      deptCosts[dept] = sampleCatalog[dept].costs.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        value: c.value * 1000,
        isDefault: true,
      }))
    })
    setDepartmentCosts(deptCosts)
  }

  const clearAll = () => {
    setCosts([])
    setBenefits([])
    setDepartmentCosts({})
  }

  const toggleSample = () => {
    if (hasAnyData) {
      clearAll()
      toast.info(tr("toast.reset"), { description: tr("toast.resetDesc") })
    } else {
      loadSample()
      toast.success(tr("toast.loadSample"), { description: tr("toast.loadSampleDesc") })
    }
  }

  // ─────────────── chart data
  const AnimatedBarChart = ({ data }: { data: Array<{ name: string; value: number; fill: string }> }) => {
    const maxValue = Math.max(...data.map((d) => d.value))
    const { ref, hasIntersected } = useIntersectionObserver()
    return (
      <div ref={ref} className="space-y-5">
        {data.map((item, index) => (
          <div key={`${item.name}-${animationTrigger}`} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="whitespace-nowrap text-label-sm text-text-sub">{item.name}</span>
              <div className="whitespace-nowrap text-right">
                <span className="text-label-md text-text-strong tabular-nums">
                  <AnimatedNumber value={item.value} formatFn={formatDisplay} trigger={hasIntersected} />
                </span>
                <span className="ml-1 text-paragraph-xs text-text-soft">{unitLabel}</span>
              </div>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-bg-soft">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: hasIntersected && maxValue > 0 ? `${(item.value / maxValue) * 100}%` : "0%",
                  backgroundColor: item.fill,
                  transitionDelay: `${index * 120}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const AnimatedPieChart = ({ data }: { data: Array<{ name: string; value: number; fill: string }> }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const { ref, hasIntersected } = useIntersectionObserver()
    if (data.length === 0) {
      return (
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-stroke-soft text-paragraph-sm text-text-soft">
          {tr("analysis.emptyChart")}
        </div>
      )
    }
    return (
      <div ref={ref} className="space-y-2">
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0
          return (
            <div
              key={`${item.name}-${animationTrigger}`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2.5 py-2 transition-all duration-500 hover:bg-bg-weak",
                hasIntersected ? "translate-x-0 opacity-100" : "translate-x-3 opacity-0",
              )}
              style={{ transitionDelay: `${index * 90}ms` }}
            >
              <div
                className="size-2.5 shrink-0 rounded-full transition-colors"
                style={{ backgroundColor: hasIntersected ? item.fill : "var(--bg-soft-200)" }}
              />
              <span className="flex-1 truncate text-paragraph-sm text-text-sub">{item.name}</span>
              <div className="flex items-baseline gap-1.5 text-right">
                <span className="text-label-md text-text-strong tabular-nums">
                  <AnimatedNumber value={percentage} formatFn={(v) => `${v.toFixed(1)}%`} trigger={hasIntersected} />
                </span>
                <span className="text-paragraph-xs text-text-soft tabular-nums">
                  <AnimatedNumber value={item.value} formatFn={formatDisplay} trigger={hasIntersected} />
                </span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const chartData = [
    { name: tr("chart.totalCost"), value: totalCosts, fill: CHART_RED },
    { name: tr("chart.totalBenefit"), value: totalBenefits, fill: CHART_GREEN },
    {
      name: tr("chart.netBenefit"),
      value: Math.abs(netBenefit),
      fill: netBenefit >= 0 ? CHART_BLUE : "oklch(0.7 0.05 258)",
    },
  ]

  const costPieData = currentCosts
    .filter((c) => c.value > 0)
    .map((c, i) => ({ name: c.name, value: c.value, fill: COST_PALETTE[i % COST_PALETTE.length] }))

  const benefitPieData = currentBenefits
    .filter((b) => b.value > 0)
    .map((b, i) => ({ name: b.name, value: b.value, fill: BENEFIT_PALETTE[i % BENEFIT_PALETTE.length] }))

  // ─────────────── export
  // 리포트를 뷰포트로 스크롤 후 애니메이션 완료 대기 (바 차트 width transition 1s + 버퍼)
  const prepareReportForCapture = async () => {
    if (!reportRef.current) return
    reportRef.current.scrollIntoView({ block: "start", behavior: "auto" })
    await new Promise((r) => setTimeout(r, 1300))
  }

  const captureReportCanvas = async () => {
    if (!reportRef.current) throw new Error("report node missing")
    const { domToCanvas } = await import("modern-screenshot")
    const bg = getComputedStyle(reportRef.current).backgroundColor
    return domToCanvas(reportRef.current, {
      scale: 2,
      backgroundColor: bg,
      quality: 1,
      // font embedding for Orbitron/JetBrains/Geist would be fetched; skip if unnecessary
      font: false,
    })
  }

  const copyReportAsImage = async () => {
    if (!reportRef.current) return
    const loadingId = toast.loading(tr("toast.imageLoading"))
    try {
      await prepareReportForCapture()
      const canvas = await captureReportCanvas()
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/png"))
      if (!blob) {
        toast.error(tr("toast.imageError"), { id: loadingId })
        return
      }
      const scopeLabel =
        reportViewMode === "전체"
          ? tr("report.companyScope")
          : tr("report.deptScope", { dept: tr(`dept.${reportActiveTab}`) })
      const filename = `ROA_Report_${reportViewMode === "전체" ? "전체" : reportActiveTab}_${new Date().toISOString().split("T")[0]}.png`
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
        toast.success(tr("toast.imageSuccess"), {
          id: loadingId,
          description: tr("toast.imageSuccessDesc", { scope: scopeLabel }),
        })
      } catch {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
        toast.success(tr("toast.imageDownloaded"), {
          id: loadingId,
          description: tr("toast.imageDownloadedDesc", { filename }),
        })
      }
    } catch (e) {
      console.error("copyReportAsImage failed:", e)
      toast.error(tr("toast.imageError"), {
        id: loadingId,
        description: e instanceof Error ? e.message : undefined,
      })
    }
  }

  const exportReportAsPDF = async () => {
    if (!reportRef.current) return
    const loadingId = toast.loading(tr("toast.pdfLoading"))
    try {
      await prepareReportForCapture()
      const [canvas, { jsPDF }] = await Promise.all([captureReportCanvas(), import("jspdf")])
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      } else {
        let remaining = imgHeight
        let offset = 0
        while (remaining > 0) {
          pdf.addImage(imgData, "PNG", 0, -offset, imgWidth, imgHeight)
          remaining -= pageHeight
          offset += pageHeight
          if (remaining > 0) pdf.addPage()
        }
      }
      const filename = `ROA_Report_${reportViewMode === "전체" ? "전체" : reportActiveTab}_${new Date().toISOString().split("T")[0]}.pdf`
      pdf.save(filename)
      toast.success(tr("toast.pdfSuccess"), {
        id: loadingId,
        description: tr("toast.pdfSuccessDesc", { filename }),
      })
    } catch (e) {
      console.error("exportReportAsPDF failed:", e)
      toast.error(tr("toast.pdfError"), {
        id: loadingId,
        description: e instanceof Error ? e.message : undefined,
      })
    }
  }

  const getReportTitle = () =>
    reportViewMode === "전체"
      ? tr("report.headerAll")
      : tr("report.headerDept", { dept: tr(`dept.${reportActiveTab}`) })

  // ─────────────── suggestion chips computed
  const costSuggestions = useMemo(() => {
    const source = viewMode === "전체" ? sampleCatalog.전체.costs : sampleCatalog[activeTab as DeptKey].costs
    const existingIds = new Set(currentCosts.map((c) => c.id))
    return source.filter((s) => !existingIds.has(s.id))
  }, [viewMode, activeTab, currentCosts])

  const benefitSuggestions = useMemo(() => {
    const deptKey: DeptKey = viewMode === "전체" ? "전체" : (activeTab as DeptKey)
    const source = sampleCatalog[deptKey].benefits
    const existingIds = new Set(
      benefits.filter((b) => b.department === deptKey).map((b) => b.id),
    )
    return source.filter((s) => !existingIds.has(s.id))
  }, [viewMode, activeTab, benefits])

  return (
    <div className="relative min-h-screen bg-background">
      {/* Futuristic background layers — fixed so sticky header is not clipped */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade" />
        <div className="orb absolute left-[10%] top-[5%] size-[420px] rounded-full bg-primary/55" />
        <div className="orb absolute right-[-80px] top-[30%] size-[380px] rounded-full bg-accent-violet/45" />
        <div className="orb absolute bottom-[-120px] left-[40%] size-[520px] rounded-full bg-accent-cyan/40" />
      </div>

      <TopBar
        subtitle={tr("brand.subtitle")}
        actions={
          <>
            <Button
              onClick={toggleSample}
              size="sm"
              variant="outline"
              className="border-stroke-soft bg-bg-white"
            >
              {hasAnyData ? <RotateCcw className="size-4" /> : <Sparkles className="size-4" />}
              {hasAnyData ? tr("action.reset") : tr("action.loadSample")}
            </Button>
            <Button
              onClick={copyReportAsImage}
              size="sm"
              variant="outline"
              className="border-stroke-soft bg-bg-white"
            >
              <Copy className="size-4" />
              {tr("action.copyImage")}
            </Button>
            <Button
              onClick={exportReportAsPDF}
              size="sm"
              className="bg-primary text-primary-foreground shadow-xs hover:bg-primary-dark"
            >
              <FileDown className="size-4" />
              {tr("action.exportPDF")}
            </Button>
          </>
        }
      />

      <main
        className={cn(
          "mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6",
          translating ? "lang-transitioning" : "lang-clear",
        )}
      >
        {/* Hero */}
        <section className="mb-8 flex flex-col items-center text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card/60 px-3 py-1 text-paragraph-xs text-text-sub shadow-xs backdrop-blur-md">
            <span className="relative flex size-1.5">
              <span className="pulse-glow absolute inset-0 rounded-full bg-primary-glow" />
              <span className="relative size-1.5 rounded-full bg-primary-glow" />
            </span>
            <span className="font-mono uppercase tracking-[0.18em] text-[10px] text-text-sub">
              {tr("hero.badge")} · {currency}
            </span>
          </span>
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-tight tracking-tight text-text-strong">
            {tr("hero.title1")}{" "}
            <span className="bg-gradient-to-r from-primary via-accent-violet to-accent-cyan bg-clip-text text-transparent">
              {tr("hero.title2")}
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-paragraph-md text-text-sub">{tr("hero.subtitle")}</p>

          {/* View mode toggle */}
          <div className="mt-6 inline-flex rounded-lg border border-stroke-soft bg-card/70 p-1 shadow-xs backdrop-blur-md">
            <button
              onClick={() => {
                setViewMode("전체")
                setActiveTab("전체")
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-all",
                viewMode === "전체"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-text-sub hover:text-text-strong",
              )}
            >
              <BarChart3 className="size-4" />
              {tr("view.all")}
            </button>
            <button
              onClick={() => {
                setViewMode("부서별")
                setActiveTab("마케팅")
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-all",
                viewMode === "부서별"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-text-sub hover:text-text-strong",
              )}
            >
              <Building2 className="size-4" />
              {tr("view.byDept")}
            </button>
          </div>

          {/* Currency + Unit toggles */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <CurrencyToggle value={currency} onChange={changeCurrency} lang={lang} />
            <UnitToggle value={unit} onChange={setUnit} currency={currency} lang={lang} />
          </div>
        </section>

        {/* Dept tabs */}
        {viewMode === "부서별" ? (
          <div className="mb-8 flex justify-center">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DeptKey)}>
              <TabsList className="h-auto flex-wrap gap-1">
                {DEPT_LIST.map((dept) => (
                  <TabsTrigger key={dept} value={dept} className="px-3 py-1.5">
                    {tr(`dept.${dept}`)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        ) : null}

        {/* Metric overview bar chart */}
        <section className="mb-6">
          <MetricsBarChart
            totalCosts={totalCosts}
            totalBenefits={totalBenefits}
            roa={roa}
            unitLabel={unitLabel}
            currencyCode={currency}
            format={formatDisplay}
            labels={{
              eyebrow: tr("metric.overviewEyebrow"),
              title: tr("metric.overviewTitle"),
              cost: tr("metric.totalCost"),
              benefit: tr("metric.totalBenefit"),
              roa: tr("metric.roa"),
            }}
          />
        </section>

        {/* KPI row */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile
            label={
              viewMode === "전체"
                ? tr("stat.costLabel")
                : tr("stat.costLabelDept", { dept: tr(`dept.${activeTab}`) })
            }
            value={totalCosts}
            unit={unitLabel}
            icon={Wallet}
            tone="danger"
            format={formatDisplay}
          />
          <StatTile
            label={
              viewMode === "전체"
                ? tr("stat.benefitLabel")
                : tr("stat.benefitLabelDept", { dept: tr(`dept.${activeTab}`) })
            }
            value={totalBenefits}
            unit={unitLabel}
            icon={TrendingUp}
            tone="success"
            format={formatDisplay}
          />
          <StatTile
            label={tr("stat.roaLabel")}
            value={roa}
            unit="%"
            icon={Gauge}
            tone="primary"
            format={(v) => v.toFixed(1)}
            sublabel={
              paybackMonths != null
                ? tr("stat.payback", {
                    net: formatDisplay(netBenefit),
                    unit: unitLabel,
                    months: paybackMonths.toFixed(1),
                  })
                : tr("stat.payback.noMonths", { net: formatDisplay(netBenefit), unit: unitLabel })
            }
          />
        </section>

        {/* Input panels */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Costs */}
          <AnimatedCard delay={80}>
            <div className="border-b border-stroke-soft p-6">
              <SectionHeader
                icon={Wallet}
                tone="danger"
                title={
                  viewMode === "전체"
                    ? tr("panel.costTitle")
                    : tr("panel.costTitleDept", { dept: tr(`dept.${activeTab}`) })
                }
                caption={tr("panel.costCaption")}
                action={
                  <Button onClick={addCustomCost} size="sm" variant="outline" className="border-stroke-soft bg-bg-white">
                    <Plus className="size-4" />
                    {tr("action.addItem")}
                  </Button>
                }
              />
            </div>
            <div className="flex flex-col gap-3 p-6">
              {currentCosts.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-stroke-soft p-6 text-center">
                  <Wallet className="size-5 text-text-soft" />
                  <p className="text-paragraph-sm text-text-sub">{tr("panel.emptyCost")}</p>
                  <p className="text-paragraph-xs text-text-soft">{tr("panel.emptyCostHint")}</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleCostDragEnd}
                >
                  <SortableContext
                    items={currentCosts.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-3">
                      {currentCosts.map((cost) => {
                        const trn = cost.isDefault ? sampleText(lang, cost.id) : null
                        return (
                          <SortableItemRow
                            key={cost.id}
                            id={cost.id}
                            item={cost}
                            unitLabel={unitLabel}
                            editing={editing}
                            setEditing={setEditing}
                            formatDisplay={formatDisplay}
                            fromInput={fromInput}
                            toDisplay={toDisplay}
                            onValueChange={(v) => updateCost(cost.id, v)}
                            onNameChange={(v) => updateCostName(cost.id, v)}
                            onDescChange={(v) => updateCostDescription(cost.id, v)}
                            onRemove={() => removeCost(cost.id)}
                            displayName={trn?.name}
                            displayDesc={trn?.desc}
                            editTooltip={tr("row.editTooltip")}
                            handleLabel={tr("row.dragHandle")}
                          />
                        )
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {costSuggestions.length > 0 ? (
                <SuggestionChips
                  items={costSuggestions.map((c) => {
                    const trn = sampleText(lang, c.id)
                    return { ...c, name: trn?.name ?? c.name, description: trn?.desc ?? c.description }
                  })}
                  onPick={(chip) => {
                    // 추천 칩의 id를 원본 카탈로그 기준으로 다시 찾아 addCostFromSample에 전달
                    const original = costSuggestions.find((x) => x.id === chip.id)
                    if (original) addCostFromSample(original)
                  }}
                  tone="cost"
                  label={tr("panel.suggestCost")}
                />
              ) : null}

              {currentCosts.length > 0 ? (
                <>
                  <Separator className="bg-stroke-soft" />
                  <div className="flex items-center justify-between px-1">
                    <span className="text-label-md text-text-sub">{tr("panel.total")}</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-title-h5 text-text-strong tabular-nums">{formatDisplay(totalCosts)}</span>
                      <span className="text-paragraph-xs text-text-soft">{unitLabel}</span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </AnimatedCard>

          {/* Benefits */}
          <AnimatedCard delay={160}>
            <div className="border-b border-stroke-soft p-6">
              <SectionHeader
                icon={TrendingUp}
                tone="success"
                title={
                  viewMode === "전체"
                    ? tr("panel.benefitTitle")
                    : tr("panel.benefitTitleDept", { dept: tr(`dept.${activeTab}`) })
                }
                caption={tr("panel.benefitCaption")}
                action={
                  <Button
                    onClick={() => addCustomBenefit(viewMode === "전체" ? "전체" : activeTab)}
                    size="sm"
                    variant="outline"
                    className="border-stroke-soft bg-bg-white"
                  >
                    <Plus className="size-4" />
                    {tr("action.addItem")}
                  </Button>
                }
              />
            </div>
            <div className="flex flex-col gap-3 p-6">
              {currentBenefits.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-stroke-soft p-6 text-center">
                  <TrendingUp className="size-5 text-text-soft" />
                  <p className="text-paragraph-sm text-text-sub">{tr("panel.emptyBenefit")}</p>
                  <p className="text-paragraph-xs text-text-soft">{tr("panel.emptyBenefitHint")}</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleBenefitDragEnd}
                >
                  <SortableContext
                    items={currentBenefits.map((b) => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-3">
                      {currentBenefits.map((benefit) => {
                        const trn = benefit.isDefault ? sampleText(lang, benefit.id) : null
                        return (
                          <SortableItemRow
                            key={benefit.id}
                            id={benefit.id}
                            item={benefit}
                            deptTag={
                              viewMode === "전체" && benefit.department !== "전체"
                                ? tr(`dept.${benefit.department}`)
                                : undefined
                            }
                            unitLabel={unitLabel}
                            editing={editing}
                            setEditing={setEditing}
                            formatDisplay={formatDisplay}
                            fromInput={fromInput}
                            toDisplay={toDisplay}
                            onValueChange={(v) => updateBenefit(benefit.id, v)}
                            onNameChange={(v) => updateBenefitName(benefit.id, v)}
                            onDescChange={(v) => updateBenefitDescription(benefit.id, v)}
                            onRemove={() => removeBenefit(benefit.id)}
                            displayName={trn?.name}
                            displayDesc={trn?.desc}
                            editTooltip={tr("row.editTooltip")}
                            handleLabel={tr("row.dragHandle")}
                          />
                        )
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {benefitSuggestions.length > 0 ? (
                <SuggestionChips
                  items={benefitSuggestions.map((b) => {
                    const trn = sampleText(lang, b.id)
                    return { ...b, name: trn?.name ?? b.name, description: trn?.desc ?? b.description }
                  })}
                  onPick={(chip) => {
                    const original = benefitSuggestions.find((x) => x.id === chip.id)
                    if (original) addBenefitFromSample(original, viewMode === "전체" ? "전체" : activeTab)
                  }}
                  tone="benefit"
                  label={tr("panel.suggestBenefit")}
                />
              ) : null}

              {currentBenefits.length > 0 ? (
                <>
                  <Separator className="bg-stroke-soft" />
                  <div className="flex items-center justify-between px-1">
                    <span className="text-label-md text-text-sub">{tr("panel.total")}</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-title-h5 text-text-strong tabular-nums">{formatDisplay(totalBenefits)}</span>
                      <span className="text-paragraph-xs text-text-soft">{unitLabel}</span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </AnimatedCard>
        </section>

        {/* Analysis charts */}
        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AnimatedCard delay={240}>
            <div className="border-b border-stroke-soft p-6">
              <SectionHeader
                icon={LineChart}
                tone="primary"
                title={tr("analysis.compareTitle")}
                caption={tr("analysis.compareCaption")}
              />
            </div>
            <div className="p-6">
              <AnimatedBarChart data={chartData} />
            </div>
          </AnimatedCard>

          <AnimatedCard delay={320}>
            <div className="border-b border-stroke-soft p-6">
              <SectionHeader
                icon={PieChart}
                tone="primary"
                title={
                  viewMode === "전체"
                    ? tr("analysis.compositionCostTitle")
                    : tr("analysis.compositionBenefitTitle", { dept: tr(`dept.${activeTab}`) })
                }
                caption={tr("analysis.compositionCaption")}
              />
            </div>
            <div className="p-6">
              <AnimatedPieChart data={viewMode === "전체" ? costPieData : benefitPieData} />
            </div>
          </AnimatedCard>
        </section>

        {/* Detailed report (capture target) */}
        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <SectionHeader
              icon={FileText}
              tone="primary"
              title={tr("report.title")}
              caption={tr("report.caption")}
            />
            <div className="flex gap-2">
              <Button onClick={copyReportAsImage} size="sm" variant="outline" className="border-stroke-soft bg-bg-white">
                <Copy className="size-4" />
                {tr("action.copyImage")}
              </Button>
              <Button
                onClick={exportReportAsPDF}
                size="sm"
                className="bg-primary text-primary-foreground shadow-xs hover:bg-primary-dark"
              >
                <FileDown className="size-4" />
                {tr("action.exportPDF")}
              </Button>
            </div>
          </div>

          {/* 리포트 대상 선택 */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-lg border border-stroke-soft bg-bg-white p-1 shadow-xs">
              <button
                onClick={() => {
                  setReportViewMode("전체")
                  setReportActiveTab("전체")
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-all",
                  reportViewMode === "전체"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-text-sub hover:text-text-strong",
                )}
              >
                <BarChart3 className="size-4" />
                {tr("report.all")}
              </button>
              <button
                onClick={() => {
                  setReportViewMode("부서별")
                  setReportActiveTab("마케팅")
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-all",
                  reportViewMode === "부서별"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-text-sub hover:text-text-strong",
                )}
              >
                <Building2 className="size-4" />
                {tr("report.byDept")}
              </button>
            </div>

            {reportViewMode === "부서별" ? (
              <Tabs value={reportActiveTab} onValueChange={(v) => setReportActiveTab(v as DeptKey)}>
                <TabsList className="h-auto flex-wrap gap-1">
                  {DEPT_LIST.map((dept) => (
                    <TabsTrigger key={dept} value={dept} className="px-3 py-1.5">
                      {tr(`dept.${dept}`)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            ) : null}
          </div>

          <div className="overflow-x-auto rounded-xl border border-stroke-soft bg-bg-white p-2 shadow-sm">
            <div
              ref={reportRef}
              className="mx-auto bg-card text-text-strong p-10"
              style={{ width: "794px", minHeight: "1123px" }}
            >
              <div className="mb-8 border-b border-stroke-soft pb-6 text-center">
                <h1 className="text-title-h3 text-text-strong">{getReportTitle()}</h1>
                <p className="mt-1 text-paragraph-md text-text-sub">{tr("report.sub")}</p>
                <p className="mt-2 text-paragraph-xs text-text-soft">
                  {tr("report.createdAt")}: {new Date().toLocaleDateString(locale)}
                  <span className="ml-3">({tr("report.unitSuffix")}: {unitLabel})</span>
                </p>
                {reportViewMode === "부서별" ? (
                  <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-paragraph-xs text-primary-darker">
                    <Building2 className="size-3.5" />
                    {tr("report.deptBadge", { dept: tr(`dept.${reportActiveTab}`) })}
                  </span>
                ) : null}
              </div>

              <div className="mb-8 grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-stroke-soft p-5 text-center">
                  <p className="text-paragraph-xs text-text-sub">
                    {reportViewMode === "전체"
                      ? tr("stat.costLabel")
                      : tr("stat.costLabelDept", { dept: tr(`dept.${reportActiveTab}`) })}
                  </p>
                  <p className="mt-2 text-title-h4 text-text-strong tabular-nums">{formatDisplay(reportTotalCosts)}</p>
                  <p className="text-paragraph-xs text-text-soft">{unitLabel}</p>
                </div>
                <div className="rounded-xl border border-stroke-soft p-5 text-center">
                  <p className="text-paragraph-xs text-text-sub">
                    {reportViewMode === "전체"
                      ? tr("stat.benefitLabel")
                      : tr("stat.benefitLabelDept", { dept: tr(`dept.${reportActiveTab}`) })}
                  </p>
                  <p className="mt-2 text-title-h4 text-text-strong tabular-nums">{formatDisplay(reportTotalBenefits)}</p>
                  <p className="text-paragraph-xs text-text-soft">{unitLabel}</p>
                </div>
                <div className="rounded-xl border-2 border-primary bg-primary/5 p-5 text-center">
                  <p className="text-paragraph-xs text-primary-darker">{tr("report.roa")}</p>
                  <p className="mt-2 text-title-h3 text-primary-darker tabular-nums">{reportRoa.toFixed(1)}%</p>
                  <p className="text-paragraph-xs text-primary-darker/80">
                    {reportViewMode === "부서별"
                      ? tr("report.deptScope", { dept: tr(`dept.${reportActiveTab}`) })
                      : tr("report.companyScope")}
                  </p>
                </div>
              </div>

              <div className="mb-8 grid grid-cols-2 gap-6">
                <div>
                  <h3 className="mb-4 text-title-h6 text-text-strong">{tr("analysis.compareTitle")}</h3>
                  <AnimatedBarChart data={reportChartData} />
                </div>
                <div>
                  <h3 className="mb-4 text-title-h6 text-text-strong">
                    {reportViewMode === "전체"
                      ? tr("analysis.compositionCostTitle")
                      : tr("analysis.compositionBenefitTitle", { dept: tr(`dept.${reportActiveTab}`) })}
                  </h3>
                  <AnimatedPieChart data={reportViewMode === "전체" ? reportCostPieData : reportBenefitPieData} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="mb-3 border-b border-stroke-soft pb-2 text-title-h6 text-text-strong">
                    {reportViewMode === "전체"
                      ? tr("report.costDetailCompany")
                      : tr("report.costDetailDept", { dept: tr(`dept.${reportActiveTab}`) })}
                  </h3>
                  <div className="space-y-1.5">
                    {reportCosts
                      .filter((c) => c.value > 0)
                      .map((c) => {
                        const trn = c.isDefault ? sampleText(lang, c.id) : null
                        return (
                          <div key={c.id} className="flex items-center justify-between text-paragraph-sm">
                            <span className="truncate pr-2 text-text-sub">{trn?.name ?? c.name}</span>
                            <span className="shrink-0 whitespace-nowrap tabular-nums text-text-strong">
                              {formatDisplay(c.value)}
                              <span className="ml-1 text-paragraph-xs text-text-soft">{unitLabel}</span>
                            </span>
                          </div>
                        )
                      })}
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 border-b border-stroke-soft pb-2 text-title-h6 text-text-strong">
                    {reportViewMode === "전체"
                      ? tr("report.benefitDetailCompany")
                      : tr("report.benefitDetailDept", { dept: tr(`dept.${reportActiveTab}`) })}
                  </h3>
                  <div className="space-y-1.5">
                    {reportBenefits
                      .filter((b) => b.value > 0)
                      .slice(0, 8)
                      .map((b) => {
                        const trn = b.isDefault ? sampleText(lang, b.id) : null
                        return (
                          <div key={b.id} className="flex items-center justify-between text-paragraph-sm">
                            <span className="truncate pr-2 text-text-sub">{trn?.name ?? b.name}</span>
                            <span className="shrink-0 whitespace-nowrap tabular-nums text-text-strong">
                              {formatDisplay(b.value)}
                              <span className="ml-1 text-paragraph-xs text-text-soft">{unitLabel}</span>
                            </span>
                          </div>
                        )
                      })}
                    {reportBenefits.filter((b) => b.value > 0).length > 8 ? (
                      <p className="mt-2 text-paragraph-xs text-text-soft">
                        {tr("report.otherItems", { count: reportBenefits.filter((b) => b.value > 0).length - 8 })}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-stroke-soft bg-bg-weak p-6">
                <h3 className="mb-3 text-title-h6 text-text-strong">{tr("report.conclusion")}</h3>
                <ul className="space-y-1.5 text-paragraph-sm text-text-sub">
                  <li>
                    · {tr("report.netBenefit")}:{" "}
                    <span className="font-semibold text-text-strong tabular-nums">
                      {formatDisplay(reportNetBenefit)} {unitLabel}
                    </span>
                  </li>
                  <li>
                    · {tr("report.roa")}:{" "}
                    <span className="font-semibold text-text-strong tabular-nums">{reportRoa.toFixed(1)}%</span>
                  </li>
                  <li>· {reportRoa >= 0 ? tr("report.positive") : tr("report.negative")}</li>
                  <li>
                    · {tr("report.payback", {
                      months: reportPaybackMonths != null ? reportPaybackMonths.toFixed(1) : "∞",
                    })}
                  </li>
                  {reportViewMode === "부서별" ? (
                    <li className="text-primary-darker">
                      · {tr("report.deptNote", { dept: tr(`dept.${reportActiveTab}`) })}
                    </li>
                  ) : null}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
