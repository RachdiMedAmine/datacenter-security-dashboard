import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colours";

interface ConnectionStatusProps {
  connected: boolean;
}

export default function ConnectionStatus({ connected }: ConnectionStatusProps) {
  return (
    <View
      style={[
        styles.container,
        connected ? styles.connected : styles.disconnected,
      ]}
    >
      <Ionicons
        name={connected ? "cloud-done" : "cloud-offline"}
        size={16}
        color={connected ? colors.success : colors.danger}
      />
      <Text style={styles.text}>{connected ? "CONNECTED" : "OFFLINE"}</Text>
      <View style={[styles.pulse, connected && styles.pulsing]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  connected: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: colors.success,
  },
  disconnected: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: colors.danger,
  },
  text: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  pulsing: {
    backgroundColor: colors.success,
  },
});
