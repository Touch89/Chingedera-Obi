from flask import Flask, jsonify, request
from flask_cors import CORS

from data_store import get_latest_per_node, get_history, get_stats
from mqtt_client import MQTTClient

app = Flask(__name__)

CORS(app)

mqtt_client = MQTTClient()


@app.route("/api/latest")

def latest():

    return jsonify(get_latest_per_node())


@app.route("/api/history")

def history():

    limit = request.args.get("limit", default=50, type=int)

    return jsonify(get_history(limit))


@app.route("/api/stats")

def stats():

    return jsonify(get_stats())


@app.route("/api/control", methods=["POST"])

def control():

    data = request.json

    node = data.get("node")

    state = data.get("state")

    if node is None or state is None:

        return jsonify({"error": "node and state required"}), 400

    mqtt_client.publish_control(node, state)

    return jsonify({
        "status": "command sent",
        "node": node,
        "state": state
    })


@app.errorhandler(404)

def not_found(e):

    return jsonify({"error": "not found"}), 404


@app.errorhandler(500)

def server_error(e):

    return jsonify({"error": "server error"}), 500


if __name__ == "__main__":

    app.run(host="0.0.0.0", port=5000)