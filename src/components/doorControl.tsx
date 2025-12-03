// doorControl.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../theme/colours";

interface DoorControlProps {
  doorStatus: "OPEN" | "CLOSED" | "UNKNOWN";
  isManual: boolean;
  onOpenDoor: () => Promise<void>;
  onCloseDoor: () => Promise<void>;
  onAutoMode: () => Promise<void>;
}

export default function DoorControl({
  doorStatus,
  isManual,
  onOpenDoor,
  onCloseDoor,
  onAutoMode,
}: DoorControlProps) {
  const [loading, setLoading] = useState(false);

  const handleOpenDoor = async () => {
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await onOpenDoor();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Door control error:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDoor = async () => {
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await onCloseDoor();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Door control error:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoMode = async () => {
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await onAutoMode();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Auto mode error:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const statusColor =
    doorStatus === "OPEN"
      ? colors.success
      : doorStatus === "CLOSED"
      ? colors.danger
      : colors.textSecondary;

  return (
    <LinearGradient
      colors={["rgba(15, 23, 42, 0.95)", "rgba(30, 41, 59, 0.8)"]}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${statusColor}20` },
          ]}
        >
          <Ionicons
            name={doorStatus === "OPEN" ? "lock-open" : "lock-closed"}
            size={28}
            color={statusColor}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>DOOR CONTROL</Text>
          <View style={styles.statusRow}>
            <View
              style={[styles.statusDot, { backgroundColor: statusColor }]}
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {doorStatus}
            </Text>
            {isManual && (
              <View style={styles.manualBadge}>
                <Text style={styles.manualText}>MANUAL</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Control Buttons */}
      <View style={styles.buttonContainer}>
        {/* Open Door Button */}
        <TouchableOpacity
          style={[
            styles.button,
            doorStatus === "OPEN" && styles.buttonDisabled,
          ]}
          onPress={handleOpenDoor}
          disabled={loading || doorStatus === "OPEN"}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={
              doorStatus === "OPEN"
                ? ["rgba(16, 185, 129, 0.2)", "rgba(16, 185, 129, 0.1)"]
                : ["rgba(16, 185, 129, 0.4)", "rgba(16, 185, 129, 0.3)"]
            }
            style={styles.buttonGradient}
          >
            {loading ? (
              <ActivityIndicator color={colors.success} />
            ) : (
              <>
                <Ionicons
                  name="lock-open-outline"
                  size={24}
                  color={
                    doorStatus === "OPEN"
                      ? colors.textSecondary
                      : colors.success
                  }
                />
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color:
                        doorStatus === "OPEN"
                          ? colors.textSecondary
                          : colors.success,
                    },
                  ]}
                >
                  OPEN DOOR
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Close Door Button */}
        <TouchableOpacity
          style={[
            styles.button,
            doorStatus === "CLOSED" && styles.buttonDisabled,
          ]}
          onPress={handleCloseDoor}
          disabled={loading || doorStatus === "CLOSED"}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={
              doorStatus === "CLOSED"
                ? ["rgba(239, 68, 68, 0.2)", "rgba(239, 68, 68, 0.1)"]
                : ["rgba(239, 68, 68, 0.4)", "rgba(239, 68, 68, 0.3)"]
            }
            style={styles.buttonGradient}
          >
            {loading ? (
              <ActivityIndicator color={colors.danger} />
            ) : (
              <>
                <Ionicons
                  name="lock-closed-outline"
                  size={24}
                  color={
                    doorStatus === "CLOSED"
                      ? colors.textSecondary
                      : colors.danger
                  }
                />
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color:
                        doorStatus === "CLOSED"
                          ? colors.textSecondary
                          : colors.danger,
                    },
                  ]}
                >
                  CLOSE DOOR
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Auto Mode Button - Only show when in manual mode */}
        {isManual && (
          <TouchableOpacity
            style={styles.button}
            onPress={handleAutoMode}
            disabled={loading}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["rgba(139, 92, 246, 0.4)", "rgba(139, 92, 246, 0.3)"]}
              style={styles.buttonGradient}
            >
              {loading ? (
                <ActivityIndicator color={colors.secondary} />
              ) : (
                <>
                  <Ionicons
                    name="refresh-outline"
                    size={24}
                    color={colors.secondary}
                  />
                  <Text
                    style={[styles.buttonText, { color: colors.secondary }]}
                  >
                    RETURN TO AUTO
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Info Text */}
      <Text style={styles.infoText}>
        {isManual
          ? "Manual mode active - Use controls above or return to automatic mode"
          : doorStatus === "CLOSED"
          ? "Door locked - Will auto-open after 5 minutes"
          : "Door open - Will auto-lock on motion detection"}
      </Text>

      {/* Border */}
      <View style={[styles.border, { borderColor: `${statusColor}40` }]} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    position: "relative",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  manualBadge: {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  manualText: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  buttonContainer: {
    marginBottom: 16,
    gap: 12,
  },
  button: {
    borderRadius: 16,
    overflow: "hidden",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
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
