/**
 * reports.js —— 统计报表页逻辑
 */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  initUserInfo();
  renderEnvTrendChart();
  renderAlertBarChart();
  renderDevicePieChart();
  renderBatchStatsTable();
  bindPeriodSwitch();
});

function initUserInfo() {
  const user = getCurrentUser();
  const av = document.getElementById("topbarAvatar");
  const nm = document.getElementById("topbarName");
  if (av) av.textContent = user.avatar;
  if (nm) nm.textContent = user.name;
}

/* ── 环境趋势折线图（近30天） ── */
function renderEnvTrendChart(period = 30) {
  const dom = document.getElementById("envTrendChart");
  if (!dom || typeof echarts === "undefined") return;

  const chart = echarts.getInstanceByDom(dom) || echarts.init(dom);

  const n       = Math.min(period, 30);
  const tempData = HISTORY_30D.temperature.slice(-n);
  const humiData = HISTORY_30D.humidity.slice(-n);
  const co2Data  = HISTORY_30D.co2.slice(-n);
  const dates    = tempData.map(d => d.date);

  chart.setOption({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      backgroundColor: "rgba(255,255,255,.95)",
      borderColor: "#E0E0E0",
      textStyle: { color: "#212121", fontSize: 12 }
    },
    legend: {
      data: ["温度(°C)", "湿度(%)", "CO₂(ppm÷10)"],
      top: 6, textStyle: { fontSize: 12 }
    },
    grid: { top: 46, left: 12, right: 20, bottom: 40, containLabel: true },
    xAxis: {
      type: "category", data: dates,
      axisLabel: { fontSize: 11, color: "#9E9E9E", interval: Math.ceil(n / 10) - 1, rotate: 30 }
    },
    yAxis: { type: "value", axisLabel: { fontSize: 11, color: "#9E9E9E" }, splitLine: { lineStyle: { color: "#F5F5F5", type: "dashed" } } },
    series: [
      {
        name: "温度(°C)", type: "line", smooth: true,
        data: tempData.map(d => d.value),
        lineStyle: { color: "#E53935", width: 2 }, itemStyle: { color: "#E53935" }, symbol: "none",
        areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(229,57,53,.15)" }, { offset: 1, color: "rgba(229,57,53,.01)" }] } }
      },
      {
        name: "湿度(%)", type: "line", smooth: true,
        data: humiData.map(d => d.value),
        lineStyle: { color: "#1976D2", width: 2 }, itemStyle: { color: "#1976D2" }, symbol: "none",
        areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(25,118,210,.12)" }, { offset: 1, color: "rgba(25,118,210,.01)" }] } }
      },
      {
        name: "CO₂(ppm÷10)", type: "line", smooth: true,
        data: co2Data.map(d => parseFloat((d.value / 10).toFixed(1))),
        lineStyle: { color: "#2E7D32", width: 2, type: "dashed" }, itemStyle: { color: "#2E7D32" }, symbol: "none"
      }
    ]
  }, true);
  window.addEventListener("resize", () => chart.resize());
}

/* ── 告警统计柱状图 ── */
function renderAlertBarChart(mode = "day") {
  const dom = document.getElementById("alertBarChart");
  if (!dom || typeof echarts === "undefined") return;

  const chart = echarts.getInstanceByDom(dom) || echarts.init(dom);

  let dates, critical, warning, info;

  if (mode === "day") {
    const n = 14;
    dates    = ALERT_STATS_30D.dates.slice(-n);
    critical = ALERT_STATS_30D.counts.critical.slice(-n);
    warning  = ALERT_STATS_30D.counts.warning.slice(-n);
    info     = ALERT_STATS_30D.counts.info.slice(-n);
  } else if (mode === "week") {
    // 汇总近4周
    dates = ["第1周", "第2周", "第3周", "第4周"];
    critical = []; warning = []; info = [];
    for (let i = 0; i < 4; i++) {
      const s = i * 7, e = s + 7;
      critical.push(ALERT_STATS_30D.counts.critical.slice(s, e).reduce((a, b) => a + b, 0));
      warning.push(ALERT_STATS_30D.counts.warning.slice(s, e).reduce((a, b) => a + b, 0));
      info.push(ALERT_STATS_30D.counts.info.slice(s, e).reduce((a, b) => a + b, 0));
    }
  } else {
    dates    = ["6月"];
    critical = [ALERT_STATS_30D.counts.critical.reduce((a, b) => a + b, 0)];
    warning  = [ALERT_STATS_30D.counts.warning.reduce((a, b) => a + b, 0)];
    info     = [ALERT_STATS_30D.counts.info.reduce((a, b) => a + b, 0)];
  }

  chart.setOption({
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: { data: ["严重","警告","提示"], top: 4, textStyle: { fontSize: 12 } },
    grid: { top: 36, left: 10, right: 10, bottom: 40, containLabel: true },
    xAxis: {
      type: "category", data: dates,
      axisLabel: { fontSize: 11, color: "#9E9E9E", rotate: mode === "day" ? 30 : 0 }
    },
    yAxis: { type: "value", axisLabel: { fontSize: 11, color: "#9E9E9E" }, splitLine: { lineStyle: { color: "#F5F5F5", type: "dashed" } } },
    series: [
      { name: "严重", type: "bar", stack: "total", data: critical, itemStyle: { color: "#C62828" } },
      { name: "警告", type: "bar", stack: "total", data: warning,  itemStyle: { color: "#F57C00" } },
      { name: "提示", type: "bar", stack: "total", data: info,     itemStyle: { color: "#1976D2", borderRadius: [3, 3, 0, 0] } }
    ]
  }, true);
  window.addEventListener("resize", () => chart.resize());
}

/* ── 设备在线率饼图 ── */
function renderDevicePieChart() {
  const dom = document.getElementById("devicePieChart");
  if (!dom || typeof echarts === "undefined") return;

  const chart = echarts.getInstanceByDom(dom) || echarts.init(dom);
  const stats  = getDeviceStats();
  const onRate = Math.round(stats.online / stats.total * 100);

  // 按农场统计在线率
  const farmStats = FARMS.map(f => {
    const total   = DEVICES.filter(d => d.farmId === f.id).length;
    const online  = DEVICES.filter(d => d.farmId === f.id && d.status === "online").length;
    return { name: f.name, value: total ? Math.round(online / total * 100) : 0 };
  });

  chart.setOption({
    backgroundColor: "transparent",
    title: {
      text: onRate + "%",
      subtext: "总在线率",
      left: "center", top: "35%",
      textStyle: { fontSize: 22, fontWeight: "bold", color: "#2E7D32" },
      subtextStyle: { fontSize: 12, color: "#9E9E9E" }
    },
    tooltip: { trigger: "item", formatter: "{b}: {c}% 在线率" },
    legend: { bottom: 10, textStyle: { fontSize: 12 } },
    series: [{
      type: "pie", radius: ["48%", "70%"], center: ["50%", "44%"],
      data: farmStats.map((f, i) => ({
        ...f,
        itemStyle: { color: ["#2E7D32", "#1976D2", "#F57C00"][i] }
      })),
      label: { formatter: "{b}\n{c}%", fontSize: 12 },
      emphasis: { label: { show: true, fontWeight: "bold" } }
    }]
  });
  window.addEventListener("resize", () => chart.resize());
}

/* ── 批次统计表格 ── */
function renderBatchStatsTable() {
  const tbody = document.getElementById("batchStatsBody");
  if (!tbody) return;

  tbody.innerHTML = BATCHES.map(b => {
    const sb        = getStatusBadge(b.status);
    const devCount  = DEVICES.filter(d => b.fields.includes(d.fieldId)).length;
    const alertCount = ALERTS.filter(a => {
      const dev = DEVICES.find(d => d.id === a.deviceId);
      return dev && b.fields.includes(dev.fieldId);
    }).length;

    return `
      <tr>
        <td><code style="font-size:12px;background:#F5F5F5;padding:2px 6px;border-radius:4px;">${b.id}</code></td>
        <td>
          <div style="font-weight:600;">${b.crop}</div>
          <div style="font-size:11px;color:#9E9E9E;">${b.variety}</div>
        </td>
        <td>${b.area} 亩</td>
        <td>${b.sowDate}</td>
        <td>${b.harvestDate}</td>
        <td>${b.manager}</td>
        <td>${devCount} 台</td>
        <td>${alertCount} 条</td>
        <td>
          <span class="badge ${sb.cls}">${sb.label}</span>
          <div class="progress-bar" style="width:80px;margin-top:4px;">
            <div class="progress-fill" style="width:${b.progress}%;"></div>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

/* ── 时间范围切换 ── */
function bindPeriodSwitch() {
  document.querySelectorAll(".period-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      const group = this.dataset.group;
      const val   = this.dataset.val;
      document.querySelectorAll(`.period-btn[data-group="${group}"]`).forEach(b => b.classList.remove("active", "btn-primary"));
      this.classList.add("active", "btn-primary");

      if (group === "env")   renderEnvTrendChart(parseInt(val));
      if (group === "alert") renderAlertBarChart(val);
    });
  });
}
