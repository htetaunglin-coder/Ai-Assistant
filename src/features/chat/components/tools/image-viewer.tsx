/* eslint-disable @next/next/no-img-element */
import React from "react"
import { Camera, Download } from "lucide-react"
import { PhotoProvider, PhotoView } from "react-photo-view"
import "react-photo-view/dist/react-photo-view.css"
import { ToolCall } from "../../types"
import { Spinner } from "../ui/spinner"
import { StatusDisplay } from "../ui/status-display"

type ImageData = {
  id: string | number
  src: string
  alt: string
  width?: number
  height?: number
}

type ImagesData = {
  images: ImageData[]
}

type ImageViwerProps = {
  tool: ToolCall
}

const ImageViewer: React.FC<ImageViwerProps> = ({ tool }: ImageViwerProps) => {
  const images = tool.arguments && typeof tool.arguments === "object" ? (tool.arguments as ImagesData).images : []

  if (tool.status === "in_progress" || tool.status === "created") {
    return <StatusDisplay status="in_progress" title="Loading Products" description="Fetching product information..." />
  }

  if (tool.status === "completed" && !images.length) return <StatusDisplay status="error" title="No products found" />

  if (!images?.length) return

  const maxVisible = 4
  const visibleImages = images.slice(0, maxVisible)
  const remainingCount = images.length - maxVisible
  const hasMoreImages = remainingCount > 0

  return (
    <PhotoProvider
      speed={() => 300}
      maskOpacity={0.9}
      maskClosable
      photoClosable
      pullClosable
      loop={false}
      toolbarRender={({ index }) => {
        const currentImage = images[index]

        return (
          <>
            <button
              className="PhotoView-Slider__toolbarIcon"
              onClick={async (e) => {
                e.preventDefault()
                e.stopPropagation()

                if (currentImage) {
                  try {
                    const response = await fetch(currentImage.src)
                    const blob = await response.blob()

                    const url = window.URL.createObjectURL(blob)

                    const link = document.createElement("a")
                    link.style.display = "none"
                    link.href = url
                    link.download = currentImage.alt || "image"

                    link.target = "_blank"
                    link.rel = "noopener noreferrer"

                    document.body.appendChild(link)
                    link.click()

                    setTimeout(() => {
                      document.body.removeChild(link)
                      window.URL.revokeObjectURL(url)
                    }, 100)
                  } catch (error) {
                    console.error("Download failed:", error)
                    // Fallback: open in new tab
                    window.open(currentImage.src, "_blank")
                  }
                }
              }}
              title="Download image">
              <Download size={22} />
            </button>
          </>
        )
      }}
      brokenElement={
        <div className="group w-full transition-colors">
          <div className="flex flex-col items-center space-y-3 p-4 text-center">
            <div className="rounded-full bg-gray-200 p-3 transition-colors group-hover:bg-gray-300">
              <Camera className="size-6 text-gray-500" />
            </div>

            <div className="space-y-2">
              <p className="font-medium text-neutral-100">Image not available</p>
              <p className="max-w-xs text-xs text-neutral-300">
                The image could not be loaded. This might be due to network issues or the file being moved.
              </p>
            </div>
          </div>
        </div>
      }
      loadingElement={<Spinner size={40} color="hsl(var(--mijnui-primary))" />}>
      <style>
        {`
        .PhotoView-Slider__BannerWrap {
          background-color: hsl(var(--mijnui-secondary));
          padding: 1rem 2rem;
          height: 48px;
        }
       
        .PhotoView-Slider__ArrowLeft svg,
        .PhotoView-Slider__ArrowRight svg {
          background: hsl(var(--mijnui-secondary));
          border-radius: 999px;
        }
      `}
      </style>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {visibleImages.map((image, index) => {
          const isLastImage = index === maxVisible - 1
          const shouldShowOverlay = hasMoreImages && isLastImage

          return (
            <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <PhotoView src={image.src} width={image.width} height={image.height}>
                <div className="group/image-viewer z-10 size-full cursor-pointer">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="pointer-events-none size-full object-cover transition-transform group-hover/image-viewer:scale-105"
                    loading={index === 0 ? "eager" : "lazy"}
                    draggable={false}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = `data:image/svg+xml,${encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
                          <rect width="400" height="300" fill="#f3f4f6"/>
                          <text x="200" y="150" text-anchor="middle" dy="0.3em" font-family="sans-serif" font-size="14" fill="#9ca3af">
                            Image failed to load
                          </text>
                        </svg>
                      `)}`
                    }}
                  />

                  {shouldShowOverlay && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                      <div className="text-center text-white">
                        <div className="mb-1 text-2xl font-bold">+{remainingCount}</div>
                        <div className="text-sm opacity-90">more</div>
                      </div>
                    </div>
                  )}

                  {!shouldShowOverlay && (
                    <div className="pointer-events-none absolute inset-0 flex items-end justify-start bg-black/0 p-3 opacity-0 transition-colors group-hover/image-viewer:bg-black/10 group-hover/image-viewer:opacity-100">
                      <span className="rounded bg-black/50 px-1.5 py-0.5 text-xs text-white backdrop-blur-sm">
                        {index + 1} / {images.length}
                      </span>
                    </div>
                  )}
                </div>
              </PhotoView>
            </div>
          )
        })}
      </div>

      {/* Keyboard Shortcuts Help (Optional overlay) */}
      <style jsx global>{`
        .react-photo-view-backdrop {
          backdrop-filter: blur(8px);
        }

        /* Custom scrollbar for info panel */
        .react-photo-view-backdrop *::-webkit-scrollbar {
          width: 6px;
        }

        .react-photo-view-backdrop *::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .react-photo-view-backdrop *::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        .react-photo-view-backdrop *::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </PhotoProvider>
  )
}

export default ImageViewer
export type { ImageData, ImageViwerProps }
