import { Users, GraduationCap, BookOpen, School } from "lucide-react";

export const STAT_CARDS = [
  {
    key: "total",
    label: "Tổng giảng viên",
    subtitle: "Đang công tác",
    bgColor: "bg-[#FFDDAA]",
    iconColor: "text-[#CC8800]",
    Icon: Users,
  },
  {
    key: "professor",
    label: "Giáo sư",
    subtitle: "GS, PGS",
    bgColor: "bg-[#CCEECC]",
    iconColor: "text-[#44AA44]",
    Icon: GraduationCap,
  },
  {
    key: "doctor",
    label: "Tiến sĩ",
    subtitle: "TS",
    bgColor: "bg-[#AACCFF]",
    iconColor: "text-[#3366CC]",
    Icon: BookOpen,
  },
  {
    key: "master",
    label: "Thạc sĩ",
    subtitle: "ThS",
    bgColor: "bg-[#FFBBAA]",
    iconColor: "text-[#CC4444]",
    Icon: School,
  },
] as const;
