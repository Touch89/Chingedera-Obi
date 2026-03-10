# Sistema de monitoreo ambiental IoT

Foobar is a Python library for dealing with word pluralization.

## Configuración de nodos
Utilice Arduino IDE para pasar el código en ``sketch_mar8a.ino`` a los ESP32s. 
1. Debe actualizar las siguientes variables:
- ``WIFI_SSID``: Nombre de red Wi-Fi.
- ``WIFI_PASSWORD``: Contraseña de red Wi-Fi.
- ``MQTT_SERVER``: IP del Raspberry Pi.
- ``DEVICE_ID``: Nombre del nodo.
2. Instalar las siguientes librerías:
- ArduinoJson de Benoit Blanchon
- PubSubClient de Nick O'Leary
- DHT Sensor Library de Adafruit
3. En Preferences -> Settings -> Additional boards manager URLs, colocar [link a core Arduino para ESP32s](https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json).
4. Compilar y subir código al ESP32.

## Configuración de MQTT
```bash
sudo apt install mosquitto mosquitto-client -y
sudo systemctl restart mosquitto
sudo systemctl enable mosquitto
```

## Configuración de API
1. Copiar los cinco archivos en una carpeta del Raspberry Pi.
2. Instalar Python con las dependencias especificadas en el archivo ``requirements.txt``.
3. Crear un archivo JSON con contenido ``[]`` en el que se escribirán las lecturas.
4. En ``config.py``, actualizar las siguientes variables ``MQTT_BROKER`` y ``DATA_FILE`` usando la librería de ``os`` para que sean los correspondientes del sistema operativo, siendo el primero el proceso de MQTT y el segundo la ruta al archivo JSON creado en el paso 3. 

Por último, se corre la API:
```bash
sudo python3 subscriber.py &
sudo python3 app.py
```

## Uso de API
La API tiene las siguientes rutas funcionales:
- ``/api/latest``: Retorna la última lectura.
- ``/api/history``: Retorna las últimas 50 lecturas.