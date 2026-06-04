from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timedelta
from random import Random


USERS = [
    {"id": 1, "username": "liuruihong", "password": "123456", "name": "刘芮宏", "real_name": "刘芮宏", "role": "admin", "roleLabel": "组长/管理员", "avatar": "刘", "color": "#2E7D32"},
    {"id": 2, "username": "wangpanjie", "password": "123456", "name": "王攀杰", "real_name": "王攀杰", "role": "viewer", "roleLabel": "前端开发", "avatar": "王", "color": "#1976D2"},
    {"id": 3, "username": "changlinhao", "password": "123456", "name": "常琳昊", "real_name": "常琳昊", "role": "viewer", "roleLabel": "后端开发", "avatar": "常", "color": "#1976D2"},
    {"id": 4, "username": "yanghang", "password": "123456", "name": "杨航", "real_name": "杨航", "role": "tester", "roleLabel": "测试工程师", "avatar": "杨", "color": "#F57C00"},
]

FARMS = [
    {"id": "FA", "name": "农场A", "location": "江苏省南京市浦口区", "area": 520, "manager": "刘芮宏"},
    {"id": "FB", "name": "农场B", "location": "江苏省南京市溧水区", "area": 380, "manager": "王攀杰"},
    {"id": "FC", "name": "农场C", "location": "江苏省南京市高淳区", "area": 460, "manager": "常琳昊"},
]

ZONES = [
    {"id": "FA-Z1", "farmId": "FA", "name": "农场A-露天区", "type": "露天", "area": 180},
    {"id": "FA-Z2", "farmId": "FA", "name": "农场A-温室1", "type": "温室", "area": 120},
    {"id": "FA-Z3", "farmId": "FA", "name": "农场A-温室2", "type": "温室", "area": 100},
    {"id": "FB-Z1", "farmId": "FB", "name": "农场B-露天区", "type": "露天", "area": 200},
    {"id": "FB-Z2", "farmId": "FB", "name": "农场B-温室1", "type": "温室", "area": 80},
    {"id": "FC-Z1", "farmId": "FC", "name": "农场C-露天区1", "type": "露天", "area": 220},
    {"id": "FC-Z2", "farmId": "FC", "name": "农场C-露天区2", "type": "露天", "area": 160},
    {"id": "FC-Z3", "farmId": "FC", "name": "农场C-温室1", "type": "温室", "area": 90},
]

FIELDS = [
    {"id": "F001", "zoneId": "FA-Z1", "farmId": "FA", "name": "水稻A1地块", "area": 45, "crop": "水稻", "batch": "B2024001", "devices": 4, "manager": "刘芮宏", "soil": "壤土"},
    {"id": "F002", "zoneId": "FA-Z1", "farmId": "FA", "name": "水稻A2地块", "area": 50, "crop": "水稻", "batch": "B2024001", "devices": 3, "manager": "刘芮宏", "soil": "壤土"},
    {"id": "F003", "zoneId": "FA-Z2", "farmId": "FA", "name": "蔬菜温室1", "area": 30, "crop": "番茄", "batch": "B2024002", "devices": 6, "manager": "王攀杰", "soil": "腐殖土"},
    {"id": "F004", "zoneId": "FA-Z3", "farmId": "FA", "name": "蔬菜温室2", "area": 28, "crop": "黄瓜", "batch": "B2024002", "devices": 5, "manager": "王攀杰", "soil": "腐殖土"},
    {"id": "F005", "zoneId": "FB-Z1", "farmId": "FB", "name": "果树B1地块", "area": 60, "crop": "苹果", "batch": "B2024003", "devices": 3, "manager": "常琳昊", "soil": "砂壤土"},
    {"id": "F006", "zoneId": "FB-Z2", "farmId": "FB", "name": "果树温室1", "area": 25, "crop": "草莓", "batch": "B2024003", "devices": 5, "manager": "常琳昊", "soil": "腐殖土"},
    {"id": "F007", "zoneId": "FC-Z1", "farmId": "FC", "name": "水稻C1地块", "area": 55, "crop": "水稻", "batch": "B2024001", "devices": 4, "manager": "杨航", "soil": "黏土"},
    {"id": "F008", "zoneId": "FC-Z2", "farmId": "FC", "name": "水稻C2地块", "area": 48, "crop": "水稻", "batch": "B2024001", "devices": 3, "manager": "杨航", "soil": "黏土"},
]

DEVICES = [
    {"id": "DEV001", "name": "温湿度传感器-A1-01", "type": "sensor", "typeLabel": "传感器", "status": "online", "farmId": "FA", "zoneId": "FA-Z1", "fieldId": "F001", "location": "水稻A1地块北部", "lastUpdate": "2024-06-03 10:42:15", "model": "DHT22-Pro", "firmware": "v2.3.1"},
    {"id": "DEV002", "name": "土壤传感器-A1-02", "type": "sensor", "typeLabel": "传感器", "status": "online", "farmId": "FA", "zoneId": "FA-Z1", "fieldId": "F001", "location": "水稻A1地块中部", "lastUpdate": "2024-06-03 10:41:58", "model": "SoilSense-S3", "firmware": "v1.8.2"},
    {"id": "DEV003", "name": "CO2传感器-A2-01", "type": "sensor", "typeLabel": "传感器", "status": "online", "farmId": "FA", "zoneId": "FA-Z2", "fieldId": "F003", "location": "蔬菜温室1入口", "lastUpdate": "2024-06-03 10:43:01", "model": "CO2-Sense-X1", "firmware": "v3.0.0"},
    {"id": "DEV004", "name": "光照传感器-A2-02", "type": "sensor", "typeLabel": "传感器", "status": "online", "farmId": "FA", "zoneId": "FA-Z2", "fieldId": "F003", "location": "蔬菜温室1顶部", "lastUpdate": "2024-06-03 10:40:22", "model": "LuxSense-L2", "firmware": "v2.1.0"},
    {"id": "DEV005", "name": "灌溉控制器-A1-01", "type": "controller", "typeLabel": "控制器", "status": "online", "farmId": "FA", "zoneId": "FA-Z1", "fieldId": "F001", "location": "水稻A1地块泵房", "lastUpdate": "2024-06-03 10:38:45", "model": "IrriCtrl-V3", "firmware": "v4.1.2"},
    {"id": "DEV006", "name": "通风控制器-A2-01", "type": "controller", "typeLabel": "控制器", "status": "online", "farmId": "FA", "zoneId": "FA-Z2", "fieldId": "F003", "location": "蔬菜温室1通风口", "lastUpdate": "2024-06-03 10:39:12", "model": "VentCtrl-V2", "firmware": "v3.2.0"},
    {"id": "DEV007", "name": "网关设备-A-GW01", "type": "gateway", "typeLabel": "网关", "status": "online", "farmId": "FA", "zoneId": "FA-Z1", "fieldId": None, "location": "农场A中心机房", "lastUpdate": "2024-06-03 10:44:00", "model": "IoT-GW-5G", "firmware": "v5.0.3"},
    {"id": "DEV008", "name": "温湿度传感器-A3-01", "type": "sensor", "typeLabel": "传感器", "status": "offline", "farmId": "FA", "zoneId": "FA-Z3", "fieldId": "F004", "location": "蔬菜温室2东角", "lastUpdate": "2024-06-03 08:15:32", "model": "DHT22-Pro", "firmware": "v2.3.1"},
    {"id": "DEV009", "name": "土壤传感器-B1-01", "type": "sensor", "typeLabel": "传感器", "status": "online", "farmId": "FB", "zoneId": "FB-Z1", "fieldId": "F005", "location": "果树B1地块西侧", "lastUpdate": "2024-06-03 10:42:50", "model": "SoilSense-S3", "firmware": "v1.8.2"},
    {"id": "DEV010", "name": "pH传感器-B1-02", "type": "sensor", "typeLabel": "传感器", "status": "fault", "farmId": "FB", "zoneId": "FB-Z1", "fieldId": "F005", "location": "果树B1地块中部", "lastUpdate": "2024-06-03 07:30:18", "model": "pHSense-P1", "firmware": "v1.5.0"},
    {"id": "DEV011", "name": "灌溉控制器-B1-01", "type": "controller", "typeLabel": "控制器", "status": "online", "farmId": "FB", "zoneId": "FB-Z1", "fieldId": "F005", "location": "果树B1地块泵房", "lastUpdate": "2024-06-03 10:37:22", "model": "IrriCtrl-V3", "firmware": "v4.1.2"},
    {"id": "DEV012", "name": "网关设备-B-GW01", "type": "gateway", "typeLabel": "网关", "status": "online", "farmId": "FB", "zoneId": "FB-Z1", "fieldId": None, "location": "农场B中心机房", "lastUpdate": "2024-06-03 10:44:00", "model": "IoT-GW-5G", "firmware": "v5.0.3"},
    {"id": "DEV013", "name": "温湿度传感器-C1-01", "type": "sensor", "typeLabel": "传感器", "status": "online", "farmId": "FC", "zoneId": "FC-Z1", "fieldId": "F007", "location": "水稻C1地块南部", "lastUpdate": "2024-06-03 10:41:10", "model": "DHT22-Pro", "firmware": "v2.3.1"},
    {"id": "DEV014", "name": "CO2传感器-C1-02", "type": "sensor", "typeLabel": "传感器", "status": "online", "farmId": "FC", "zoneId": "FC-Z1", "fieldId": "F007", "location": "水稻C1地块监测点", "lastUpdate": "2024-06-03 10:40:55", "model": "CO2-Sense-X1", "firmware": "v3.0.0"},
    {"id": "DEV015", "name": "土壤传感器-C2-01", "type": "sensor", "typeLabel": "传感器", "status": "online", "farmId": "FC", "zoneId": "FC-Z2", "fieldId": "F008", "location": "水稻C2地块中心", "lastUpdate": "2024-06-03 10:43:30", "model": "SoilSense-S3", "firmware": "v1.8.2"},
    {"id": "DEV016", "name": "通风控制器-C3-01", "type": "controller", "typeLabel": "控制器", "status": "offline", "farmId": "FC", "zoneId": "FC-Z3", "fieldId": None, "location": "农场C温室1", "lastUpdate": "2024-06-03 09:05:44", "model": "VentCtrl-V2", "firmware": "v3.2.0"},
    {"id": "DEV017", "name": "网关设备-C-GW01", "type": "gateway", "typeLabel": "网关", "status": "online", "farmId": "FC", "zoneId": "FC-Z1", "fieldId": None, "location": "农场C中心机房", "lastUpdate": "2024-06-03 10:44:00", "model": "IoT-GW-5G", "firmware": "v5.0.3"},
]

REALTIME_DATA = {
    "FA": {"temperature": {"value": 26.4, "unit": "°C", "trend": "up", "status": "normal"}, "humidity": {"value": 72.3, "unit": "%", "trend": "stable", "status": "normal"}, "soilMoisture": {"value": 58.1, "unit": "%", "trend": "down", "status": "normal"}, "co2": {"value": 412, "unit": "ppm", "trend": "up", "status": "warning"}, "light": {"value": 8500, "unit": "lux", "trend": "up", "status": "normal"}, "ph": {"value": 6.8, "unit": "pH", "trend": "stable", "status": "normal"}},
    "FB": {"temperature": {"value": 28.1, "unit": "°C", "trend": "up", "status": "warning"}, "humidity": {"value": 65.8, "unit": "%", "trend": "down", "status": "normal"}, "soilMoisture": {"value": 42.5, "unit": "%", "trend": "down", "status": "warning"}, "co2": {"value": 398, "unit": "ppm", "trend": "stable", "status": "normal"}, "light": {"value": 9200, "unit": "lux", "trend": "stable", "status": "normal"}, "ph": {"value": 5.9, "unit": "pH", "trend": "down", "status": "danger"}},
    "FC": {"temperature": {"value": 24.8, "unit": "°C", "trend": "stable", "status": "normal"}, "humidity": {"value": 78.6, "unit": "%", "trend": "up", "status": "normal"}, "soilMoisture": {"value": 65.2, "unit": "%", "trend": "up", "status": "normal"}, "co2": {"value": 385, "unit": "ppm", "trend": "down", "status": "normal"}, "light": {"value": 7800, "unit": "lux", "trend": "down", "status": "normal"}, "ph": {"value": 7.1, "unit": "pH", "trend": "stable", "status": "normal"}},
}

BATCHES = [
    {"id": "B2024001", "crop": "水稻（粳稻）", "variety": "南粳46", "fields": ["F001", "F002", "F007", "F008"], "sowDate": "2024-04-15", "harvestDate": "2024-09-20", "area": 198, "status": "growing", "progress": 55, "manager": "刘芮宏", "desc": "本季种植南粳46，预计亩产500公斤。目前处于分蘖期，长势良好。"},
    {"id": "B2024002", "crop": "蔬菜（番茄/黄瓜）", "variety": "金皇后/津春4号", "fields": ["F003", "F004"], "sowDate": "2024-03-01", "harvestDate": "2024-07-30", "area": 58, "status": "harvesting", "progress": 80, "manager": "王攀杰", "desc": "温室蔬菜种植，番茄与黄瓜轮作，目前处于采摘期。"},
    {"id": "B2024003", "crop": "水果（苹果/草莓）", "variety": "红富士/章姬", "fields": ["F005", "F006"], "sowDate": "2024-01-10", "harvestDate": "2024-12-15", "area": 85, "status": "growing", "progress": 35, "manager": "常琳昊", "desc": "苹果与草莓混合种植区，草莓已进入采摘期，苹果处于膨大期。"},
]

ALERTS = [
    {"id": "AL001", "deviceId": "DEV010", "deviceName": "pH传感器-B1-02", "metric": "pH值", "currentVal": "5.1", "threshold": "5.5~7.5", "level": "critical", "time": "2024-06-03 07:28:00", "status": "unhandled", "notes": ""},
    {"id": "AL002", "deviceId": "DEV008", "deviceName": "温湿度传感器-A3-01", "metric": "设备离线", "currentVal": "-", "threshold": "在线", "level": "critical", "time": "2024-06-03 08:15:00", "status": "unhandled", "notes": ""},
    {"id": "AL003", "deviceId": "DEV016", "deviceName": "通风控制器-C3-01", "metric": "设备离线", "currentVal": "-", "threshold": "在线", "level": "warning", "time": "2024-06-03 09:05:00", "status": "confirmed", "notes": "已派人检查"},
    {"id": "AL004", "deviceId": "DEV001", "deviceName": "温湿度传感器-A1-01", "metric": "温度", "currentVal": "32.1°C", "threshold": "≤30°C", "level": "warning", "time": "2024-06-03 06:40:00", "status": "confirmed", "notes": "启动通风"},
    {"id": "AL005", "deviceId": "DEV003", "deviceName": "CO2传感器-A2-01", "metric": "CO2浓度", "currentVal": "520ppm", "threshold": "≤500ppm", "level": "warning", "time": "2024-06-03 05:10:00", "status": "closed", "notes": "已通风处理"},
]
for i in range(6, 26):
    dev = DEVICES[(i - 1) % len(DEVICES)]
    ALERTS.append({
        "id": f"AL{i:03d}",
        "deviceId": dev["id"],
        "deviceName": dev["name"],
        "metric": ["温度", "湿度", "土壤水分", "CO2浓度", "设备通信"][i % 5],
        "currentVal": ["31.5°C", "88%", "35%", "580ppm", "-"][i % 5],
        "threshold": ["≤30°C", "≤85%", "≥40%", "≤500ppm", "正常"][i % 5],
        "level": ["critical", "warning", "info"][i % 3],
        "time": (datetime(2024, 6, 3, 10, 0) - timedelta(hours=i * 5)).strftime("%Y-%m-%d %H:%M:%S"),
        "status": "closed",
        "notes": "已处理",
    })

FIELD_RECORDS = {
    "B2024001": [
        {"id": "TR001", "type": "播种", "date": "2024-04-15", "operator": "刘芮宏", "title": "播种作业", "content": "完成南粳46育秧，播种均匀。", "materials": ["南粳46种子 200kg"], "notes": "天气晴好"},
        {"id": "TR002", "type": "施肥", "date": "2024-04-28", "operator": "王攀杰", "title": "基肥施用", "content": "施用氮磷钾复合肥。", "materials": ["复合肥 80kg", "有机肥 200kg"], "notes": "施肥均匀"},
        {"id": "TR003", "type": "病虫害防治", "date": "2024-05-18", "operator": "常琳昊", "title": "稻飞虱防治", "content": "开展预防性处理。", "materials": ["防治药剂 30g"], "notes": "作业后封闭24小时"},
    ],
    "B2024002": [
        {"id": "TR004", "type": "定植", "date": "2024-03-01", "operator": "王攀杰", "title": "温室定植", "content": "完成番茄黄瓜定植。", "materials": ["蔬菜苗 1200株"], "notes": "温室环境稳定"},
        {"id": "TR005", "type": "采收", "date": "2024-06-01", "operator": "刘芮宏", "title": "首批采收", "content": "采收品质达标。", "materials": [], "notes": "入库抽检合格"},
    ],
    "B2024003": [
        {"id": "TR006", "type": "修剪", "date": "2024-04-20", "operator": "常琳昊", "title": "果树修剪", "content": "完成春季修剪。", "materials": [], "notes": "保留主枝"},
    ],
}

ALERT_RULES = [
    {"id": "R001", "metric": "temperature", "name": "空气温度过高", "threshold": "≥30°C", "level": "warning", "enabled": True},
    {"id": "R002", "metric": "humidity", "name": "空气湿度过高", "threshold": "≥85%", "level": "info", "enabled": True},
    {"id": "R003", "metric": "soilMoisture", "name": "土壤水分过低", "threshold": "≤40%", "level": "warning", "enabled": True},
    {"id": "R004", "metric": "co2", "name": "CO2浓度过高", "threshold": "≥500ppm", "level": "critical", "enabled": True},
    {"id": "R005", "metric": "ph", "name": "pH异常", "threshold": "5.5~7.5", "level": "critical", "enabled": True},
    {"id": "R006", "metric": "device", "name": "设备离线", "threshold": "10分钟无心跳", "level": "critical", "enabled": True},
    {"id": "R007", "metric": "battery", "name": "电池电量低", "threshold": "≤20%", "level": "info", "enabled": True},
    {"id": "R008", "metric": "flow", "name": "灌溉流量异常", "threshold": "≤1L/min", "level": "critical", "enabled": True},
    {"id": "R009", "metric": "network", "name": "网关丢包率高", "threshold": "≥10%", "level": "info", "enabled": True},
]


def history_24h():
    return {farm["id"]: {m: _series_24h(v["value"], 3 if m == "temperature" else 8) for m, v in REALTIME_DATA[farm["id"]].items()} for farm in FARMS}


def history_30d():
    return {
        "temperature": _series_30d(26.5, 4),
        "humidity": _series_30d(70, 10),
        "co2": _series_30d(405, 35),
    }


def alert_stats_30d():
    dates = []
    counts = {"critical": [], "warning": [], "info": []}
    rng = Random(7)
    for i in range(29, -1, -1):
        day = datetime.now() - timedelta(days=i)
        dates.append(day.strftime("%m-%d"))
        counts["critical"].append(rng.randint(0, 3))
        counts["warning"].append(rng.randint(1, 5))
        counts["info"].append(rng.randint(0, 4))
    return {"dates": dates, "counts": counts}


def device_stats():
    total = len(DEVICES)
    online = len([d for d in DEVICES if d["status"] == "online"])
    offline = len([d for d in DEVICES if d["status"] == "offline"])
    fault = len([d for d in DEVICES if d["status"] == "fault"])
    by_farm = []
    for farm in FARMS:
        farm_devices = [d for d in DEVICES if d["farmId"] == farm["id"]]
        by_farm.append({
            "farm_id": farm["id"],
            "farm_name": farm["name"],
            "total": len(farm_devices),
            "online": len([d for d in farm_devices if d["status"] == "online"]),
        })
    return {"total": total, "online": online, "offline": offline, "fault": fault, "online_rate": round(online / total * 100, 1), "by_farm": by_farm}


def alert_stats():
    return {
        "total": len(ALERTS),
        "critical": len([a for a in ALERTS if a["level"] == "critical"]),
        "warning": len([a for a in ALERTS if a["level"] == "warning"]),
        "info": len([a for a in ALERTS if a["level"] == "info"]),
        "unhandled": len([a for a in ALERTS if a["status"] == "unhandled"]),
        "by_day": [{"date": d, "critical": c, "warning": w, "info": i} for d, c, w, i in zip(alert_stats_30d()["dates"], alert_stats_30d()["counts"]["critical"], alert_stats_30d()["counts"]["warning"], alert_stats_30d()["counts"]["info"])],
    }


def all_mock_data():
    return deepcopy({
        "USERS": USERS,
        "FARMS": FARMS,
        "ZONES": ZONES,
        "FIELDS": FIELDS,
        "DEVICES": DEVICES,
        "REALTIME_DATA": REALTIME_DATA,
        "HISTORY_24H": history_24h(),
        "HISTORY_30D": history_30d(),
        "ALERTS": ALERTS,
        "ALERT_STATS_30D": alert_stats_30d(),
        "ALERT_RULES": ALERT_RULES,
        "BATCHES": BATCHES,
        "FIELD_RECORDS": FIELD_RECORDS,
    })


def _series_24h(base, variance):
    rng = Random(str(base) + str(variance))
    now = datetime.now()
    rows = []
    for i in range(23, -1, -1):
        t = now - timedelta(hours=i)
        rows.append({"time": t.strftime("%H:00"), "value": round(base + (rng.random() - 0.5) * variance * 2, 1)})
    return rows


def _series_30d(base, variance):
    rng = Random(str(base) + "30d")
    now = datetime.now()
    rows = []
    for i in range(29, -1, -1):
        t = now - timedelta(days=i)
        rows.append({"date": t.strftime("%m-%d"), "value": round(base + (rng.random() - 0.5) * variance * 2, 1)})
    return rows
