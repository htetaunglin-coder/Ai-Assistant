import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { messages } = await req.json()
  const _ = messages?.[0]?.content || ""

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      let step = 0
      let isControllerClosed = false

      const cleanup = () => {
        isControllerClosed = true
      }

      // Define all tool responses with new chart structure
      const toolResponses = [
        {
          id: "image_tool_001",
          name: "image_view",
          arguments: {
            images: [
              {
                id: 1,
                src: "https://picsum.photos/id/1015/600/400",
                alt: "Mountain landscape",
                width: 600,
                height: 400,
              },
            ],
          },
        },

        {
          id: "image_tool_002",
          name: "image_view",
          arguments: {
            images: [
              {
                id: "a1",
                src: "https://picsum.photos/id/1025/600/400",
                alt: "Puppy looking at the camera",
                width: 600,
                height: 400,
              },
              {
                id: "a2",
                src: "https://picsum.photos/id/1035/600/400",
                alt: "Forest in morning light",
                width: 600,
                height: 400,
              },
            ],
          },
        },

        {
          id: "image_tool_003",
          name: "image_view",
          arguments: {
            images: [
              {
                id: "b1",
                src: "https://picsum.photos/id/1045/600/400",
                alt: "Ocean waves",
                width: 600,
                height: 400,
              },
              {
                id: "b2",
                src: "https://picsum.photos/id/1055/600/400",
                alt: "City skyline at night",
                width: 600,
                height: 400,
              },
              {
                id: "b3",
                src: "https://picsum.photos/id/1065/600/400",
                alt: "Desert dunes",
                width: 600,
                height: 400,
              },
              {
                id: "b4",
                src: "https://picsum.photos/id/1075/600/400",
                alt: "Snowy forest",
                width: 600,
                height: 400,
              },
              {
                id: "b5",
                src: "https://picsum.photos/id/1085/600/400",
                alt: "Bridge over river",
                width: 600,
                height: 400,
              },
            ],
          },
        },
        // 1. Bar Chart - Cartesian with xKey and yKeys
        {
          id: "bar_chart_001",
          name: "chart_view",
          arguments: {
            type: "bar",
            title: "Monthly Sales Performance",
            description: "Sales data across different product categories",
            data: [
              { category: "Electronics", sales: 45000, revenue: 50000 },
              { category: "Clothing", sales: 32000, revenue: 40000 },
              { category: "Books", sales: 18000, revenue: 25000 },
              { category: "Sports", sales: 28000, revenue: 35000 },
              { category: "Home", sales: 35000, revenue: 42000 },
            ],
            categoryKey: "category",
            valueKeys: ["sales", "revenue"],
            config: {
              series: [
                { key: "sales", color: "#3B82F6", label: "Units Sold" },
                { key: "revenue", color: "#10B981", label: "Revenue ($)" },
              ],
            },
          },
        },
        // 2. Line Chart - Cartesian with trend data
        {
          id: "line_chart_001",
          name: "chart",
          arguments: {
            type: "line",
            title: "Website Traffic Trends",
            description: "Monthly visitor statistics over the past year",
            data: [
              { month: "Jan", visitors: 12000, pageviews: 45000 },
              { month: "Feb", visitors: 15000, pageviews: 52000 },
              { month: "Mar", visitors: 18000, pageviews: 61000 },
              { month: "Apr", visitors: 22000, pageviews: 78000 },
              { month: "May", visitors: 28000, pageviews: 95000 },
              { month: "Jun", visitors: 35000, pageviews: 125000 },
            ],
            xKey: "month",
            yKeys: ["visitors", "pageviews"],
            config: [
              { key: "visitors", color: "#8B5CF6", label: "Unique Visitors" },
              { key: "pageviews", color: "#F59E0B", label: "Page Views" },
            ],
          },
        },
        // 3. Area Chart - Cartesian with filled areas
        {
          id: "area_chart_001",
          name: "chart",
          arguments: {
            type: "area",
            title: "Revenue Growth Over Time",
            description: "Quarterly revenue breakdown by product lines",
            data: [
              { quarter: "Q1 2024", software: 125000, hardware: 95000, services: 65000 },
              { quarter: "Q2 2024", software: 142000, hardware: 108000, services: 78000 },
              { quarter: "Q3 2024", software: 158000, hardware: 125000, services: 89000 },
              { quarter: "Q4 2024", software: 175000, hardware: 138000, services: 102000 },
            ],
            xKey: "quarter",
            yKeys: ["software", "hardware", "services"],
            config: [
              { key: "software", color: "#06D6A0", label: "Software Revenue" },
              { key: "hardware", color: "#118AB2", label: "Hardware Revenue" },
              { key: "services", color: "#073B4C", label: "Services Revenue" },
            ],
          },
        },
        // 4. Pie Chart - Circular with market share
        {
          id: "pie_chart_001",
          name: "chart_view",
          arguments: {
            type: "pie",
            title: "Market Share Distribution",
            description: "Company market share across regions",
            data: [
              { region: "North America", share: 35 },
              { region: "Europe", share: 28 },
              { region: "Asia Pacific", share: 25 },
              { region: "Latin America", share: 8 },
              { region: "Africa", share: 4 },
            ],
            categoryKey: "region",
            valueKeys: ["share"],
            config: { items: [{ key: "North America", color: "#FF6B6B", label: "Market Share %" }] },
          },
        },
        // 5. Donut Chart - Circular with total display
        {
          id: "donut_chart_001",
          name: "chart",
          arguments: {
            type: "donut",
            title: "Customer Satisfaction Levels",
            description: "Satisfaction ratings from recent survey (1,000 responses)",
            data: [
              { level: "Excellent", count: 420 },
              { level: "Good", count: 350 },
              { level: "Average", count: 150 },
              { level: "Poor", count: 60 },
              { level: "Terrible", count: 20 },
            ],
            valueKey: "count",
            nameKey: "level",
            showTotal: true,
            config: [{ key: "count", color: "#10B981", label: "Response Count" }],
          },
        },
        // 6. Radial Chart - Circular performance metrics
        {
          id: "radial_chart_001",
          name: "chart",
          arguments: {
            type: "radial",
            title: "Performance Metrics",
            description: "Key performance indicators for Q4 2024",
            data: [
              { metric: "Revenue Growth", score: 85 },
              { metric: "Customer Acquisition", score: 92 },
              { metric: "Product Quality", score: 78 },
              { metric: "Team Satisfaction", score: 88 },
              { metric: "Innovation Index", score: 95 },
            ],
            valueKey: "score",
            nameKey: "metric",
            config: [{ key: "score", color: "#8B5CF6", label: "Score (/100)" }],
          },
        },
        // 7. Single Product Card
        {
          id: "single_product_001",
          name: "product_card",
          arguments: {
            title: "Featured Product",
            description: "Our top-selling item this month",
            products: [
              {
                id: "prod_001",
                name: "Wireless Bluetooth Headphones",
                price: 89.99,
                description: "Premium quality wireless headphones with noise cancellation",
                imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
                stock: 25,
              },
            ],
          },
        },
        // 8. Two Product Cards
        {
          id: "two_products_001",
          name: "product_card",
          arguments: {
            title: "Staff Picks",
            description: "Hand-picked products by our team",
            products: [
              {
                id: "prod_002",
                name: "Smart Fitness Watch",
                price: 199.99,
                description: "Advanced fitness tracking with heart rate monitor",
                imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
                stock: 18,
              },
              {
                id: "prod_003",
                name: "Eco-Friendly Water Bottle",
                price: 24.99,
                description: "Sustainable stainless steel water bottle",
                imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
                stock: 42,
              },
            ],
          },
        },
        // 9. Multiple Product Cards (5 products)
        {
          id: "multiple_products_001",
          name: "product_card",
          arguments: {
            title: "Best Sellers Collection",
            description: "Our most popular products across all categories",
            products: [
              {
                id: "prod_004",
                name: "Professional Coffee Maker",
                price: 149.99,
                description: "Barista-quality coffee at home with programmable settings",
                imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
                stock: 12,
              },
              {
                id: "prod_005",
                name: "Ergonomic Office Chair",
                price: 299.99,
                description: "Comfortable lumbar support chair for long work sessions",
                imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
                stock: 8,
              },
              {
                id: "prod_006",
                name: "Portable Bluetooth Speaker",
                price: 79.99,
                description: "Waterproof speaker with 20-hour battery life",
                imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
                stock: 35,
              },
              {
                id: "prod_007",
                name: "LED Desk Lamp",
                price: 45.99,
                description: "Adjustable brightness with USB charging port",
                imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
                stock: 22,
              },
              {
                id: "prod_008",
                name: "Wireless Phone Charger",
                price: 34.99,
                description: "Fast wireless charging pad compatible with all devices",
                imageUrl: "https://images.unsplash.com/photo-1609592362803-dc7b4ca7ad2c?w=400&h=400&fit=crop",
                stock: 56,
              },
            ],
          },
        },
      ]

      // Text to stream word by word
      const streamingText =
        "Here's a comprehensive showcase of all available components in our AI assistant. I'll demonstrate various chart types including bar charts for sales data, line charts for trends, area charts for revenue growth, pie charts for distributions, donut charts with totals, and radial charts for performance metrics. Additionally, I'll show different product card layouts from single featured items to multiple product collections."

      const words = streamingText.split(" ")
      let wordIndex = 0
      let currentPhase = "initial" // initial, text_streaming, tools, final

      const interval = setInterval(() => {
        if (isControllerClosed) {
          clearInterval(interval)
          return
        }

        try {
          if (currentPhase === "initial") {
            if (step === 0) {
              // First step: Send overall message status as "created"
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    conversation_id: "123",
                    message_id: "msg_123",
                    response_id: "rsp_showcase_all",
                    type: "message",
                    status: "created",
                  })}\n\n`,
                ),
              )
              step++
              return
            }

            if (step === 1) {
              // Second step: Send overall message status as "in_progress"
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    conversation_id: "123",
                    message_id: "msg_123",
                    response_id: "rsp_showcase_all",
                    type: "message",
                    status: "in_progress",
                  })}\n\n`,
                ),
              )
              step++
              currentPhase = "text_streaming"
              return
            }
          }

          if (currentPhase === "text_streaming") {
            if (wordIndex < words.length) {
              // Stream individual words
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    conversation_id: "123",
                    message_id: "msg_123",
                    response_id: "rsp_text_stream",
                    type: "text",
                    status: "in_progress",
                    content: words[wordIndex] + " ",
                  })}\n\n`,
                ),
              )
              wordIndex++
              return
            } else {
              // Text streaming completed, move to tools
              currentPhase = "tools"
              step = 0 // Reset step counter for tools
              return
            }
          }

          if (currentPhase === "tools") {
            // Each tool goes through 3 phases: created, in_progress, completed
            const toolIndex = Math.floor(step / 3)
            const phase = step % 3

            if (toolIndex >= toolResponses.length) {
              // All tools completed, move to final phase
              currentPhase = "final"
              step = 0
              return
            }

            const currentTool = toolResponses[toolIndex]
            const baseResponse = {
              conversation_id: "123",
              message_id: "msg_123",
              response_id: `rsp_${currentTool.id}`,
              type: "tool_call",
              status: "in_progress", // Overall message is still in progress
            }

            if (phase === 0) {
              // Tool status: created
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    ...baseResponse,
                    tool_call: {
                      id: currentTool.id,
                      name: currentTool.name,
                      status: "created",
                      arguments: "",
                    },
                  })}\n\n`,
                ),
              )
            } else if (phase === 1) {
              // Tool status: in_progress
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    ...baseResponse,
                    tool_call: {
                      id: currentTool.id,
                      name: currentTool.name,
                      status: "in_progress",
                      arguments: "",
                    },
                  })}\n\n`,
                ),
              )
            } else if (phase === 2) {
              // Tool status: completed with full arguments
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    ...baseResponse,
                    tool_call: {
                      id: currentTool.id,
                      name: currentTool.name,
                      status: "completed",
                      arguments: JSON.stringify(currentTool.arguments),
                    },
                  })}\n\n`,
                ),
              )
            }

            step++
            return
          }

          if (currentPhase === "final") {
            // Send final overall message status as "completed"
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  conversation_id: "123",
                  message_id: "msg_123",
                  response_id: "rsp_showcase_all",
                  type: "message",
                  status: "completed",
                })}\n\n`,
              ),
            )

            // End stream properly
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
            cleanup()
            clearInterval(interval)
            try {
              if (!isControllerClosed) {
                controller.close()
              }
            } catch (closeError) {
              console.error("Error closing controller:", closeError)
            }
            return
          }
        } catch (error) {
          console.error("Stream error:", error)
          cleanup()
          clearInterval(interval)
          try {
            if (!isControllerClosed) {
              controller.error(error)
            }
          } catch (errorHandlingError) {
            console.error("Error handling error:", errorHandlingError)
          }
        }
      }, 200) // Faster intervals for smoother text streaming

      return () => {
        cleanup()
        clearInterval(interval)
      }
    },

    cancel() {
      console.log("Stream cancelled by client")
    },
  })

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
