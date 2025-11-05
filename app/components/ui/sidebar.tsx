"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/store/authStore"
import { logoutApi } from "@/lib/api/auth"
import {
  ChevronLeft,
  ChevronRight,
  Home,
  FileText,
  BookOpen,
  Building2,
  Calendar,
  FileCheck,
  BarChart3,
  Notebook,
  DollarSign,
  GraduationCap,
  Users,
  Bell,
  HelpCircle,
  LogOut,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils/utils"
import { Button } from "@/app/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"

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
  label: string
  href: string
  expandable?: boolean
  subItems?: { label: string; href: string }[]
}
type MenuSection = { title: string; items: MenuItem[] }

function getMenuSections(variant: Variant): MenuSection[] {
  if (variant === "admin") {
    return [
      {
        title: "TỔNG QUAN",
        items: [
          { icon: Home, label: "Bảng điều khiển", href: "/admin/dashboard" },
          { icon: Bell, label: "Thông báo", href: "/admin/notifications" },
          { icon: BarChart3, label: "Báo cáo thống kê", href: "/admin/reports" },
        ],
      },
      {
        title: "QUẢN LÝ ĐÀO TẠO",
        items: [
          { icon: GraduationCap, label: "Quản lý ngành học", href: "/admin/majors" },
          { icon: Calendar, label: "Thời khóa biểu", href: "/admin/timetable" },
          { icon: FileText, label: "Lịch thi", href: "/admin/exam-schedule" },
          { icon: Building2, label: "Lớp học & Phân công", href: "/admin/classes" },
          { icon: BookOpen, label: "Đăng ký học phần", href: "/admin/course-registration" },
          { icon: Building2, label: "Yêu cầu phòng học", href: "/admin/room-requests" },
        ],
      },
      {
        title: "SINH VIÊN",
        items: [
          { icon: Users, label: "Hồ sơ sinh viên", href: "/admin/student-profile" },
          { icon: DollarSign, label: "Học phí sinh viên", href: "/admin/tuition" },
        ],
      },
      {
        title: "GIẢNG VIÊN",
        items: [
          { icon: Users, label: "Hồ sơ giảng viên", href: "/admin/instructors" },
          { icon: FileCheck, label: "Duyệt bảng điểm", href: "/admin/grade-approval" },
          { icon: Building2, label: "Danh sách lớp", href: "/admin/class-lists" },
          { icon: Calendar, label: "Thời khóa biểu", href: "/admin/instructor-schedule" },
          { icon: Bell, label: "Yêu cầu đổi lịch", href: "/admin/schedule-changes" },
        ],
      },
      {
        title: "TÀI CHÍNH",
        items: [
          { icon: DollarSign, label: "Chính sách học phí", href: "/admin/tuition-policy" },
          { icon: DollarSign, label: "Thanh toán", href: "/admin/payments" },
          { icon: FileText, label: "Báo cáo thu", href: "/admin/revenue-reports" },
        ],
      },
      {
        title: "HỆ THỐNG",
        items: [
          { icon: Users, label: "Hồ sơ cá nhân", href: "/admin/profile" },
          { icon: BarChart3, label: "Cấu hình chủ đề", href: "/admin/theme-configuration" },
        ],
      },
    ]
  }

  if (variant === "instructor") {
    return [
      {
        title: "TỔNG QUAN",
        items: [
          { icon: Home, label: "Bảng điều khiển", href: "/instructor/dashboard" },
          { icon: FileText, label: "Quy chế / Quy định", href: "/instructor/regulations" },
          { icon: Bell, label: "Thông báo", href: "/instructor/notification" },
        ],
      },
      {
        title: "HỌC VỤ",
        items: [
          {
            icon: Calendar, label: "Kế hoạch giảng dạy", href: "/instructor/schedule", expandable: true,
            subItems: [
              { label: "TKB theo tuần", href: "/instructor/schedule/weekly" },
              { label: "TKB theo học kỳ", href: "/instructor/schedule/semester" },
            ],
          },
          { icon: BarChart3, label: "Bài giảng & Giáo trình", href: "/instructor/materials" },
          { icon: FileCheck, label: "Đề thi", href: "/instructor/exams" },
          { icon: Notebook, label: "Điểm số", href: "/instructor/grades" },
        ],
      },
      {
        title: "HỆ THỐNG",
        items: [
          { icon: Users, label: "Hồ sơ cá nhân", href: "/instructor/profile" },
        ],
      },
    ]
  }

  return [
    {
      title: "TỔNG QUAN",
      items: [
        { icon: Home, label: "Bảng điều khiển", href: "/student/dashboard" },
        { icon: FileText, label: "Quy chế / Quy định", href: "/student/regulations" },
        { icon: Bell, label: "Thông báo", href: "/student/notification" },
      ],
    },
    {
      title: "HỌC VỤ",
      items: [
        { icon: BookOpen, label: "Khóa học", href: "/student/course" },
        { icon: Building2, label: "Phòng chức năng", href: "/student/departments" },
        {
          icon: Calendar, label: "Kế hoạch học tập", href: "/schedule", expandable: true,
          subItems: [
            { label: "TKB theo tuần", href: "/student/schedule/weekly" },
            { label: "TKB theo học kỳ", href: "/student/schedule/semester" },
            { label: "Lịch thi", href: "/student/exam-schedule" },
          ],
        },
        { icon: BarChart3, label: "Điểm số", href: "/student/grades" },
        { icon: Notebook, label: "Tài liệu", href: "/student/documents" },
        { icon: DollarSign, label: "Học phí", href: "/student/tuition" },
      ],
    },
    {
      title: "HỆ THỐNG",
      items: [
        { icon: Users, label: "Hồ sơ cá nhân", href: "/student/profile" },
      ],
    },
  ]
}

export function Sidebar({ variant, isCollapsed, onToggle, isMobileOpen, onMobileToggle, currentPath }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
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
      router.push('/login')
      try {
        if (currentRefreshToken) {
          await logoutApi(currentRefreshToken)
        }
      } catch {}
    } catch {
      router.push('/login')
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
                <img
                  src="/logo-siu.webp"
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className={cn(
                "flex flex-col",
                isCollapsed && "lg:hidden"
              )}>
                <span className="text-[10px] lg:text-xs font-bold text-[var(--sidebar-foreground)] opacity-70">ĐẠI HỌC</span>
                <span className="text-xs lg:text-sm font-bold text-[var(--sidebar-foreground)]">QUỐC TẾ SÀI GÒN</span>
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
                  )}>{section.title}</h3>
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
                                    <p>{item.label}</p>
                                  </TooltipContent>
                                </Tooltip>
                                <PopoverContent side="right" align="start" className="w-48 p-2 ml-2">
                                  <div className="space-y-1">
                                    {item.subItems.map((subItem, subIndex) => (
                                      <Button
                                        key={subIndex}
                                        variant="ghost"
                                        className="w-full justify-start text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => router.push(subItem.href)}
                                      >
                                        {subItem.label}
                                      </Button>
                                    ))}
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
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    "w-full justify-center px-2 text-[var(--sidebar-item-text)] hover:bg-[var(--sidebar-hover)] cursor-pointer",
                                    isActive && "bg-[var(--sidebar-primary)] text-[var(--sidebar-item-text-active)] hover:bg-[var(--sidebar-primary)] hover:text-[var(--sidebar-item-text-active)]",
                                  )}
                                  onClick={() => router.push(item.href)}
                                >
                                  <item.icon className="h-5 w-5 flex-shrink-0" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="bg-gray-900 text-white">
                                <p>{item.label}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        )
                      }

                      // Full view (mobile + desktop expanded)
                      return (
                        <div key={itemIndex}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start gap-3 text-[var(--sidebar-item-text)] hover:bg-[var(--sidebar-hover)] cursor-pointer",
                              isActive && "bg-[var(--sidebar-primary)] text-[var(--sidebar-item-text-active)] hover:bg-[var(--sidebar-primary)] hover:text-[var(--sidebar-item-text-active)]",
                            )}
                            onClick={() => {
                              if (!item.expandable) {
                                router.push(item.href)
                              } else {
                                toggleSection(itemKey)
                              }
                            }}
                          >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            <span className="flex-1 text-left text-sm">{item.label}</span>
                            {item.expandable && (
                              <ChevronRight
                                className={cn(
                                  "h-4 w-4 transition-transform",
                                  expandedSection === itemKey && "rotate-90",
                                )}
                              />
                            )}
                          </Button>
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
                                    
                                    <Button
                                      variant="ghost"
                                      className={cn(
                                        "w-[calc(100%-16px)] justify-start text-sm hover:bg-[var(--sidebar-hover)] cursor-pointer pl-6 ml-4",
                                        isSubActive ? "bg-[var(--sidebar-primary)] text-[var(--sidebar-item-text-active)] font-semibold hover:bg-[var(--sidebar-primary)] hover:text-[var(--sidebar-item-text-active)]" : "text-[var(--sidebar-item-text)] opacity-80"
                                      )}
                                      onClick={() => {
                                        router.push(subItem.href)
                                      }}
                                    >
                                      {subItem.label}
                                    </Button>
                                    
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
                        <p>Trợ giúp</p>
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
                        <p>Đăng xuất</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </>
              ) : null}
              
              {/* Mobile and desktop expanded view */}
              <div className={cn(isCollapsed && "lg:hidden")}> 
                <Button variant="ghost" className="w-full justify-start gap-3 text-[var(--sidebar-item-text)] hover:bg-[var(--sidebar-hover)] cursor-pointer">
                  <HelpCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">Trợ giúp</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 cursor-pointer"
                  onClick={onLogout}
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">Đăng xuất</span>
                </Button>
              </div>
            </div>
          </TooltipProvider>
        </div>
      </aside>
    </>
  )
}


