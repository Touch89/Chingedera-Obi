import json
import os
from datetime import datetime
from config import DATA_FILE


def init_storage():

    os.makedirs("data", exist_ok=True)

    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w") as f:
            json.dump([], f)


def save_reading(data):

    with open(DATA_FILE, "r") as f:
        readings = json.load(f)

    data["timestamp"] = datetime.utcnow().isoformat()

    readings.append(data)

    with open(DATA_FILE, "w") as f:
        json.dump(readings, f, indent=2)


def get_all():

    with open(DATA_FILE, "r") as f:
        return json.load(f)


def get_latest_per_node():

    readings = get_all()

    latest = {}

    for r in readings:
        node = r["nodo"]
        latest[node] = r

    return latest


def get_history(limit=50):

    readings = get_all()

    return readings[-limit:]


def get_stats():

    readings = get_all()

    stats = {}

    for r in readings:

        node = r["nodo"]

        if node not in stats:

            stats[node] = {
                "temperatura": [],
                "humedad": [],
                "luz": []
            }

        stats[node]["temperatura"].append(r["temperatura"])
        stats[node]["humedad"].append(r["humedad"])
        stats[node]["luz"].append(r["luz"])

    result = {}

    for node, values in stats.items():

        result[node] = {
            "temperatura": {
                "min": min(values["temperatura"]),
                "max": max(values["temperatura"]),
                "avg": sum(values["temperatura"]) / len(values["temperatura"])
            },
            "humedad": {
                "min": min(values["humedad"]),
                "max": max(values["humedad"]),
                "avg": sum(values["humedad"]) / len(values["humedad"])
            },
            "luz": {
                "min": min(values["luz"]),
                "max": max(values["luz"]),
                "avg": sum(values["luz"]) / len(values["luz"])
            }
        }

    return result