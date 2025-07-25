import { useChatStore } from "../stores/use-chat-store"
import { FormEventHandler, useCallback } from "react"

export const useChat = () => {
  const { messages, status, input, setInput, addMessage, updateLastMessage, setStatus, setError } = useChatStore()

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      event.preventDefault()

      if (!input || status === "streaming") {
        return
      }

      const currentInput = input

      // Add user message and the assistant's placeholder in one go
      addMessage({ role: "user", content: currentInput })
      addMessage({ role: "assistant", content: "" })
      setStatus("streaming")
      setInput("")

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: currentInput }),
        })

        if (!response.ok || !response.body) {
          const errorText = await response.text()
          throw new Error(`API Error: ${response.statusText} - ${errorText}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            setStatus("ready")
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n").filter((line) => line.trim() !== "")

          // for (const line of lines) {
          //   const message = line.replace(/^data: /, "")
          //   if (message === "[DONE]") {
          //     setStatus("ready")
          //     return // End of stream
          //   }
          //   try {
          //     const parsed = JSON.parse(message)
          //     console.log("[OpenAI Stream Chunk]:", parsed);
              
          //     const content = parsed.data.delta 
          //     if (content) {
          //       updateLastMessage(content)
          //     }
          //   } catch (error) {
          //     console.error("Could not parse JSON chunk:", message, error)
          //   }
          // }
            for (const line of lines) {
              const message = line.replace(/^data: /, "")
              if (message === "[DONE]") {
                setStatus("ready")
                return // End of stream
              }
              try {
                const data = JSON.parse(message)
                if (data.type === "response.output_text.delta") {
                  const rawMarkdown = data.delta ?? ""
                  if (rawMarkdown) {
                    updateLastMessage(rawMarkdown)
                  }
                } else if (data.type === "response.created") {
                  // You can handle response.created here if needed, e.g. store previous_response_id
                  // const previous_response_id = data.response.id
                }
              } catch (error) {
                console.error("Could not parse JSON chunk:", message, error)
              }
            }
        }
      } catch (error) {
        const errorMessage = `Sorry, I encountered an error: ${error instanceof Error ? error.message : String(error)}`
        setError(errorMessage)
      }
    },
    [input, status, addMessage, setStatus, setInput, updateLastMessage, setError],
  )

  return {
    messages,
    status,
    input,
    setInput,
    handleSubmit,
  }
}
