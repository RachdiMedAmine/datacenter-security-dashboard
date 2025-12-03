export type SensorType = "temperature" | "humidity" | "motion" | "gas";

export type SensorStatus =
  | "OPTIMAL"
  | "CLEAR"
  | "SAFE"
  | "LOW"
  | "HIGH"
  | "WARNING"
  | "CRITICAL"
  | "DETECTED"
  | "UNKNOWN";

export type SensorColor = "normal" | "warning" | "critical" | "detected";

export interface SensorValue {
  value: number | boolean;
  lastUpdate: number | null;
}

export interface SensorData {
  temperature: SensorValue;
  humidity: SensorValue;
  motion: SensorValue;
  gas: SensorValue;
}

export interface SensorStatusInfo {
  status: SensorStatus;
  color: SensorColor;
}

export interface MQTTMessage {
  alert?: string;
  value?: number;
  location?: string;
  timestamp?: number;
  message?: string;
  door?: "OPEN" | "CLOSED";
  manual?: boolean;
}

export interface DoorStatus {
  state: "OPEN" | "CLOSED" | "UNKNOWN";
  isManual: boolean;
}

export type MQTTMessageHandler = (topic: string, data: MQTTMessage) => void;
