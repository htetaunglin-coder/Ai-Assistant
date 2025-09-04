import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { messages } = await req.json()
  const userInput = messages?.[0]?.content || ""

  const paragraph =
    "The patient has reported symptoms including fever, headache, and fatigue.\n\n" +
    "Based on these inputs, the system is preparing a structured recommendation.\n\n" +
    "This response includes suggested medicines, dosage instructions, and self-care advice.\n\n" +
    "If the condition does not improve within a few days, consultation with a licensed medical professional is strongly advised.\n"

  const words = paragraph.split(" ")

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      let step = 0
      let isControllerClosed = false

      const cleanup = () => {
        isControllerClosed = true
      }

      const interval = setInterval(() => {
        // Check if controller is closed before each operation
        if (isControllerClosed) {
          clearInterval(interval)
          return
        }

        try {
          if (step === 0) {
            // Initial status: created (for text)
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  id: "123",
                  message_id: "2",
                  resp_id: `resp_${crypto.randomUUID().replace(/-/g, "")}`,
                  type: "text",
                  status: "created",
                  content: "",
                })}\n\n`,
              ),
            )
          } else if (step <= words.length) {
            // Stream text word by word - ONLY THE CURRENT WORD (delta)
            const currentWord = words[step - 1] + (step < words.length ? " " : "")
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  id: "123",
                  message_id: "2",
                  resp_id: `resp_${crypto.randomUUID().replace(/-/g, "")}`,
                  type: "text",
                  status: "in_progress",
                  content: currentWord, // Only current word, not cumulative
                })}\n\n`,
              ),
            )
          } else if (step === words.length + 1) {
            // Text completed signal
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  id: "123",
                  message_id: "2",
                  resp_id: `resp_${crypto.randomUUID().replace(/-/g, "")}`,
                  type: "text",
                  status: "in_progress",
                  content: "", // Empty for completion signal
                })}\n\n`,
              ),
            )
          } else if (step === words.length + 2) {
            // Artifact initial: created
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  id: "123",
                  message_id: "2",
                  resp_id: "resp_artifact_001",
                  type: "artifact",
                  status: "in_progress",
                  artifact: {
                    id: "simple-calculator",
                    title: "Web Page",
                    content: "",
                    name: "code",
                    status: "created",
                    language: "html",
                  },
                })}\n\n`,
              ),
            )
          } else {
            // Stream artifact content
            const artifact = SIMPLE_EXAMPLES.text
            const artifactWords = artifact.content.split(" ") // Split by spaces only
            const wordIndex = step - (words.length + 3)

            if (wordIndex < artifactWords.length) {
              // Send ONLY the current word (delta chunk)
              const currentWord = artifactWords[wordIndex] + (wordIndex < artifactWords.length - 1 ? " " : "")

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    id: "123",
                    message_id: "2",
                    resp_id: "resp_artifact_001",
                    type: "artifact",
                    status: "in_progress",
                    artifact: {
                      id: "simple-calculator",
                      name: artifact.name,
                      title: artifact.title,
                      content: currentWord, // ONLY current word
                      status: "in_progress",
                      language: artifact.language,
                    },
                  })}\n\n`,
                ),
              )
            } else {
              // Final completed signal - empty content
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    id: "123",
                    message_id: "2",
                    resp_id: "resp_artifact_001",
                    type: "artifact",
                    status: "in_progress",
                    artifact: {
                      id: "simple-calculator",
                      name: artifact.name,
                      title: artifact.title,
                      content: "", // Empty content for completion signal
                      status: "completed", // Mark as completed
                      language: artifact.language,
                    },
                  })}\n\n`,
                ),
              )

              // Send final done signal and cleanup
              controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
              cleanup()
              clearInterval(interval)

              // Close controller safely
              if (!isControllerClosed) {
                controller.close()
              }
              return
            }
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
      }, 100) // 100ms per chunk

      // Handle stream cancellation
      return () => {
        cleanup()
        clearInterval(interval)
      }
    },

    cancel() {
      // This gets called when the client cancels the stream
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

export const SIMPLE_EXAMPLES = {
  htmlCode: {
    language: "html",
    title: "Web Page",
    name: "code",
    content: `<!DOCTYPE html>
<html>
<head>
    <title>Simple Calculator</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .calculator { max-width: 300px; margin: 0 auto; }
        button { width: 60px; height: 60px; margin: 5px; font-size: 18px; }
        input { width: 280px; height: 40px; font-size: 20px; text-align: right; }
    </style>
</head>
<body>
    <div class="calculator">
        <input type="text" id="display" readonly>
        <br>
        <button onclick="clearDisplay()">C</button>
        <button onclick="appendToDisplay('/')">/</button>
        <button onclick="appendToDisplay('*')">*</button>
        <button onclick="deleteLast()">←</button>
        <br>
        <button onclick="appendToDisplay('7')">7</button>
        <button onclick="appendToDisplay('8')">8</button>
        <button onclick="appendToDisplay('9')">9</button>
        <button onclick="appendToDisplay('-')">-</button>
        <br>
        <button onclick="appendToDisplay('4')">4</button>
        <button onclick="appendToDisplay('5')">5</button>
        <button onclick="appendToDisplay('6')">6</button>
        <button onclick="appendToDisplay('+')">+</button>
        <br>
        <button onclick="appendToDisplay('1')">1</button>
        <button onclick="appendToDisplay('2')">2</button>
        <button onclick="appendToDisplay('3')">3</button>
        <button onclick="calculate()" rowspan="2">=</button>
        <br>
        <button onclick="appendToDisplay('0')" colspan="2">0</button>
        <button onclick="appendToDisplay('.')">.</button>
    </div>
    <script>
        function appendToDisplay(value) {
            document.getElementById('display').value += value;
        }
        function clearDisplay() {
            document.getElementById('display').value = '';
        }
        function deleteLast() {
            const display = document.getElementById('display');
            display.value = display.value.slice(0, -1);
        }
        function calculate() {
            const display = document.getElementById('display');
            try {
                display.value = eval(display.value);
            } catch (error) {
                display.value = 'Error';
            }
        }
    </script>
</body>
</html>`,
  },
  pythonCode: {
    name: "code",
    language: "python",
    title: "Python Script",
    content: `def fibonacci(n):
    """Generate Fibonacci sequence up to n terms"""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]
    
    sequence = [0, 1]
    for i in range(2, n):
        sequence.append(sequence[i-1] + sequence[i-2])
    
    return sequence

# Example usage
if __name__ == "__main__":
    terms = 10
    result = fibonacci(terms)
    print(f"First {terms} Fibonacci numbers: {result}")`,
  },

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
