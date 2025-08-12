import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@mijn-ui/react-card"
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  LabelList,
  Legend,
  Pie,
  BarChart as RechartBarChart,
  PieChart as RechartPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartLegend, ChartTooltip } from "./ui/chart"

/**
 * Icon types for category visualization
 */
export type CategoryIconType =
  | "spread-sheet"
  | "trending-up"
  | "exchange"
  | "credit-card"
  | "hand-coins"
  | "database"
  | "mail"
  | "code"

/**
 * Chart configuration types
 */
export type BaseChartConfig = {
  title: string
  description: string
}

export type BarChartConfig = BaseChartConfig & {
  type: "bar"
  dataKey: string
  data: Record<string, unknown>[]
}

export type LineChartConfig = BaseChartConfig & {
  type: "line"
  dataKey: string
  data: Record<string, unknown>[]
}

export type PieChartConfig = BaseChartConfig & {
  type: "pie"
  data: Record<string, unknown>[]
}

export type ChartConfig = BarChartConfig | LineChartConfig | PieChartConfig

const Chart = (props: ChartConfig) => {
  switch (props.type) {
    case "bar":
      return <BarChart {...props} />
    case "line":
      return <LineChart {...props} />
    case "pie":
      return <PieChart {...props} />
    default:
      return null
  }
}

export default Chart

/* -------------------------------------------------------------------------- */

export const BarChart = ({ title, description, dataKey, data }: BarChartConfig) => {
  const dataKeys = getDataKeys(data, dataKey)

  return (
    <Card className="my-4 w-full border bg-transparent text-xs shadow-none">
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {description && <CardDescription className="text-small">{description}</CardDescription>}
      </CardHeader>

      <CardContent className="aspect-video w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartBarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} stroke="hsl(var(--mijnui-border))" strokeDasharray={3} />

            <XAxis tickLine={false} tickMargin={10} axisLine={false} dataKey={dataKey} />

            <Tooltip
              cursor={{ fill: "hsl(var(--mijnui-muted) / 0.75)" }}
              content={<ChartTooltip indicator="square" accessibilityLayer />}
            />

            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                // These colors should come from the api
                // and passed them accordingly
                fill={`hsl(var(--chart-${index + 1}))`}
                radius={[4, 4, 0, 0]}
                dataKey={key}
              />
            ))}

            <Legend
              verticalAlign="top"
              formatter={(value) => <ChartLegend value={value} />}
              iconType="circle"
              iconSize={8}
            />
          </RechartBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

const LineChart = ({ title, description, dataKey, data }: LineChartConfig) => {
  const dataKeys = getDataKeys(data, dataKey)

  return (
    <Card className="my-4 flex size-full min-h-80 flex-col items-center justify-between gap-4 bg-transparent shadow-none">
      <CardHeader className="flex w-full flex-col items-start space-y-0">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-sm text-secondary-foreground">{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex h-64 w-[calc(543/12*1rem)] max-w-full items-center rounded-none p-4 pl-0 pt-0 text-xs md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <YAxis className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
            <XAxis
              className="text-muted-foreground"
              dataKey={dataKey}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              cursor={{ stroke: "hsl(var(--mijnui-muted-foreground) / 0.45)", strokeWidth: 1 }}
              content={<ChartTooltip accessibilityLayer />}
            />

            <CartesianGrid horizontal={false} stroke={"hsl(var(--mijnui-border))"} strokeDasharray={3} />

            {dataKeys.map((key, index) => (
              <Area
                key={key}
                // These colors should come from the api
                // and passed them accordingly
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
      </CardContent>
    </Card>
  )
}

const PieChart = ({ title, description, data }: PieChartConfig) => {
  const dataKeys = getDataKeys(data)

  return (
    <Card className="mb-2 mt-4 w-full border bg-transparent text-xs shadow-none">
      <CardHeader>
        <CardTitle className="text-medium">{title}</CardTitle>
        <CardDescription className="text-small">{description}</CardDescription>
      </CardHeader>

      <CardContent className="aspect-video w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartPieChart>
            <Tooltip
              cursor={{ fill: "hsl(var(--mijnui-accent))" }}
              content={<ChartTooltip accessibilityLayer hideIndicator active />}
            />
            {dataKeys.map((key) => (
              <Pie key={key} data={data} dataKey={key} stroke="fill-background">
                <LabelList dataKey={key} className="fill-card" stroke="none" fontSize={12} />
              </Pie>
            ))}
          </RechartPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

const getDataKeys = (content: Record<string, unknown>[], xAxisKey?: string) => {
  const keys = [...new Set(content.flatMap(Object.keys))]

  return xAxisKey ? keys.filter((key) => key !== xAxisKey) : keys
}
