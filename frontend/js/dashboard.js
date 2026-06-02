/**
 * dashboard.js —— 监控看板逻辑
 * 依赖：mock-data.js, ECharts (CDN)
 */

"use strict";

/* =====================================================
   初始化
   ===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initUserInfo();
  renderMetricCards("FA");
  renderTrendChart("FA");
  renderDeviceOverviewChart();
  renderAlertPanel();
  bindAreaSwitch();
  startAutoRefresh();
});

/* =====================================================
   用户信息
   ===================================================== */
function initUserInfo() {
  const user = getCurrentUser();
  const el = document.getElementById("topbarUser");
  if (el) {
    el.querySelector(".t-avatar").textContent = user.avatar;
    el.querySelector(".u-name").textContent   = user.name;
  }
}

/* =====================================================
   指标卡片渲染
   ===================================================== */
function renderMetricCards(farmId) {
  const data = REALTIME_DATA[farmId];
  if (!data) return;

  const metrics = [
    { key: "temperature",  label: "空气温度",   icon: "🌡️" },
    { key: "humidity",     label: "空气湿度",   icon: "💧" },
    { key: "soilMoisture", label: "土壤水分",   icon: "🌱" },
    { key: "co2",          label: "CO₂浓度",   icon: "🌫️" },
    { key: "light",        label: "光照强度",   icon: "☀️" },
    { key: "ph",           label: "土壤pH",    icon: "⚗️" }
  ];

  const container = document.getElementById("metricGrid");
  if (!container) return;

  const trendArrow  = { up: "↑", down: "↓", stable: "→" };
  const trendClass  = { up: "up", down: "down", stable: "stable" };
  const statusClass = { normal: "", warning: "warn", danger: "danger", info: "info" };

  container.innerHTML = metrics.map(m => {
    const d = data[m.key];
    return `
      <div class="metric-card ${statusClass[d.status] || ""}" data-icon="${m.icon}">
        <div class="metric-label">${m.label}</div>
        <div class="metric-value">${d.value}<span class="metric-unit">${d.unit}</span></div>
        <div class="metric-trend ${trendClass[d.trend]}">
          <span>${trendArrow[d.trend]}</span>
          <span>${trendLabel(d.trend)}</span>
          ${d.status !== "normal" ? `<span class="badge badge-${d.status === "warning" ? "warning" : "danger"}" style="margin-left:auto;padding:1px 7px;">${d.status === "warning" ? "偏高" : "异常"}</span>` : ""}
        </div>
      </div>
    `;
  }).join("");
}

function trendLabel(t) {
  return { up: "升高中", down: "下降中", stable: "稳定" }[t] || t;
}

/* =====================================================
   趋势折线图
   ===================================================== */
let trendChart = null;

function renderTrendChart(farmId) {
  const dom = document.getElementById("trendChart");
  if (!dom) return;

  if (!trendChart) {
    trendChart = echarts.init(dom, null, { renderer: "canvas" });
    window.addEventListener("resize", () => trendChart && trendChart.resize());
  }

  const hist = HISTORY_24H[farmId];
  const hours = hist.temperature.map(d => d.time);

  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255,255,255,.95)",
      borderColor: "#E0E0E0",
      textStyle: { color: "#212121", fontSize: 12 },
      axisPointer: { type: "cross", label: { backgroundColor: "#2E7D32" } }
    },
    legend: {
      data: ["温度(°C)", "湿度(%)", "土壤水分(%)"],
      top: 8, right: 10,
      textStyle: { fontSize: 12, color: "#616161" }
    },
    grid: { top: 48, left: 14, right: 14, bottom: 36, containLabel: true },
    xAxis: {
      type: "category", data: hours,
      axisLabel: { fontSize: 11, color: "#9E9E9E", interval: 3 },
      axisLine: { lineStyle: { color: "#E0E0E0" } },
      splitLine: { show: false }
    },
    yAxis: [
      { type: "value", name: "°C / %", nameTextStyle: { fontSize: 11 }, axisLabel: { fontSize: 11, color: "#9E9E9E" }, splitLine: { lineStyle: { color: "#F5F5F5", type: "dashed" } } }
    ],
    series: [
      {
        name: "温度(°C)", type: "line", smooth: true,
        data: hist.temperature.map(d => d.value),
        lineStyle: { color: "#E53935", width: 2.5 },
        itemStyle: { color: "#E53935" },
        areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(229,57,53,.25)" }, { offset: 1, color: "rgba(229,57,53,.02)" }] } },
        symbol: "none"
      },
      {
        name: "湿度(%)", type: "line", smooth: true,
        data: hist.humidity.map(d => d.value),
        lineStyle: { color: "#1976D2", width: 2.5 },
        itemStyle: { color: "#1976D2" },
        areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(25,118,210,.2)" }, { offset: 1, color: "rgba(25,118,210,.02)" }] } },
        symbol: "none"
      },
      {
        name: "土壤水分(%)", type: "line", smooth: true,
        data: hist.soilMoisture.map(d => d.value),
        lineStyle: { color: "#2E7D32", width: 2.5 },
        itemStyle: { color: "#2E7D32" },
        areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(46,125,50,.2)" }, { offset: 1, color: "rgba(46,125,50,.02)" }] } },
        symbol: "none"
      }
    ]
  };
  trendChart.setOption(option, true);
}

/* =====================================================
   设备在线概览图
   ===================================================== */
let deviceChart = null;

function renderDeviceOverviewChart() {
  const dom = document.getElementById("deviceChart");
  if (!dom) return;

  const stats = getDeviceStats();
  document.getElementById("devOnlineNum").textContent  = stats.online;
  document.getElementById("devOfflineNum").textContent = stats.offline;
  document.getElementById("devFaultNum").textContent   = stats.fault;
  document.getElementById("devTotalNum").textContent   = stats.total;

  if (!deviceChart) {
    deviceChart = echarts.init(dom, null, { renderer: "canvas" });
    window.addEventListener("resize", () => deviceChart && deviceChart.resize());
  }

  const option = {
    backgroundColor: "transparent",
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { show: false },
    series: [{
      type: "pie",
      radius: ["52%", "78%"],
      center: ["50%", "50%"],
      data: [
        { value: stats.online,  name: "在线", itemStyle: { color: "#2E7D32" } },
        { value: stats.offline, name: "离线", itemStyle: { color: "#9E9E9E" } },
        { value: stats.fault,   name: "故障", itemStyle: { color: "#C62828" } }
      ],
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 13, fontWeight: "bold" } },
      startAngle: 90
    }]
  };
  deviceChart.setOption(option, true);
}

/* =====================================================
   告警摘要面板
   ===================================================== */
function renderAlertPanel() {
  const container = document.getElementById("alertList");
  if (!container) return;

  // 最近5条未处理或已确认告警
  const recent = ALERTS.filter(a => a.status !== "closed").slice(0, 5);
  const all5   = recent.length < 5
    ? recent.concat(ALERTS.filter(a => a.status === "closed").slice(0, 5 - recent.length))
    : recent;

  const stats = getAlertStats();
  const unhandledEl = document.getElementById("alertUnhandledNum");
  if (unhandledEl) unhandledEl.textContent = stats.unhandled;

  container.innerHTML = all5.map(a => {
    const li = getAlertLevelInfo(a.level);
    return `
      <div class="alert-item ${a.level}" onclick="window.location.href='alerts.html'">
        <div class="alert-dot"></div>
        <div class="alert-info">
          <div class="title">${a.deviceName} · ${a.metric}</div>
          <div class="meta">当前值: ${a.currentVal} &nbsp;|&nbsp; 阈值: ${a.threshold} &nbsp;|&nbsp; <span class="badge ${li.cls}" style="padding:1px 7px;">${li.label}</span></div>
          <div class="meta">${a.time}</div>
        </div>
      </div>
    `;
  }).join("") || '<div class="empty-state"><div class="empty-icon">✅</div><p>暂无告警记录</p></div>';
}

/* =====================================================
   区域切换
   ===================================================== */
function bindAreaSwitch() {
  const sel = document.getElementById("areaSelect");
  if (!sel) return;
  sel.addEventListener("change", e => {
    const val = e.target.value;
    renderMetricCards(val);
    renderTrendChart(val);
    showToast(`已切换到 ${sel.options[sel.selectedIndex].text}`, "info");
  });
}

/* =====================================================
   数据自动刷新（模拟）
   ===================================================== */
function startAutoRefresh() {
  setInterval(() => {
    const sel = document.getElementById("areaSelect");
    const farmId = sel ? sel.value : "FA";
    // 轻微扰动模拟实时感
    const d = REALTIME_DATA[farmId];
    d.temperature.value  = parseFloat((d.temperature.value  + (Math.random() - 0.5) * 0.4).toFixed(1));
    d.humidity.value     = parseFloat((d.humidity.value     + (Math.random() - 0.5) * 1.0).toFixed(1));
    d.soilMoisture.value = parseFloat((d.soilMoisture.value + (Math.random() - 0.5) * 0.6).toFixed(1));
    d.co2.value          = Math.round(d.co2.value           + (Math.random() - 0.5) * 8);
    renderMetricCards(farmId);
    // 更新时间
    const timeEl = document.getElementById("refreshTime");
    if (timeEl) timeEl.textContent = new Date().toLocaleTimeString("zh-CN");
  }, 5000);
}
