import { MQTTMessageHandler } from "../types";

// @ts-ignore
import Paho from "paho-mqtt";

let client: any = null;

export const connectMQTT = (
  brokerUrl: string,
  port: number,
  onMessage: MQTTMessageHandler
): any => {
  if (client && client.isConnected()) {
    console.log("Already connected to MQTT broker");
    return client;
  }

  console.log(`Connecting to MQTT broker: ${brokerUrl}:${port}`);

  try {
    // Create a client instance
    // Note: Paho requires WebSocket connection, so you need to configure your MQTT broker
    // to support WebSocket on a different port (usually 9001)
    const wsPort = 9001; // WebSocket port - configure this on your broker
    const clientId = `datacenter_mobile_${Math.random()
      .toString(16)
      .substr(2, 8)}`;

    client = new Paho.Client(brokerUrl, wsPort, "/mqtt", clientId);

    // Set callback handlers
    client.onConnectionLost = (responseObject: any) => {
      if (responseObject.errorCode !== 0) {
        console.log("⚠️ Connection lost:", responseObject.errorMessage);
      }
    };

    client.onMessageArrived = (message: any) => {
      try {
        const data = JSON.parse(message.payloadString);
        console.log("✓ Message received:", message.destinationName, data);
        onMessage(message.destinationName, data);
      } catch (error) {
        console.error("❌ Error parsing message:", error);
      }
    };

    // Connect the client
    client.connect({
      onSuccess: () => {
        console.log("✓ Connected to MQTT broker!");

        // Subscribe to topics
        client.subscribe("datacenter/motion", { qos: 0 });
        console.log("✓ Subscribed to datacenter/motion");
      },
      onFailure: (error: any) => {
        console.error("❌ Connection failed:", error.errorMessage);
      },
      keepAliveInterval: 60,
      cleanSession: true,
      useSSL: false,
    });
  } catch (err) {
    console.error("❌ Failed to create MQTT client:", err);
  }

  return client;
};

export const disconnectMQTT = (): void => {
  if (client && client.isConnected()) {
    client.disconnect();
    console.log("✓ Disconnected from MQTT broker");
  }
  client = null;
};

export const isConnected = (): boolean => {
  return client !== null && client.isConnected();
};
