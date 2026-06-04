# 智能农业物联网监控平台 (Smart Agriculture IoT Monitoring Platform)

> **2026 民族大学人工智能研究生实训 — 第17组**
>
> 本项目为实训课程作业，仅供学习使用。

---

## 📌 项目简介

基于 Web 的农业环境监控与管理系统，提供农场环境监测、设备管理、告警中心、质量追溯等核心功能。

---

## 👥 团队成员与分工

| 姓名 | 角色 / 主要分工 | GitHub 分支 |
| :--- | :--- | :--- |
| **刘芮宏** | 组长 / 整体统筹 | `dev-liuruihong` |
| **王攀杰** | 前端开发 | `dev-wangpanjie` |
| **常琳昊** | 后端开发 | `dev-changlinghao` |
| **杨航** | 测试与文档 | `dev-yanghang` |

---

## 🛠️ 技术栈

* **前端**：`HTML5` + `CSS3` + `JavaScript`（基于 `Vue 3` + `Element Plus` + `ECharts`，通过 CDN 引入）
* **后端**：`Python 3` + `Django` + `Django REST Framework` + `SQLite`
* **认证**：`JWT Token` 认证机制
* **部署**：本地开发服务器

---

## 📂 项目结构

```text
smart-agri-iot/
├── frontend/              # 前端页面目录
│   ├── index.html         # 登录页
│   ├── dashboard.html     # 监控看板
│   ├── devices.html       # 设备管理
│   ├── alerts.html        # 告警中心
│   ├── fields.html        # 地块管理
│   ├── tracing.html       # 追溯档案
│   ├── reports.html       # 统计报表
│   ├── css/
│   │   └── main.css       # 全局样式
│   └── js/                # 页面逻辑 + 模拟数据
├── api/                   # Django REST API 应用
│   ├── views.py           # API 视图
│   ├── urls.py            # 路由配置
│   └── mock_store.py      # 模拟数据存储
├── smart_agri_iot/        # Django 项目配置
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── docs/                  # 团队设计文档
│   ├── database-design.md # 数据库设计
│   ├── api-spec.md        # 接口草案
│   └── test-plan.md       # 测试计划
├── manage.py              # Django 管理脚本
├── requirements.txt       # Python 依赖包列表
├── run.bat                # Windows 启动批处理脚本
└── .gitignore             # Git 忽略规则
