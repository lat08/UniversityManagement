/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils/utils"

const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error("useChart must be used within a <ChartContainer />")
  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, c]) => c.theme || c.color)
  if (!colorConfig.length) return null

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

type TooltipPayload = {
  name?: string
  value?: number | string
  color?: string
  dataKey?: string
  payload?: any
}

type ChartTooltipContentProps = {
  active?: boolean
  payload?: TooltipPayload[]
  className?: string
  indicator?: "line" | "dot" | "dashed"
  hideLabel?: boolean
  hideIndicator?: boolean
  label?: string | number
  labelFormatter?: (label: React.ReactNode, payload?: TooltipPayload[]) => React.ReactNode
  labelClassName?: string
  formatter?: (value: any, name: any, props: any) => React.ReactNode
  color?: string
  nameKey?: string
  labelKey?: string
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart()
    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) return null
      const [item] = payload as TooltipPayload[]
      const key = `${labelKey || item.dataKey || item.name || "value"}`
      const itemConfig = config[key as keyof typeof config]
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter) {
        return <div className={cn("font-medium", labelClassName)}>{labelFormatter(value, payload)}</div>
      }

      if (!value) return null
      return <div className={cn("font-medium", labelClassName)}>{value}</div>
    }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])

    if (!active || !payload?.length) return null

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {(payload as TooltipPayload[]).map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = config[key as keyof typeof config]
            const indicatorColor = color || item.payload?.fill || item.color

            return (
              <div
                key={item.dataKey || index}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2",
                  indicator === "dot" && "items-center"
                )}
              >
                {!hideIndicator && (
                  <div
                    className={cn("shrink-0 rounded-[2px]", {
                      "h-2.5 w-2.5": indicator === "dot",
                      "w-1": indicator === "line",
                      "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                    })}
                    style={{
                      backgroundColor: indicatorColor,
                      borderColor: indicatorColor,
                    }}
                  />
                )}
                <div className="flex flex-1 justify-between items-center">
                  <span className="text-muted-foreground">{itemConfig?.label || item.name}</span>
                  {item.value && (
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      {item.value.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltip"

const ChartLegend = RechartsPrimitive.Legend

// ...existing code...
type LegendPayload = {
  value?: string;
  color?: string;
  dataKey?: string;
};

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    payload?: LegendPayload[]
    verticalAlign?: "top" | "bottom"
    hideIcon?: boolean
    nameKey?: string
  }
>(({ className, hideIcon = false, payload = [], verticalAlign = "bottom", nameKey }, ref) => {
  const { config } = useChart()
  if (!payload?.length) return null

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload.map((item, i) => {
        const key = `${nameKey || item.dataKey || "value"}`
        const itemConfig = config[key as keyof typeof config]

        return (
          <div
            key={item.value || i}
            className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
          >
            {!hideIcon ? (
              itemConfig?.icon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: item.color }}
                />
              )
            ) : null}
            <span className="text-muted-foreground">{itemConfig?.label || item.value}</span>
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegend"

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle }
