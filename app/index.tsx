import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import ConnectionStatus from "../src/components/connectionStatus";
import DoorControl from "../src/components/doorControl";
import SensorPanel from "../src/components/sensorPanel";
import {
  connectMQTT,
  disconnectMQTT,
  isConnected,
  openDoor,
} from "../src/services/mqttService";
import {
  sendMotionAlert,
  setupNotifications,
} from "../src/services/notificationService";
import { colors } from "../src/theme/colours";
import { DoorStatus, MQTTMessage, SensorData } from "../src/types";

export default function Dashboard() {
  const [connected, setConnected] = useState<boolean>(false);
  const [doorStatus, setDoorStatus] = useState<DoorStatus>({
    state: "UNKNOWN",
    isManual: false,
  });

  const [sensors, setSensors] = useState<SensorData>({
    temperature: { value: 22, lastUpdate: Date.now() },
    humidity: { value: 45, lastUpdate: Date.now() },
    motion: { value: false, lastUpdate: null },
    gas: { value: 150, lastUpdate: Date.now() },
  });

  useEffect(() => {
    setupNotifications();

    const client = connectMQTT("10.75.158.160", 9001, handleMessage);

    const connectionCheck = setInterval(() => {
      setConnected(isConnected());
    }, 1000);

    const mockDataInterval = setInterval(() => {
      setSensors((prev) => ({
        ...prev,
        temperature: {
          value: parseFloat((20 + Math.random() * 4).toFixed(1)),
          lastUpdate: Date.now(),
        },
        humidity: {
          value: Math.floor(40 + Math.random() * 10),
          lastUpdate: Date.now(),
        },
        gas: {
          value: Math.floor(100 + Math.random() * 200),
          lastUpdate: Date.now(),
        },
      }));
    }, 3000);

    return () => {
      disconnectMQTT();
      clearInterval(connectionCheck);
      clearInterval(mockDataInterval);
    };
  }, []);

  const handleMessage = (topic: string, data: MQTTMessage): void => {
    console.log("Received:", topic, data);

    if (topic === "datacenter/motion") {
      const motionDetected = data.alert === "MOTION_DETECTED";

      setSensors((prev) => ({
        ...prev,
        motion: {
          value: motionDetected,
          lastUpdate: Date.now(),
        },
      }));

      if (motionDetected) {
        sendMotionAlert();
      }
    } else if (topic === "datacenter/status") {
      // Update door status from ESP32
      if (data.door) {
        setDoorStatus({
          state: data.door as "OPEN" | "CLOSED",
          isManual: data.manual || false,
        });
      }
    }
  };

  const handleOpenDoor = async (): Promise<void> => {
    openDoor();
    // Optimistically update UI
    setDoorStatus((prev) => ({ ...prev, state: "OPEN", isManual: true }));
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

          {/* Door Control */}
          <DoorControl
            doorStatus={doorStatus.state}
            isManual={doorStatus.isManual}
            onOpenDoor={handleOpenDoor}
          />

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
                Real-time monitoring & door control
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
            <Text style={styles.versionText}>v1.1.0</Text>
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
    marginBottom: 24,
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
