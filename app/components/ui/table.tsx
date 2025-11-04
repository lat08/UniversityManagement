"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils/utils"

export interface TableColumn<T = unknown> {
  key: string
  label: string
  className?: string
  headerClassName?: string
  align?: "left" | "center" | "right"
}

interface TableProps<T = unknown> {
  readonly columns: TableColumn<T>[]
  readonly data: T[]
  readonly renderRow: (item: T, index: number) => ReactNode
  readonly isLoading?: boolean
  readonly loadingMessage?: string
  readonly emptyMessage?: string
  readonly className?: string
  readonly headerClassName?: string
  readonly rowClassName?: string | ((item: T, index: number) => string)
  readonly loadingComponent?: ReactNode
}

export function Table<T = unknown>({
  columns,
  data,
  renderRow,
  isLoading = false,
  loadingMessage = "Đang tải...",
  emptyMessage = "Không có dữ liệu",
  className,
  headerClassName,
  rowClassName,
  loadingComponent,
}: TableProps<T>) {
  const defaultLoadingComponent = (
    <tr>
      <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
        <div className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5 text-[#0053AD]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingMessage}
        </div>
      </td>
    </tr>
  )

  return (
    <div className={cn("border border-gray-200 rounded-lg overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={cn("bg-[#0053AD] text-white text-sm", headerClassName)}>
              {columns.map((column, index) => {
                const alignClass = {
                  left: "text-left",
                  center: "text-center",
                  right: "text-right",
                }[column.align || "left"]

                return (
                  <th
                    key={column.key}
                    className={cn(
                      "px-6 py-4 font-semibold",
                      alignClass,
                      index < columns.length - 1 && "border-r border-blue-400",
                      column.headerClassName
                    )}
                  >
                    {column.label}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {(() => {
              if (isLoading) {
                return loadingComponent || defaultLoadingComponent;
              }
              if (data.length === 0) {
                return (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                      {emptyMessage}
                    </td>
                  </tr>
                );
              }
              return data.map((item, index) => {
                const rowClass = typeof rowClassName === "function" ? rowClassName(item, index) : rowClassName;
                const itemKey = (item as { id?: string | number }).id || `row-${index}`;
                return (
                  <tr key={itemKey} className={cn("hover:bg-gray-50", rowClass)}>
                    {renderRow(item, index)}
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>
    </div>
  )
}

