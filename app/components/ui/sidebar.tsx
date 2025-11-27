"use client"

import { useCallback, useState, useEffect } from "react"
import Image from "next/image"
import { useRouter, usePathname, Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { useAuthStore } from "@/lib/store/authStore"
import { logoutApi } from "@/lib/api/auth"
import {
  BarChart3,
  Bell,
  BellRing,
  BookOpen,
  BookText,
  BookMarked,
  Building,
  Building2,
  Calendar,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardSignature,
  DollarSign,
  DoorOpen,
  FileCheck,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  IdCard,
  LayoutDashboard,
  Layers3,
  LogOut,
  Notebook,
  Palette,
  PiggyBank,
  Presentation,
  RefreshCcw,
  ScrollText,
  Users,
  Warehouse,
  X,
  UserRoundCog,
} from "lucide-react"
import { cn } from "@/lib/utils/utils"
import { Button } from "@/app/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/api/queryKeys"

type Variant = "student" | "instructor" | "admin"

interface SidebarProps {
  variant?: Variant // nếu không truyền, tự suy ra từ Redux role
  isCollapsed: boolean
  onToggle: () => void
  isMobileOpen: boolean
  onMobileToggle: () => void
  currentPath?: string
}

type MenuItem = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
  labelKey: string
  href: string
  expandable?: boolean
  subItems?: { labelKey: string; href: string }[]
}
type MenuSection = { titleKey: string; items: MenuItem[] }

const deriveLocaleFromPath = (path?: string | null): 'vi' | 'en' => {
  if (!path) return 'vi'
  const segment = path.split('/').filter(Boolean)[0]
  return segment === 'en' ? 'en' : 'vi'
}

function getMenuSections(variant: Variant): MenuSection[] {
  if (variant === "admin") {
    return [
      {
        titleKey: "sections.overview",
        items: [
          { icon: LayoutDashboard, labelKey: "menu.dashboard", href: "/admin/dashboard" },
          { icon: BellRing, labelKey: "menu.notificationManagement", href: "/admin/notification-management" },
          { icon: ScrollText, labelKey: "menu.regulations", href: "/admin/regulations" },
        ],
      },
      {
        titleKey: "sections.training",
        items: [
          { icon: Layers3, labelKey: "menu.divisionManagement", href: "/admin/division-management" },
          { icon: GraduationCap, labelKey: "menu.facultyManagement", href: "/admin/faculty-management" },
          { icon: Building, labelKey: "menu.departmentManagement", href: "/admin/department-management" },
          { icon: Warehouse, labelKey: "menu.buildingManagement", href: "/admin/building-management" },
          { icon: BookText, labelKey: "menu.curriculumManagement", href: "/admin/curriculum-management" },
          { icon: BookMarked, labelKey: "menu.subjectManagement", href: "/admin/subject-management" },
          { icon: Presentation, labelKey: "menu.courseManagement", href: "/admin/course-management" },
          { icon: Users, labelKey: "menu.classManagement", href: "/admin/class-management" },
          { icon: CalendarClock, labelKey: "menu.examSchedule", href: "/admin/exam-schedule-management" },
          { icon: DoorOpen, labelKey: "menu.roomRequests", href: "/admin/room-requests" },
        ],
      },
      {
        titleKey: "sections.students",
        items: [
          { icon: IdCard, labelKey: "menu.studentProfile", href: "/admin/student-profile" },
          { icon: PiggyBank, labelKey: "menu.studentTuition", href: "/admin/tuition" },
        ],
      },
      {
        titleKey: "sections.instructors",
        items: [
          { icon: UserRoundCog, labelKey: "menu.instructorProfile", href: "/admin/instructor-profile" },
          { icon: ClipboardCheck, labelKey: "menu.gradeApproval", href: "/admin/grade-approval" },
          { icon: ClipboardSignature, labelKey: "menu.examApproval", href: "/admin/exam-approval" },
          { icon: RefreshCcw, labelKey: "menu.scheduleChanges", href: "/admin/schedule-change-management" },
        ],
      },
      {
        titleKey: "sections.system",
        items: [{ icon: Palette, labelKey: "menu.themeConfiguration", href: "/admin/theme-configuration" }],
      },
    ]
  }

  if (variant === "instructor") {
    return [
      {
        titleKey: "sections.overview",
        items: [
          { icon: Home, labelKey: "menu.dashboard", href: "/instructor/dashboard" },
          { icon: FileText, labelKey: "menu.regulations", href: "/instructor/regulations" },
          { icon: Bell, labelKey: "menu.notification", href: "/instructor/notification" },
        ],
      },
      {
        titleKey: "sections.academic",
        items: [
          {
            icon: Calendar, labelKey: "menu.teachingPlan", href: "/instructor/schedule", expandable: true,
            subItems: [
              { labelKey: "menu.weeklySchedule", href: "/instructor/schedule/weekly" },
              { labelKey: "menu.semesterSchedule", href: "/instructor/schedule/semester" },
            ],
          },
          { icon: BarChart3, labelKey: "menu.materials", href: "/instructor/materials" },
          { icon: FileCheck, labelKey: "menu.exams", href: "/instructor/exams" },
          { icon: Notebook, labelKey: "menu.grades", href: "/instructor/grades" },
        ],
      },
      {
        titleKey: "sections.system",
        items: [
          { icon: Users, labelKey: "menu.personalProfile", href: "/instructor/profile" },
        ],
      },
    ]
  }

  return [
    {
      titleKey: "sections.overview",
      items: [
        { icon: Home, labelKey: "menu.dashboard", href: "/student/dashboard" },
        { icon: FileText, labelKey: "menu.regulations", href: "/student/regulations" },
        { icon: Bell, labelKey: "menu.notification", href: "/student/notification" },
      ],
    },
    {
      titleKey: "sections.academic",
      items: [
        { icon: BookOpen, labelKey: "menu.courses", href: "/student/course" },
        { icon: Building2, labelKey: "menu.departments", href: "/student/departments" },
        {
          icon: Calendar, labelKey: "menu.studyPlan", href: "/schedule", expandable: true,
          subItems: [
            { labelKey: "menu.weeklySchedule", href: "/student/schedule/weekly" },
            { labelKey: "menu.semesterSchedule", href: "/student/schedule/semester" },
            { labelKey: "menu.examSchedule", href: "/student/exam-schedule" },
          ],
        },
        { icon: BarChart3, labelKey: "menu.grades", href: "/student/grades" },
        { icon: Notebook, labelKey: "menu.documents", href: "/student/documents" },
        { icon: DollarSign, labelKey: "menu.tuition", href: "/student/tuition" },
      ],
    },
    {
      titleKey: "sections.system",
      items: [
        { icon: Users, labelKey: "menu.personalProfile", href: "/student/profile" },
      ],
    },
  ]
}

export function Sidebar({ variant, isCollapsed, onToggle, isMobileOpen, onMobileToggle, currentPath }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('common.sidebar')
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const resolvedVariant: Variant =
    variant || 
    ((user?.role || "").toLowerCase().includes("admin") ? "admin" :
     (user?.role || "").toLowerCase().includes("instructor") || (user?.role || "") === "giang_vien" ? "instructor" : 
     "student")

  const sections = getMenuSections(resolvedVariant)

  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [openPopover, setOpenPopover] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const prefetchAdminStudentResources = useCallback(async () => {
    try {
      const { studentsApi } = await import("@/app/[locale]/(page)/admin/student-profile/lib/api/studentsApi")
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: queryKeys.adminStudents.departments(),
          queryFn: async () => {
            const response = await studentsApi.getDepartments({ pageNumber: 1, pageSize: 100 })
            return response.success ? response.data.items : []
          },
          staleTime: 5 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: queryKeys.adminStudents.academicYears(),
          queryFn: async () => {
            const response = await studentsApi.getAcademicYears({ count: 4 })
            return response.success ? response.data : []
          },
          staleTime: 5 * 60 * 1000,
        }),
      ])
    } catch {
      // ignore prefetch errors
    }
  }, [queryClient])

  const prefetchStudentGrades = useCallback(async () => {
    try {
      const { gradesApi } = await import("@/lib/api/grades")
      await queryClient.prefetchQuery({
        queryKey: queryKeys.grades.cumulative(),
        queryFn: async () => {
          const response = await gradesApi.getCumulativeGrades()
          if (response.success) {
            return response.data
          }
          throw new Error(response.message || 'Không thể tải dữ liệu điểm')
        },
        staleTime: 5 * 60 * 1000,
      })
    } catch {
      // ignore prefetch errors
    }
  }, [queryClient])

  const prefetchRouteResources = useCallback(
    (href: string) => {
      if (!href) return
      if (typeof router.prefetch === "function") {
        try {
          void router.prefetch(href)
        } catch {
          // ignore router prefetch errors
        }
      }
      if (resolvedVariant === "admin" && href.startsWith("/admin/student-profile")) {
        void prefetchAdminStudentResources()
      }
      if (resolvedVariant === "student" && (href.startsWith("/student/grades") || href.startsWith("/grades"))) {
        void prefetchStudentGrades()
      }
    },
    [prefetchAdminStudentResources, prefetchStudentGrades, resolvedVariant, router],
  )

  const activePage = pathname || currentPath || "/"

  // Auto expand theo route
  useEffect(() => {
    if (resolvedVariant === "instructor" && activePage?.startsWith("/instructor/schedule")) {
      setExpandedSection("1-0")
    }
    if (resolvedVariant === "student" && (activePage?.startsWith("/student/schedule") || activePage?.startsWith("/schedule") || activePage?.startsWith("/student/exam-schedule"))) {
      setExpandedSection("1-2")
    }
  }, [activePage, resolvedVariant])

  const toggleSection = (section: string) => {
    if (isCollapsed) return
    setExpandedSection(expandedSection === section ? null : section)
  }

  const onLogout = async () => {
    try {
      const currentRefreshToken = useAuthStore.getState().refreshToken
      logout()
      const detectedLocale = deriveLocaleFromPath(activePage)
      router.push(`/${detectedLocale}/login`)
      try {
        if (currentRefreshToken) {
          await logoutApi(currentRefreshToken)
        }
      } catch {}
    } catch {
      const detectedLocale = deriveLocaleFromPath(activePage)
      router.push(`/${detectedLocale}/login`)
    }
  }

  return (
    <>
      {isMobileOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onMobileToggle} />}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] transition-all duration-300 ease-in-out",
          "lg:z-40",
          isCollapsed ? "lg:w-20" : "lg:w-64",
          "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className={cn(
            "flex items-center border-b border-[var(--sidebar-border)] h-16 relative",
            isCollapsed ? "px-2 justify-center" : "px-4 lg:px-6",
            "lg:justify-between"
          )}>
            <Button variant="ghost" size="icon" onClick={onMobileToggle} className="h-8 w-8 lg:hidden cursor-pointer mr-2">
              <X className="h-4 w-4" />
            </Button>

            <div className={cn(
              "flex items-center gap-3",
              isCollapsed ? "lg:w-full lg:justify-center" : ""
            )}>
              <div className={cn(
                "flex items-center justify-center transition-all duration-200",
                "h-8 w-8",
                "lg:h-10 lg:w-10",
                isCollapsed && "lg:h-12 lg:w-12"
              )}>
                <Image
                  src="/logo-siu.webp"
                  alt="Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className={cn(
                "flex flex-col",
                isCollapsed && "lg:hidden"
              )}>
                <span className="text-[10px] lg:text-xs font-bold text-[var(--sidebar-foreground)] opacity-70">{t('university')}</span>
                <span className="text-xs lg:text-sm font-bold text-[var(--sidebar-foreground)]">{t('universityName')}</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggle} 
              className="h-6 w-6 hidden lg:flex cursor-pointer absolute -right-3 top-1/2 -translate-y-1/2 bg-[var(--sidebar)] border border-[var(--sidebar-border)] rounded-md shadow-sm hover:shadow-md hover:bg-[var(--sidebar-hover)] z-50 p-0 transition-colors"
            >
              {isCollapsed ? <ChevronRight className="h-3.5 w-3.5 text-[var(--sidebar-item-text)]" /> : <ChevronLeft className="h-3.5 w-3.5 text-[var(--sidebar-item-text)]" />}
            </Button>
          </div>

          {/* Navigation */}
          <TooltipProvider delayDuration={300}>
            <nav className="flex-1 overflow-y-auto p-2">
              {sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-4">
                  {sectionIndex > 0 && (
                    <hr className="my-3 border-[var(--sidebar-border)]" />
                  )}
                  <h3 className={cn(
                    "mb-2 px-3 text-xs font-semibold text-[var(--sidebar-foreground)] opacity-50 uppercase",
                    isCollapsed && "lg:hidden"
                  )}>{t(section.titleKey)}</h3>
                  <div className="space-y-1">
                    {section.items.map((item, itemIndex) => {
                      const itemKey = `${sectionIndex}-${itemIndex}`
                      const isActive = activePage === item.href

                      // Desktop collapsed view with tooltip/popover
                      if (isCollapsed) {
                        if (item.expandable && item.subItems) {
                          return (
                            <div key={itemIndex} className="hidden lg:block">
                              <Popover
                                open={openPopover === itemKey}
                                onOpenChange={(open) => setOpenPopover(open ? itemKey : null)}
                              >
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        className={cn(
                                          "w-full justify-center px-2 text-[var(--sidebar-item-text)] hover:bg-[var(--sidebar-hover)] cursor-pointer",
                                          isActive && "bg-[var(--sidebar-primary)] text-[var(--sidebar-item-text-active)] hover:bg-[var(--sidebar-primary)] hover:text-[var(--sidebar-item-text-active)]",
                                        )}
                                      >
                                        <item.icon className="h-5 w-5 flex-shrink-0" />
                                      </Button>
                                    </PopoverTrigger>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="bg-gray-900 text-white">
                                    <p>{t(item.labelKey)}</p>
                                  </TooltipContent>
                                </Tooltip>
                                <PopoverContent side="right" align="start" className="w-48 p-2 ml-2">
                                  <div className="space-y-1">
                                    {item.subItems.map((subItem, subIndex) => {
                                      const isSubActive = activePage === subItem.href
                                      return (
                                        <Link
                                          key={subIndex}
                                          href={subItem.href}
                                          prefetch
                                          onMouseEnter={() => prefetchRouteResources(subItem.href)}
                                        >
                                          <Button
                                            variant="ghost"
                                            className={cn(
                                              "w-full justify-start text-sm text-gray-700 hover:bg-gray-100 cursor-pointer",
                                              isSubActive && "bg-gray-200"
                                            )}
                                          >
                                            {t(subItem.labelKey)}
                                          </Button>
                                        </Link>
                                      )
                                    })}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          )
                        }

                        return (
                          <div key={itemIndex} className="hidden lg:block">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link
                                  href={item.href}
                                  prefetch
                                  onMouseEnter={() => prefetchRouteResources(item.href)}
                                >
                                  <Button
                                    variant="ghost"
                                    className={cn(
                                      "w-full justify-center px-2 text-[var(--sidebar-item-text)] hover:bg-[var(--sidebar-hover)] cursor-pointer",
                                      isActive && "bg-[var(--sidebar-primary)] text-[var(--sidebar-item-text-active)] hover:bg-[var(--sidebar-primary)] hover:text-[var(--sidebar-item-text-active)]"
                                    )}
                                  >
                                    <item.icon className="h-5 w-5 flex-shrink-0" />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="bg-gray-900 text-white">
                                <p>{t(item.labelKey)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        )
                      }

                      // Full view (mobile + desktop expanded)
                      return (
                        <div key={itemIndex}>
                          {!item.expandable ? (
                            <Link
                              href={item.href}
                              prefetch
                              onMouseEnter={() => prefetchRouteResources(item.href)}
                            >
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start gap-3 text-[var(--sidebar-item-text)] hover:bg-[var(--sidebar-hover)] cursor-pointer",
                                  isActive && "bg-[var(--sidebar-primary)] text-[var(--sidebar-item-text-active)] hover:bg-[var(--sidebar-primary)] hover:text-[var(--sidebar-item-text-active)]"
                                )}
                              >
                                <item.icon className="h-5 w-5 flex-shrink-0" />
                                <span className="flex-1 text-left text-sm">{t(item.labelKey)}</span>
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              variant="ghost"
                              className={cn(
                                "w-full justify-start gap-3 text-[var(--sidebar-item-text)] hover:bg-[var(--sidebar-hover)] cursor-pointer",
                                isActive && "bg-[var(--sidebar-primary)] text-[var(--sidebar-item-text-active)] hover:bg-[var(--sidebar-primary)] hover:text-[var(--sidebar-item-text-active)]",
                              )}
                              onClick={() => toggleSection(itemKey)}
                            >
                              <item.icon className="h-5 w-5 flex-shrink-0" />
                              <span className="flex-1 text-left text-sm">{t(item.labelKey)}</span>
                              <ChevronRight
                                className={cn(
                                  "h-4 w-4 transition-transform",
                                  expandedSection === itemKey && "rotate-90",
                                )}
                              />
                            </Button>
                          )}
                          {item.expandable && item.subItems && expandedSection === itemKey && (
                            <div className="ml-6 mt-1 space-y-1 relative">
                              {/* Vertical line connecting all sub-items */}
                              <div className="absolute left-0 top-0 bottom-2 w-px bg-[var(--sidebar-border)]" />
                              
                              {item.subItems.map((subItem, subIndex) => {
                                const isSubActive = activePage === subItem.href
                                const isLastItem = subIndex === item.subItems!.length - 1
                                return (
                                  <div key={subIndex} className="relative">
                                    {/* Horizontal line connecting to the sub-item */}
                                    <div className="absolute left-0 top-1/2 w-4 h-px bg-[var(--sidebar-border)]" />
                                    
                                    <Link
                                      href={subItem.href}
                                      prefetch
                                      onMouseEnter={() => prefetchRouteResources(subItem.href)}
                                    >
                                      <Button
                                        variant="ghost"
                                        className={cn(
                                          "w-[calc(100%-16px)] justify-start text-sm hover:bg-[var(--sidebar-hover)] cursor-pointer pl-6 ml-4",
                                          isSubActive ? "bg-[var(--sidebar-primary)] text-[var(--sidebar-item-text-active)] font-semibold hover:bg-[var(--sidebar-primary)] hover:text-[var(--sidebar-item-text-active)]" : "text-[var(--sidebar-item-text)] opacity-80"
                                        )}
                                      >
                                        {t(subItem.labelKey)}
                                      </Button>
                                    </Link>
                                    
                                    {/* Stop vertical line at the last item */}
                                    {isLastItem && (
                                      <div className="absolute left-0 top-1/2 bottom-0 w-px bg-[var(--sidebar)]" />
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </TooltipProvider>

          {/* Footer */}
          <TooltipProvider delayDuration={300}>
            <div className="border-t border-[var(--sidebar-border)] p-2">
              {isCollapsed ? (
                <>
                  <div className="hidden lg:block">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" className="w-full justify-center px-2 text-[var(--sidebar-item-text)] hover:bg-[var(--sidebar-hover)] cursor-pointer">
                          <HelpCircle className="h-5 w-5 flex-shrink-0" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-gray-900 text-white">
                        <p>{t('help')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="hidden lg:block">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-center px-2 text-red-600 hover:bg-red-50 cursor-pointer"
                          onClick={onLogout}
                        >
                          <LogOut className="h-5 w-5 flex-shrink-0" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-gray-900 text-white">
                        <p>{t('logout')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </>
              ) : null}
              
              {/* Mobile and desktop expanded view */}
              <div className={cn(isCollapsed && "lg:hidden")}> 
                <Button variant="ghost" className="w-full justify-start gap-3 text-[var(--sidebar-item-text)] hover:bg-[var(--sidebar-hover)] cursor-pointer">
                  <HelpCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">{t('help')}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 cursor-pointer"
                  onClick={onLogout}
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">{t('logout')}</span>
                </Button>
              </div>
            </div>
          </TooltipProvider>
        </div>
      </aside>
    </>
  )
}


