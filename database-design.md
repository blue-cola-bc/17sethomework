# 智能农业物联网监控平台 — 数据库设计文档

**项目名称**：Smart Agriculture IoT Monitoring Platform  
**版本**：v1.0.0-M2  
**编写日期**：2024-06-03  
**负责人**：刘芮宏  

---

## 目录

1. [概述](#概述)
2. [ER图关系描述](#er图关系描述)
3. [数据表设计](#数据表设计)
   - [用户表 users](#1-用户表-users)
   - [农场表 farms](#2-农场表-farms)
   - [区域表 zones](#3-区域表-zones)
   - [地块表 fields](#4-地块表-fields)
   - [设备表 devices](#5-设备表-devices)
   - [传感数据表 sensor_data](#6-传感数据表-sensor_data)
   - [告警规则表 alert_rules](#7-告警规则表-alert_rules)
   - [告警记录表 alert_records](#8-告警记录表-alert_records)
   - [作物品种表 crop_varieties](#9-作物品种表-crop_varieties)
   - [种植批次表 plant_batches](#10-种植批次表-plant_batches)
   - [批次地块关联表 batch_fields](#11-批次地块关联表-batch_fields)
   - [田间记录表 field_records](#12-田间记录表-field_records)
   - [追溯档案表 tracing_records](#13-追溯档案表-tracing_records)
4. [索引设计](#索引设计)
5. [初始数据说明](#初始数据说明)

---

## 概述

本文档描述智慧农业物联网监控平台的数据库结构设计，使用 **SQLite**（开发/演示阶段），生产环境可迁移至 MySQL 8.0+。

**核心数据域**：

| 域 | 说明 |
|---|---|
| 用户与权限 | 平台登录用户、角色管理 |
| 农场结构 | 农场 > 区域 > 地块（三级层次） |
| 设备管理 | IoT 设备注册、状态、配置 |
| 传感数据 | 时序传感器上报数据 |
| 告警管理 | 告警规则、告警记录、处理流程 |
| 作物种植 | 品种库、种植批次、批次生命周期 |
| 田间作业 | 作业记录、追溯档案 |

---

## ER图关系描述

```
users (1) ─────────────────── (*) farms
farms (1) ─────────────────── (*) zones
zones (1) ─────────────────── (*) fields
fields (1) ────────────────── (*) devices
devices (1) ───────────────── (*) sensor_data
devices (1) ───────────────── (*) alert_records
alert_rules (1) ────────────── (*) alert_records
crop_varieties (1) ──────────── (*) plant_batches
plant_batches (M) ───────────── (N) fields   [via batch_fields]
plant_batches (1) ───────────── (*) field_records
field_records (1) ───────────── (1) tracing_records
```

---

## 数据表设计

### 1. 用户表 `users`

> 平台登录用户，支持4种预定义角色。

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | 用户ID |
| `username` | VARCHAR(50) | NOT NULL, UNIQUE | 登录用户名 |
| `real_name` | VARCHAR(50) | NOT NULL | 真实姓名 |
| `password_hash` | VARCHAR(128) | NOT NULL | 密码哈希（bcrypt） |
| `role` | VARCHAR(20) | NOT NULL | 角色：admin/viewer/tester |
| `avatar_color` | VARCHAR(10) | DEFAULT '#2E7D32' | 头像颜色 |
| `email` | VARCHAR(100) | NULL | 邮箱 |
| `phone` | VARCHAR(20) | NULL | 手机号 |
| `is_active` | INTEGER | DEFAULT 1 | 是否启用（0/1） |
| `last_login` | DATETIME | NULL | 最后登录时间 |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**角色说明**：
- `admin`：管理员，拥有全部权限
- `viewer`：普通用户，只读权限
- `tester`：测试员，只读+部分操作权限

**初始数据**：

| username | real_name | role |
|---|---|---|
| liuruihong | 刘芮宏 | admin |
| wangpanjie | 王攀杰 | viewer |
| changlinhao | 常琳昊 | viewer |
| yanghang | 杨航 | tester |

---

### 2. 农场表 `farms`

> 农场是最高级别的地理单元。

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | VARCHAR(10) | PK | 农场ID，如 FA/FB/FC |
| `name` | VARCHAR(100) | NOT NULL | 农场名称 |
| `location` | VARCHAR(200) | NULL | 地理位置描述 |
| `longitude` | DECIMAL(10,7) | NULL | 经度 |
| `latitude` | DECIMAL(10,7) | NULL | 纬度 |
| `area_mu` | DECIMAL(10,2) | NULL | 总面积（亩） |
| `manager_id` | INTEGER | FK → users.id | 负责人ID |
| `description` | TEXT | NULL | 农场简介 |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

---

### 3. 区域表 `zones`

> 农场下的分区，如露天区、温室等。

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | VARCHAR(20) | PK | 区域ID，如 FA-Z1 |
| `farm_id` | VARCHAR(10) | FK → farms.id, NOT NULL | 所属农场 |
| `name` | VARCHAR(100) | NOT NULL | 区域名称 |
| `zone_type` | VARCHAR(20) | NOT NULL | 类型：露天/温室/大棚 |
| `area_mu` | DECIMAL(10,2) | NULL | 区域面积（亩） |
| `description` | TEXT | NULL | 区域描述 |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

---

### 4. 地块表 `fields`

> 种植管理的最小单元，绑定作物批次。

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | VARCHAR(20) | PK | 地块ID，如 F001 |
| `zone_id` | VARCHAR(20) | FK → zones.id, NOT NULL | 所属区域 |
| `name` | VARCHAR(100) | NOT NULL | 地块名称 |
| `area_mu` | DECIMAL(10,2) | NOT NULL | 地块面积（亩） |
| `soil_type` | VARCHAR(50) | NULL | 土壤类型 |
| `manager_id` | INTEGER | FK → users.id | 负责人ID |
| `current_batch_id` | VARCHAR(20) | FK → plant_batches.id, NULL | 当前种植批次 |
| `geometry` | TEXT | NULL | GeoJSON 多边形（未来地图展示用） |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

---

### 5. 设备表 `devices`

> IoT 设备注册表，记录设备基本信息和当前状态。

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | VARCHAR(20) | PK | 设备ID，如 DEV001 |
| `name` | VARCHAR(100) | NOT NULL | 设备名称 |
| `device_type` | VARCHAR(20) | NOT NULL | sensor/controller/gateway |
| `status` | VARCHAR(20) | NOT NULL | online/offline/fault |
| `farm_id` | VARCHAR(10) | FK → farms.id | 所属农场 |
| `zone_id` | VARCHAR(20) | FK → zones.id | 所属区域 |
| `field_id` | VARCHAR(20) | FK → fields.id, NULL | 所属地块（可为空） |
| `location_desc` | VARCHAR(200) | NULL | 安装位置描述 |
| `model` | VARCHAR(50) | NULL | 设备型号 |
| `firmware_version` | VARCHAR(20) | NULL | 固件版本 |
| `mac_address` | VARCHAR(20) | UNIQUE, NULL | MAC地址 |
| `ip_address` | VARCHAR(20) | NULL | IP地址 |
| `install_date` | DATE | NULL | 安装日期 |
| `last_heartbeat` | DATETIME | NULL | 最后心跳时间 |
| `config_json` | TEXT | NULL | 设备配置（JSON） |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

---

### 6. 传感数据表 `sensor_data`

> 传感器上报的时序数据，数据量大，建议按月分表或使用 InfluxDB。

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | 记录ID |
| `device_id` | VARCHAR(20) | FK → devices.id, NOT NULL | 设备ID |
| `metric_name` | VARCHAR(50) | NOT NULL | 指标名：temperature/humidity/soil_moisture/co2/light/ph |
| `metric_value` | DECIMAL(12,4) | NOT NULL | 数值 |
| `unit` | VARCHAR(20) | NULL | 单位：°C/% /ppm/lux |
| `quality` | INTEGER | DEFAULT 1 | 数据质量：1正常/0异常 |
| `recorded_at` | DATETIME | NOT NULL | 采集时间 |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 入库时间 |

> **分区建议**：按 `recorded_at` 月份分区，或使用 `device_id + recorded_at` 联合索引加速查询。  
> **数据保留策略**：原始数据保留 90 天，聚合数据（小时均值）保留 1 年。

---

### 7. 告警规则表 `alert_rules`

> 定义触发告警的阈值规则。

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | VARCHAR(20) | PK | 规则ID，如 R001 |
| `name` | VARCHAR(100) | NOT NULL | 规则名称 |
| `metric_name` | VARCHAR(50) | NOT NULL | 监控指标名 |
| `condition_type` | VARCHAR(10) | NOT NULL | 条件类型：gt/lt/gte/lte/eq/ne/offline |
| `threshold_value` | DECIMAL(12,4) | NULL | 阈值（离线类型为空） |
| `duration_sec` | INTEGER | DEFAULT 0 | 持续时长（秒）触发，0表示立即 |
| `alert_level` | VARCHAR(20) | NOT NULL | critical/warning/info |
| `device_types` | VARCHAR(100) | NULL | 适用设备类型，逗号分隔 |
| `is_enabled` | INTEGER | DEFAULT 1 | 是否启用 |
| `created_by` | INTEGER | FK → users.id | 创建人 |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

---

### 8. 告警记录表 `alert_records`

> 每次触发告警的记录及处理流程。

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | VARCHAR(20) | PK | 告警ID，如 AL001 |
| `rule_id` | VARCHAR(20) | FK → alert_rules.id, NULL | 触发规则（NULL表示系统告警） |
| `device_id` | VARCHAR(20) | FK → devices.id, NOT NULL | 触发设备 |
| `metric_name` | VARCHAR(50) | NOT NULL | 告警指标 |
| `current_value` | VARCHAR(50) | NOT NULL | 触发时的当前值（存字符串便于展示） |
| `threshold_desc` | VARCHAR(100) | NULL | 阈值描述 |
| `alert_level` | VARCHAR(20) | NOT NULL | critical/warning/info |
| `status` | VARCHAR(20) | NOT NULL | unhandled/confirmed/closed |
| `triggered_at` | DATETIME | NOT NULL | 触发时间 |
| `confirmed_by` | INTEGER | FK → users.id, NULL | 确认处理人 |
| `confirmed_at` | DATETIME | NULL | 确认时间 |
| `closed_at` | DATETIME | NULL | 关闭时间 |
| `handle_notes` | TEXT | NULL | 处理备注 |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

---

### 9. 作物品种表 `crop_varieties`

> 农场种植的作物品种信息库。

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | 品种ID |
| `crop_name` | VARCHAR(50) | NOT NULL | 作物名称，如水稻、番茄 |
| `variety_name` | VARCHAR(100) | NOT NULL | 品种名称，如南粳46 |
| `category` | VARCHAR(30) | NULL | 分类：粮食作物/蔬菜/水果/经济作物 |
| `growth_days` | INTEGER | NULL | 参考生长天数 |
| `optimal_temp_min` | DECIMAL(5,2) | NULL | 适宜温度下限（°C） |
| `optimal_temp_max` | DECIMAL(5,2) | NULL | 适宜温度上限（°C） |
| `optimal_humidity_min` | DECIMAL(5,2) | NULL | 适宜湿度下限（%） |
| `optimal_humidity_max` | DECIMAL(5,2) | NULL | 适宜湿度上限（%） |
| `optimal_ph_min` | DECIMAL(4,2) | NULL | 适宜pH下限 |
| `optimal_ph_max` | DECIMAL(4,2) | NULL | 适宜pH上限 |
| `description` | TEXT | NULL | 品种简介 |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

---

### 10. 种植批次表 `plant_batches`

> 一次完整的种植周期，贯穿播种到收获。

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | VARCHAR(20) | PK | 批次号，如 B2024001 |
| `crop_name` | VARCHAR(100) | NOT NULL | 作物名称 |
| `variety_id` | INTEGER | FK → crop_varieties.id, NULL | 品种ID |
| `variety_name` | VARCHAR(100) | NULL | 品种名称（冗余，便于展示） |
| `sow_date` | DATE | NOT NULL | 播种日期 |
| `expected_harvest_date` | DATE | NULL | 预计收获日期 |
| `actual_harvest_date` | DATE | NULL | 实际收获日期 |
| `total_area_mu` | DECIMAL(10,2) | NULL | 总种植面积（亩） |
| `status` | VARCHAR(20) | NOT NULL | growing/harvesting/finished/aborted |
| `progress_pct` | INTEGER | DEFAULT 0 | 生长进度（0-100） |
| `manager_id` | INTEGER | FK → users.id | 负责人 |
| `description` | TEXT | NULL | 批次说明 |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

---

### 11. 批次地块关联表 `batch_fields`

> 种植批次与地块的多对多关系。

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | 关联ID |
| `batch_id` | VARCHAR(20) | FK → plant_batches.id, NOT NULL | 批次号 |
| `field_id` | VARCHAR(20) | FK → fields.id, NOT NULL | 地块ID |
| `area_mu` | DECIMAL(10,2) | NULL | 该地块的种植面积 |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

> **联合唯一约束**：`(batch_id, field_id)`

---

### 12. 田间记录表 `field_records`

> 种植过程中的作业记录，是追溯档案的原始数据。

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | VARCHAR(20) | PK | 记录ID，如 TR001 |
| `batch_id` | VARCHAR(20) | FK → plant_batches.id, NOT NULL | 所属批次 |
| `field_id` | VARCHAR(20) | FK → fields.id, NULL | 关联地块（可为整批次操作） |
| `record_type` | VARCHAR(30) | NOT NULL | 类型：播种/施肥/除草/病虫害防治/灌溉/采收/其他 |
| `title` | VARCHAR(200) | NOT NULL | 记录标题 |
| `content` | TEXT | NOT NULL | 详细内容描述 |
| `operator_id` | INTEGER | FK → users.id, NULL | 操作人ID |
| `operator_name` | VARCHAR(50) | NULL | 操作人姓名（冗余） |
| `operated_at` | DATE | NOT NULL | 操作日期 |
| `materials_json` | TEXT | NULL | 使用物料列表（JSON数组） |
| `notes` | TEXT | NULL | 备注 |
| `images_json` | TEXT | NULL | 图片路径列表（JSON数组） |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

---

### 13. 追溯档案表 `tracing_records`

> 对外查询的追溯档案，聚合田间记录形成完整追溯链。

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | 档案ID |
| `batch_id` | VARCHAR(20) | FK → plant_batches.id, NOT NULL | 批次号 |
| `trace_code` | VARCHAR(50) | UNIQUE, NOT NULL | 追溯码（可扫码查询） |
| `product_name` | VARCHAR(100) | NOT NULL | 产品名称 |
| `origin_farm` | VARCHAR(100) | NULL | 产地农场 |
| `origin_zone` | VARCHAR(100) | NULL | 产地区域 |
| `sow_date` | DATE | NULL | 播种日期 |
| `harvest_date` | DATE | NULL | 收获日期 |
| `pesticide_records` | TEXT | NULL | 农药使用记录（JSON） |
| `fertilizer_records` | TEXT | NULL | 施肥记录（JSON） |
| `inspection_result` | VARCHAR(50) | NULL | 质检结果：合格/不合格 |
| `inspection_org` | VARCHAR(100) | NULL | 检测机构 |
| `certificate_no` | VARCHAR(100) | NULL | 检测证书编号 |
| `qr_code_url` | VARCHAR(500) | NULL | 二维码图片URL |
| `published_at` | DATETIME | NULL | 发布时间 |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

---

## 索引设计

```sql
-- 传感数据：高频查询按设备+时间
CREATE INDEX idx_sensor_device_time ON sensor_data(device_id, recorded_at DESC);

-- 传感数据：按时间范围全表扫描
CREATE INDEX idx_sensor_time ON sensor_data(recorded_at DESC);

-- 告警记录：按状态筛选
CREATE INDEX idx_alert_status ON alert_records(status);
CREATE INDEX idx_alert_device ON alert_records(device_id, triggered_at DESC);

-- 设备：按状态/农场筛选
CREATE INDEX idx_device_status ON devices(status);
CREATE INDEX idx_device_farm ON devices(farm_id);

-- 批次：按状态查询
CREATE INDEX idx_batch_status ON plant_batches(status);

-- 田间记录：按批次查询
CREATE INDEX idx_field_record_batch ON field_records(batch_id, operated_at DESC);

-- 追溯：按追溯码查询
CREATE UNIQUE INDEX idx_tracing_code ON tracing_records(trace_code);
```

---

## 初始数据说明

初始化 SQL 见 `docs/init-data.sql`（待开发阶段生成）。

包含：
1. 4名用户数据
2. 3个农场、8个区域、8个地块
3. 17个设备
4. 3个种植批次、8个批次-地块关联
5. 10条田间作业记录
6. 9条告警规则
7. 25条告警记录（演示用）
