import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import ConnectionStatus from "../src/components/connectionStatus";
import SensorPanel from "../src/components/sensorPanel";
import {
  connectMQTT,
  disconnectMQTT,
  isConnected,
} from "../src/services/mqttService";
import {
  sendMotionAlert,
  setupNotifications,
} from "../src/services/notificationService";
import { colors } from "../src/theme/colours";
import { MQTTMessage, SensorData } from "../src/types";

export default function Dashboard() {
  const [connected, setConnected] = useState<boolean>(false);

  // Mock data for temperature, humidity, and gas
  const [sensors, setSensors] = useState<SensorData>({
    temperature: { value: 22, lastUpdate: Date.now() },
    humidity: { value: 45, lastUpdate: Date.now() },
    motion: { value: false, lastUpdate: null }, // Real data from ESP32
    gas: { value: 150, lastUpdate: Date.now() },
  });

  useEffect(() => {
    // Setup notifications
    setupNotifications();

    // Connect to MQTT broker
    const client = connectMQTT("10.75.158.160", 9001, handleMessage);

    // Check connection status periodically
    const connectionCheck = setInterval(() => {
      setConnected(isConnected());
    }, 1000);

    // Update mock data periodically to simulate live readings
    const mockDataInterval = setInterval(() => {
      setSensors((prev) => ({
        ...prev,
        // Temperature varies between 20-24°C
        temperature: {
          value: parseFloat((20 + Math.random() * 4).toFixed(1)),
          lastUpdate: Date.now(),
        },
        // Humidity varies between 40-50%
        humidity: {
          value: Math.floor(40 + Math.random() * 10),
          lastUpdate: Date.now(),
        },
        // Gas varies between 100-300 ppm
        gas: {
          value: Math.floor(100 + Math.random() * 200),
          lastUpdate: Date.now(),
        },
      }));
    }, 3000); // Update every 3 seconds

    return () => {
      disconnectMQTT();
      clearInterval(connectionCheck);
      clearInterval(mockDataInterval);
    };
  }, []);

  const handleMessage = (topic: string, data: MQTTMessage): void => {
    console.log("Received:", topic, data);

    // Only handle motion sensor data from ESP32
    if (topic === "datacenter/motion") {
      const motionDetected = data.alert === "MOTION_DETECTED";

      setSensors((prev) => ({
        ...prev,
        motion: {
          value: motionDetected,
          lastUpdate: Date.now(),
        },
      }));

      // Send notification when motion is detected
      if (motionDetected) {
        sendMotionAlert();
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.background, "#1a1f3a", colors.background]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>DATACENTER</Text>
              <Text style={styles.subtitle}>Security Monitoring System</Text>
            </View>
            <ConnectionStatus connected={connected} />
          </View>

          {/* Sensor Grid */}
          <View style={styles.grid}>
            <SensorPanel
              type="temperature"
              value={sensors.temperature.value as number}
              lastUpdate={sensors.temperature.lastUpdate}
            />
            <SensorPanel
              type="humidity"
              value={sensors.humidity.value as number}
              lastUpdate={sensors.humidity.lastUpdate}
            />
            <SensorPanel
              type="motion"
              value={sensors.motion.value as boolean}
              lastUpdate={sensors.motion.lastUpdate}
            />
            <SensorPanel
              type="gas"
              value={sensors.gas.value as number}
              lastUpdate={sensors.gas.lastUpdate}
            />
          </View>

          {/* Footer Info */}
          <View style={styles.footer}>
            <View style={styles.infoRow}>
              <View style={styles.infoDot} />
              <Text style={styles.infoText}>
                Real-time motion monitoring active
              </Text>
            </View>
            <Text
              style={[
                styles.infoText,
                { fontSize: 10, opacity: 0.6, marginTop: 4 },
              ]}
            >
              Temperature, Humidity, Gas: Demo Mode
            </Text>
            <Text style={styles.versionText}>v1.0.0</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    letterSpacing: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
    gap: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  versionText: {
    color: colors.textSecondary,
    fontSize: 10,
    opacity: 0.5,
    marginTop: 4,
  },
});
