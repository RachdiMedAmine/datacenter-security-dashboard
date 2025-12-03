import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colours";
import { SensorType } from "../types";
import {
  getSensorIcon,
  getSensorStatus,
  getSensorUnit,
} from "../utils/sensorData";

interface SensorPanelProps {
  type: SensorType;
  value: number | boolean;
  lastUpdate: number | null;
}

export default function SensorPanel({
  type,
  value,
  lastUpdate,
}: SensorPanelProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const { status, color } = getSensorStatus(type, value);
  const icon = getSensorIcon(type);
  const unit = getSensorUnit(type);
  const sensorColor = colors[type][color as keyof (typeof colors)[typeof type]];

  useEffect(() => {
    // Pulse animation for critical states
    if (color === "critical" || color === "detected") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Glow effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [color, pulseAnim, glowAnim]);

  const getTimeAgo = (timestamp: number | null): string => {
    if (!timestamp) return "No data";
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const displayValue =
    type === "motion" ? (value ? "ALERT" : "CLEAR") : String(value);

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: pulseAnim }] }]}
    >
      <LinearGradient
        colors={["rgba(15, 23, 42, 0.95)", "rgba(30, 41, 59, 0.8)"]}
        style={styles.gradient}
      >
        {/* Glow effect */}
        <Animated.View
          style={[
            styles.glow,
            {
              backgroundColor: sensorColor,
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3],
              }),
            },
          ]}
        />

        {/* Header */}
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${sensorColor}20` },
            ]}
          >
            <Ionicons name={icon as any} size={24} color={sensorColor} />
          </View>
          <Text style={styles.title}>{type.toUpperCase()}</Text>
        </View>

        {/* Value Display */}
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color: sensorColor }]}>
            {displayValue}
          </Text>
          {unit && <Text style={styles.unit}>{unit}</Text>}
        </View>

        {/* Status */}
        <View style={[styles.statusBadge, { borderColor: sensorColor }]}>
          <View style={[styles.statusDot, { backgroundColor: sensorColor }]} />
          <Text style={[styles.statusText, { color: sensorColor }]}>
            {status}
          </Text>
        </View>

        {/* Last Update */}
        <Text style={styles.timestamp}>{getTimeAgo(lastUpdate)}</Text>

        {/* Border glow */}
        <View style={[styles.border, { borderColor: `${sensorColor}40` }]} />
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "48%",
    aspectRatio: 1,
    marginBottom: 16,
  },
  gradient: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    justifyContent: "space-between",
    overflow: "hidden",
    position: "relative",
  },
  glow: {
    position: "absolute",
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    borderRadius: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  value: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
  },
  unit: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  timestamp: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  border: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 2,
    pointerEvents: "none",
  },
});
