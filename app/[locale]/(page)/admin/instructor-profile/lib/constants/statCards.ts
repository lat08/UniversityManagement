import { Users, GraduationCap, BookOpen, School } from 'lucide-react';

export const STAT_CARDS = [
  {
    key: 'total',
    labelKey: 'total',
    subtitleKey: 'totalSubtitle',
    bgColor: 'bg-[#FFDDAA]',
    iconColor: 'text-[#CC8800]',
    Icon: Users,
  },
  {
    key: 'professor',
    labelKey: 'professor',
    subtitleKey: 'professorSubtitle',
    bgColor: 'bg-[#CCEECC]',
    iconColor: 'text-[#44AA44]',
    Icon: GraduationCap,
  },
  {
    key: 'doctor',
    labelKey: 'doctor',
    subtitleKey: 'doctorSubtitle',
    bgColor: 'bg-[#AACCFF]',
    iconColor: 'text-[#3366CC]',
    Icon: BookOpen,
  },
  {
    key: 'master',
    labelKey: 'master',
    subtitleKey: 'masterSubtitle',
    bgColor: 'bg-[#FFBBAA]',
    iconColor: 'text-[#CC4444]',
    Icon: School,
  },
] as const;
