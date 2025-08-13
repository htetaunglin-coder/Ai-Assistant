import { FC } from "react"
import { Card, CardContent, CardHeader } from "@mijn-ui/react"
import { ToolCall } from "../../types"

type Products = {
  title: string
  products: {
    id: string
    name: string
    price: number
    imageUrl?: string
    stock?: number
  }[]
}

type ProductCardsProps = {
  tool: ToolCall
}

export const ProductCards: FC<ProductCardsProps> = ({ tool }) => {
  const products = typeof tool.function.arguments === "object" ? (tool.function.arguments as Products).products : []

  if (!products.length) return <div>No products found</div>

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {products.slice(0, 4).map((product) => (
        <Card
          key={product.id}
          className="overflow-hidden border border-border bg-transparent shadow-none transition hover:shadow-sm"
          aria-label={`${product.name}, $${product.price}, ${product.stock || "unknown"} units in stock`}>
          <CardHeader className="mb-4 aspect-square w-full p-0">
            {product.imageUrl && (
              // eslint-disable-next-line
              <img
                src={product.imageUrl}
                alt={product.name}
                width={80}
                height={80}
                className="size-full object-cover"
              />
            )}
          </CardHeader>
          <CardContent>
            <h3 className="mb-1 text-base font-semibold leading-5 tracking-tight">{product.name}</h3>
            <div className="flex items-center justify-between">
              <p className="text-xl font-semibold">${product.price.toFixed(2)}</p>
              {product.stock !== undefined && (
                <p className="text-sm text-secondary-foreground">{product.stock} units</p>
              )}
            </div>
            <button className="text-sm text-primary-emphasis underline" onClick={() => alert("Show details")}>
              Details
            </button>
          </CardContent>
        </Card>
      ))}
      {/* This should open the detail sidebar/artifacts */}
      {products.length > 4 && <button className="text-sm text-secondary-foreground">Show More</button>}
    </div>
  )
}
