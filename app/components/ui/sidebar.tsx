"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { logout } from "@/lib/store/features/authSlice"
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

type Variant = "student" | "instructor"

interface SidebarProps {
  variant?: Variant // nếu không truyền, tự suy ra từ Redux role
  isCollapsed: boolean
  onToggle: () => void
  isMobileOpen: boolean
  onMobileToggle: () => void
  currentPath?: string
}

type MenuItem = {
  icon: any
  label: string
  href: string
  expandable?: boolean
  subItems?: { label: string; href: string }[]
}
type MenuSection = { title: string; items: MenuItem[] }

function getMenuSections(variant: Variant): MenuSection[] {
  if (variant === "instructor") {
    return [
      {
        title: "TỔNG QUAN",
        items: [
          { icon: Home, label: "Bảng điều khiển", href: "/instructor/dashboard" },
          { icon: FileText, label: "Quy chế / Quy định", href: "/instructor/regulations" },
        ],
      },
      {
        title: "HỌC VỤ",
        items: [
          {
            icon: Calendar, label: "Thời khóa biểu", href: "/instructor/schedule", expandable: true,
            subItems: [
              { label: "TKB theo tuần", href: "/instructor/schedule/weekly" },
              { label: "TKB theo học kỳ", href: "/instructor/schedule/semester" },
            ],
          },
          { icon: Building2, label: "Khoa học phụ trách", href: "/instructor/departments" },
          { icon: BarChart3, label: "Bài giảng & Giáo trình", href: "/instructor/materials" },
          { icon: FileCheck, label: "Đề thi", href: "/instructor/exams" },
          { icon: Notebook, label: "Điểm số", href: "/instructor/grades" },
        ],
      },
      {
        title: "HỆ THỐNG",
        items: [
          { icon: Users, label: "Hồ sơ cá nhân", href: "/instructor/profile" },
          { icon: Bell, label: "Thông báo", href: "/instructor/notification" },
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
      ],
    },
    {
      title: "HỌC VỤ",
      items: [
        { icon: BookOpen, label: "Khóa học", href: "/courses" },
        { icon: Building2, label: "Phòng chức năng", href: "/student/departments" },
        {
          icon: Calendar, label: "Thời khóa biểu", href: "/schedule", expandable: true,
          subItems: [
            { label: "TKB theo tuần", href: "/student/schedule/weekly" },
            { label: "TKB theo học kỳ", href: "/student/schedule/semester" },
          ],
        },
        { icon: FileCheck, label: "Lịch thi", href: "/exams" },
        { icon: BarChart3, label: "Điểm số", href: "/student/grades" },
        { icon: Notebook, label: "Tài liệu", href: "/student/documents" },
        { icon: DollarSign, label: "Học phí", href: "/student/tuition" },
        { icon: GraduationCap, label: "Xét học bổng", href: "/scholarships" },
      ],
    },
    {
      title: "HỆ THỐNG",
      items: [
        { icon: Users, label: "Hồ sơ cá nhân", href: "/profile" },
        { icon: Bell, label: "Thông báo", href: "/student/notification" },
      ],
    },
  ]
}

export function Sidebar({ variant, isCollapsed, onToggle, isMobileOpen, onMobileToggle, currentPath }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((s) => s.auth)

  const resolvedVariant: Variant =
    variant || ((user?.role || "").toLowerCase().includes("instructor") || (user?.role || "") === "giang_vien" ? "instructor" : "student")

  const sections = getMenuSections(resolvedVariant)

  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [openPopover, setOpenPopover] = useState<string | null>(null)

  const activePage = pathname || currentPath || "/"

  // Auto expand theo route
  useEffect(() => {
    if (resolvedVariant === "instructor" && activePage?.startsWith("/instructor/schedule")) {
      setExpandedSection("1-0")
    }
    if (resolvedVariant === "student" && (activePage?.startsWith("/student/schedule") || activePage?.startsWith("/schedule"))) {
      setExpandedSection("1-2")
    }
  }, [activePage, resolvedVariant])

  const toggleSection = (section: string) => {
    if (isCollapsed) return
    setExpandedSection(expandedSection === section ? null : section)
  }

  const onLogout = async () => {
    try {
      dispatch(logout())
      router.push('/login')
      try {
        await logoutApi()
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
          "fixed left-0 top-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          "lg:z-40",
          isCollapsed ? "lg:w-20" : "lg:w-64",
          "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className={cn(
            "flex items-center border-b border-gray-300 h-16 relative",
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
                <span className="text-[10px] lg:text-xs font-bold text-gray-600">ĐẠI HỌC</span>
                <span className="text-xs lg:text-sm font-bold text-gray-900">QUỐC TẾ SÀI GÒN</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggle} 
              className="h-6 w-6 hidden lg:flex cursor-pointer absolute -right-3 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-md shadow-sm hover:shadow-md z-50 p-0"
            >
              {isCollapsed ? <ChevronRight className="h-3.5 w-3.5 text-gray-700" /> : <ChevronLeft className="h-3.5 w-3.5 text-gray-700" />}
            </Button>
          </div>

          {/* Navigation */}
          <TooltipProvider delayDuration={300}>
            <nav className="flex-1 overflow-y-auto p-2">
              {sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-4">
                  {sectionIndex > 0 && (
                    <hr className="my-3 border-gray-300" />
                  )}
                  <h3 className={cn(
                    "mb-2 px-3 text-xs font-semibold text-gray-400 uppercase",
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
                                          "w-full justify-center px-2 text-gray-700 hover:bg-gray-100 cursor-pointer",
                                          isActive && "bg-blue-50 text-blue-600 hover:bg-blue-100",
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
                                    "w-full justify-center px-2 text-gray-700 hover:bg-gray-100 cursor-pointer",
                                    isActive && "bg-blue-50 text-blue-600 hover:bg-blue-100",
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
                              "w-full justify-start gap-3 text-gray-700 hover:bg-gray-100 cursor-pointer",
                              isActive && "bg-blue-50 text-blue-600 hover:bg-blue-100",
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
                            <div className="ml-8 mt-1 space-y-1">
                              {item.subItems.map((subItem, subIndex) => {
                                const isSubActive = activePage === subItem.href
                                return (
                                  <Button
                                    key={subIndex}
                                    variant="ghost"
                                    className={cn(
                                      "w-full justify-start text-sm hover:bg-gray-100 cursor-pointer",
                                      isSubActive ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-600"
                                    )}
                                    onClick={() => {
                                      router.push(subItem.href)
                                    }}
                                  >
                                    {subItem.label}
                                  </Button>
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
            <div className="border-t border-gray-200 p-2">
              {isCollapsed ? (
                <>
                  <div className="hidden lg:block">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" className="w-full justify-center px-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
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
                <Button variant="ghost" className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-100 cursor-pointer">
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


