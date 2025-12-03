import mqtt, { MqttClient } from "mqtt";
import { MQTTMessageHandler } from "../types";

let client: MqttClient | null = null;

export const connectMQTT = (
  brokerUrl: string,
  port: number,
  onMessage: MQTTMessageHandler
): MqttClient => {
  // Don't create a new connection if already connected
  if (client && client.connected) {
    console.log("Already connected to MQTT broker");
    return client;
  }

  const url = `mqtt://${brokerUrl}:${port}`;

  console.log("Connecting to MQTT broker:", url);

  client = mqtt.connect(url, {
    clientId: `ESP32_Datacentersecurity`,
    keepalive: 60,
    clean: true,
    reconnectPeriod: 5000, // Changed from 1000 to 5000ms
    connectTimeout: 30000, // 30 second timeout
  });

  client.on("connect", () => {
    console.log("✓ Connected to MQTT broker");

    // Subscribe ONLY to motion sensor topic
    client?.subscribe("datacenter/motion", (err) => {
      if (!err) {
        console.log("✓ Subscribed to motion sensor");
      } else {
        console.error("Failed to subscribe to motion:", err);
      }
    });
  });

  client.on("error", (error) => {
    console.error("MQTT Error:", error.message);
  });

  client.on("message", (topic: string, message: Buffer) => {
    try {
      const data = JSON.parse(message.toString());
      console.log("Message received:", topic, data);
      onMessage(topic, data);
    } catch (error) {
      console.error("Error parsing MQTT message:", error);
    }
  });

  client.on("offline", () => {
    console.log("MQTT client offline");
  });

  client.on("reconnect", () => {
    console.log("Reconnecting to MQTT broker...");
  });

  client.on("close", () => {
    console.log("MQTT connection closed");
  });

  return client;
};

export const disconnectMQTT = (): void => {
  if (client) {
    client.end(true); // Force close
    client = null;
    console.log("Disconnected from MQTT broker");
  }
};

export const isConnected = (): boolean => {
  return client !== null && client.connected;
};
