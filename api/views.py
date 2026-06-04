from __future__ import annotations

import json
from datetime import datetime

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from . import mock_store as store


def frontend_index(_request):
    return redirect("/index.html")


def ok(data=None, message="success", status=200):
    return JsonResponse({"code": 200, "message": message, "data": data}, status=status, json_dumps_params={"ensure_ascii": False})


def fail(message, code=400, status=400):
    return JsonResponse({"code": code, "message": message, "data": None}, status=status, json_dumps_params={"ensure_ascii": False})


def body_json(request):
    if not request.body:
        return {}
    try:
        return json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return {}


def paginate(items, request):
    page = max(int(request.GET.get("page", 1)), 1)
    page_size = min(max(int(request.GET.get("page_size", request.GET.get("pageSize", 20))), 1), 100)
    start = (page - 1) * page_size
    return {"total": len(items), "page": page, "page_size": page_size, "items": items[start:start + page_size]}


def find_by_id(items, item_id, key="id"):
    return next((item for item in items if item.get(key) == item_id), None)


def normalize_device(device):
    data = dict(device)
    data["device_type"] = data.get("type")
    data["farm_id"] = data.get("farmId")
    data["zone_id"] = data.get("zoneId")
    data["field_id"] = data.get("fieldId")
    data["firmware_version"] = data.get("firmware")
    data["last_heartbeat"] = data.get("lastUpdate")
    return data


def normalize_field(field):
    data = dict(field)
    data["farm_id"] = data.get("farmId")
    data["zone_id"] = data.get("zoneId")
    data["batch_id"] = data.get("batch")
    return data


def normalize_batch(batch):
    data = dict(batch)
    data["crop_name"] = data.get("crop")
    data["variety_name"] = data.get("variety")
    data["sow_date"] = data.get("sowDate")
    data["expected_harvest_date"] = data.get("harvestDate")
    data["progress_pct"] = data.get("progress")
    data["total_area"] = data.get("area")
    return data


@require_http_methods(["GET"])
def mock_data(_request):
    return ok(store.all_mock_data())


@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    payload = body_json(request)
    username = payload.get("username")
    password = payload.get("password")
    user = next((u for u in store.USERS if u["username"] == username and u["password"] == password), None)
    if not user:
        return fail("用户名或密码错误", 401, 401)
    safe_user = {k: v for k, v in user.items() if k != "password"}
    return ok({
        "access_token": f"demo-token-{user['id']}",
        "token_type": "bearer",
        "expires_in": 86400,
        "user": safe_user,
    })


@require_http_methods(["GET"])
def me(request):
    auth = request.headers.get("Authorization", "")
    user = store.USERS[0]
    if auth.startswith("Bearer demo-token-"):
        try:
            user_id = int(auth.replace("Bearer demo-token-", ""))
            user = find_by_id(store.USERS, user_id) or user
        except ValueError:
            pass
    safe_user = {k: v for k, v in user.items() if k != "password"}
    safe_user["last_login"] = datetime.now().isoformat(timespec="seconds")
    return ok(safe_user)


@csrf_exempt
@require_http_methods(["POST"])
def logout(_request):
    return ok(message="已成功登出")


@require_http_methods(["GET"])
def sensor_realtime(request):
    farm_id = request.GET.get("farm_id") or request.GET.get("farmId") or "FA"
    if farm_id not in store.REALTIME_DATA:
        return fail("农场不存在", 404, 404)
    farm = find_by_id(store.FARMS, farm_id)
    return ok({
        "farm_id": farm_id,
        "farm_name": farm["name"] if farm else farm_id,
        "updated_at": datetime.now().isoformat(timespec="seconds"),
        "metrics": store.REALTIME_DATA[farm_id],
    })


@require_http_methods(["GET"])
def sensor_history(request):
    farm_id = request.GET.get("farm_id") or request.GET.get("farmId") or "FA"
    metric = request.GET.get("metric_name") or request.GET.get("metric") or "temperature"
    hist = store.history_24h().get(farm_id, {})
    records = hist.get(metric) or []
    return ok({
        "device_id": request.GET.get("device_id", ""),
        "farm_id": farm_id,
        "metric_name": metric,
        "records": records,
        "total": len(records),
    })


@csrf_exempt
@require_http_methods(["POST"])
def sensor_upload(request):
    records = body_json(request).get("records", [])
    return ok({"accepted": len(records)}, message="数据上报成功")


@csrf_exempt
@require_http_methods(["GET", "POST"])
def devices(request):
    if request.method == "POST":
        payload = body_json(request)
        new_id = payload.get("id") or f"DEV{len(store.DEVICES) + 1:03d}"
        device = {
            "id": new_id,
            "name": payload.get("name", "新设备"),
            "type": payload.get("type") or payload.get("device_type", "sensor"),
            "typeLabel": payload.get("typeLabel") or {"sensor": "传感器", "controller": "控制器", "gateway": "网关"}.get(payload.get("device_type", "sensor"), "设备"),
            "status": payload.get("status", "online"),
            "farmId": payload.get("farmId") or payload.get("farm_id", "FA"),
            "zoneId": payload.get("zoneId") or payload.get("zone_id", "FA-Z1"),
            "fieldId": payload.get("fieldId") or payload.get("field_id"),
            "location": payload.get("location", ""),
            "lastUpdate": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "model": payload.get("model", ""),
            "firmware": payload.get("firmware") or payload.get("firmware_version", "v1.0.0"),
        }
        store.DEVICES.append(device)
        return ok(normalize_device(device), message="新增成功", status=201)

    items = store.DEVICES
    farm_id = request.GET.get("farm_id") or request.GET.get("farmId")
    zone_id = request.GET.get("zone_id") or request.GET.get("zoneId")
    device_type = request.GET.get("device_type") or request.GET.get("type")
    status = request.GET.get("status")
    q = (request.GET.get("q") or "").strip().lower()
    if farm_id:
        items = [d for d in items if d["farmId"] == farm_id]
    if zone_id:
        items = [d for d in items if d["zoneId"] == zone_id]
    if device_type:
        items = [d for d in items if d["type"] == device_type]
    if status:
        items = [d for d in items if d["status"] == status]
    if q:
        items = [d for d in items if q in d["id"].lower() or q in d["name"].lower()]
    return ok(paginate([normalize_device(d) for d in items], request))


@require_http_methods(["GET"])
def device_stats(_request):
    return ok(store.device_stats())


@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
def device_detail(request, device_id):
    device = find_by_id(store.DEVICES, device_id)
    if not device:
        return fail("设备不存在", 404, 404)
    if request.method == "DELETE":
        store.DEVICES.remove(device)
        return ok(message="删除成功")
    if request.method == "PUT":
        payload = body_json(request)
        mapping = {"device_type": "type", "farm_id": "farmId", "zone_id": "zoneId", "field_id": "fieldId", "firmware_version": "firmware"}
        for key, value in payload.items():
            device[mapping.get(key, key)] = value
        device["lastUpdate"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        return ok(normalize_device(device), message="更新成功")
    data = normalize_device(device)
    data["config_json"] = {"sample_interval": 300, "upload_interval": 300, "alarm_enabled": True}
    data["recent_records"] = store.history_24h().get(device["farmId"], {}).get("temperature", [])[-5:]
    return ok(data)


@require_http_methods(["GET"])
def alerts(request):
    items = store.ALERTS
    level = request.GET.get("level")
    status = request.GET.get("status")
    device_id = request.GET.get("device_id") or request.GET.get("deviceId")
    if level:
        items = [a for a in items if a["level"] == level]
    if status:
        items = [a for a in items if a["status"] == status]
    if device_id:
        items = [a for a in items if a["deviceId"] == device_id]
    return ok(paginate(items, request))


@require_http_methods(["GET"])
def alert_stats(_request):
    return ok(store.alert_stats())


@require_http_methods(["GET"])
def alert_rules(_request):
    return ok(store.ALERT_RULES)


@csrf_exempt
@require_http_methods(["PUT"])
def alert_rule_detail(request, rule_id):
    rule = find_by_id(store.ALERT_RULES, rule_id)
    if not rule:
        return fail("规则不存在", 404, 404)
    rule.update(body_json(request))
    return ok(rule, message="规则已更新")


@csrf_exempt
@require_http_methods(["PUT"])
def alert_confirm(request, alert_id):
    alert = find_by_id(store.ALERTS, alert_id)
    if not alert:
        return fail("告警不存在", 404, 404)
    alert["status"] = "confirmed"
    alert["notes"] = body_json(request).get("notes", alert.get("notes", ""))
    alert["confirmed_at"] = datetime.now().isoformat(timespec="seconds")
    return ok(alert, message="告警已确认")


@csrf_exempt
@require_http_methods(["PUT"])
def alert_close(request, alert_id):
    alert = find_by_id(store.ALERTS, alert_id)
    if not alert:
        return fail("告警不存在", 404, 404)
    alert["status"] = "closed"
    alert["notes"] = body_json(request).get("notes", alert.get("notes", ""))
    alert["closed_at"] = datetime.now().isoformat(timespec="seconds")
    return ok(alert, message="告警已关闭")


@require_http_methods(["GET"])
def farms(_request):
    return ok(store.FARMS)


@require_http_methods(["GET"])
def zones(request):
    farm_id = request.GET.get("farm_id") or request.GET.get("farmId")
    items = [z for z in store.ZONES if not farm_id or z["farmId"] == farm_id]
    return ok(items)


@csrf_exempt
@require_http_methods(["GET", "POST"])
def fields(request):
    if request.method == "POST":
        payload = body_json(request)
        field = {
            "id": payload.get("id") or f"F{len(store.FIELDS) + 1:03d}",
            "zoneId": payload.get("zoneId") or payload.get("zone_id", "FA-Z1"),
            "farmId": payload.get("farmId") or payload.get("farm_id", "FA"),
            "name": payload.get("name", "新地块"),
            "area": payload.get("area", 0),
            "crop": payload.get("crop", ""),
            "batch": payload.get("batch") or payload.get("batch_id"),
            "devices": payload.get("devices", 0),
            "manager": payload.get("manager", ""),
            "soil": payload.get("soil", ""),
        }
        store.FIELDS.append(field)
        return ok(normalize_field(field), message="新增成功", status=201)
    farm_id = request.GET.get("farm_id") or request.GET.get("farmId")
    zone_id = request.GET.get("zone_id") or request.GET.get("zoneId")
    items = store.FIELDS
    if farm_id:
        items = [f for f in items if f["farmId"] == farm_id]
    if zone_id:
        items = [f for f in items if f["zoneId"] == zone_id]
    return ok([normalize_field(f) for f in items])


@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
def field_detail(request, field_id):
    field = find_by_id(store.FIELDS, field_id)
    if not field:
        return fail("地块不存在", 404, 404)
    if request.method == "DELETE":
        store.FIELDS.remove(field)
        return ok(message="删除成功")
    if request.method == "PUT":
        payload = body_json(request)
        mapping = {"farm_id": "farmId", "zone_id": "zoneId", "batch_id": "batch"}
        for key, value in payload.items():
            field[mapping.get(key, key)] = value
        return ok(normalize_field(field), message="更新成功")
    data = normalize_field(field)
    data["devices_list"] = [normalize_device(d) for d in store.DEVICES if d["fieldId"] == field_id]
    batch = find_by_id(store.BATCHES, field.get("batch"))
    data["current_batch"] = normalize_batch(batch) if batch else None
    return ok(data)


@csrf_exempt
@require_http_methods(["GET", "POST"])
def batches(request):
    if request.method == "POST":
        payload = body_json(request)
        batch = {
            "id": payload.get("id") or f"B{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "crop": payload.get("crop") or payload.get("crop_name", ""),
            "variety": payload.get("variety") or payload.get("variety_name", ""),
            "fields": payload.get("fields") or payload.get("field_ids", []),
            "sowDate": payload.get("sowDate") or payload.get("sow_date"),
            "harvestDate": payload.get("harvestDate") or payload.get("expected_harvest_date"),
            "area": payload.get("area", 0),
            "status": payload.get("status", "growing"),
            "progress": payload.get("progress") or payload.get("progress_pct", 0),
            "manager": payload.get("manager", ""),
            "desc": payload.get("desc") or payload.get("description", ""),
        }
        store.BATCHES.append(batch)
        return ok(normalize_batch(batch), message="新增成功", status=201)
    status = request.GET.get("status")
    items = [b for b in store.BATCHES if not status or b["status"] == status]
    return ok([normalize_batch(b) for b in items])


@require_http_methods(["GET"])
def batch_detail(_request, batch_id):
    batch = find_by_id(store.BATCHES, batch_id)
    if not batch:
        return fail("批次不存在", 404, 404)
    data = normalize_batch(batch)
    data["fields_detail"] = [normalize_field(f) for f in store.FIELDS if f["id"] in batch["fields"]]
    data["records"] = store.FIELD_RECORDS.get(batch_id, [])
    return ok(data)


@csrf_exempt
@require_http_methods(["PUT"])
def batch_status(request, batch_id):
    batch = find_by_id(store.BATCHES, batch_id)
    if not batch:
        return fail("批次不存在", 404, 404)
    payload = body_json(request)
    if "status" in payload:
        batch["status"] = payload["status"]
    if "progress_pct" in payload:
        batch["progress"] = payload["progress_pct"]
    if "progress" in payload:
        batch["progress"] = payload["progress"]
    return ok(normalize_batch(batch), message="批次状态已更新")


@require_http_methods(["GET"])
def tracing(_request, batch_id):
    batch = find_by_id(store.BATCHES, batch_id)
    if not batch:
        return fail("批次不存在", 404, 404)
    data = normalize_batch(batch)
    data["batch_id"] = batch["id"]
    data["records"] = store.FIELD_RECORDS.get(batch_id, [])
    data["trace_code"] = f"TRACE-{batch_id}"
    return ok(data)


@csrf_exempt
@require_http_methods(["POST"])
def tracing_records(request, batch_id):
    if not find_by_id(store.BATCHES, batch_id):
        return fail("批次不存在", 404, 404)
    payload = body_json(request)
    records = store.FIELD_RECORDS.setdefault(batch_id, [])
    record = {
        "id": payload.get("id") or f"TR{sum(len(v) for v in store.FIELD_RECORDS.values()) + 1:03d}",
        "type": payload.get("type") or payload.get("record_type", ""),
        "date": payload.get("date") or payload.get("operated_at") or datetime.now().strftime("%Y-%m-%d"),
        "operator": payload.get("operator") or payload.get("operator_name", "系统用户"),
        "title": payload.get("title", ""),
        "content": payload.get("content", ""),
        "materials": payload.get("materials", []),
        "notes": payload.get("notes", ""),
    }
    records.append(record)
    return ok(record, message="记录已添加", status=201)


@require_http_methods(["GET"])
def tracing_public(_request, trace_code):
    batch_id = trace_code.replace("TRACE-", "")
    batch = find_by_id(store.BATCHES, batch_id)
    if not batch:
        return fail("追溯码不存在", 404, 404)
    data = normalize_batch(batch)
    data["records"] = store.FIELD_RECORDS.get(batch_id, [])
    return ok(data)


@require_http_methods(["GET"])
def report_env_trend(request):
    days = int(request.GET.get("days", 30))
    data = store.history_30d()
    return ok({key: values[-days:] for key, values in data.items()})


@require_http_methods(["GET"])
def report_alert_stats(request):
    group_by = request.GET.get("group_by", "day")
    stats = store.alert_stats_30d()
    if group_by == "day":
        return ok(stats)
    if group_by == "week":
        return ok(_group_alert_stats(stats, 7, "第{}周"))
    if group_by == "month":
        return ok(_group_alert_stats(stats, 30, "{}月"))
    return ok(stats)


@require_http_methods(["GET"])
def report_device_online_rate(_request):
    stats = store.device_stats()
    return ok({
        "overall": stats,
        "by_farm": [
            {**item, "online_rate": round(item["online"] / item["total"] * 100, 1) if item["total"] else 0}
            for item in stats["by_farm"]
        ],
    })


@require_http_methods(["GET"])
def report_batch_summary(_request):
    rows = []
    for batch in store.BATCHES:
        dev_count = len([d for d in store.DEVICES if d.get("fieldId") in batch["fields"]])
        alert_count = 0
        for alert in store.ALERTS:
            dev = find_by_id(store.DEVICES, alert["deviceId"])
            if dev and dev.get("fieldId") in batch["fields"]:
                alert_count += 1
        rows.append({**normalize_batch(batch), "device_count": dev_count, "alert_count": alert_count})
    return ok(rows)


def _group_alert_stats(stats, size, label_tpl):
    grouped = {"dates": [], "counts": {"critical": [], "warning": [], "info": []}}
    for start in range(0, len(stats["dates"]), size):
        end = min(start + size, len(stats["dates"]))
        grouped["dates"].append(label_tpl.format(len(grouped["dates"]) + 1))
        for level in grouped["counts"]:
            grouped["counts"][level].append(sum(stats["counts"][level][start:end]))
    return grouped
