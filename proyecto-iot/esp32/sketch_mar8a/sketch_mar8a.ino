#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <iostream>

#define DHTTYPE DHT22
#define DHTPIN 4
#define AO_PIN 34
#define RELAY_PIN 23
DHT dht(DHTPIN, DHTTYPE);

// ==================== CONFIGURACIÓN WiFi ====================
const char* WIFI_SSID = "Alumno";        // Cambiar
const char* WIFI_PASSWORD = "Mebe2ege";       // Cambiar

// ==================== CONFIGURACIÓN MQTT ====================
const char* MQTT_SERVER = "10.10.1.201";   // No cambiar
const int MQTT_PORT = 1883;                        // No cambiar
const char* DEVICE_ID = "nodo2";                 // CAMBIAR: esp32_1, esp32_2, ..., esp32_5

// ==================== ESTRUCTURA DE TOPICS ====================
String BASE_TOPIC = "iot/ambiente";
String topicPublicacion;
String topicPublicacionEstado;
String topicSuscripcionComandosIndividual;
String topicSuscripcionComandosBroadcast;

// ==================== OBJETOS GLOBALES ====================
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// ==================== VARIABLES GLOBALES ====================
unsigned long lastPublishTime = 0;
const unsigned long PUBLISH_INTERVAL = 3000;  // Publicar cada 3 segundos
int messageCounter = 0;

// ==================== FUNCIÓN: Conectar WiFi ====================
void conectarWiFi() {
  Serial.println("\n[WiFi] Conectando a: " + String(WIFI_SSID));
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED && intentos < 30) {
    delay(500);
    Serial.print(".");
    intentos++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] ✓ Conectado exitosamente");
    Serial.print("[WiFi] IP local: ");
    Serial.println(WiFi.localIP());
    Serial.print("[WiFi] RSSI: ");
    Serial.println(WiFi.RSSI());
  } else {
    Serial.println("\n[WiFi] ✗ Error: No se pudo conectar");
    Serial.println("[WiFi] Reiniciando en 5 segundos...");
    delay(5000);
    ESP.restart();
  }
}

// ==================== FUNCIÓN: Callback MQTT ====================
void callbackMQTT(char* topic, byte* payload, unsigned int length) {
  // Convertir payload a String
  String mensaje = "";
  for (unsigned int i = 0; i < length; i++) {
    mensaje += (char)payload[i];
  }
  
  Serial.println("\n[MQTT] ← Mensaje recibido");
  Serial.println("  Topic: " + String(topic));
  Serial.println("  Payload: " + mensaje);
  
  // Procesar comandos
  if (mensaje == "LED_ON") {
    Serial.println("  Acción: Encender LED");
    // digitalWrite(LED_PIN, HIGH);  // Descomentar si tienen LED conectado
  } 
  else if (mensaje == "LED_OFF") {
    Serial.println("  Acción: Apagar LED");
    // digitalWrite(LED_PIN, LOW);
  }
  else if (mensaje == "RESET_COUNTER") {
    Serial.println("  Acción: Resetear contador");
    messageCounter = 0;
  }
  else if (mensaje == "STATUS") {
    Serial.println("  Acción: Publicar estado inmediato");
    publicarEstado();
  }
  else {
    Serial.println("  Comando no reconocido: " + mensaje);
  }
}

// ==================== FUNCIÓN: Conectar MQTT ====================
void conectarMQTT() {
  while (!mqttClient.connected()) {
    Serial.println("\n[MQTT] Conectando al broker...");
    Serial.println("  Servidor: " + String(MQTT_SERVER));
    Serial.println("  Puerto: " + String(MQTT_PORT));
    Serial.println("  Client ID: " + String(DEVICE_ID));
    
    // Intentar conexión con Last Will Testament
    String willTopic = BASE_TOPIC + "/dispositivos/" + DEVICE_ID + "/estado/conexion";
    
    if (mqttClient.connect(DEVICE_ID, willTopic.c_str(), 1, true, "offline")) {
      Serial.println("[MQTT] ✓ Conectado al broker");
      
      // Publicar estado online
      mqttClient.publish(willTopic.c_str(), "online", true);
      
      // Suscribirse a topics de comandos
      mqttClient.subscribe(topicSuscripcionComandosIndividual.c_str());
      mqttClient.subscribe(topicSuscripcionComandosBroadcast.c_str());
      
      Serial.println("[MQTT] ✓ Suscrito a:");
      Serial.println("  - " + topicSuscripcionComandosIndividual);
      Serial.println("  - " + topicSuscripcionComandosBroadcast);
      
    } else {
      Serial.print("[MQTT] ✗ Error de conexión. Estado: ");
      Serial.println(mqttClient.state());
      Serial.println("[MQTT] Reintentando en 5 segundos...");
      delay(5000);
    }
  }
}

// ==================== FUNCIÓN: Publicar Temperatura ====================
void publicarDatos() {
  // Simular temperatura: base 20°C + offset único + variación aleatoria
  
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int light = analogRead(AO_PIN);

  StaticJsonDocument<256> doc;
  float timestamp = millis() / 1000;
  doc["nodo"] = DEVICE_ID;
  doc["temperatura"] = temperature;
  doc["humedad"] = humidity;
  doc["luz"] = light;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Publicar
  bool exito = mqttClient.publish(topicPublicacion.c_str(), jsonString.c_str(), false);
  
  if (exito) {
    Serial.println("\n[MQTT] → Datos publicados");
    Serial.println("  Topic: " + topicPublicacion);
    Serial.println("  Payload: " + jsonString);
    messageCounter++;
  } else {
    Serial.println("\n[MQTT] ✗ Error al publicar datos");
  }
}

// ==================== FUNCIÓN: Publicar Estado ====================
void publicarEstado() {
  StaticJsonDocument<256> doc;
  doc["device_id"] = DEVICE_ID;
  doc["estado"] = "online";
  doc["uptime"] = millis() / 1000;
  doc["rssi"] = WiFi.RSSI();
  doc["ip"] = WiFi.localIP().toString();
  doc["mensajes_enviados"] = messageCounter;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  mqttClient.publish(topicPublicacionEstado.c_str(), jsonString.c_str(), false);
  Serial.println("\n[MQTT] → Estado publicado: " + jsonString);
}

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  dht.begin();
  pinMode(AO_PIN, INPUT);
  
  Serial.println("\n\n");
  Serial.println("========================================");
  Serial.println("  ESP32 - Cliente MQTT");
  Serial.println("  Device ID: " + String(DEVICE_ID));
  Serial.println("========================================");
  
  
  // Construir topics dinámicamente
  topicPublicacion = BASE_TOPIC;
  topicPublicacionEstado = "iot/control";
  topicSuscripcionComandosIndividual = "jons";
  topicSuscripcionComandosBroadcast = "jons";
  
  // Conectar WiFi
  conectarWiFi();
  
  // Configurar MQTT
  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
  mqttClient.setCallback(callbackMQTT);
  mqttClient.setBufferSize(512);  // Aumentar buffer si es necesario
  
  // Conectar al broker MQTT
  conectarMQTT();
  
  // Publicar estado inicial
  publicarEstado();
  
  Serial.println("\n[Sistema] Listo. Iniciando bucle principal...\n");
}

// ==================== LOOP ====================
void loop() {
  // Verificar conexión WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] ✗ Desconectado. Reconectando...");
    conectarWiFi();
  }
  
  // Verificar conexión MQTT
  if (!mqttClient.connected()) {
    conectarMQTT();
  }
  
  // Mantener conexión MQTT (procesar mensajes entrantes)
  mqttClient.loop();
  
  // Publicar datos periódicamente
  unsigned long currentTime = millis();
  if (currentTime - lastPublishTime >= PUBLISH_INTERVAL) {
    publicarDatos();
    lastPublishTime = currentTime;
  }
  
  // Pequeño delay para evitar saturar el procesador
  delay(10);
}