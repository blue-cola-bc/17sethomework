# 智能农业物联网监控平台 — API 接口草案

**版本**：v1.0.0-M2（接口草案）  
**Base URL**：`http://localhost:5000/api/v1`  
**编写日期**：2024-06-03  
**负责人**：常琳昊（后端）  

---

## 通用规范

### 请求头

```
Content-Type: application/json
Authorization: Bearer {access_token}   （除登录接口外必须携带）
```

### 响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

### 错误码

| code | 说明 |
|---|---|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或 Token 失效 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 分页参数（列表类接口通用）

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `page` | int | 1 | 页码 |
| `page_size` | int | 20 | 每页条数，最大 100 |

---

## 一、认证模块 `/auth`

### 1.1 用户登录

```
POST /auth/login
```

**请求体**：

```json
{
  "username": "liuruihong",
  "password": "123456"
}
```

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 86400,
    "user": {
      "id": 1,
      "username": "liuruihong",
      "real_name": "刘芮宏",
      "role": "admin",
      "avatar_color": "#2E7D32"
    }
  }
}
```

### 1.2 获取当前用户信息

```
GET /auth/me
```

**响应**：

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "username": "liuruihong",
    "real_name": "刘芮宏",
    "role": "admin",
    "email": null,
    "last_login": "2024-06-03T10:30:00"
  }
}
```

### 1.3 登出

```
POST /auth/logout
```

**响应**：

```json
{ "code": 200, "message": "已成功登出" }
```

---

## 二、传感数据模块 `/sensor`

### 2.1 获取实时传感数据

```
GET /sensor/realtime
```

**查询参数**：

| 参数 | 类型 | 必须 | 说明 |
|---|---|---|---|
| `farm_id` | string | 否 | 农场ID，不传则返回全部 |
| `zone_id` | string | 否 | 区域ID |
| `device_id` | string | 否 | 设备ID |

**响应**：

```json
{
  "code": 200,
  "data": {
    "farm_id": "FA",
    "farm_name": "农场A",
    "updated_at": "2024-06-03T10:42:15",
    "metrics": {
      "temperature":   { "value": 26.4, "unit": "°C", "trend": "up",     "status": "normal" },
      "humidity":      { "value": 72.3, "unit": "%",   "trend": "stable", "status": "normal" },
      "soil_moisture": { "value": 58.1, "unit": "%",   "trend": "down",   "status": "normal" },
      "co2":           { "value": 412,  "unit": "ppm", "trend": "up",     "status": "warning" },
      "light":         { "value": 8500, "unit": "lux", "trend": "up",     "status": "normal" },
      "ph":            { "value": 6.8,  "unit": "pH",  "trend": "stable", "status": "normal" }
    }
  }
}
```

### 2.2 查询历史传感数据

```
GET /sensor/history
```

**查询参数**：

| 参数 | 类型 | 必须 | 说明 |
|---|---|---|---|
| `device_id` | string | 是 | 设备ID |
| `metric_name` | string | 是 | 指标名称 |
| `start_time` | datetime | 是 | 开始时间 ISO8601 |
| `end_time` | datetime | 是 | 结束时间 ISO8601 |
| `agg` | string | 否 | 聚合粒度：raw/1h/1d，默认 raw |

**响应**：

```json
{
  "code": 200,
  "data": {
    "device_id": "DEV001",
    "metric_name": "temperature",
    "unit": "°C",
    "records": [
      { "time": "2024-06-03T00:00:00", "value": 24.2 },
      { "time": "2024-06-03T01:00:00", "value": 23.8 }
    ],
    "total": 24
  }
}
```

### 2.3 设备数据上报（IoT设备调用）

```
POST /sensor/upload
```

**请求体**：

```json
{
  "device_id": "DEV001",
  "records": [
    { "metric_name": "temperature", "value": 26.4, "unit": "°C", "recorded_at": "2024-06-03T10:42:15" },
    { "metric_name": "humidity",    "value": 72.3, "unit": "%",   "recorded_at": "2024-06-03T10:42:15" }
  ]
}
```

**响应**：

```json
{ "code": 200, "message": "数据上报成功", "data": { "accepted": 2 } }
```

---

## 三、设备管理模块 `/devices`

### 3.1 获取设备列表

```
GET /devices
```

**查询参数**：

| 参数 | 类型 | 说明 |
|---|---|---|
| `farm_id` | string | 按农场筛选 |
| `zone_id` | string | 按区域筛选 |
| `device_type` | string | sensor/controller/gateway |
| `status` | string | online/offline/fault |
| `q` | string | 搜索关键词（名称/ID） |
| `page` | int | 页码 |
| `page_size` | int | 每页条数 |

**响应**：

```json
{
  "code": 200,
  "data": {
    "total": 17,
    "page": 1,
    "page_size": 10,
    "items": [
      {
        "id": "DEV001",
        "name": "温湿度传感器-A1-01",
        "device_type": "sensor",
        "status": "online",
        "farm_id": "FA",
        "zone_id": "FA-Z1",
        "field_id": "F001",
        "location": "水稻A1地块北部",
        "model": "DHT22-Pro",
        "firmware_version": "v2.3.1",
        "last_heartbeat": "2024-06-03T10:42:15"
      }
    ]
  }
}
```

### 3.2 获取设备详情

```
GET /devices/{device_id}
```

**响应**：与列表单项相同，额外包含 `config_json` 字段。

### 3.3 新增设备

```
POST /devices
```

**请求体**：

```json
{
  "name": "新传感器",
  "device_type": "sensor",
  "farm_id": "FA",
  "zone_id": "FA-Z1",
  "field_id": "F001",
  "location": "安装位置描述",
  "model": "DHT22-Pro"
}
```

### 3.4 更新设备

```
PUT /devices/{device_id}
```

**请求体**：同新增，所有字段可选。

### 3.5 删除设备

```
DELETE /devices/{device_id}
```

**响应**：`{ "code": 200, "message": "删除成功" }`

### 3.6 获取设备统计

```
GET /devices/stats
```

**响应**：

```json
{
  "code": 200,
  "data": {
    "total": 17, "online": 13, "offline": 2, "fault": 1,
    "online_rate": 76.5,
    "by_farm": [
      { "farm_id": "FA", "farm_name": "农场A", "total": 7, "online": 6 }
    ]
  }
}
```

---

## 四、告警模块 `/alerts`

### 4.1 获取告警列表

```
GET /alerts
```

**查询参数**：

| 参数 | 说明 |
|---|---|
| `level` | critical/warning/info |
| `status` | unhandled/confirmed/closed |
| `device_id` | 设备ID |
| `start_time` / `end_time` | 时间范围 |

**响应**：分页列表，包含告警基本信息。

### 4.2 确认告警

```
PUT /alerts/{alert_id}/confirm
```

**请求体**：

```json
{ "notes": "已派人检查，正在处理" }
```

### 4.3 关闭告警

```
PUT /alerts/{alert_id}/close
```

**请求体**：

```json
{ "notes": "已处理完毕，恢复正常" }
```

### 4.4 获取告警统计

```
GET /alerts/stats
```

**查询参数**：`start_date`, `end_date`

**响应**：

```json
{
  "code": 200,
  "data": {
    "total": 25, "critical": 7, "warning": 11, "info": 7,
    "unhandled": 2,
    "by_day": [
      { "date": "06-01", "critical": 2, "warning": 3, "info": 1 }
    ]
  }
}
```

### 4.5 告警规则列表

```
GET /alerts/rules
```

### 4.6 更新告警规则

```
PUT /alerts/rules/{rule_id}
```

**请求体**：

```json
{
  "threshold_value": 32.0,
  "is_enabled": true
}
```

---

## 五、地块管理模块 `/fields`

### 5.1 获取农场列表

```
GET /farms
```

### 5.2 获取区域列表

```
GET /zones?farm_id=FA
```

### 5.3 获取地块列表

```
GET /fields?zone_id=FA-Z1&farm_id=FA
```

### 5.4 获取地块详情

```
GET /fields/{field_id}
```

**响应**额外包含：关联设备列表、当前批次信息。

### 5.5 新增/更新/删除地块

```
POST   /fields
PUT    /fields/{field_id}
DELETE /fields/{field_id}
```

---

## 六、种植批次模块 `/batches`

### 6.1 获取批次列表

```
GET /batches?status=growing
```

### 6.2 获取批次详情

```
GET /batches/{batch_id}
```

**响应**包含：批次基本信息、关联地块、种植进度、田间记录摘要。

### 6.3 新建批次

```
POST /batches
```

**请求体**：

```json
{
  "crop_name": "水稻",
  "variety_name": "南粳46",
  "sow_date": "2024-04-15",
  "expected_harvest_date": "2024-09-20",
  "field_ids": ["F001", "F002"],
  "manager_id": 1,
  "description": "本季水稻种植说明"
}
```

### 6.4 更新批次状态

```
PUT /batches/{batch_id}/status
```

**请求体**：

```json
{ "status": "harvesting", "progress_pct": 80 }
```

---

## 七、追溯模块 `/tracing`

### 7.1 查询追溯档案

```
GET /tracing/{batch_id}
```

**响应**：

```json
{
  "code": 200,
  "data": {
    "batch_id": "B2024001",
    "crop_name": "水稻（粳稻）",
    "variety_name": "南粳46",
    "sow_date": "2024-04-15",
    "harvest_date": null,
    "total_area": 198,
    "status": "growing",
    "records": [
      {
        "id": "TR001",
        "record_type": "播种",
        "title": "播种作业",
        "content": "完成南粳46育秧...",
        "operator_name": "刘芮宏",
        "operated_at": "2024-04-15",
        "materials": ["南粳46种子 200kg"],
        "notes": "天气晴好"
      }
    ]
  }
}
```

### 7.2 添加田间记录

```
POST /tracing/{batch_id}/records
```

**请求体**：

```json
{
  "record_type": "施肥",
  "title": "追肥操作",
  "content": "施用尿素...",
  "operated_at": "2024-06-03",
  "materials": ["尿素 50kg"],
  "notes": "施肥均匀"
}
```

### 7.3 通过追溯码查询（公开接口，无需认证）

```
GET /tracing/public/{trace_code}
```

---

## 八、报表模块 `/reports`

### 8.1 环境趋势报表

```
GET /reports/env-trend
```

**查询参数**：`farm_id`, `metric_name`, `start_date`, `end_date`, `agg=1d`

### 8.2 告警统计报表

```
GET /reports/alert-stats
```

**查询参数**：`start_date`, `end_date`, `group_by=day/week/month`

### 8.3 设备在线率报表

```
GET /reports/device-online-rate
```

**查询参数**：`farm_id`, `start_date`, `end_date`

### 8.4 批次统计报表

```
GET /reports/batch-summary
```

**响应**：包含各批次的面积、设备数、告警次数、种植周期等汇总。

---

## 附录：数据字典

### 设备状态

| 值 | 说明 |
|---|---|
| `online` | 在线正常 |
| `offline` | 离线（超过10分钟无心跳） |
| `fault` | 故障（设备上报错误状态） |

### 告警等级

| 值 | 说明 | 响应时间 |
|---|---|---|
| `critical` | 严重 | 立即处理（< 30分钟） |
| `warning` | 警告 | 当日处理（< 4小时） |
| `info` | 提示 | 24小时内处理 |

### 批次状态

| 值 | 说明 |
|---|---|
| `growing` | 生长中 |
| `harvesting` | 采收期 |
| `finished` | 已完成 |
| `aborted` | 已终止 |
