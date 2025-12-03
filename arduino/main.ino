#include <Arduino.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ESP32Servo.h>
#include <WiFi.h>
#include <PubSubClient.h>

// WiFi credentials
const char* ssid = "Yeet";
const char* password = "88888888";

// MQTT Broker settings
const char* mqtt_server = "10.75.158.160";
const int mqtt_port = 1883;
const char* mqtt_topic_motion = "datacenter/motion";
const char* mqtt_topic_control = "datacenter/control";
const char* mqtt_topic_status = "datacenter/status";
const char* mqtt_client_id = "ESP32_DatacenterSecurity";

// LCD
LiquidCrystal_I2C lcd(0x27, 16, 2);

// PIR sensor pin
const int pirPin = 2;

// Servo
const int servoPin = 18;
Servo doorServo;

// LEDs
const int yellowLED = 4;  // Motion detected
const int greenLED  = 5;  // No motion

// MQTT objects
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Motion detection state
bool lastMotionState = false;
unsigned long lastMotionTime = 0;
const unsigned long motionCooldown = 5000; // 5 seconds cooldown between notifications

// Servo control state
bool doorClosed = false;
unsigned long doorClosedTime = 0;
const unsigned long doorResetDelay = 300000; // 5 minutes (300000 ms)

// Manual override flag
bool manualOverride = false;

// Function declarations
void openDoor(bool manual = false);
void closeDoor(bool manual = false);
void publishDoorStatus();
void sendMotionAlert();

void setup() {
  Serial.begin(115200);
  
  pinMode(pirPin, INPUT);

  // LED setup
  pinMode(yellowLED, OUTPUT);
  pinMode(greenLED, OUTPUT);
  digitalWrite(yellowLED, LOW);
  digitalWrite(greenLED, HIGH);

  // Servo setup - initialize door open position
  doorServo.attach(servoPin);
  doorServo.write(0); // Door open
  delay(1200);         // Wait for servo to reach position
  doorServo.detach(); // Detach to prevent jitter

  // LCD setup
  lcd.init();
  lcd.backlight();

  lcd.setCursor(0, 0);
  lcd.print("System Starting");
  lcd.setCursor(0, 1);
  lcd.print("Connecting WiFi");
  
  // Connect to WiFi
  setupWiFi();
  
  // Setup MQTT
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(mqttCallback);
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("System Ready");
  delay(2000);
  lcd.clear();
}

void setupWiFi() {
  WiFi.begin(ssid, password);
  
  Serial.print("Connecting to WiFi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi connection failed!");
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);
  
  // Handle control commands
  if (String(topic) == mqtt_topic_control) {
    if (message == "OPEN_DOOR") {
      openDoor(true);
    } else if (message == "CLOSE_DOOR") {
      closeDoor(true);
    } else if (message == "AUTO_MODE") {
      // Return to automatic mode
      manualOverride = false;
      Serial.println("Returned to automatic mode");
      
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Mode: AUTO");
      lcd.setCursor(0, 1);
      lcd.print("Motion Tracking");
      
      publishDoorStatus();
      
      // Give time to see the message
      delay(2000);
      lcd.clear();
    }
  }
}

void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    if (mqttClient.connect(mqtt_client_id)) {
      Serial.println("connected");
      
      // Subscribe to control topic
      mqttClient.subscribe(mqtt_topic_control);
      Serial.println("Subscribed to control topic");
      
      // Publish connection message
      mqttClient.publish(mqtt_topic_motion, "{\"status\":\"online\",\"message\":\"Security system connected\"}");
      
      // Publish initial door status
      publishDoorStatus();
    } else {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" retrying in 5 seconds");
      delay(5000);
    }
  }
}

void openDoor(bool manual) {
  doorServo.attach(servoPin);
  doorServo.write(0);  // Open position
  delay(500);
  doorServo.detach();
  doorClosed = false;
  
  if (manual) {
    manualOverride = true;
    Serial.println("Door opened manually via app");
    
    // Update LCD
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Door: OPENED");
    lcd.setCursor(0, 1);
    lcd.print("Manual Override");
  } else {
    Serial.println("Door opened automatically");
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Door: OPENED");
    lcd.setCursor(0, 1);
    lcd.print("Auto Reset");
  }
  
  publishDoorStatus();
}

void closeDoor(bool manual) {
  doorServo.attach(servoPin);
  doorServo.write(90);  // Close position
  delay(500);
  doorServo.detach();
  doorClosed = true;
  doorClosedTime = millis();
  
  if (manual) {
    manualOverride = true;
    Serial.println("Door closed manually via app");
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Door: CLOSED");
    lcd.setCursor(0, 1);
    lcd.print("Manual Override");
  } else {
    manualOverride = false;
    Serial.println("Door closed automatically");
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Door: CLOSED");
    lcd.setCursor(0, 1);
    lcd.print("Motion Detected!");
  }
  
  publishDoorStatus();
}

void publishDoorStatus() {
  if (mqttClient.connected()) {
    String status = "{\"door\":\"";
    status += doorClosed ? "CLOSED" : "OPEN";
    status += "\",\"manual\":";
    status += manualOverride ? "true" : "false";
    status += ",\"timestamp\":";
    status += millis();
    status += "}";
    
    mqttClient.publish(mqtt_topic_status, status.c_str());
  }
}

void sendMotionAlert() {
  if (mqttClient.connected()) {
    // Create JSON message
    String message = "{\"alert\":\"MOTION_DETECTED\",\"location\":\"datacenter\",\"timestamp\":";
    message += millis();
    message += ",\"message\":\"Unauthorized access detected!\"}";
    
    // Publish to MQTT
    if (mqttClient.publish(mqtt_topic_motion, message.c_str())) {
      Serial.println("Motion alert sent via MQTT");
    } else {
      Serial.println("Failed to send MQTT message");
    }
  }
}

void loop() {
  // Ensure WiFi is connected
  if (WiFi.status() != WL_CONNECTED) {
    setupWiFi();
  }
  
  // Ensure MQTT is connected
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  int pirState = digitalRead(pirPin);
  bool motionDetected = (pirState == HIGH);

  // Check if it's time to reset the door (only if not manually controlled)
  if (!manualOverride && doorClosed && (millis() - doorClosedTime >= doorResetDelay)) {
    openDoor(false);
  }

  // Only respond to motion if not in manual override mode
  if (!manualOverride) {
    lcd.setCursor(0, 0);
    lcd.print("PIR Sensor      ");

    lcd.setCursor(0, 1);
    if (motionDetected) {
      lcd.print("Motion: YES     ");

      // Only close door if it's not already closed
      if (!doorClosed) {
        closeDoor(false);
      }
      
      digitalWrite(yellowLED, HIGH);
      digitalWrite(greenLED, LOW);
      
      // Send MQTT notification (with cooldown to avoid spam)
      if (!lastMotionState || (millis() - lastMotionTime > motionCooldown)) {
        sendMotionAlert();
        lastMotionTime = millis();
      }
      lastMotionState = true;
    }
    else {
      lcd.print("Motion: NO      ");
      
      digitalWrite(yellowLED, LOW);
      digitalWrite(greenLED, HIGH);
      
      lastMotionState = false;
    }
  }

  delay(200);
}