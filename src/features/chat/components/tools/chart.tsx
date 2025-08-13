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
import { ChartLegend, ChartTooltip } from "@/components/ui/chart"
import { ToolCall } from "../../types"

export type ChartProps = {
  type: "bar" | "line" | "pie"
  dataKey: string
  data: Record<string, unknown>[]
  title: string
  description: string
}

type ChartPreviewProps = {
  tool: ToolCall
}

const ChartPreview = ({ tool }: ChartPreviewProps) => {
  const chartData = tool.function.arguments as ChartProps

  if (typeof chartData !== "object" || !chartData) {
    return <div className="p-2 text-muted-foreground">Chart data not found</div>
  }

  switch (chartData.type) {
    case "bar":
      return <BarChart {...chartData} />
    case "line":
      return <LineChart {...chartData} />
    case "pie":
      return <PieChart {...chartData} />
    default:
      return null
  }
}

export { ChartPreview }

/* -------------------------------------------------------------------------- */

export const BarChart = ({ title, description, dataKey, data }: ChartProps) => {
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
    </ChartContainer>
  )
}

const LineChart = ({ title, description, dataKey, data }: ChartProps) => {
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
    </ChartContainer>
  )
}

const PieChart = ({ title, description, data }: ChartProps) => {
  const dataKeys = getDataKeys(data)

  return (
    <Card className="skeleton-bg mb-2 mt-4 w-full border bg-transparent text-xs shadow-none">
      <CardHeader>
        <CardTitle className="text-medium">{title}</CardTitle>
        <CardDescription className="text-small">{description}</CardDescription>
      </CardHeader>

      <CardContent className="aspect-video w-full">
        <ResponsiveContainer width="100%" height="100%" className="skeleton-div">
          <RechartPieChart>
            <Tooltip
              cursor={{ fill: "hsl(var(--mijnui-accent))" }}
              content={<ChartTooltip accessibilityLayer hideIndicator active />}
            />
            {dataKeys?.map((key) => (
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
  if (!dataKey) return

  const keys = [...new Set(content.flatMap(Object.keys))]

  return dataKey ? keys.filter((key) => key !== dataKey) : keys
}
