# Datacenter Security Monitoring System 🔒

A real-time IoT security monitoring mobile application built with React Native and Expo, designed to interface with ESP32 microcontrollers for datacenter environmental monitoring and access control.

## 📱 Project Overview

This mobile application provides real-time monitoring and control capabilities for a datacenter security system. It communicates with ESP32-based sensors via MQTT protocol to monitor environmental conditions and control door access remotely.

### Key Features

- **Real-time Environmental Monitoring**

  - Temperature monitoring with threshold alerts
  - Humidity level tracking
  - Gas concentration detection
  - Motion detection with instant alerts

- **Door Access Control**

  - Remote door lock/unlock functionality
  - Manual and automatic operation modes
  - Real-time door status updates
  - Auto-lock on motion detection

- **Push Notifications**

  - Instant motion detection alerts
  - Critical environmental condition warnings
  - Gas leak notifications

- **Live Connection Status**
  - Real-time MQTT broker connection monitoring
  - Visual connection indicators

## 🛠️ Technology Stack

- **Framework**: React Native with Expo (~54.0)
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Hooks
- **Communication Protocol**: MQTT over WebSocket
- **MQTT Client**: Paho MQTT JavaScript client
- **UI Components**:
  - Custom components with Linear Gradients
  - Ionicons for iconography
  - Haptic feedback integration
- **Notifications**: Expo Notifications

## 📂 Project Structure

```
datacenter-security/
├── app/
│   ├── _layout.tsx          # Root layout and navigation configuration
│   └── index.tsx             # Main dashboard screen
├── src/
│   ├── components/
│   │   ├── connectionStatus.tsx   # MQTT connection indicator
│   │   ├── doorControl.tsx        # Door control panel
│   │   └── sensorPanel.tsx        # Sensor data display cards
│   ├── services/
│   │   ├── mqttService.ts         # MQTT communication layer
│   │   └── notificationService.ts # Push notification handling
│   ├── theme/
│   │   └── colours.ts             # Application color scheme
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   └── utils/
│       └── sensorData.ts          # Sensor data utilities
├── assets/                   # Images and static resources
├── app.json                  # Expo configuration
├── package.json              # Dependencies
└── tsconfig.json            # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Expo Go app (for mobile testing) or Android Studio/Xcode for emulator testing
- An ESP32 device configured with MQTT broker

## 📡 MQTT Communication Protocol

### Topics

| Topic                | Direction   | Purpose                 | Message Format                                  |
| -------------------- | ----------- | ----------------------- | ----------------------------------------------- |
| `datacenter/motion`  | ESP32 → App | Motion detection alerts | `{"alert": "MOTION_DETECTED"}`                  |
| `datacenter/status`  | ESP32 → App | System status updates   | `{"door": "OPEN/CLOSED", "manual": true/false}` |
| `datacenter/control` | App → ESP32 | Door control commands   | `"OPEN_DOOR"`, `"CLOSE_DOOR"`, `"AUTO_MODE"`    |

### Connection Details

- **Protocol**: MQTT over WebSocket
- **Port**: 9001 (WebSocket port)
- **QoS**: 0 (At most once delivery)
- **Keep Alive**: 60 seconds
- **Clean Session**: Enabled

## 🎨 UI Components

### Dashboard (`app/index.tsx`)

Main screen displaying all system information with real-time updates.

### Door Control Panel (`src/components/doorControl.tsx`)

- Visual door status indicator
- Manual control buttons (Open/Close)
- Auto mode toggle
- Haptic feedback on interactions

### Sensor Panels (`src/components/sensorPanel.tsx`)

Individual cards for each sensor type with:

- Current value display
- Status indicators (OPTIMAL, WARNING, CRITICAL)
- Last update timestamp
- Animated alerts for critical states

### Connection Status (`src/components/connectionStatus.tsx`)

Real-time MQTT connection indicator in the header.

## 🔔 Notification System

The application sends local push notifications for:

1. **Motion Detection** 🚨

   - Triggers immediately when motion is detected
   - High priority notification with vibration

2. **Gas Level Warnings** ⚠️

   - Alerts when gas concentration exceeds safe levels
   - Includes current PPM value

3. **Temperature Alerts** 🌡️
   - Notifies when temperature goes outside optimal range
   - Shows current temperature reading

## 📊 Sensor Thresholds

| Sensor      | Optimal Range | Warning          | Critical         |
| ----------- | ------------- | ---------------- | ---------------- |
| Temperature | 18-27°C       | < 18°C or > 27°C | < 15°C or > 30°C |
| Humidity    | 30-60%        | < 30% or > 60%   | < 20% or > 70%   |
| Gas (MQ-2)  | 0-500 ppm     | 500-1000 ppm     | > 1000 ppm       |
| Motion      | N/A           | Detected         | N/A              |

## 🧪 Demo Mode

The application includes simulated sensor data for temperature, humidity, and gas sensors that updates every 3 seconds. This allows testing the UI without physical hardware. Motion detection requires actual MQTT messages from the ESP32.
