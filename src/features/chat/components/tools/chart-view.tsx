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
import { z } from "zod"
import { ChartLegend, ChartTooltip } from "@/components/ui/chart"
import { StatusDisplay } from "../ui/status-display"

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */
// ChartConfig controls how colors/labels are applied.
//
// - series → used in Cartesian charts (bar, line, area).
//   Colors are applied by data object keys (e.g. "sales", "profit").
//   Example row: { quarter: "Q1", sales: 100, profit: 50 }
//   Config: series: [{ key: "sales", color: "#3B82F6" }]
//
// - items → used in Polar charts (pie, donut, radial).
//   Colors are applied by category values (e.g. "Excellent", "Poor").
//   Example row: { level: "Excellent", count: 420 }
//   Config: items: [{ key: "Excellent", color: "#16A34A" }]
//
// This split is needed because Cartesian charts color by column names,
// while most of the Polar charts color by the category values in the data.
export const chartConfigSchema = z.object({
  series: z
    .array(
      z.object({
        key: z.string(),
        color: z.string().optional(),
        label: z.string().optional(),
      }),
    )
    .optional(),

  items: z
    .array(
      z.object({
        key: z.string(),
        color: z.string().optional(),
        label: z.string().optional(),
      }),
    )
    .optional(),
})

export const chartSchema = z.object({
  type: z.enum(["bar", "line", "area", "pie", "donut", "radial"]),
  title: z.string().optional(),
  description: z.string().optional().nullable(),
  categoryKey: z.string().optional(),
  valueKeys: z.array(z.string()).optional(),
  data: z.array(z.record(z.unknown())),
  legend: z.boolean().optional(),
  config: chartConfigSchema.optional(),

  /* Chart Specific Options */

  // For Bar Chart
  orientation: z.enum(["horizontal", "vertical"]).optional(),
  stacked: z.boolean().optional(),
  stackGroups: z.record(z.array(z.string())).optional(),

  // For Donut Chart Only
  showTotal: z.boolean().optional(),
})

export type ChartConfig = z.infer<typeof chartConfigSchema>
export type ChartProps = z.infer<typeof chartSchema>

/* -------------------------------------------------------------------------- */

const PureChartView = (props: ChartProps) => {
  const { type, data, config } = props
  const keys = useChartKeys(data, props)
  const colors = useChartColors(config, keys.allKeys)
  const labels = useChartLabels(config)

  const commonProps = { ...props, data, keys, colors, labels }

  switch (type) {
    case "bar":
      return <BarChart {...commonProps} />
    case "line":
      return <LineChart {...commonProps} />
    case "area":
      return <AreaChartComponent {...commonProps} />
    case "pie":
      return <PieChart {...commonProps} />
    case "donut":
      return <DonutChart {...commonProps} />
    case "radial":
      return <RadialChart {...commonProps} />
    default:
      return <StatusDisplay status="error" title={`Unsupported Chart type: ${type}`} />
  }
}

const ChartView = memo(PureChartView)

export default ChartView

/* -------------------------------------------------------------------------- */
/*                              Chart Components                              */
/* -------------------------------------------------------------------------- */
type ChartRenderProps = ChartProps & {
  keys: ChartKeys
  labels: Record<string, string>
  colors: Record<string, string>
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
}: ChartRenderProps) => {
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

const LineChart = ({ data, keys, colors, labels, title, description, legend = true }: ChartRenderProps) => (
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

const AreaChartComponent = ({ data, keys, colors, labels, title, description, legend }: ChartRenderProps) => (
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

const PieChart = ({ data, keys, colors, title, description, labels, legend }: ChartRenderProps) => {
  const chartData = useDataWithItemColors(data, keys, colors)

  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer width="100%" height="100%" className="skeleton-div">
        <RechartPieChart>
          <Tooltip cursor={false} content={<ChartTooltip accessibilityLayer hideLabel />} />
          <Pie
            data={chartData}
            dataKey={keys.values[0]}
            nameKey={keys.category}
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

const DonutChart = ({ data, keys, colors, title, description, showTotal = true, labels, legend }: ChartRenderProps) => {
  const chartData = useDataWithItemColors(data, keys, colors)

  const total = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + (Number(curr[keys.values[0] as keyof typeof curr]) || 0), 0)
  }, [chartData, keys.values])

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
            dataKey={keys.values[0]}
            nameKey={keys.category}
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

const RadialChart = ({ data, keys, colors, title, description, labels, legend }: ChartRenderProps) => {
  const chartData = useDataWithItemColors(data, keys, colors)

  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer
        width="100%"
        height="100%"
        className="skeleton-div [&_.recharts-radial-bar-background-sector]:fill-muted">
        <RadialBarChart data={chartData} innerRadius={30} outerRadius={110}>
          <Tooltip cursor={false} content={<ChartTooltip accessibilityLayer hideLabel />} />
          <RadialBar dataKey={keys.values[0]} background>
            <LabelList
              position="insideStart"
              dataKey={keys.category}
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

const ChartContainer = ({
  title,
  description,
  children,
}: {
  title?: string
  description?: string | null
  children: React.ReactNode
}) => {
  return (
    <Card className="skeleton-bg my-4 flex h-full min-h-80 w-[90%] flex-col items-center justify-between gap-4 bg-transparent shadow-none">
      <CardHeader className="flex w-full flex-col items-start space-y-0">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-sm text-secondary-foreground">{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex h-64 w-full max-w-full items-center rounded-none p-4 pt-0 text-xs md:h-72">
        {children}
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*                                    Hooks                                   */
/* -------------------------------------------------------------------------- */
type ChartKeys = {
  category: string
  values: string[]
  allKeys: string[]
}

const useChartKeys = (data: Record<string, unknown>[], props: ChartProps): ChartKeys => {
  return React.useMemo(() => {
    if (!data.length) {
      return { category: "", values: [], allKeys: [] }
    }

    const allKeys = Object.keys(data[0])

    const categoryKey = props.categoryKey || allKeys[0]
    let valueKeys = props.valueKeys

    if (!valueKeys) {
      valueKeys = allKeys.filter((key) => key !== categoryKey && typeof data[0][key] === "number")

      // If no numeric fields found, use the first non-category field
      if (valueKeys.length === 0) {
        valueKeys = allKeys.filter((key) => key !== categoryKey).slice(0, 1)
      }
    }

    return {
      category: categoryKey,
      values: valueKeys,
      allKeys,
    }
  }, [data, props.categoryKey, props.valueKeys])
}

const useChartColors = (
  config: ChartConfig = {},
  keys: string[],
  data: Record<string, unknown>[] = [],
  categoryKey?: string,
) => {
  return React.useMemo(() => {
    const colors: Record<string, string> = {}

    // Handle explicit colors
    config.series?.forEach(({ key, color }) => {
      if (color) colors[key] = color
    })

    config.items?.forEach(({ key, color }) => {
      if (color) colors[key] = color
    })

    // Fallback for series - only if config.series exists and has items
    if (config.series && config.series.length > 0) {
      keys.forEach((key, index) => {
        if (!colors[key]) {
          colors[key] = `hsl(var(--chart-${(index % 5) + 1}))`
        }
      })
    }

    // Fallback for items - only if config.items exists and has items
    if (config.items && config.items.length > 0 && data.length > 0 && categoryKey) {
      const uniqueCategoryValues = Array.from(new Set(data.map((item) => String(item[categoryKey]))))

      uniqueCategoryValues.forEach((categoryValue, index) => {
        if (!colors[categoryValue]) {
          colors[categoryValue] = `hsl(var(--chart-${(index % 5) + 1}))`
        }
      })
    }

    return colors
  }, [config, keys, data, categoryKey])
}

const useChartLabels = (config: ChartConfig = {}) => {
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

const useDataWithItemColors = (data: Record<string, unknown>[], keys: ChartKeys, colors: Record<string, string>) => {
  return React.useMemo(() => {
    return data.map((item, index) => {
      const itemNameValue = item[keys.category] as string
      const fallbackColor = colors[keys.values[0]] || `hsl(var(--chart-${(index % 5) + 1}))`

      return {
        ...item,
        fill: colors[itemNameValue] || fallbackColor,
      }
    })
  }, [data, keys, colors])
}
