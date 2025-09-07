import React, { memo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@mijn-ui/react-card"
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Label,
  Legend,
  Pie,
  BarChart as RechartBarChart,
  PieChart as RechartPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartLegend, ChartTooltip } from "@/components/ui/chart"
import { ToolCall } from "../../types"
import { StatusDisplay } from "../ui/status-display"

export type BaseChartProps = {
  dataKey: string
  data: Record<string, unknown>[]
  title: string
  description: string
}

export type BarChartProps = BaseChartProps & {
  type: "bar"
}

export type LineChartProps = BaseChartProps & {
  type: "line"
}

export type PieChartProps = BaseChartProps & {
  type: "pie" | "donut"
  showTotal?: boolean
}

export type ChartProps = BarChartProps | LineChartProps | PieChartProps

type ChartPreviewProps = {
  tool: ToolCall
  loading: boolean
}

const ChartPreview = ({ tool, loading }: ChartPreviewProps) => {
  const chartData = tool.arguments as ChartProps

  if (loading) {
    return (
      <StatusDisplay
        status="in_progress"
        title="Generating Chart..."
        description="Creating visualization from your data..."
      />
    )
  }

  if (typeof chartData !== "object" || !chartData) {
    return <StatusDisplay status="error" title="Chart data not found." />
  }

  switch (chartData.type) {
    case "bar":
      return <BarChart {...chartData} />
    case "line":
      return <LineChart {...chartData} />
    case "pie":
      return <PieChart {...chartData} />
    case "donut":
      return <PieChart {...chartData} />
    default:
      return null
  }
}

export { ChartPreview }

/* -------------------------------------------------------------------------- */

const PureBarChart = ({ title, description, dataKey, data }: BarChartProps) => {
  const dataKeys = getDataKeys(data, dataKey)

  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer width="100%" height="100%" className="skeleton-div">
        <RechartBarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} stroke="hsl(var(--mijnui-border))" strokeDasharray={3} />

          <XAxis tickLine={false} tickMargin={10} axisLine={false} dataKey={dataKey} />

          <Tooltip
            cursor={{ fill: "hsl(var(--mijnui-muted) / 0.75)" }}
            content={<ChartTooltip indicator="square" accessibilityLayer />}
          />

          {dataKeys?.map((key, index) => (
            <Bar key={key} fill={`hsl(var(--chart-${index + 1}))`} radius={[4, 4, 0, 0]} dataKey={key} />
          ))}

          <Legend
            verticalAlign="top"
            formatter={(value) => <ChartLegend value={value} />}
            iconType="circle"
            iconSize={8}
          />
        </RechartBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export const BarChart = memo(PureBarChart)

/* -------------------------------------------------------------------------- */

const PureLineChart = ({ title, description, dataKey, data }: LineChartProps) => {
  const dataKeys = getDataKeys(data, dataKey)

  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer width="100%" height="100%" className="skeleton-div">
        <AreaChart data={data}>
          <YAxis className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
          <XAxis className="text-muted-foreground" dataKey={dataKey} fontSize={12} tickLine={false} axisLine={false} />

          <Tooltip
            cursor={{ stroke: "hsl(var(--mijnui-muted-foreground) / 0.45)", strokeWidth: 1 }}
            content={<ChartTooltip accessibilityLayer />}
          />

          <CartesianGrid horizontal={false} stroke={"hsl(var(--mijnui-border))"} strokeDasharray={3} />

          {dataKeys?.map((key, index) => (
            <Area
              key={key}
              fill={`hsl(var(--chart-${index + 1}))`}
              stroke={`hsl(var(--chart-${index + 1}))`}
              fillOpacity={0.1}
              dataKey={key}
              activeDot={{
                color: `hsl(var(--chart-${index + 1}))`,
                r: 3,
                stroke: `hsl(var(--chart-${index + 1}))`,
              }}
            />
          ))}

          <Legend
            align="center"
            verticalAlign="bottom"
            formatter={(value) => <ChartLegend value={value} />}
            iconType="circle"
            iconSize={8}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export const LineChart = memo(PureLineChart)

/* -------------------------------------------------------------------------- */

const PurePieChart = ({ title, description, data, dataKey, type, showTotal = true }: PieChartProps) => {
  const chartVariant = type === "donut" ? "donut" : "pie"

  // For pie charts, determine which field contains values and which contains labels
  const valueKey = dataKey
  console.log(data)

  const keys = Object.keys(data[0] || {})
  const labelKey = keys.find((key) => key !== valueKey && typeof data[0]?.[key] === "string") || keys[0]

  // Add colors to data if they don't exist
  const chartData = data.map((item, index) => ({
    ...item,
    fill: item.fill || `hsl(var(--chart-${(index % 5) + 1}))`,
  }))

  // Calculate total for center label (donut charts)
  const total = React.useMemo(() => {
    return chartData.reduce((acc, curr: any) => acc + (Number(curr[valueKey]) || 0), 0)
  }, [chartData, valueKey])

  const isDonut = chartVariant === "donut"

  return (
    <Card className="skeleton-bg mb-2 mt-4 w-full border bg-transparent text-xs shadow-none">
      <CardHeader>
        <CardTitle className="text-medium">{title}</CardTitle>
        <CardDescription className="text-small">{description}</CardDescription>
      </CardHeader>

      <CardContent className="aspect-video w-full">
        <ResponsiveContainer width="100%" height="100%" className="skeleton-div">
          <RechartPieChart>
            <Tooltip cursor={false} content={<ChartTooltip accessibilityLayer hideLabel />} />
            <Pie
              data={chartData}
              dataKey={valueKey}
              nameKey={labelKey}
              innerRadius={isDonut ? 60 : 0}
              strokeWidth={2}
              className="stroke-background">
              {isDonut && showTotal && (
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                            {total.toLocaleString()}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-sm">
                            Total
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              )}
            </Pie>
          </RechartPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export const PieChart = memo(PurePieChart)

/* -------------------------------------------------------------------------- */

const ChartContainer = ({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) => {
  return (
    <Card className="skeleton-bg my-4 flex size-full min-h-80 flex-col items-center justify-between gap-4 bg-transparent shadow-none">
      <CardHeader className="flex w-full flex-col items-start space-y-0">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-sm text-secondary-foreground">{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex h-64 w-[calc(543/12*1rem)] max-w-full items-center rounded-none p-4 pl-0 pt-0 text-xs md:h-72">
        {children}
      </CardContent>
    </Card>
  )
}

const getDataKeys = (content: Record<string, unknown>[], dataKey?: string) => {
  if (!content.length || !dataKey) return []

  const keys = [...new Set(content.flatMap(Object.keys))]
  return keys.filter((key) => key !== dataKey)
}
