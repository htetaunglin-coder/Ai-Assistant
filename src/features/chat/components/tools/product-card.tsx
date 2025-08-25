import { FC, memo } from "react"
import { Card, CardContent, CardHeader } from "@mijn-ui/react"
import { Package } from "lucide-react"
import { VariantProps, tv } from "tailwind-variants"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ToolCall } from "../../types"
import { ToolCallStatusDisplay } from "./tool-call-status-display"

type Product = {
  id: string
  name: string
  price: number
  description: string
  imageUrl?: string
  stock?: number
}

type Products = {
  title: string
  products: Product[]
}

type ProductCardsProps = {
  tool: ToolCall
  loading: boolean
}

const PureProductCards: FC<ProductCardsProps> = ({ tool, loading }) => {
  console.log(tool)
  console.log("Arguments", tool.arguments)

  const products = tool.arguments && typeof tool.arguments === "object" ? (tool.arguments as Products).products : []

  if (loading) {
    return (
      <ToolCallStatusDisplay
        icon={Package}
        status="loading"
        title="Loading Products"
        description="Fetching product information..."
      />
    )
  }

  if (!products.length) return <ToolCallStatusDisplay status="error" icon={Package} title="No products found" />

  if (products.length === 1) {
    return (
      <div className="flex flex-row">
        <ProductCard product={products[0]} layout="single" />
      </div>
    )
  }

  return (
    <Carousel>
      <CarouselContent>
        {products.map((product, index) => (
          <CarouselItem key={`${product.id}-item-${index}`} className="basis-3/4 sm:basis-1/2 lg:basis-1/3">
            <div className="size-full p-1">
              <ProductCard product={product} layout="multiple" />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {products.length > 2 && (
        <>
          <CarouselPrevious className="hidden sm:inline-flex" />
          <CarouselNext className="hidden sm:inline-flex" />
        </>
      )}
    </Carousel>
  )
}

export const ProductCards = memo(PureProductCards)

/* -------------------------------------------------------------------------- */

const productCardVariants = tv({
  slots: {
    card: "flex overflow-hidden border border-border bg-transparent shadow-none transition hover:shadow-sm",
    header: "relative w-full p-0",
    content: "flex flex-col items-start",
    title: "mb-1 font-semibold leading-5 tracking-tight",
    price: "font-semibold",
    image: "size-full object-cover",
  },
  variants: {
    layout: {
      multiple: {
        card: "h-full flex-col",
        header: "mb-4 aspect-square",
        content: "size-full flex-1 justify-between",
        title: "text-base",
        price: "text-xl",
        image: "absolute",
      },

      single: {
        card: "flex-1 flex-col p-0 sm:flex-row",
        header: "mb-0 aspect-square sm:w-1/3",
        content: "h-full flex-1 p-6",
        title: "text-lg sm:text-xl",
        price: "text-xl sm:text-2xl",
        image: "absolute inset-0",
      },
    },
  },
})

type TooltipVariants = VariantProps<typeof productCardVariants>

const ProductCard: FC<{ product: Product; layout: TooltipVariants["layout"] }> = ({ product, layout }) => {
  const { card, header, content, title, price, image } = productCardVariants({ layout })

  return (
    <Card
      className={card()}
      aria-label={`${product.name}, ${product.price}, ${product.stock || "unknown"} units in stock`}>
      <CardHeader className={header()}>
        {product.imageUrl && (
          <img src={product.imageUrl} alt={product.name} width={80} height={80} loading="lazy" className={image()} />
        )}
      </CardHeader>
      <CardContent className={content()}>
        <h3 className={title()}>{product.name}</h3>
        <div className="w-full flex-1">{product.description}</div>
        <div className="flex w-full items-center justify-between">
          <p className={price()}>${product.price.toFixed(2)}</p>
          {product.stock !== undefined && <p className="text-sm text-secondary-foreground">{product.stock} units</p>}
        </div>
        <button className="text-sm text-primary-emphasis underline" onClick={() => alert("Show details")}>
          Details
        </button>
      </CardContent>
    </Card>
  )
}
