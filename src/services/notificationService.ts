import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export const setupNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.log("Notifications only work on physical devices");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get notification permissions");
    return null;
  }

  console.log("✓ Notification permissions granted");
  // Don't try to get Expo push token - we only need local notifications
  return null;
};

export const sendLocalNotification = async (
  title: string,
  body: string,
  data: Record<string, any> = {}
): Promise<void> => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      vibrate: [0, 250, 250, 250],
    },
    trigger: null,
  });
};

export const sendMotionAlert = async (): Promise<void> => {
  await sendLocalNotification(
    "🚨 Motion Detected!",
    "Unauthorized movement detected in datacenter",
    { type: "motion", severity: "critical" }
  );
};

export const sendGasAlert = async (value: number): Promise<void> => {
  await sendLocalNotification(
    "⚠️ Gas Level Warning!",
    `Gas concentration at ${value} ppm - Check datacenter immediately`,
    { type: "gas", severity: "critical", value }
  );
};

export const sendTemperatureAlert = async (value: number): Promise<void> => {
  await sendLocalNotification(
    "🌡️ Temperature Alert!",
    `Datacenter temperature at ${value}°C - Outside optimal range`,
    { type: "temperature", severity: "warning", value }
  );
};
