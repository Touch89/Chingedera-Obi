import json
import paho.mqtt.client as mqtt

from config import MQTT_BROKER, MQTT_PORT, MQTT_TOPIC_DATA
from data_store import save_reading, init_storage


init_storage()


def on_connect(client, userdata, flags, rc):

    print("Connected to MQTT Broker")

    client.subscribe(MQTT_TOPIC_DATA)


def on_message(client, userdata, msg):

    try:

        payload = msg.payload.decode()

        data = json.loads(payload)

        save_reading(data)

        print("Saved", data)

    except Exception as e:

        print("Error", e)


client = mqtt.Client()

client.on_connect = on_connect
client.on_message = on_message

client.connect(MQTT_BROKER, MQTT_PORT)

client.loop_forever()