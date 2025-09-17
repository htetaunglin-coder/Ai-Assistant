import { NextResponse } from "next/server"

// Define artifact content (from previous mock)
const SIMPLE_EXAMPLES = {
  text: {
    name: "text",
    language: "text",
    title: "Prescription Recommendation",
    content: `
# Prescription Recommendation

**Patient Symptoms (Reported by User):**
- Fever (38.5°C)
- Headache
- Fatigue
- Mild sore throat
- Reduced appetite

---

## Preliminary Assessment

The symptoms suggest a **mild viral infection**, most likely seasonal flu. No signs of severe respiratory distress or complications were reported. Current condition is **non-critical** but requires monitoring.

---

## Recommended Medicines

1. **Paracetamol 500mg**
   - Dosage: 1 tablet every 6 hours (maximum 4 tablets/day)
   - Purpose: Reduces fever and relieves headache/body ache
2. **ORS (Oral Rehydration Solution)**
   - Dosage: Sip small amounts frequently, especially after sweating or loss of appetite
   - Purpose: Prevents dehydration
3. **Vitamin C (500mg)**
   - Dosage: 1 tablet daily
   - Purpose: Supports immune system recovery

---

## Home Care Instructions

- Drink **2–3 liters of water daily** to stay hydrated
- Take **light, nutritious meals** (soups, fruits, easily digestible foods)
- Get **adequate rest** — at least 7–9 hours of sleep
- Monitor body temperature every 6–8 hours

---

## Warning Signs (Seek Medical Attention If...)

- Fever exceeds **39.5°C**
- Shortness of breath or chest pain
- Severe sore throat with difficulty swallowing
- Symptoms persist beyond **5 days** without improvement

---
⚠️ **Important Disclaimer:**

This is an AI system-generated suggestion based on reported symptoms.
It is **not a substitute for professional medical advice**.
Always consult a licensed healthcare provider before starting or changing any treatment.
    `,
  },
}

export async function POST(req: Request) {
  const { messages } = await req.json()
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      let step = 0
      let isControllerClosed = false
      const cleanup = () => {
        isControllerClosed = true
      }

      // Define all tool responses
      const toolResponses: Array<{
        id: string
        name: string
        arguments: Record<string, any>
      }> = [
        // [Existing toolResponses array unchanged]
        {
          id: "bar_chart_001",
          name: "chart",
          arguments: {
            type: "bar",
            title: "Monthly Sales Performance",
            description: "Sales data across different product categories",
            data: [
              { category: "Electronics", revenue: 50000 },
              { category: "Clothing", revenue: 40000 },
              { category: "Books", revenue: 25000 },
              { category: "Sports", revenue: 35000 },
              { category: "Home", revenue: 42000 },
            ],
            categoryKey: "category",
            valueKeys: ["revenue"],
            config: {
              series: [{ key: "revenue", color: "#10B981", label: "Revenue ($)" }],
            },
          },
        },
        {
          id: "bar_chart_002",
          name: "chart",
          arguments: {
            type: "bar",
            title: "Monthly Sales Comparison",
            description: "Units sold vs revenue by category",
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
        {
          id: "bar_chart_003",
          name: "chart",
          arguments: {
            type: "bar",
            title: "Stacked Monthly Sales",
            description: "Combined sales and revenue by category",
            data: [
              { category: "Electronics", sales: 45000, revenue: 50000 },
              { category: "Clothing", sales: 32000, revenue: 40000 },
              { category: "Books", sales: 18000, revenue: 25000 },
              { category: "Sports", sales: 28000, revenue: 35000 },
              { category: "Home", sales: 35000, revenue: 42000 },
            ],
            categoryKey: "category",
            valueKeys: ["sales", "revenue"],
            stacked: true,
            config: {
              series: [
                { key: "sales", color: "#3B82F6", label: "Units Sold" },
                { key: "revenue", color: "#10B981", label: "Revenue ($)" },
              ],
            },
          },
        },
        {
          id: "bar_chart_004",
          name: "chart",
          arguments: {
            type: "bar",
            title: "Quarterly Sales by Group",
            description: "Product and service sales by quarter",
            data: [
              { quarter: "Q1", productA: 1200, productB: 800, serviceA: 600, serviceB: 400 },
              { quarter: "Q2", productA: 1500, productB: 900, serviceA: 700, serviceB: 500 },
              { quarter: "Q3", productA: 1800, productB: 1100, serviceA: 800, serviceB: 600 },
              { quarter: "Q4", productA: 2000, productB: 1200, serviceA: 900, serviceB: 700 },
            ],
            categoryKey: "quarter",
            valueKeys: ["productA", "productB", "serviceA", "serviceB"],
            orientation: "vertical",
            stacked: true,
            legend: true,
            stackGroups: {
              products: ["productA", "productB"],
              services: ["serviceA", "serviceB"],
            },
            config: {
              series: [
                { key: "productA", color: "#FF6B6B", label: "Product A ($)" },
                { key: "productB", color: "#4ECDC4", label: "Product B ($)" },
                { key: "serviceA", color: "#FFD166", label: "Service A ($)" },
                { key: "serviceB", color: "#06D6A0", label: "Service B ($)" },
              ],
            },
          },
        },
        {
          id: "bar_chart_005",
          name: "chart",
          arguments: {
            type: "bar",
            title: "Horizontal Revenue Overview",
            description: "Revenue by category (horizontal view)",
            data: [
              { category: "Electronics", revenue: 50000 },
              { category: "Clothing", revenue: 40000 },
              { category: "Books", revenue: 25000 },
              { category: "Sports", revenue: 35000 },
              { category: "Home", revenue: 42000 },
            ],
            categoryKey: "category",
            valueKeys: ["revenue"],
            orientation: "horizontal",
            config: {
              series: [{ key: "revenue", color: "#10B981", label: "Revenue ($)" }],
            },
          },
        },
        {
          id: "bar_chart_006",
          name: "chart",
          arguments: {
            type: "bar",
            title: "Horizontal Sales Comparison",
            description: "Units sold vs revenue (horizontal)",
            data: [
              { category: "Electronics", sales: 45000, revenue: 50000 },
              { category: "Clothing", sales: 32000, revenue: 40000 },
              { category: "Books", sales: 18000, revenue: 25000 },
              { category: "Sports", sales: 28000, revenue: 35000 },
              { category: "Home", sales: 35000, revenue: 42000 },
            ],
            categoryKey: "category",
            valueKeys: ["sales", "revenue"],
            orientation: "horizontal",
            config: {
              series: [
                { key: "sales", color: "#3B82F6", label: "Units Sold" },
                { key: "revenue", color: "#10B981", label: "Revenue ($)" },
              ],
            },
          },
        },
        {
          id: "bar_chart_007",
          name: "chart",
          arguments: {
            type: "bar",
            title: "Horizontal Stacked Sales",
            description: "Stacked sales and revenue (horizontal)",
            data: [
              { category: "Electronics", sales: 45000, revenue: 50000 },
              { category: "Clothing", sales: 32000, revenue: 40000 },
              { category: "Books", sales: 18000, revenue: 25000 },
              { category: "Sports", sales: 28000, revenue: 35000 },
              { category: "Home", sales: 35000, revenue: 42000 },
            ],
            categoryKey: "category",
            valueKeys: ["sales", "revenue"],
            stacked: true,
            orientation: "horizontal",
            config: {
              series: [
                { key: "sales", color: "#3B82F6", label: "Units Sold" },
                { key: "revenue", color: "#10B981", label: "Revenue ($)" },
              ],
            },
          },
        },
        {
          id: "bar_chart_008",
          name: "chart",
          arguments: {
            type: "bar",
            title: "Horizontal Grouped Quarterly Sales",
            description: "Grouped product and service sales (horizontal)",
            data: [
              { quarter: "Q1", productA: 1200, productB: 800, serviceA: 600, serviceB: 400 },
              { quarter: "Q2", productA: 1500, productB: 900, serviceA: 700, serviceB: 500 },
              { quarter: "Q3", productA: 1800, productB: 1100, serviceA: 800, serviceB: 600 },
              { quarter: "Q4", productA: 2000, productB: 1200, serviceA: 900, serviceB: 700 },
            ],
            categoryKey: "quarter",
            valueKeys: ["productA", "productB", "serviceA", "serviceB"],
            legend: true,
            stacked: true,
            stackGroups: {
              products: ["productA", "productB"],
              services: ["serviceA", "serviceB"],
            },
            orientation: "horizontal",
            config: {
              series: [
                { key: "productA", color: "#FF6B6B", label: "Product A ($)" },
                { key: "productB", color: "#4ECDC4", label: "Product B ($)" },
                { key: "serviceA", color: "#FFD166", label: "Service A ($)" },
                { key: "serviceB", color: "#06D6A0", label: "Service B ($)" },
              ],
            },
          },
        },

        // Line and Area Charts
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
            categoryKey: "month",
            valueKeys: ["visitors", "pageviews"],
            config: {
              series: [
                { key: "visitors", color: "#8B5CF6", label: "Unique Visitors" },
                { key: "pageviews", color: "#F59E0B", label: "Page Views" },
              ],
            },
            legend: true,
          },
        },
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
            categoryKey: "quarter",
            valueKeys: ["software", "hardware", "services"],
            config: {
              series: [
                { key: "software", color: "#06D6A0", label: "Software Revenue" },
                { key: "hardware", color: "#118AB2", label: "Hardware Revenue" },
                { key: "services", color: "#073B4C", label: "Services Revenue" },
              ],
            },
            legend: true,
          },
        },

        // Circular Charts: Donut and Radial
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
            valueKeys: ["count"],
            categoryKey: "level",
            showTotal: true,
            legend: true,
            config: {
              items: [
                { key: "Excellent", color: "#16A34A" },
                { key: "Good", color: "#4ADE80" },
                { key: "Average", color: "#FACC15" },
                { key: "Poor", color: "#FB923C" },
                { key: "Terrible", color: "#DC2626" },
              ],
            },
          },
        },
        {
          id: "pie_chart_002",
          name: "chart",
          arguments: {
            type: "pie",
            title: "Performance Metrics",
            description: "Key performance indicators for Q4 2024",
            data: [
              { name: "Revenue Growth", score: 85 },
              { name: "Customer Acquisition", score: 92 },
              { name: "Product Quality", score: 78 },
              { name: "Team Satisfaction", score: 88 },
              { name: "Innovation Index", score: 95 },
            ],
            valueKeys: ["score"],
            categoryKey: "name",
            legend: true,
            config: {
              items: [
                { key: "Revenue Growth", color: "#6366F1" },
                { key: "Customer Acquisition", color: "#3B82F6" },
                { key: "Product Quality", color: "#06B6D4" },
                { key: "Team Satisfaction", color: "#10B981" },
                { key: "Innovation Index", color: "#F59E0B" },
              ],
            },
          },
        },

        {
          id: "radial_chart_001",
          name: "chart",
          arguments: {
            type: "radial",
            title: "Performance Metrics",
            description: "Key performance indicators for Q4 2024",
            data: [
              { name: "Revenue Growth", score: 85 },
              { name: "Customer Acquisition", score: 92 },
              { name: "Product Quality", score: 78 },
              { name: "Team Satisfaction", score: 88 },
              { name: "Innovation Index", score: 95 },
            ],
            valueKeys: ["score"],
            categoryKey: "name",
            legend: true,
            config: {
              items: [
                { key: "Revenue Growth", color: "#6366F1" },
                { key: "Customer Acquisition", color: "#3B82F6" },
                { key: "Product Quality", color: "#06B6D4" },
                { key: "Team Satisfaction", color: "#10B981" },
                { key: "Innovation Index", color: "#F59E0B" },
              ],
            },
          },
        },

        // Product Cards: Single, Dual, Multiple
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
        "# Here's a showcase of all tool-call components\n\nThis demo includes various charts, product cards, a table of top-selling products, and a prescription recommendation artifact.\n\n- **Charts:** bar, grouped, stacked, line, area, donut, radial \n- **Products:** single, multiple, staff picks \n- **Table:** quick summary of top-selling products (name, price, units sold, stock)\n- **Artifact:** prescription recommendation based on symptoms\n\n---\n\n## Top Selling Products (Last 30 days)\n\n| Product | Price (USD) | Units Sold | Stock |\n|----------------------------------|-----------:|----------:|------:|\n| Portable Bluetooth Speaker | 79.99 | 1,250 | 35 |\n| Wireless Bluetooth Headphones | 89.99 | 1,120 | 25 |\n| Ergonomic Office Chair | 299.99 | 640 | 8 |\n| Professional Coffee Maker | 149.99 | 520 | 12 |\n| Wireless Phone Charger | 34.99 | 480 | 56 |\n\n---\n"
      const words = streamingText.split(" ")

      // Artifact content to stream
      const artifact = SIMPLE_EXAMPLES.text
      const artifactWords = artifact.content.split(" ")
      let wordIndex = 0
      let artifactWordIndex = 0

      // Add artifact phase to streaming
      let currentPhase: "initial" | "text_streaming" | "tools" | "artifact" | "final" = "initial"

      // Helper to send tool phases
      const sendToolPhase = (toolIndex: number, phase: 0 | 1 | 2) => {
        const currentTool = toolResponses[toolIndex]
        const statuses = ["created", "in_progress", "completed"]
        const baseResponse = {
          conversation_id: "123",
          message_id: "msg_123",
          response_id: `rsp_${currentTool.id}`,
          type: "tool_call",
          status: "in_progress",
        }
        const args = phase === 2 ? JSON.stringify(currentTool.arguments) : ""
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              ...baseResponse,
              tool_call: {
                id: currentTool.id,
                name: currentTool.name,
                status: statuses[phase],
                arguments: args,
              },
            })}\n\n`,
          ),
        )
      }

      // Helper to send artifact phases
      const sendArtifactPhase = (phase: "created" | "in_progress" | "completed") => {
        const artifactResponse = {
          conversation_id: "123",
          message_id: "msg_123",
          response_id: "rsp_artifact_001",
          type: "artifact",
          status: "in_progress",
          artifact: {
            id: "prescription-recommendation",
            name: artifact.name,
            title: artifact.title,
            content: phase === "in_progress" ? artifactWords[artifactWordIndex] + " " : "",
            status: phase,
            language: artifact.language,
          },
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(artifactResponse)}\n\n`))
      }

      const interval = setInterval(
        () => {
          if (isControllerClosed) {
            clearInterval(interval)
            return
          }

          try {
            if (currentPhase === "initial") {
              if (step === 0) {
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
                currentPhase = "tools"
                step = 0
                return
              }
            }

            if (currentPhase === "tools") {
              const toolIndex = Math.floor(step / 3)
              const phase = (step % 3) as 0 | 1 | 2
              if (toolIndex >= toolResponses.length) {
                currentPhase = "artifact"
                step = 0
                return
              }
              sendToolPhase(toolIndex, phase)
              step++
              return
            }

            if (currentPhase === "artifact") {
              if (step === 0) {
                sendArtifactPhase("created")
                step++
                return
              }
              if (step === 1 && artifactWordIndex < artifactWords.length) {
                sendArtifactPhase("in_progress")
                artifactWordIndex++
                return
              }
              if (artifactWordIndex >= artifactWords.length) {
                sendArtifactPhase("completed")
                step++
                return
              }
              if (step > 1) {
                currentPhase = "final"
                step = 0
                return
              }
            }

            if (currentPhase === "final") {
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
              controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
              cleanup()
              clearInterval(interval)
              if (!isControllerClosed) {
                controller.close()
              }
              return
            }
          } catch (error) {
            console.error("Stream error:", error)
            cleanup()
            clearInterval(interval)
            if (!isControllerClosed) {
              controller.error(error)
            }
          }
        },
        50 + Math.random() * 100,
      ) // 150-250ms for varied pacing

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
