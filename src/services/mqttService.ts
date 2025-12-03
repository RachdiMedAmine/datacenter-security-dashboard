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
    const wsPort = 9001;
    const clientId = `datacenter_mobile_${Math.random()
      .toString(16)
      .substr(2, 8)}`;

    client = new Paho.Client(brokerUrl, wsPort, "/mqtt", clientId);

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

    client.connect({
      onSuccess: () => {
        console.log("✓ Connected to MQTT broker!");

        // Subscribe to topics
        client.subscribe("datacenter/motion", { qos: 0 });
        client.subscribe("datacenter/status", { qos: 0 });
        console.log("✓ Subscribed to datacenter topics");
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

export const publishCommand = (command: string): void => {
  if (client && client.isConnected()) {
    const message = new Paho.Message(command);
    message.destinationName = "datacenter/control";
    message.qos = 0;
    client.send(message);
    console.log(`✓ Command sent: ${command}`);
  } else {
    console.error("❌ Cannot send command - MQTT not connected");
  }
};

export const openDoor = (): void => {
  publishCommand("OPEN_DOOR");
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
