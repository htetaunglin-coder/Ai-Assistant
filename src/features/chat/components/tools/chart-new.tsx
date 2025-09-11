"use client"

import React, { memo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@mijn-ui/react-card"
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Label,
  LabelList,
  Legend,
  Line,
  Pie,
  RadialBar,
  RadialBarChart,
  BarChart as RechartBarChart,
  PieChart as RechartPieChart,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartLegend, ChartTooltip } from "@/components/ui/chart"
import { ToolCall } from "../../types"
import { StatusDisplay } from "../ui/status-display"

/**
 * Charts are grouped into two categories:
 * 1. Cartesian Charts ("bar", "line", "area"): Use x and y axes for data like sales over time.
 * 2. Circular Charts ("pie", "donut", "radial"): Show data like market share in circular format.
 *
 * The backend needs to send a JSON response in the `tool.arguments` field that matches these charts.
 * Required fields:
 * - `type`: One of "bar", "line", "area", "pie", "donut", or "radial" to pick the chart type.
 * - `title`: A string for the chart's title (e.g., "Monthly Sales").
 * - `data`: An array of objects with keys for chart data (e.g., [{ month: "Jan", sales: 100 }, { month: "Feb", sales: 120 }]).
 *
 * Optional fields:
 * - `description`: A string to describe the chart (e.g., "Sales in 2025").
 * - `config`: An array of objects to style the chart. Each has:
 *   - `key`: A data key (e.g., "sales") to apply styles.
 *   - `color`: Optional string for color (e.g., "#4CAF50").
 *   - `label`: Optional string for display name (e.g., "Units Sold").
 * - For Cartesian charts: `xKey` (e.g., "month") and `yKeys` (e.g., ["sales"]) to set axes.
 * - For Circular charts: `valueKey` (e.g., "share") for numbers, `nameKey` (e.g., "product") for labels.
 * - For "donut" only: `showTotal` (boolean) to show the total value in the center.
 *
 * For examples, refer to: src/app/(app)/api/chat/chart-mock.ts
 */

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

export type ChartConfig = {
  key: string
  color?: string
  label?: string
}

type BaseChartProps = {
  title: string
  description?: string
  data: Record<string, unknown>[]
  config?: ChartConfig[]
}

export type CartesianChartProps = BaseChartProps & {
  type: "bar" | "line" | "area"
  xKey?: string
  yKeys?: string[]
}

export type CircularChartProps = BaseChartProps & {
  type: "pie" | "donut" | "radial"
  valueKey?: string
  nameKey?: string
  showTotal?: boolean // Only for donut chart
}

export type ChartProps = CartesianChartProps | CircularChartProps

type ChartPreviewProps = {
  tool: ToolCall
}

const ChartPreview = ({ tool }: ChartPreviewProps) => {
  const chartProps = tool.arguments as ChartProps

  if (tool.status === "in_progress" || tool.status === "created") {
    return (
      <StatusDisplay
        status="in_progress"
        title="Generating Chart..."
        description="Creating visualization from your data..."
      />
    )
  }

  if ((tool.status === "completed" && typeof chartProps !== "object") || !chartProps) {
    return <StatusDisplay status="error" title="Chart data not found." />
  }

  return <ChartRenderer {...chartProps} />
}

export { ChartPreview }

/* -------------------------------------------------------------------------- */

const PureChartRenderer = (props: ChartProps & { config?: ChartConfigNamespace }) => {
  const { type, title, description, data, config } = props
  const keys = useChartKeys(data, props)
  const colors = useChartColors(config, keys.allKeys)
  const labels = useChartLabels(config)

  function isCartesianKeys(keys: ChartKeys): keys is CartesianKeys {
    return "x" in keys && "y" in keys
  }

  if (isCartesianKeys(keys)) {
    const commonProps = { data, keys, colors, labels, title, description }

    switch (type) {
      case "bar":
        return <BarChart {...commonProps} />
      case "line":
        return <LineChart {...commonProps} />
      case "area":
        return <AreaChartComponent {...commonProps} />
      default:
        return <div>Unsupported Cartesian type: {type}</div>
    }
  } else {
    const commonProps = { data, keys, colors, labels, title, description }

    switch (type) {
      case "pie":
        console.log(type, colors)
        return <PieChart {...commonProps} />
      case "donut":
        console.log(type, colors)
        return <DonutChart {...commonProps} />
      case "radial":
        console.log(type, colors)
        return <RadialChart {...commonProps} />
      default:
        return <div>Unsupported Circular type: {type}</div>
    }
  }
}

export const ChartRenderer = memo(PureChartRenderer)

/* -------------------------------------------------------------------------- */
/*                              Chart Components                              */
/* -------------------------------------------------------------------------- */

type CartesianChartRenderProps = {
  title: string
  description?: string
  data: Record<string, unknown>[]
  keys: CartesianKeys
  colors: Record<string, string>
  labels: Record<string, string>
}

const BarChart = ({ data, keys, colors, labels, title, description }: CartesianChartRenderProps) => {
  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer width="100%" height="100%" className="skeleton-div">
        <RechartBarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} stroke="hsl(var(--mijnui-border))" strokeDasharray={3} />

          <XAxis tickLine={false} tickMargin={10} axisLine={false} dataKey={keys.x} />

          <Tooltip
            cursor={{ fill: "hsl(var(--mijnui-muted) / 0.75)" }}
            content={<ChartTooltip indicator="square" accessibilityLayer />}
          />

          {keys.y.map((key) => (
            <Bar key={key} fill={colors[key]} radius={[4, 4, 0, 0]} dataKey={key} />
          ))}

          <Legend
            verticalAlign="top"
            formatter={(value) => <ChartLegend value={labels[value] || value} />}
            iconType="circle"
            iconSize={8}
          />
        </RechartBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

const LineChart = ({ data, keys, colors, labels, title, description }: CartesianChartRenderProps) => (
  <ChartContainer title={title} description={description}>
    <ResponsiveContainer width="100%" height="100%" className="skeleton-div">
      <RechartsLineChart data={data}>
        <YAxis className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
        <XAxis className="text-muted-foreground" dataKey={keys.x} fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ stroke: "hsl(var(--mijnui-muted-foreground) / 0.45)", strokeWidth: 1 }}
          content={<ChartTooltip accessibilityLayer />}
        />
        <CartesianGrid horizontal={false} stroke={"hsl(var(--mijnui-border))"} strokeDasharray={3} />
        {keys.y.map((key) => (
          <Line key={key} stroke={colors[key]} strokeWidth={2} dataKey={key} dot={{ r: 3, fill: colors[key] }} />
        ))}

        <Legend
          align="center"
          verticalAlign="bottom"
          formatter={(value) => <ChartLegend value={labels[value] || value} />}
          iconType="circle"
          iconSize={8}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  </ChartContainer>
)

const AreaChartComponent = ({ data, keys, colors, labels, title, description }: CartesianChartRenderProps) => (
  <ChartContainer title={title} description={description}>
    <ResponsiveContainer width="100%" height="100%" className="skeleton-div">
      <AreaChart data={data}>
        <YAxis className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
        <XAxis className="text-muted-foreground" dataKey={keys.x} fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ stroke: "hsl(var(--mijnui-muted-foreground) / 0.45)", strokeWidth: 1 }}
          content={<ChartTooltip accessibilityLayer />}
        />
        <CartesianGrid horizontal={false} stroke={"hsl(var(--mijnui-border))"} strokeDasharray={3} />
        {keys.y.map((key) => (
          <Area
            key={key}
            fill={colors[key]}
            stroke={colors[key]}
            fillOpacity={0.1}
            dataKey={key}
            activeDot={{ r: 3, stroke: colors[key], color: colors[key] }}
          />
        ))}
        <Legend
          align="center"
          verticalAlign="bottom"
          formatter={(value) => <ChartLegend value={labels[value] || value} />}
          iconType="circle"
          iconSize={8}
        />
      </AreaChart>
    </ResponsiveContainer>
  </ChartContainer>
)

/* -------------------------------------------------------------------------- */

type CircularChartRenderProps = {
  title: string
  description?: string
  data: Record<string, unknown>[]
  keys: CircularKeys
  colors: Record<string, string>
  labels: Record<string, string>
  props?: ChartProps
}

const PieChart = ({ data, keys, colors, title, description }: CircularChartRenderProps) => {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: item?.fill || colors[keys.value] || `hsl(var(--chart-${(index % 5) + 1}))`,
  }))

  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer width="100%" height="100%" className="skeleton-div">
        <RechartPieChart>
          <Tooltip cursor={false} content={<ChartTooltip accessibilityLayer hideLabel />} />
          <Pie
            data={chartData}
            dataKey={keys.value}
            nameKey={keys.name}
            innerRadius={0}
            strokeWidth={2}
            className="stroke-background"
          />
        </RechartPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

const DonutChart = ({
  data,
  keys,
  colors,
  title,
  description,
  showTotal = true,
}: CircularChartRenderProps & { showTotal?: boolean }) => {
  const chartData = data.map((item, index) => {
    return {
      ...item,
      fill: colors[item[keys.name]] || colors[keys.value] || `hsl(var(--chart-${(index % 5) + 1}))`, // ultimate fallback
    }
  })

  const total = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + (Number(curr[keys.value as keyof typeof curr]) || 0), 0)
  }, [chartData, keys.value])

  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer width="100%" height="100%" className="skeleton-div">
        <RechartPieChart>
          <Tooltip cursor={false} content={<ChartTooltip accessibilityLayer hideLabel />} />
          <Pie
            data={chartData}
            dataKey={keys.value}
            nameKey={keys.name}
            innerRadius={60}
            strokeWidth={2}
            className="stroke-background">
            {showTotal && (
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
    </ChartContainer>
  )
}

const RadialChart = ({ data, keys, colors, title, description }: CircularChartRenderProps) => {
  const chartData = data.map((item, index) => {
    return {
      ...item,
      fill: colors[item[keys.name]] || colors[keys.value] || `hsl(var(--chart-${(index % 5) + 1}))`, // ultimate fallback
    }
  })

  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer
        width="100%"
        height="100%"
        className="skeleton-div [&_.recharts-radial-bar-background-sector]:fill-muted">
        <RadialBarChart data={chartData} innerRadius={30} outerRadius={110}>
          <Tooltip cursor={false} content={<ChartTooltip accessibilityLayer hideLabel />} />
          <RadialBar dataKey={keys.value} background>
            <LabelList
              position="insideStart"
              dataKey={keys.name}
              className="fill-white capitalize mix-blend-luminosity"
              fontSize={10}
            />
          </RadialBar>
        </RadialBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

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

/* -------------------------------------------------------------------------- */
/*                                    Hooks                                   */
/* -------------------------------------------------------------------------- */

type CartesianKeys = {
  x: string
  y: string[]
  allKeys: string[]
}

type CircularKeys = {
  value: string
  name: string
  allKeys: string[]
}

type ChartKeys = CartesianKeys | CircularKeys

const useChartKeys = (data: Record<string, unknown>[], props: ChartProps): ChartKeys => {
  return React.useMemo(() => {
    if (!data.length) {
      const isCartesian = ["bar", "line", "area"].includes(props.type)
      return isCartesian ? { x: "", y: [], allKeys: [] } : { value: "", name: "", allKeys: [] }
    }

    const allKeys = Object.keys(data[0])
    const isCartesian = ["bar", "line", "area"].includes(props.type)

    if (isCartesian) {
      const cartesianProps = props as CartesianChartProps
      const xKey = cartesianProps.xKey || allKeys[0]
      const yKeys = cartesianProps.yKeys || allKeys.filter((key) => key !== xKey && typeof data[0][key] === "number")

      return { x: xKey, y: yKeys, allKeys }
    } else {
      const circularProps = props as CircularChartProps
      const valueKey = circularProps.valueKey || allKeys.find((key) => typeof data[0][key] === "number") || allKeys[0]
      const nameKey =
        circularProps.nameKey ||
        allKeys.find((key) => key !== valueKey && typeof data[0][key] === "string") ||
        allKeys[0]

      return { value: valueKey, name: nameKey, allKeys }
    }
  }, [data, props])
}

type ChartConfigNamespace = {
  series?: { key: string; color?: string; label?: string }[]
  items?: { key: string; color?: string; label?: string }[]
}

const useChartColors = (config: ChartConfigNamespace = {}, keys: string[]) => {
  return React.useMemo(() => {
    const colors: Record<string, string> = {}

    // Series-level colors (Cartesian)
    config.series?.forEach(({ key, color }) => {
      if (color) colors[key] = color
    })

    // Item-level colors (Circular)
    config.items?.forEach(({ key, color }) => {
      if (color) colors[key] = color
    })

    // Fallback defaults
    keys.forEach((key, index) => {
      if (!colors[key]) {
        colors[key] = `hsl(var(--chart-${(index % 5) + 1}))`
      }
    })

    return colors
  }, [config, keys])
}

const useChartLabels = (config: ChartConfigNamespace = {}) => {
  return React.useMemo(() => {
    const labels: Record<string, string> = {}

    config.series?.forEach(({ key, label }) => {
      if (label) labels[key] = label
    })

    config.items?.forEach(({ key, label }) => {
      if (label) labels[key] = label
    })

    return labels
  }, [config])
}
