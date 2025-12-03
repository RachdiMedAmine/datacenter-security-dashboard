import { MQTTMessageHandler } from "../types";

// @ts-ignore - react-native-mqtt doesn't have types
import MQTT from "react-native-mqtt";

let client: any = null;

export const connectMQTT = (
  brokerUrl: string,
  port: number,
  onMessage: MQTTMessageHandler
): any => {
  if (client && client.connected) {
    console.log("Already connected to MQTT broker");
    return client;
  }

  console.log(`Connecting to MQTT broker: ${brokerUrl}:${port}`);

  MQTT.createClient({
    uri: `mqtt://${brokerUrl}:${port}`,
    clientId: `datacenter_mobile_${Math.random().toString(16).substr(2, 8)}`,
  })
    .then((mqttClient: any) => {
      client = mqttClient;

      client.on("closed", () => {
        console.log("⚠️ MQTT connection closed");
      });

      client.on("error", (msg: string) => {
        console.error("❌ MQTT Error:", msg);
      });

      client.on("message", (msg: any) => {
        try {
          const data = JSON.parse(msg.data);
          console.log("✓ Message received:", msg.topic, data);
          onMessage(msg.topic, data);
        } catch (error) {
          console.error("❌ Error parsing message:", error);
        }
      });

      client.on("connect", () => {
        console.log("✓ Connected to MQTT broker!");

        client.subscribe("datacenter/motion", 0);
        console.log("✓ Subscribed to datacenter/motion");
      });

      client.connect();
    })
    .catch((err: any) => {
      console.error("❌ Failed to create MQTT client:", err);
    });

  return client;
};

export const disconnectMQTT = (): void => {
  if (client) {
    client.disconnect();
    client = null;
    console.log("✓ Disconnected from MQTT broker");
  }
};

export const isConnected = (): boolean => {
  return client !== null && client.connected;
};
