interface SpinnerProps {
  size?: number | string
  color?: string
  speed?: string
  trackOpacity?: number
  strokeWidth?: number
  className?: string
  style?: React.CSSProperties
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 40,
  color = "#000000",
  speed = "2s",
  trackOpacity = 0,
  strokeWidth = 5,
  className = "",
  style = {},
}) => {
  // Convert size to string with px if it's a number
  const sizeValue = typeof size === "number" ? `${size}px` : size

  const containerStyle: React.CSSProperties = {
    "--uib-size": sizeValue,
    "--uib-color": color,
    "--uib-speed": speed,
    "--uib-bg-opacity": trackOpacity,
    height: sizeValue,
    width: sizeValue,
    transformOrigin: "center",
    animation: `rotate ${speed} linear infinite`,
    willChange: "transform",
    overflow: "visible",
    ...style,
  } as React.CSSProperties

  return (
    <>
      <style>{`
        @keyframes rotate {
          100% {
            transform: rotate(360deg);
          }
        }
        
        @keyframes stretch {
          0% {
            stroke-dasharray: 0, 150;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 75, 150;
            stroke-dashoffset: -25;
          }
          100% {
            stroke-dashoffset: -100;
          }
        }
      `}</style>

      <svg
        className={`spinner-container ${className}`}
        viewBox="0 0 40 40"
        height={sizeValue}
        width={sizeValue}
        style={containerStyle}>
        <circle
          className="spinner-track"
          cx="20"
          cy="20"
          r="17.5"
          pathLength="100"
          strokeWidth={`${strokeWidth}px`}
          fill="none"
          stroke={color}
          opacity={trackOpacity}
          style={{
            transition: "stroke 0.5s ease",
          }}
        />
        <circle
          className="spinner-car"
          cx="20"
          cy="20"
          r="17.5"
          pathLength="100"
          strokeWidth={`${strokeWidth}px`}
          fill="none"
          stroke={color}
          strokeDasharray="1, 200"
          strokeDashoffset="0"
          strokeLinecap="round"
          style={{
            animation: `stretch calc(${speed} * 0.75) ease-in-out infinite`,
            willChange: "stroke-dasharray, stroke-dashoffset",
            transition: "stroke 0.5s ease",
          }}
        />
      </svg>
    </>
  )
}

export { Spinner }
