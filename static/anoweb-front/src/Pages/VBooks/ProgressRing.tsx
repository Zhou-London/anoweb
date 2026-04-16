import type { ReactNode } from "react";

type ProgressRingProps = {
  size: number;
  strokeWidth: number;
  progress: number;
  color?: string;
  children?: ReactNode;
  className?: string;
};

export default function ProgressRing({
  size,
  strokeWidth,
  progress,
  color,
  children,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 100);
  const offset = circumference - (clamped / 100) * circumference;
  const center = size / 2;

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="absolute inset-0">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--gb-bg-muted)"
          strokeWidth={strokeWidth}
        />
        {clamped > 0 && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color ?? "var(--gb-accent)"}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        )}
      </svg>
      {children}
    </div>
  );
}
