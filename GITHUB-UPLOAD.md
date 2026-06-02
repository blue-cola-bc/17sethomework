# GitHub 上传指南

## 项目已就绪，按以下步骤上传到 GitHub

### 第一步：在 GitHub 创建仓库

1. 打开 https://github.com/new
2. 仓库名填写：`smart-agri-iot`（或 `smart-agriculture-iot-platform`）
3. 描述：`智能农业物联网监控平台 - 智慧农业实训项目`
4. 选择 `Public`（公开，方便老师查看）
5. **不要**勾选 "Initialize with README"（我们已有README）
6. 点击 `Create repository`

### 第二步：在终端执行（在本目录下）

打开 PowerShell 或 CMD，进入项目目录：

```bash
cd D:\code\zuoye\smart-agri-iot

# 初始化 Git
git init

# 配置用户信息（如果还没配置）
git config --global user.name "杨航"
git config --global user.email "你的邮箱@example.com"

# 添加所有文件
git add .

# 提交
git commit -m "feat: 智能农业物联网监控平台 截止6.03进度

- M2-1 完成：7个页面框架（登录/看板/设备/告警/地块/追溯/报表）
- M2-2 完成：完整数据库设计文档（13张表）
- M2-3 完成：RESTful接口草案（8模块40+接口）+ 测试计划（74条用例）
- 模拟数据：3农场/17设备/3批次/25告警/30天历史数据"

# 关联远程仓库（替换YOUR_USERNAME为你的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/smart-agri-iot.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 第三步：验证

打开 `https://github.com/YOUR_USERNAME/smart-agri-iot`，应该能看到所有文件。

---

## 项目结构说明

```
smart-agri-iot/
├── frontend/
│   ├── index.html      # 登录页
│   ├── dashboard.html  # 监控看板
│   ├── devices.html    # 设备管理
│   ├── alerts.html     # 告警中心
│   ├── fields.html     # 地块管理
│   ├── tracing.html    # 追溯档案
│   ├── reports.html    # 统计报表
│   ├── css/main.css    # 全局样式
│   └── js/             # 各页面逻辑 + mock-data.js
├── docs/
│   ├── database-design.md  # 数据库设计（M2-2）
│   ├── api-spec.md         # 接口草案（M2-3）
│   └── test-plan.md        # 测试计划
└── README.md
```
