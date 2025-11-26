"use client"

import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import { Faculty } from "../lib/types/types"

interface FacultyActionsMenuProps {
  faculty: Faculty
  onEdit: (faculty: Faculty) => void
  onDelete: (faculty: Faculty) => void
}

export function FacultyActionsMenu({ faculty, onEdit, onDelete }: FacultyActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-gray-100"
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem
          onClick={() => onEdit(faculty)}
          className="cursor-pointer"
        >
          <Pencil className="mr-2 h-4 w-4" />
          <span>Chỉnh sửa</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(faculty)}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Xóa ngành học</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
