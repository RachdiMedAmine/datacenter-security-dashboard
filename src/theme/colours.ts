interface ColorSet {
  normal: string;
  warning: string;
  critical: string;
  glow: string;
}

interface MotionColors {
  normal: string;
  detected: string;
  glow: string;
}

interface Colors {
  background: string;
  cardBackground: string;
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
  temperature: ColorSet;
  humidity: ColorSet;
  motion: MotionColors;
  gas: ColorSet;
}

export const colors: Colors = {
  background: "#0a0e27",
  cardBackground: "rgba(15, 23, 42, 0.8)",
  primary: "#00f5ff",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  text: "#e2e8f0",
  textSecondary: "#94a3b8",
  border: "rgba(0, 245, 255, 0.2)",
  shadow: "rgba(0, 0, 0, 0.5)",

  temperature: {
    normal: "#10b981",
    warning: "#f59e0b",
    critical: "#ef4444",
    glow: "rgba(16, 185, 129, 0.3)",
  },
  humidity: {
    normal: "#3b82f6",
    warning: "#f59e0b",
    critical: "#ef4444",
    glow: "rgba(59, 130, 246, 0.3)",
  },
  motion: {
    normal: "#10b981",
    detected: "#ef4444",
    glow: "rgba(239, 68, 68, 0.5)",
  },
  gas: {
    normal: "#10b981",
    warning: "#f59e0b",
    critical: "#ef4444",
    glow: "rgba(245, 158, 11, 0.3)",
  },
};
