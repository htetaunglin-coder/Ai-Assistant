import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { messages } = await req.json()
  const userInput = messages?.[0]?.content || ""

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      let step = 0
      let isControllerClosed = false

      const cleanup = () => {
        isControllerClosed = true
      }

      const interval = setInterval(() => {
        if (isControllerClosed) {
          clearInterval(interval)
          return
        }

        try {
          if (step === 0) {
            // Status: created (empty string for loading state)
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  id: "123",
                  message_id: "2",
                  resp_id: "resp_tool_donut_001",
                  type: "tool_call",
                  status: "created",
                  tool_call: {
                    id: "call_donut_symptoms",
                    name: "chart",
                    arguments: "",
                  },
                })}\n\n`,
              ),
            )
          } else if (step === 1) {
            // Status: in_progress (still empty string)
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  id: "123",
                  message_id: "2",
                  resp_id: "resp_tool_donut_001",
                  type: "tool_call",
                  status: "in_progress",
                  tool_call: {
                    id: "call_donut_symptoms",
                    name: "chart",
                    arguments: "",
                  },
                })}\n\n`,
              ),
            )
          } else if (step === 2) {
            // Status: completed with stringified arguments object only
            const argumentsData = {
              type: "pie",
              title: "Symptom Distribution",
              description: "Distribution of reported symptoms by severity",
              dataKey: "severity",
              showTotal: true,
              data: [
                { symptom: "Fever", severity: 35, fill: "#FF6B6B" },
                { symptom: "Fatigue", severity: 28, fill: "#4ECDC4" },
                { symptom: "Headache", severity: 22, fill: "#45B7D1" },
                { symptom: "Sore Throat", severity: 10, fill: "#96CEB4" },
                { symptom: "Appetite Loss", severity: 5, fill: "#FFEAA7" },
              ],
            }

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  id: "123",
                  message_id: "2",
                  resp_id: "resp_tool_donut_001",
                  type: "tool_call",
                  status: "completed",
                  tool_call: {
                    id: "call_donut_symptoms",
                    name: "chart",
                    arguments: JSON.stringify(argumentsData),
                  },
                })}\n\n`,
              ),
            )
          } else {
            // End stream
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
            cleanup()
            clearInterval(interval)
            if (!isControllerClosed) {
              controller.close()
            }
            return
          }

          step++
        } catch (error) {
          console.error("Stream error:", error)
          cleanup()
          clearInterval(interval)
          if (!isControllerClosed) {
            controller.error(error)
          }
        }
      }, 800) // 800ms between each status

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
