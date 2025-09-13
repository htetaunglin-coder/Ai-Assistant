"use client"

import React, { memo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@mijn-ui/react-card"
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
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
 * CHART SYSTEM OVERVIEW
 *
 * We have 2 main chart types, and they need different color rules:
 *
 * 1. CARTESIAN CHARTS (bar, line, area):
 *    - Data is shown on X and Y axes
 *    - We color by column names, like "sales" or "profit"
 *    - Use config.series: [{ key: "sales", color: "#blue" }]
 *    - Example: { month: "Jan", sales: 100, profit: 50 }
 *      → colors go on "sales" and "profit"
 *
 * 2. POLAR CHARTS (pie, donut, radial):
 *    - Data is shown as parts of a circle
 *    - We color by category values, like "Phone" or "Laptop"
 *    - Use config.items: [{ key: "Phone", color: "#blue" }]
 *    - Example: { product: "Phone", amount: 100 }
 *      → color goes on "Phone"
 *
 * WHY DIFFERENT CONFIG?
 * - Cartesian charts need colors for several columns in the same row
 * - Polar charts need colors for the category each row represents
 *
 * QUICK GUIDE:
 * - Bar / Line / Area → config.series (color by column name)
 * - Pie / Donut / Radial → config.items (color by category value)
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
  categoryKey?: string
  valueKeys?: string[]
}

export type PolarChartProps = BaseChartProps & {
  type: "pie" | "donut" | "radial"
  nameKey?: string
  valueKey?: string
}

export type ChartProps = CartesianChartProps | PolarChartProps

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
  const { type, data, config } = props
  const keys = useChartKeys(data, props)
  const colors = useChartColors(config, keys.allKeys)
  const labels = useChartLabels(config)

  // We check explicitly because TypeScript can't always know
  // whether the keys belong to a Cartesian chart or a Circular chart.
  // By narrowing like this at runtime, we avoid type errors and make sure
  // we only pass valid keys to each chart type.
  function isCartesianKeys(keys: ChartKeys): keys is CartesianKeys {
    return "category" in keys && "values" in keys
  }

  if (isCartesianKeys(keys)) {
    const commonProps = { ...props, data, keys, colors, labels }

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
    const commonProps = { ...props, data, keys, colors, labels }

    switch (type) {
      case "pie":
        return <PieChart {...commonProps} />
      case "donut":
        return <DonutChart {...commonProps} />
      case "radial":
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
  legend?: boolean
}

type BarChartProps = CartesianChartRenderProps & {
  orientation?: "horizontal" | "vertical"
  stacked?: boolean
  stackGroups?: Record<string, string[]>
}

type RadiusArray = [number, number, number, number]

type RadiusConfig = {
  first: RadiusArray
  last: RadiusArray
  middle: RadiusArray
}

const BarChart = ({
  data,
  keys,
  labels,
  colors,
  title,
  description,
  orientation = "vertical",
  legend = true,
  stacked = false,
  stackGroups,
}: BarChartProps) => {
  const isHorizontal = orientation === "horizontal"
  const layout = isHorizontal ? "vertical" : "horizontal"

  const radiusConfig: Record<typeof orientation, RadiusConfig> = {
    horizontal: {
      first: [4, 0, 0, 4], // Left-most bar: rounded left corners
      last: [0, 4, 4, 0], // Right-most bar: rounded right corners
      middle: [0, 0, 0, 0], // Middle bars: no rounding
    },
    vertical: {
      first: [0, 0, 4, 4], // Bottom bar: rounded bottom corners
      last: [4, 4, 0, 0], // Top bar: rounded top corners
      middle: [0, 0, 0, 0], // Middle bars: no rounding
    },
  }

  const getBarRadius = (key: string, index: number): RadiusArray | number => {
    if (!stacked) return 4 // Non-stacked bars get uniform radius

    const config = radiusConfig[orientation]

    // Handle custom stack groups
    if (stackGroups) {
      for (const groupKeys of Object.values(stackGroups)) {
        if (groupKeys.includes(key)) {
          const indexInGroup = groupKeys.indexOf(key)
          if (indexInGroup === 0) return config.first
          if (indexInGroup === groupKeys.length - 1) return config.last
          return config.middle
        }
      }
    }

    // Handle default single stack
    if (index === 0) return config.first
    if (index === keys.values.length - 1) return config.last
    return config.middle
  }

  const getStackId = (key: string): string | undefined => {
    if (!stacked) return undefined

    // If stackGroups is provided, find which group this key belongs to
    if (stackGroups) {
      for (const [groupId, groupKeys] of Object.entries(stackGroups)) {
        if (groupKeys.includes(key)) {
          return groupId
        }
      }
    }

    return "stack"
  }

  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer width="100%" height="100%" className="skeleton-div">
        <RechartBarChart
          layout={layout}
          accessibilityLayer
          data={data}
          margin={{
            left: orientation === "horizontal" ? 24 : 0,
          }}>
          <CartesianGrid
            vertical={!isHorizontal}
            horizontal={isHorizontal}
            stroke="hsl(var(--mijnui-border))"
            strokeDasharray={3}
          />

          {isHorizontal ? (
            <>
              <XAxis type="number" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis type="category" dataKey={keys.category} tickLine={false} tickMargin={10} axisLine={false} />
            </>
          ) : (
            <>
              <XAxis type="category" dataKey={keys.category} tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis type="number" tickLine={false} tickMargin={10} axisLine={false} />
            </>
          )}

          <Tooltip
            cursor={{ fill: "hsl(var(--mijnui-muted) / 0.75)" }}
            content={<ChartTooltip indicator="square" accessibilityLayer />}
          />

          {keys.values.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[key]}
              radius={getBarRadius(key, index)}
              stackId={getStackId(key)}
            />
          ))}

          {legend && (
            <Legend
              verticalAlign="bottom"
              formatter={(value) => <ChartLegend value={labels[value] || value} className="inline-block pt-3" />}
              iconType="circle"
              iconSize={8}
            />
          )}
        </RechartBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

const LineChart = ({ data, keys, colors, labels, title, description, legend = true }: CartesianChartRenderProps) => (
  <ChartContainer title={title} description={description}>
    <ResponsiveContainer width="100%" height="100%" className="skeleton-div">
      <RechartsLineChart data={data}>
        <YAxis className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
        <XAxis
          className="text-muted-foreground"
          dataKey={keys.category}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ stroke: "hsl(var(--mijnui-muted-foreground) / 0.45)", strokeWidth: 1 }}
          content={<ChartTooltip accessibilityLayer />}
        />
        <CartesianGrid horizontal={false} stroke={"hsl(var(--mijnui-border))"} strokeDasharray={3} />

        {keys.values.map((key) => (
          <Line key={key} stroke={colors[key]} strokeWidth={2} dataKey={key} dot={{ r: 3, fill: colors[key] }} />
        ))}

        {legend && (
          <Legend
            align="center"
            verticalAlign="bottom"
            formatter={(value) => <ChartLegend value={labels[value] || value} className="inline-block pt-3" />}
            iconType="circle"
            iconSize={8}
          />
        )}
      </RechartsLineChart>
    </ResponsiveContainer>
  </ChartContainer>
)

const AreaChartComponent = ({ data, keys, colors, labels, title, description, legend }: CartesianChartRenderProps) => (
  <ChartContainer title={title} description={description}>
    <ResponsiveContainer width="100%" height="100%" className="skeleton-div">
      <AreaChart data={data}>
        <YAxis className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
        <XAxis
          className="text-muted-foreground"
          dataKey={keys.category}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ stroke: "hsl(var(--mijnui-muted-foreground) / 0.45)", strokeWidth: 1 }}
          content={<ChartTooltip accessibilityLayer />}
        />
        <CartesianGrid horizontal={false} stroke={"hsl(var(--mijnui-border))"} strokeDasharray={3} />
        {keys.values.map((key) => (
          <Area
            key={key}
            fill={colors[key]}
            stroke={colors[key]}
            fillOpacity={0.1}
            dataKey={key}
            activeDot={{ r: 3, stroke: colors[key], color: colors[key] }}
          />
        ))}
        {legend && (
          <Legend
            align="center"
            verticalAlign="bottom"
            formatter={(value) => <ChartLegend value={labels[value] || value} className="inline-block pt-3" />}
            iconType="circle"
            iconSize={8}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  </ChartContainer>
)

/* -------------------------------------------------------------------------- */

type PolarChartRenderProps = {
  title: string
  description?: string
  data: Record<string, unknown>[]
  keys: PolarKeys
  colors: Record<string, string>
  labels: Record<string, string>
  legend?: boolean
}

const PieChart = ({ data, keys, colors, title, description, labels, legend }: PolarChartRenderProps) => {
  const chartData = assignPolarChartColors(data, keys, colors)

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

          {legend && (
            <Legend
              align="center"
              verticalAlign="bottom"
              formatter={(value) => <ChartLegend value={labels[value] || value} className="inline-block pt-3" />}
              iconType="circle"
              iconSize={8}
            />
          )}
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
  labels,
  legend,
}: PolarChartRenderProps & { showTotal?: boolean }) => {
  const chartData = assignPolarChartColors(data, keys, colors)

  const total = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + (Number(curr[keys.value as keyof typeof curr]) || 0), 0)
  }, [chartData, keys.value])

  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer width="100%" height="100%" className="skeleton-div">
        <RechartPieChart margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
          <Tooltip cursor={false} content={<ChartTooltip accessibilityLayer hideLabel />} />

          {showTotal && (
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
              <tspan x="50%" y="45%" className="fill-foreground text-3xl font-bold">
                {total.toLocaleString()}
              </tspan>
              <tspan x="50%" y="55%" className="fill-muted-foreground text-sm">
                Total
              </tspan>
            </text>
          )}

          <Pie
            data={chartData}
            dataKey={keys.value}
            nameKey={keys.name}
            innerRadius={60}
            strokeWidth={2}
            className="stroke-secondary"
          />

          {legend && (
            <Legend
              align="center"
              verticalAlign="bottom"
              formatter={(value) => <ChartLegend value={labels[value] || value} className="inline-block pt-3" />}
              iconType="circle"
              iconSize={8}
            />
          )}
        </RechartPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

const RadialChart = ({ data, keys, colors, title, description, labels, legend }: PolarChartRenderProps) => {
  const chartData = assignPolarChartColors(data, keys, colors)

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

          {legend && (
            <Legend
              align="center"
              verticalAlign="bottom"
              formatter={(value) => <ChartLegend value={labels[value] || value} className="inline-block pt-3" />}
              iconType="circle"
              iconSize={8}
            />
          )}
        </RadialBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

const assignPolarChartColors = (data: Record<string, unknown>[], keys: PolarKeys, colors: Record<string, string>) => {
  return data.map((item, index) => {
    const itemNameValue = item[keys.name] as string
    return {
      ...item,
      fill: colors[itemNameValue] || colors[keys.value] || `hsl(var(--chart-${(index % 5) + 1}))`,
    }
  })
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
  category: string
  values: string[]
  allKeys: string[]
}

type PolarKeys = {
  value: string
  name: string
  allKeys: string[]
}

type ChartKeys = CartesianKeys | PolarKeys

const useChartKeys = (data: Record<string, unknown>[], props: ChartProps): ChartKeys => {
  return React.useMemo(() => {
    if (!data.length) {
      const isCartesian = ["bar", "line", "area"].includes(props.type)
      return isCartesian ? { category: "", values: [], allKeys: [] } : { value: "", name: "", allKeys: [] }
    }

    const allKeys = Object.keys(data[0])
    const isCartesian = ["bar", "line", "area"].includes(props.type)

    if (isCartesian) {
      const cartesianProps = props as CartesianChartProps
      const categoryKey = cartesianProps.categoryKey || allKeys[0]
      const valueKeys =
        cartesianProps.valueKeys || allKeys.filter((key) => key !== categoryKey && typeof data[0][key] === "number")

      return { category: categoryKey, values: valueKeys, allKeys }
    } else {
      const circularProps = props as PolarChartProps
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
