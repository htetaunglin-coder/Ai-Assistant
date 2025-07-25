// src/lib/config/getLlmConfig.ts

import { LlmConfigResponse } from "../types/llm";

export async function getLlmConfiguration(): Promise<LlmConfigResponse> {
     const response = await fetch("https://mcp.picosbs.com/api/v1/mcp/client/info/openai", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${process.env.picosbs_llm_api_key}`,
      }
    })
    console.log(response);

    return response.json();
}