import paho.mqtt.client as mqtt
from config import MQTT_BROKER, MQTT_PORT, MQTT_TOPIC_CONTROL


class MQTTClient:

    def __init__(self):

        self.client = mqtt.Client()
        self.client.connect(MQTT_BROKER, MQTT_PORT)

    def publish_control(self, node, state):

        topic = MQTT_TOPIC_CONTROL.format(node)

        self.client.publish(topic, state)