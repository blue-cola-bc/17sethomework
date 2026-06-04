/**
 * alerts.js —— 告警中心页逻辑
 */
"use strict";

let alertPage      = 1;
const ALERT_PAGE_SZ = 10;
let filteredAlerts  = [...ALERTS];

document.addEventListener("DOMContentLoaded", () => {
  initUserInfo();
  renderAlertStats();
  renderCharts();
  renderAlertTable();
  bindFilters();
});

function initUserInfo() {
  const user = getCurrentUser();
  const av = document.getElementById("topbarAvatar");
  const nm = document.getElementById("topbarName");
  if (av) av.textContent = user.avatar;
  if (nm) nm.textContent = user.name;
}

/* ── 统计数字 ── */
function renderAlertStats() {
  const s = getAlertStats();
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set("sTotal",     s.total);
  set("sCritical",  s.critical);
  set("sWarning",   s.warning);
  set("sInfo",      s.info);
  set("sUnhandled", s.unhandled);
}

/* ── 图表 ── */
function renderCharts() {
  renderLevelPie();
  renderTrendBar();
}

function renderLevelPie() {
  const dom = document.getElementById("levelPieChart");
  if (!dom || typeof echarts === "undefined") return;
  const chart = echarts.init(dom);
  const s = getAlertStats();
  chart.setOption({
    backgroundColor: "transparent",
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 10, textStyle: { fontSize: 12 } },
    series: [{
      type: "pie", radius: ["42%","68%"], center: ["50%","44%"],
      data: [
        { value: s.critical, name: "严重", itemStyle: { color: "#C62828" } },
        { value: s.warning,  name: "警告", itemStyle: { color: "#F57C00" } },
        { value: s.info,     name: "提示", itemStyle: { color: "#1976D2" } }
      ],
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: "bold" } }
    }]
  });
  window.addEventListener("resize", () => chart.resize());
}

function renderTrendBar() {
  const dom = document.getElementById("trendBarChart");
  if (!dom || typeof echarts === "undefined") return;
  const chart = echarts.init(dom);
  const ds = ALERT_STATS_30D;
  // 展示近14天
  const n = 14;
  const dates    = ds.dates.slice(-n);
  const critical = ds.counts.critical.slice(-n);
  const warning  = ds.counts.warning.slice(-n);
  const info     = ds.counts.info.slice(-n);

  chart.setOption({
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: { data: ["严重","警告","提示"], top: 4, textStyle: { fontSize: 12 } },
    grid: { top: 36, left: 10, right: 10, bottom: 40, containLabel: true },
    xAxis: {
      type: "category", data: dates,
      axisLabel: { fontSize: 11, color: "#9E9E9E", rotate: 30 }
    },
    yAxis: {
      type: "value",
      axisLabel: { fontSize: 11, color: "#9E9E9E" },
      splitLine: { lineStyle: { color: "#F5F5F5", type: "dashed" } }
    },
    series: [
      { name: "严重", type: "bar", stack: "total", data: critical, itemStyle: { color: "#C62828" } },
      { name: "警告", type: "bar", stack: "total", data: warning,  itemStyle: { color: "#F57C00" } },
      { name: "提示", type: "bar", stack: "total", data: info,     itemStyle: { color: "#1976D2", borderRadius:[4,4,0,0] } }
    ]
  });
  window.addEventListener("resize", () => chart.resize());
}

/* ── 告警表格 ── */
function renderAlertTable() {
  const tbody = document.getElementById("alertTableBody");
  if (!tbody) return;
  const start = (alertPage - 1) * ALERT_PAGE_SZ;
  const page  = filteredAlerts.slice(start, start + ALERT_PAGE_SZ);

  if (page.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:#9E9E9E;">暂无告警</td></tr>`;
    renderAlertPagination();
    return;
  }

  tbody.innerHTML = page.map(a => {
    const li  = getAlertLevelInfo(a.level);
    const sb  = getStatusBadge(a.status);
    const isOpen = a.status === "unhandled";
    return `
      <tr>
        <td><code style="font-size:12px;background:#F5F5F5;padding:2px 6px;border-radius:4px;">${a.id}</code></td>
        <td style="font-size:13px;">${a.deviceName}</td>
        <td>${a.metric}</td>
        <td style="font-weight:600;">${a.currentVal}</td>
        <td style="color:#9E9E9E;">${a.threshold}</td>
        <td><span class="badge ${li.cls}">${li.label}</span></td>
        <td style="font-size:12px;color:#9E9E9E;">${a.time.slice(5)}</td>
        <td>
          <span class="badge ${sb.cls}">${sb.label}</span>
          ${isOpen ? `<button class="btn btn-sm btn-accent" onclick="confirmAlert('${a.id}')" style="margin-left:4px;">确认</button>` : ""}
          ${a.status === "confirmed" ? `<button class="btn btn-sm btn-outline-gray" onclick="closeAlert('${a.id}')" style="margin-left:4px;">关闭</button>` : ""}
        </td>
      </tr>
    `;
  }).join("");
  renderAlertPagination();
}

function renderAlertPagination() {
  const pg    = document.getElementById("alertPagination");
  if (!pg) return;
  const total = Math.ceil(filteredAlerts.length / ALERT_PAGE_SZ);
  let html = `<span class="page-info">共 ${filteredAlerts.length} 条</span>`;
  html += `<button class="page-btn" onclick="goAlertPage(${alertPage-1})" ${alertPage===1?"disabled style='opacity:.4'":""}>‹</button>`;
  for (let i = 1; i <= total; i++) {
    html += `<button class="page-btn ${i===alertPage?"active":""}" onclick="goAlertPage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" onclick="goAlertPage(${alertPage+1})" ${alertPage===total||total===0?"disabled style='opacity:.4'":""}>›</button>`;
  pg.innerHTML = html;
}

function goAlertPage(p) {
  const total = Math.ceil(filteredAlerts.length / ALERT_PAGE_SZ);
  if (p < 1 || p > total) return;
  alertPage = p;
  renderAlertTable();
}

/* ── 筛选 ── */
function bindFilters() {
  ["fLevel","fStatus","fDevice"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", applyFilter);
  });
}

function applyFilter() {
  const level  = document.getElementById("fLevel")?.value  || "";
  const status = document.getElementById("fStatus")?.value || "";
  const device = document.getElementById("fDevice")?.value.trim().toLowerCase() || "";

  filteredAlerts = ALERTS.filter(a => {
    if (level  && a.level  !== level)  return false;
    if (status && a.status !== status) return false;
    if (device && !a.deviceName.toLowerCase().includes(device)) return false;
    return true;
  });
  alertPage = 1;
  renderAlertTable();
}

/* ── 告警处理 ── */
function confirmAlert(id) {
  const a = ALERTS.find(x => x.id === id);
  if (!a) return;
  const note = prompt("请输入处理备注（可选）：", "");
  a.status = "confirmed";
  a.notes  = note || "已确认处理";
  filteredAlerts = [...ALERTS];
  applyFilter();
  renderAlertStats();
  showToast(`告警 ${id} 已确认`, "success");
}

function closeAlert(id) {
  const a = ALERTS.find(x => x.id === id);
  if (!a) return;
  a.status = "closed";
  filteredAlerts = [...ALERTS];
  applyFilter();
  renderAlertStats();
  showToast(`告警 ${id} 已关闭`, "info");
}
