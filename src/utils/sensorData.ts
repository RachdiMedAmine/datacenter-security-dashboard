import { SensorStatusInfo, SensorType } from "../types";

export const getSensorStatus = (
  type: SensorType,
  value: number | boolean
): SensorStatusInfo => {
  switch (type) {
    case "temperature":
      if (typeof value === "number") {
        if (value < 18) return { status: "LOW", color: "warning" };
        if (value > 27) return { status: "HIGH", color: "critical" };
        return { status: "OPTIMAL", color: "normal" };
      }
      return { status: "UNKNOWN", color: "normal" };

    case "humidity":
      if (typeof value === "number") {
        if (value < 30) return { status: "LOW", color: "warning" };
        if (value > 60) return { status: "HIGH", color: "critical" };
        return { status: "OPTIMAL", color: "normal" };
      }
      return { status: "UNKNOWN", color: "normal" };

    case "motion":
      return value
        ? { status: "DETECTED", color: "detected" }
        : { status: "CLEAR", color: "normal" };

    case "gas":
      if (typeof value === "number") {
        if (value > 1000) return { status: "CRITICAL", color: "critical" };
        if (value > 500) return { status: "WARNING", color: "warning" };
        return { status: "SAFE", color: "normal" };
      }
      return { status: "UNKNOWN", color: "normal" };

    default:
      return { status: "UNKNOWN", color: "normal" };
  }
};

export const getSensorIcon = (type: SensorType): string => {
  const icons: Record<SensorType, string> = {
    temperature: "thermometer",
    humidity: "water",
    motion: "eye",
    gas: "alert-circle",
  };
  return icons[type];
};

export const getSensorUnit = (type: SensorType): string => {
  const units: Record<SensorType, string> = {
    temperature: "°C",
    humidity: "%",
    motion: "",
    gas: "ppm",
  };
  return units[type];
};
