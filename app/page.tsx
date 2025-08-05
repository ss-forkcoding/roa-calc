"use client"

import { useState, useRef, useEffect } from "react"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Plus, Trash2, BarChart3, Building2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AnimatedCard } from "@/components/animated-card"
import { AnimatedNumber } from "@/components/animated-number"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"

interface CostItem {
  id: string
  name: string
  description: string
  value: number
  isDefault: boolean
}

interface BenefitItem {
  id: string
  name: string
  description: string
  value: number
  isDefault: boolean
  department: string
}

// 부서별 기본 항목 데이터
const departmentData = {
  전체: {
    costs: [
      { id: "solution", name: "AI 솔루션 구매 비용", description: "AI 플랫폼 라이선스 및 구매 비용", value: 50000 },
      {
        id: "training",
        name: "모델 학습/튜닝/유지 비용",
        description: "AI 모델 개발 및 지속적인 개선 비용",
        value: 30000,
      },
      {
        id: "infrastructure",
        name: "인프라 구축 및 운영 비용",
        description: "클라우드, GPU 등 하드웨어 인프라 비용",
        value: 40000,
      },
      {
        id: "data",
        name: "데이터 수집 및 정제 비용",
        description: "학습용 데이터 확보 및 전처리 비용",
        value: 20000,
      },
      { id: "personnel", name: "전문가 인건비", description: "AI 개발자, 데이터 사이언티스트 인건비", value: 80000 },
      {
        id: "consulting",
        name: "외주비/컨설팅 비용",
        description: "외부 전문업체 컨설팅 및 개발 비용",
        value: 25000,
      },
    ],
    benefits: [
      {
        id: "automation",
        name: "업무 자동화 효과",
        description: "반복 업무 자동화로 인한 인건비 절감",
        value: 120000,
      },
      {
        id: "error_reduction",
        name: "오류 감소 효과",
        description: "AI를 통한 정확도 향상으로 오류 비용 감소",
        value: 30000,
      },
      {
        id: "process_improvement",
        name: "프로세스 개선 효과",
        description: "업무 프로세스 최적화로 인한 효율성 증대",
        value: 45000,
      },
      {
        id: "decision_support",
        name: "의사결정 지원 효과",
        description: "데이터 기반 의사결정으로 인한 성과 향상",
        value: 35000,
      },
    ],
  },
  마케팅: {
    costs: [
      { id: "marketing_solution", name: "마케팅 AI 솔루션", description: "개인화 추천, 타겟팅 AI 도구", value: 15000 },
      {
        id: "marketing_data",
        name: "고객 데이터 분석 비용",
        description: "고객 행동 데이터 수집 및 분석",
        value: 8000,
      },
      { id: "marketing_personnel", name: "마케팅 AI 전문가", description: "마케팅 AI 운영 전담 인력", value: 12000 },
    ],
    benefits: [
      {
        id: "personalization",
        name: "개인화 마케팅",
        description: "고객별 맞춤 마케팅으로 전환율 향상",
        value: 60000,
      },
      { id: "targeting", name: "정밀 타겟팅", description: "AI 기반 고객 세분화로 마케팅 ROI 개선", value: 40000 },
      {
        id: "content_optimization",
        name: "콘텐츠 최적화",
        description: "AI 기반 콘텐츠 생성 및 최적화",
        value: 25000,
      },
      {
        id: "campaign_automation",
        name: "캠페인 자동화",
        description: "마케팅 캠페인 자동 실행 및 최적화",
        value: 35000,
      },
      {
        id: "customer_insights",
        name: "고객 인사이트 분석",
        description: "고객 행동 패턴 분석을 통한 전략 수립",
        value: 30000,
      },
    ],
  },
  기획: {
    costs: [
      { id: "planning_solution", name: "기획 분석 AI 도구", description: "시장 분석, 예측 모델링 도구", value: 12000 },
      { id: "planning_data", name: "시장 데이터 구매", description: "외부 시장 데이터 및 리서치 비용", value: 10000 },
      { id: "planning_personnel", name: "기획 분석 전문가", description: "데이터 기반 기획 전담 인력", value: 15000 },
    ],
    benefits: [
      {
        id: "market_analysis",
        name: "시장 분석 자동화",
        description: "AI 기반 시장 트렌드 및 경쟁사 분석",
        value: 35000,
      },
      { id: "demand_forecasting", name: "수요 예측", description: "정확한 수요 예측으로 재고 최적화", value: 50000 },
      {
        id: "strategic_planning",
        name: "전략 기획 지원",
        description: "데이터 기반 전략 수립 및 시뮬레이션",
        value: 40000,
      },
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
      {
        id: "customer_churn",
        name: "고객 이탈 방지",
        description: "이탈 위험 고객 사전 감지 및 대응",
        value: 55000,
      },
      { id: "price_optimization", name: "가격 최적화", description: "동적 가격 책정으로 수익성 향상", value: 35000 },
      {
        id: "sales_automation",
        name: "영업 프로세스 자동화",
        description: "영업 활동 자동화로 효율성 증대",
        value: 30000,
      },
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
      {
        id: "ab_testing",
        name: "A/B 테스트 최적화",
        description: "디자인 요소별 성과 분석 및 최적화",
        value: 25000,
      },
      {
        id: "user_experience",
        name: "사용자 경험 개선",
        description: "사용자 행동 분석을 통한 UX 최적화",
        value: 35000,
      },
      {
        id: "brand_consistency",
        name: "브랜드 일관성 관리",
        description: "AI 기반 브랜드 가이드라인 자동 검증",
        value: 20000,
      },
      {
        id: "creative_efficiency",
        name: "크리에이티브 효율성",
        description: "디자인 작업 시간 단축 및 품질 향상",
        value: 30000,
      },
    ],
  },
  개발: {
    costs: [
      { id: "dev_solution", name: "개발 AI 도구", description: "코드 생성, 테스트 자동화 도구", value: 25000 },
      { id: "dev_infrastructure", name: "개발 인프라", description: "AI 개발 환경 구축 및 운영", value: 20000 },
      { id: "dev_personnel", name: "AI 개발팀", description: "AI 기반 개발 도구 운영팀", value: 18000 },
    ],
    benefits: [
      {
        id: "code_generation",
        name: "코드 자동 생성",
        description: "AI 기반 코드 생성으로 개발 속도 향상",
        value: 60000,
      },
      {
        id: "bug_detection",
        name: "버그 자동 탐지",
        description: "AI 기반 코드 품질 검사 및 버그 예방",
        value: 35000,
      },
      {
        id: "testing_automation",
        name: "테스트 자동화",
        description: "AI 기반 자동 테스트 케이스 생성",
        value: 40000,
      },
      {
        id: "performance_optimization",
        name: "성능 최적화",
        description: "AI 기반 시스템 성능 모니터링 및 최적화",
        value: 45000,
      },
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
      {
        id: "hr_automation",
        name: "인사 업무 자동화",
        description: "채용, 평가, 교육 등 인사 프로세스 자동화",
        value: 50000,
      },
      {
        id: "document_processing",
        name: "문서 처리 자동화",
        description: "계약서, 보고서 등 문서 자동 분석 및 처리",
        value: 35000,
      },
      {
        id: "compliance_monitoring",
        name: "컴플라이언스 모니터링",
        description: "규정 준수 자동 모니터링 및 리스크 관리",
        value: 30000,
      },
      {
        id: "financial_analysis",
        name: "재무 분석 자동화",
        description: "AI 기반 재무 데이터 분석 및 예측",
        value: 40000,
      },
      {
        id: "facility_management",
        name: "시설 관리 최적화",
        description: "스마트 빌딩 관리 및 에너지 효율화",
        value: 25000,
      },
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
      {
        id: "sentiment_analysis",
        name: "고객 감정 분석",
        description: "고객 피드백 감정 분석을 통한 서비스 개선",
        value: 30000,
      },
      {
        id: "ticket_routing",
        name: "티켓 자동 라우팅",
        description: "고객 문의 자동 분류 및 담당자 배정",
        value: 25000,
      },
      {
        id: "knowledge_management",
        name: "지식 관리 시스템",
        description: "AI 기반 FAQ 자동 생성 및 관리",
        value: 20000,
      },
      {
        id: "response_optimization",
        name: "응답 최적화",
        description: "고객 문의 유형별 최적 응답 제안",
        value: 35000,
      },
    ],
  },
}

export default function ROACalculator() {
  const { toast } = useToast()
  const reportRef = useRef<HTMLDivElement>(null)
  const [viewMode, setViewMode] = useState<"전체" | "부서별">("전체")
  const [activeTab, setActiveTab] = useState("전체")
  const [animationTrigger, setAnimationTrigger] = useState(0)

  const [costs, setCosts] = useState<CostItem[]>(
    departmentData.전체.costs.map((item) => ({ ...item, isDefault: true })),
  )

  const [benefits, setBenefits] = useState<BenefitItem[]>(() => {
    const allBenefits: BenefitItem[] = []
    Object.entries(departmentData).forEach(([dept, data]) => {
      if (data.benefits) {
        data.benefits.forEach((benefit) => {
          allBenefits.push({ ...benefit, isDefault: true, department: dept })
        })
      }
    })
    return allBenefits
  })

  // 부서별 비용 상태 추가
  const [departmentCosts, setDepartmentCosts] = useState<{ [key: string]: CostItem[] }>(() => {
    const deptCosts: { [key: string]: CostItem[] } = {}
    Object.entries(departmentData).forEach(([dept, data]) => {
      if (data.costs && dept !== "전체") {
        deptCosts[dept] = data.costs.map((item) => ({ ...item, isDefault: true }))
      }
    })
    return deptCosts
  })

  // 뷰 모드나 탭이 변경될 때 애니메이션 트리거
  useEffect(() => {
    setAnimationTrigger((prev) => prev + 1)
  }, [viewMode, activeTab])

  // 현재 보기 모드에 따른 데이터 필터링
  const getCurrentCosts = () => {
    if (viewMode === "전체") {
      return costs
    } else {
      return departmentCosts[activeTab] || []
    }
  }

  const getCurrentBenefits = () => {
    if (viewMode === "전체") {
      return benefits
    } else {
      return benefits.filter((benefit) => benefit.department === activeTab)
    }
  }

  const totalCosts = getCurrentCosts().reduce((sum, cost) => sum + cost.value, 0)
  const totalBenefits = getCurrentBenefits().reduce((sum, benefit) => sum + benefit.value, 0)
  const netBenefit = totalBenefits - totalCosts
  const roa = totalCosts > 0 ? (netBenefit / totalCosts) * 100 : 0

  const updateCost = (id: string, value: number) => {
    if (viewMode === "전체") {
      setCosts(costs.map((cost) => (cost.id === id ? { ...cost, value } : cost)))
    } else {
      setDepartmentCosts({
        ...departmentCosts,
        [activeTab]: departmentCosts[activeTab].map((cost) => (cost.id === id ? { ...cost, value } : cost)),
      })
    }
  }

  const updateBenefit = (id: string, value: number) => {
    setBenefits(benefits.map((benefit) => (benefit.id === id ? { ...benefit, value } : benefit)))
  }

  const addCost = () => {
    const newId = `cost_${Date.now()}`
    const newCost = {
      id: newId,
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

  const addBenefit = (department: string) => {
    const newId = `benefit_${Date.now()}`
    setBenefits([
      ...benefits,
      {
        id: newId,
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
      setCosts(costs.filter((cost) => cost.id !== id))
    } else {
      setDepartmentCosts({
        ...departmentCosts,
        [activeTab]: departmentCosts[activeTab].filter((cost) => cost.id !== id),
      })
    }
  }

  const removeBenefit = (id: string) => {
    setBenefits(benefits.filter((benefit) => benefit.id !== id))
  }

  const updateCostName = (id: string, name: string) => {
    if (viewMode === "전체") {
      setCosts(costs.map((cost) => (cost.id === id ? { ...cost, name } : cost)))
    } else {
      setDepartmentCosts({
        ...departmentCosts,
        [activeTab]: departmentCosts[activeTab].map((cost) => (cost.id === id ? { ...cost, name } : cost)),
      })
    }
  }

  const updateBenefitName = (id: string, name: string) => {
    setBenefits(benefits.map((benefit) => (benefit.id === id ? { ...benefit, name } : benefit)))
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ko-KR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // 애니메이션이 적용된 바 차트 컴포넌트
  const AnimatedBarChart = ({ data }: { data: Array<{ name: string; value: number; fill: string }> }) => {
    const maxValue = Math.max(...data.map((d) => d.value))
    const { ref, hasIntersected } = useIntersectionObserver()

    return (
      <div ref={ref} className="space-y-4">
        {data.map((item, index) => (
          <div key={`${item.name}-${animationTrigger}`} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">{item.name}</span>
              <div className="text-right">
                <AnimatedNumber
                  value={item.value}
                  formatFn={formatCurrency}
                  trigger={hasIntersected}
                  className="font-medium"
                />
                <span className="text-xs text-gray-500 ml-1">천원</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className="h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium transition-all duration-1000 ease-out"
                style={{
                  width: hasIntersected && maxValue > 0 ? `${(item.value / maxValue) * 100}%` : "0%",
                  backgroundColor: item.fill,
                  minWidth: item.value > 0 ? "60px" : "0px",
                  transitionDelay: `${index * 200}ms`,
                }}
              >
                {hasIntersected && item.value > 0 && maxValue > 0 && `${((item.value / maxValue) * 100).toFixed(0)}%`}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 애니메이션이 적용된 파이 차트 컴포넌트
  const AnimatedPieChart = ({ data }: { data: Array<{ name: string; value: number; fill: string }> }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const { ref, hasIntersected } = useIntersectionObserver()

    return (
      <div ref={ref} className="space-y-3">
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0
          return (
            <div
              key={`${item.name}-${animationTrigger}`}
              className={`flex items-center space-x-3 transition-all duration-500 ease-out ${
                hasIntersected ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div
                className="w-4 h-4 rounded transition-all duration-300"
                style={{
                  backgroundColor: hasIntersected ? item.fill : "#e5e7eb",
                  transitionDelay: `${index * 150}ms`,
                }}
              />
              <div className="flex-1 flex justify-between text-sm">
                <span className="text-gray-700 truncate">{item.name.split(" ")[0]}...</span>
                <div className="text-right">
                  <AnimatedNumber
                    value={percentage}
                    formatFn={(v) => `${v.toFixed(1)}%`}
                    trigger={hasIntersected}
                    className="font-medium"
                  />
                  <div className="text-xs text-gray-500">
                    <AnimatedNumber value={item.value} formatFn={formatCurrency} trigger={hasIntersected} />
                    <span className="ml-1">천원</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const chartData = [
    { name: "총 비용", value: totalCosts, fill: "#6b7280" },
    { name: "총 효과", value: totalBenefits, fill: "#374151" },
    { name: "순 효과", value: Math.abs(netBenefit), fill: netBenefit >= 0 ? "#111827" : "#9ca3af" },
  ]

  const costPieData = getCurrentCosts()
    .filter((cost) => cost.value > 0)
    .map((cost, index) => ({
      name: cost.name,
      value: cost.value,
      fill: `hsl(0, 0%, ${85 - ((index * 8) % 60)}%)`,
    }))

  const benefitPieData = getCurrentBenefits()
    .filter((benefit) => benefit.value > 0)
    .map((benefit, index) => ({
      name: benefit.name,
      value: benefit.value,
      fill: `hsl(0, 0%, ${85 - ((index * 6) % 60)}%)`,
    }))

  const copyReportAsImage = async () => {
    if (!reportRef.current) return

    try {
      const html2canvas = (await import("html2canvas")).default

      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })

      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
            toast({
              title: "성공",
              description: "리포트가 클립보드에 복사되었습니다.",
            })
          } catch (err) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `ROA_Report_${viewMode === "전체" ? "전체" : activeTab}_${new Date().toISOString().split("T")[0]}.png`
            a.click()
            URL.revokeObjectURL(url)
            toast({
              title: "다운로드 완료",
              description: "리포트가 다운로드되었습니다.",
            })
          }
        }
      }, "image/png")
    } catch (error) {
      toast({
        title: "오류",
        description: "리포트 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const getReportTitle = () => {
    if (viewMode === "전체") {
      return "전사 AI 투자 수익률 분석 리포트"
    } else {
      return `${activeTab} 부서 AI 투자 수익률 분석 리포트`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* A4 리포트 섹션 */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">ROA 분석 리포트</h2>
              <p className="text-sm text-gray-600 mt-1">
                {viewMode === "전체" ? "전사 통합 분석" : `${activeTab} 부서별 분석`}
                <span className="text-xs text-gray-500 ml-2">(단위: 천원)</span>
              </p>
            </div>
            <Button onClick={copyReportAsImage} className="bg-gray-900 hover:bg-gray-800 text-white">
              <Copy className="w-4 h-4 mr-2" />
              이미지로 복사
            </Button>
          </div>

          <div
            ref={reportRef}
            className="bg-white p-8 border border-gray-200 rounded-lg"
            style={{ width: "794px", minHeight: "1123px" }}
          >
            {/* 리포트 헤더 */}
            <div className="text-center mb-8 border-b border-gray-200 pb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{getReportTitle()}</h1>
              <p className="text-lg text-gray-600">Return on AI (ROA) Analysis Report</p>
              <p className="text-sm text-gray-500 mt-2">
                생성일: {new Date().toLocaleDateString("ko-KR")}
                <span className="ml-4 text-xs">(단위: 천원)</span>
              </p>
              {viewMode === "부서별" && (
                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700">
                  <Building2 className="w-4 h-4 mr-1" />
                  {activeTab} 부서 전용 분석
                </div>
              )}
            </div>

            {/* 핵심 지표 */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  {viewMode === "전체" ? "총 투자 비용" : `${activeTab} 부서 투자 비용`}
                </h3>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCosts)}</p>
                <p className="text-xs text-gray-500 mt-1">천원</p>
              </div>
              <div className="text-center p-6 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  {viewMode === "전체" ? "총 예상 효과" : `${activeTab} 부서 효과`}
                </h3>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBenefits)}</p>
                <p className="text-xs text-gray-500 mt-1">천원</p>
              </div>
              <div className="text-center p-6 border-2 border-gray-900 rounded-lg bg-gray-50">
                <h3 className="text-sm font-medium text-gray-600 mb-2">ROA</h3>
                <p className={`text-3xl font-bold ${roa >= 0 ? "text-gray-900" : "text-gray-600"}`}>
                  {roa.toFixed(1)}%
                </p>
                {viewMode === "부서별" && <p className="text-xs text-gray-500 mt-1">{activeTab} 부서 기준</p>}
              </div>
            </div>

            {/* 차트 섹션 */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">비용 vs 효과 비교</h3>
                <AnimatedBarChart data={chartData} />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {viewMode === "전체" ? "비용 구성" : `${activeTab} 효과 구성`}
                </h3>
                <AnimatedPieChart data={viewMode === "전체" ? costPieData : benefitPieData} />
              </div>
            </div>

            {/* 상세 분석 */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  {viewMode === "전체" ? "투자 비용 상세" : `${activeTab} 부서 투자 비용`}
                </h3>
                <div className="space-y-2">
                  {getCurrentCosts()
                    .filter((cost) => cost.value > 0)
                    .map((cost) => (
                      <div key={cost.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{cost.name}</span>
                        <div className="text-right">
                          <span className="font-medium text-gray-900">{formatCurrency(cost.value)}</span>
                          <span className="text-xs text-gray-500 ml-1">천원</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  {viewMode === "전체" ? "예상 효과 상세" : `${activeTab} 부서 효과 상세`}
                </h3>
                <div className="space-y-2">
                  {getCurrentBenefits()
                    .filter((benefit) => benefit.value > 0)
                    .slice(0, 8)
                    .map((benefit) => (
                      <div key={benefit.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{benefit.name}</span>
                        <div className="text-right">
                          <span className="font-medium text-gray-900">{formatCurrency(benefit.value)}</span>
                          <span className="text-xs text-gray-500 ml-1">천원</span>
                        </div>
                      </div>
                    ))}
                  {getCurrentBenefits().filter((benefit) => benefit.value > 0).length > 8 && (
                    <div className="text-xs text-gray-500 mt-2">
                      * 기타 {getCurrentBenefits().filter((benefit) => benefit.value > 0).length - 8}개 항목 포함
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 결론 */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">분석 결론</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  • 순 효과: <span className="font-semibold">{formatCurrency(netBenefit)} 천원</span>
                </p>
                <p>
                  • ROA: <span className="font-semibold">{roa.toFixed(1)}%</span>
                </p>
                <p>• {roa >= 0 ? "투자 대비 긍정적인 수익률이 예상됩니다." : "투자 대비 수익률 개선이 필요합니다."}</p>
                <p>
                  • 투자 회수 기간: 약 {totalBenefits > 0 ? ((totalCosts / totalBenefits) * 12).toFixed(1) : "∞"}개월
                </p>
                {viewMode === "부서별" && (
                  <p className="text-blue-600">
                    • 본 분석은 {activeTab} 부서의 AI 도입 효과 및 투자 비용을 대상으로 합니다.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 기존 계산기 섹션 */}
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">ROA (Return on AI) 계산기</h1>
            <p className="text-lg text-gray-600">
              AI 투자 수익률을 실시간으로 계산하고 분석해보세요
              <span className="text-sm text-gray-500 ml-2">(단위: 천원)</span>
            </p>
          </div>

          {/* 보기 모드 선택 */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
              <button
                onClick={() => {
                  setViewMode("전체")
                  setActiveTab("전체")
                }}
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "전체"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                전체 보기
              </button>
              <button
                onClick={() => {
                  setViewMode("부서별")
                  setActiveTab("마케팅")
                }}
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "부서별"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Building2 className="w-4 h-4 mr-2" />
                부서별 보기
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 왼쪽: 결과 및 차트 */}
            <div className="space-y-6">
              {/* ROA 결과 카드 */}
              <AnimatedCard delay={0}>
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-2xl font-bold text-center text-gray-900">
                    {viewMode === "전체" ? "전사 ROA 계산 결과" : `${activeTab} 부서 ROA`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 font-medium">
                        {viewMode === "전체" ? "총 비용" : `${activeTab} 비용`}
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        <AnimatedNumber value={totalCosts} formatFn={formatCurrency} trigger={true} />
                      </p>
                      <p className="text-xs text-gray-500">천원</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 font-medium">
                        {viewMode === "전체" ? "총 효과" : `${activeTab} 효과`}
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        <AnimatedNumber value={totalBenefits} formatFn={formatCurrency} trigger={true} />
                      </p>
                      <p className="text-xs text-gray-500">천원</p>
                    </div>
                  </div>

                  <div className="text-center p-6 bg-gray-900 rounded-lg">
                    <p className="text-lg font-medium text-gray-300 mb-2">ROA (Return on AI)</p>
                    <p className="text-4xl font-bold text-white">
                      <AnimatedNumber value={roa} formatFn={(v) => `${v.toFixed(1)}%`} trigger={true} />
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      순 효과: <AnimatedNumber value={netBenefit} formatFn={formatCurrency} trigger={true} />{" "}
                      <span className="text-xs">천원</span>
                    </p>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">ROA = (총 효과 - 총 비용) ÷ 총 비용 × 100</p>
                  </div>
                </CardContent>
              </AnimatedCard>

              {/* 비교 차트 */}
              <AnimatedCard delay={200}>
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-gray-900">비용 vs 효과 비교</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <AnimatedBarChart data={chartData} />
                </CardContent>
              </AnimatedCard>

              {/* 구성 차트 */}
              <AnimatedCard delay={400}>
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-gray-900">
                    {viewMode === "전체" ? "비용 구성" : `${activeTab} 효과 구성`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <AnimatedPieChart data={viewMode === "전체" ? costPieData : benefitPieData} />
                </CardContent>
              </AnimatedCard>
            </div>

            {/* 오른쪽: 입력 패널 */}
            <div className="space-y-6">
              {viewMode === "전체" ? (
                // 전체 보기 모드
                <>
                  {/* AI 도입/운영 총비용 */}
                  <AnimatedCard delay={100}>
                    <CardHeader className="bg-gray-50 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-gray-900">💰 AI 도입/운영 총비용</CardTitle>
                        <Button
                          onClick={addCost}
                          size="sm"
                          variant="outline"
                          className="border-gray-300 hover:bg-gray-100 bg-transparent"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          항목 추가
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      {costs.map((cost) => (
                        <div key={cost.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            {!cost.isDefault && (
                              <Button
                                onClick={() => removeCost(cost.id)}
                                size="sm"
                                variant="ghost"
                                className="p-1 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                            <div className="flex-1">
                              <Label htmlFor={cost.id} className="text-sm font-medium text-gray-700">
                                {cost.isDefault ? (
                                  cost.name
                                ) : (
                                  <Input
                                    value={cost.name}
                                    onChange={(e) => updateCostName(cost.id, e.target.value)}
                                    className="text-sm border-none p-0 h-auto bg-transparent focus:bg-white focus:border-gray-300"
                                    placeholder="항목명을 입력하세요"
                                  />
                                )}
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">{cost.description}</p>
                            </div>
                          </div>
                          <div className="relative">
                            <Input
                              id={cost.id}
                              type="number"
                              value={cost.value}
                              onChange={(e) => updateCost(cost.id, Number(e.target.value) || 0)}
                              className="text-right border-gray-300 focus:border-gray-500 focus:ring-gray-500 pr-12"
                              placeholder="0"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                              천원
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 text-right">{formatCurrency(cost.value)} 천원</p>
                        </div>
                      ))}
                      <Separator className="bg-gray-200" />
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span className="text-gray-700">총 비용:</span>
                        <div className="text-right">
                          <span className="text-gray-900">{formatCurrency(totalCosts)}</span>
                          <span className="text-sm text-gray-500 ml-1">천원</span>
                        </div>
                      </div>
                    </CardContent>
                  </AnimatedCard>

                  {/* AI 도입으로 인한 순 효과 */}
                  <AnimatedCard delay={300}>
                    <CardHeader className="bg-gray-50 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-gray-900">📈 전사 AI 도입 효과</CardTitle>
                        <Button
                          onClick={() => addBenefit("전체")}
                          size="sm"
                          variant="outline"
                          className="border-gray-300 hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          항목 추가
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      {getCurrentBenefits().map((benefit) => (
                        <div key={benefit.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            {!benefit.isDefault && (
                              <Button
                                onClick={() => removeBenefit(benefit.id)}
                                size="sm"
                                variant="ghost"
                                className="p-1 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                            <div className="flex-1">
                              <Label htmlFor={benefit.id} className="text-sm font-medium text-gray-700">
                                {benefit.isDefault ? (
                                  <span>
                                    {benefit.name}
                                    {benefit.department !== "전체" && (
                                      <span className="text-xs text-gray-500 ml-2">({benefit.department})</span>
                                    )}
                                  </span>
                                ) : (
                                  <Input
                                    value={benefit.name}
                                    onChange={(e) => updateBenefitName(benefit.id, e.target.value)}
                                    className="text-sm border-none p-0 h-auto bg-transparent focus:bg-white focus:border-gray-300"
                                    placeholder="항목명을 입력하세요"
                                  />
                                )}
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">{benefit.description}</p>
                            </div>
                          </div>
                          <div className="relative">
                            <Input
                              id={benefit.id}
                              type="number"
                              value={benefit.value}
                              onChange={(e) => updateBenefit(benefit.id, Number(e.target.value) || 0)}
                              className="text-right border-gray-300 focus:border-gray-500 focus:ring-gray-500 pr-12"
                              placeholder="0"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                              천원
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 text-right">{formatCurrency(benefit.value)} 천원</p>
                        </div>
                      ))}
                      <Separator className="bg-gray-200" />
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span className="text-gray-700">총 효과:</span>
                        <div className="text-right">
                          <span className="text-gray-900">{formatCurrency(totalBenefits)}</span>
                          <span className="text-sm text-gray-500 ml-1">천원</span>
                        </div>
                      </div>
                    </CardContent>
                  </AnimatedCard>
                </>
              ) : (
                // 부서별 보기 모드
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 h-auto">
                    <TabsTrigger value="마케팅" className="text-xs">
                      마케팅
                    </TabsTrigger>
                    <TabsTrigger value="기획" className="text-xs">
                      기획
                    </TabsTrigger>
                    <TabsTrigger value="영업" className="text-xs">
                      영업
                    </TabsTrigger>
                    <TabsTrigger value="디자인" className="text-xs">
                      디자인
                    </TabsTrigger>
                    <TabsTrigger value="개발" className="text-xs">
                      개발
                    </TabsTrigger>
                    <TabsTrigger value="기업지원" className="text-xs">
                      기업지원
                    </TabsTrigger>
                    <TabsTrigger value="고객센터" className="text-xs">
                      고객센터
                    </TabsTrigger>
                  </TabsList>

                  {/* 부서별 탭 콘텐츠 */}
                  {Object.keys(departmentData)
                    .filter((dept) => dept !== "전체")
                    .map((dept) => (
                      <TabsContent key={dept} value={dept} className="space-y-6">
                        {/* 부서별 투자 비용 */}
                        <AnimatedCard delay={100}>
                          <CardHeader className="bg-gray-50 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-gray-900">💰 {dept} 부서 투자 비용</CardTitle>
                              <Button
                                onClick={addCost}
                                size="sm"
                                variant="outline"
                                className="border-gray-300 hover:bg-gray-100 bg-transparent"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                항목 추가
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4 pt-6">
                            {getCurrentCosts().map((cost) => (
                              <div key={cost.id} className="space-y-2">
                                <div className="flex items-center gap-2">
                                  {!cost.isDefault && (
                                    <Button
                                      onClick={() => removeCost(cost.id)}
                                      size="sm"
                                      variant="ghost"
                                      className="p-1 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  )}
                                  <div className="flex-1">
                                    <Label htmlFor={cost.id} className="text-sm font-medium text-gray-700">
                                      {cost.isDefault ? (
                                        cost.name
                                      ) : (
                                        <Input
                                          value={cost.name}
                                          onChange={(e) => updateCostName(cost.id, e.target.value)}
                                          className="text-sm border-none p-0 h-auto bg-transparent focus:bg-white focus:border-gray-300"
                                          placeholder="항목명을 입력하세요"
                                        />
                                      )}
                                    </Label>
                                    <p className="text-xs text-gray-500 mt-1">{cost.description}</p>
                                  </div>
                                </div>
                                <div className="relative">
                                  <Input
                                    id={cost.id}
                                    type="number"
                                    value={cost.value}
                                    onChange={(e) => updateCost(cost.id, Number(e.target.value) || 0)}
                                    className="text-right border-gray-300 focus:border-gray-500 focus:ring-gray-500 pr-12"
                                    placeholder="0"
                                  />
                                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                                    천원
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 text-right">{formatCurrency(cost.value)} 천원</p>
                              </div>
                            ))}
                            <Separator className="bg-gray-200" />
                            <div className="flex justify-between items-center font-bold text-lg">
                              <span className="text-gray-700">{dept} 부서 비용:</span>
                              <div className="text-right">
                                <span className="text-gray-900">{formatCurrency(totalCosts)}</span>
                                <span className="text-sm text-gray-500 ml-1">천원</span>
                              </div>
                            </div>
                          </CardContent>
                        </AnimatedCard>

                        {/* 부서별 효과 */}
                        <AnimatedCard delay={300}>
                          <CardHeader className="bg-gray-50 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-gray-900">🎯 {dept} 부서 AI 효과</CardTitle>
                              <Button
                                onClick={() => addBenefit(dept)}
                                size="sm"
                                variant="outline"
                                className="border-gray-300 hover:bg-gray-100"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                항목 추가
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4 pt-6">
                            {getCurrentBenefits().map((benefit) => (
                              <div key={benefit.id} className="space-y-2">
                                <div className="flex items-center gap-2">
                                  {!benefit.isDefault && (
                                    <Button
                                      onClick={() => removeBenefit(benefit.id)}
                                      size="sm"
                                      variant="ghost"
                                      className="p-1 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  )}
                                  <div className="flex-1">
                                    <Label htmlFor={benefit.id} className="text-sm font-medium text-gray-700">
                                      {benefit.isDefault ? (
                                        benefit.name
                                      ) : (
                                        <Input
                                          value={benefit.name}
                                          onChange={(e) => updateBenefitName(benefit.id, e.target.value)}
                                          className="text-sm border-none p-0 h-auto bg-transparent focus:bg-white focus:border-gray-300"
                                          placeholder="항목명을 입력하세요"
                                        />
                                      )}
                                    </Label>
                                    <p className="text-xs text-gray-500 mt-1">{benefit.description}</p>
                                  </div>
                                </div>
                                <div className="relative">
                                  <Input
                                    id={benefit.id}
                                    type="number"
                                    value={benefit.value}
                                    onChange={(e) => updateBenefit(benefit.id, Number(e.target.value) || 0)}
                                    className="text-right border-gray-300 focus:border-gray-500 focus:ring-gray-500 pr-12"
                                    placeholder="0"
                                  />
                                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                                    천원
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 text-right">{formatCurrency(benefit.value)} 천원</p>
                              </div>
                            ))}
                            <Separator className="bg-gray-200" />
                            <div className="flex justify-between items-center font-bold text-lg">
                              <span className="text-gray-700">{dept} 부서 효과:</span>
                              <div className="text-right">
                                <span className="text-gray-900">
                                  {formatCurrency(getCurrentBenefits().reduce((sum, b) => sum + b.value, 0))}
                                </span>
                                <span className="text-sm text-gray-500 ml-1">천원</span>
                              </div>
                            </div>
                          </CardContent>
                        </AnimatedCard>
                      </TabsContent>
                    ))}
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
