"use client"

import { lazy } from "react"
import { chartSchema } from "./chart-view"
import { imageViewSchema } from "./image-view"
import { productViewSchema } from "./product-view"
import { statusViewSchema } from "./status-view"

export const toolRegistry = {
  chart_view: {
    schema: chartSchema,
    component: lazy(() => import("./chart-view")),
    loadingMessages: {
      title: "Generating Chart...",
      description: "Creating visualization from your data...",
    },
  },

  image_view: {
    schema: imageViewSchema,
    component: lazy(() => import("./image-view")),
    loadingMessages: {
      title: "Loading Images...",
      description: "Fetching image information...",
    },
  },

  product_view: {
    schema: productViewSchema,
    component: lazy(() => import("./product-view")),
    loadingMessages: {
      title: "Loading Products...",
      description: "Fetching product information...",
    },
  },
  status_view: {
    schema: statusViewSchema,
    component: lazy(() => import("./status-view")),
    loadingMessages: {
      title: "Updating Status...",
      description: "Please wait while the status is being updated...",
    },
  },
}

export type ToolName = keyof typeof toolRegistry
