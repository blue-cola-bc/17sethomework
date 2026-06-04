/**
 * devices.js —— 设备管理页逻辑
 */
"use strict";

let currentPage   = 1;
const PAGE_SIZE   = 8;
let filteredDevices = [...DEVICES];

document.addEventListener("DOMContentLoaded", () => {
  initUserInfo();
  renderTable();
  bindFilters();
  bindAddDevice();
  renderDeviceStats();
});

/* ── 用户信息 ── */
function initUserInfo() {
  const user = getCurrentUser();
  const av = document.getElementById("topbarAvatar");
  const nm = document.getElementById("topbarName");
  if (av) av.textContent = user.avatar;
  if (nm) nm.textContent = user.name;
}

/* ── 设备统计栏 ── */
function renderDeviceStats() {
  const stats = getDeviceStats();
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set("statTotal",   stats.total);
  set("statOnline",  stats.online);
  set("statOffline", stats.offline);
  set("statFault",   stats.fault);
}

/* ── 渲染表格 ── */
function renderTable() {
  const tbody = document.getElementById("devTableBody");
  if (!tbody) return;

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageData = filteredDevices.slice(start, start + PAGE_SIZE);

  if (pageData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:#9E9E9E;">暂无数据</td></tr>`;
    renderPagination();
    return;
  }

  tbody.innerHTML = pageData.map(d => {
    const sb = getStatusBadge(d.status);
    return `
      <tr>
        <td><code style="font-size:12px;background:#F5F5F5;padding:2px 6px;border-radius:4px;">${d.id}</code></td>
        <td>
          <div style="font-weight:600;color:#212121;">${d.name}</div>
          <div style="font-size:11px;color:#9E9E9E;">${d.model}</div>
        </td>
        <td><span class="badge badge-info">${d.typeLabel}</span></td>
        <td><span class="badge ${sb.cls}">● ${sb.label}</span></td>
        <td>${d.location}</td>
        <td style="font-size:12px;color:#9E9E9E;">${d.lastUpdate}</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="openDetail('${d.id}')">详情</button>
          <button class="btn btn-sm btn-outline-gray" onclick="editDevice('${d.id}')" style="margin-left:4px;">编辑</button>
          <button class="btn btn-sm btn-danger" onclick="deleteDevice('${d.id}')" style="margin-left:4px;">删除</button>
        </td>
      </tr>
    `;
  }).join("");

  renderPagination();
}

/* ── 筛选 ── */
function bindFilters() {
  ["filterType", "filterStatus", "filterFarm"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", applyFilter);
  });
  const searchEl = document.getElementById("searchInput");
  if (searchEl) searchEl.addEventListener("input", applyFilter);
}

function applyFilter() {
  const type   = document.getElementById("filterType")?.value   || "";
  const status = document.getElementById("filterStatus")?.value || "";
  const farm   = document.getElementById("filterFarm")?.value   || "";
  const q      = (document.getElementById("searchInput")?.value || "").trim().toLowerCase();

  filteredDevices = DEVICES.filter(d => {
    if (type   && d.type     !== type)   return false;
    if (status && d.status   !== status) return false;
    if (farm   && d.farmId   !== farm)   return false;
    if (q      && !d.name.toLowerCase().includes(q) && !d.id.toLowerCase().includes(q)) return false;
    return true;
  });
  currentPage = 1;
  renderTable();
}

/* ── 分页 ── */
function renderPagination() {
  const total = Math.ceil(filteredDevices.length / PAGE_SIZE);
  const pg = document.getElementById("pagination");
  if (!pg) return;

  let html = `<span class="page-info">共 ${filteredDevices.length} 条</span>`;
  html += `<button class="page-btn" onclick="goPage(${currentPage - 1})" ${currentPage === 1 ? "disabled style='opacity:.4'" : ""}>‹</button>`;
  for (let i = 1; i <= total; i++) {
    html += `<button class="page-btn ${i === currentPage ? "active" : ""}" onclick="goPage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" onclick="goPage(${currentPage + 1})" ${currentPage === total || total === 0 ? "disabled style='opacity:.4'" : ""}>›</button>`;
  pg.innerHTML = html;
}

function goPage(p) {
  const total = Math.ceil(filteredDevices.length / PAGE_SIZE);
  if (p < 1 || p > total) return;
  currentPage = p;
  renderTable();
}

/* ── 详情弹窗 ── */
function openDetail(devId) {
  const dev = DEVICES.find(d => d.id === devId);
  if (!dev) return;

  const sb = getStatusBadge(dev.status);
  const recentData = generateDeviceRecentData(dev);

  document.getElementById("modalTitle").textContent = `设备详情 — ${dev.name}`;
  document.getElementById("modalBody").innerHTML = `
    <div class="detail-grid mb-4">
      <div class="detail-item"><label>设备ID</label><span>${dev.id}</span></div>
      <div class="detail-item"><label>设备名称</label><span>${dev.name}</span></div>
      <div class="detail-item"><label>设备类型</label><span><span class="badge badge-info">${dev.typeLabel}</span></span></div>
      <div class="detail-item"><label>设备状态</label><span><span class="badge ${sb.cls}">● ${sb.label}</span></span></div>
      <div class="detail-item"><label>所属农场</label><span>${FARMS.find(f => f.id === dev.farmId)?.name || dev.farmId}</span></div>
      <div class="detail-item"><label>所属区域</label><span>${ZONES.find(z => z.id === dev.zoneId)?.name || dev.zoneId}</span></div>
      <div class="detail-item"><label>安装位置</label><span>${dev.location}</span></div>
      <div class="detail-item"><label>设备型号</label><span>${dev.model}</span></div>
      <div class="detail-item"><label>固件版本</label><span>${dev.firmware}</span></div>
      <div class="detail-item"><label>最后更新</label><span>${dev.lastUpdate}</span></div>
    </div>
    <div style="font-weight:600;color:#1B5E20;margin-bottom:10px;font-size:13px;">📋 最近5条数据</div>
    <table class="data-table" style="font-size:12px;">
      <thead>
        <tr>
          <th>时间</th>
          <th>指标</th>
          <th>数值</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        ${recentData.map(r => `
          <tr>
            <td>${r.time}</td>
            <td>${r.metric}</td>
            <td><strong>${r.value}</strong></td>
            <td><span class="badge ${r.ok ? "badge-success" : "badge-warning"}">${r.ok ? "正常" : "偏高"}</span></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
  document.getElementById("deviceModal").classList.remove("hidden");
}

function generateDeviceRecentData(dev) {
  const metrics = dev.type === "gateway"
    ? [{ m: "信号强度", base: -65, unit: "dBm", range: 10 }]
    : dev.type === "controller"
    ? [{ m: "运行状态", base: 1, unit: "", range: 0 }, { m: "执行次数", base: 24, unit: "次", range: 5 }]
    : [{ m: "温度", base: 26, unit: "°C", range: 3 }, { m: "湿度", base: 72, unit: "%", range: 8 }];

  const data = [];
  const now = new Date();
  for (let i = 0; i < 5; i++) {
    const t = new Date(now.getTime() - i * 600000);
    const met = metrics[i % metrics.length];
    const v = parseFloat((met.base + (Math.random() - 0.5) * met.range * 2).toFixed(1));
    data.push({
      time: t.toLocaleTimeString("zh-CN"),
      metric: met.m,
      value: v + met.unit,
      ok: Math.random() > 0.2
    });
  }
  return data;
}

function closeModal() {
  document.getElementById("deviceModal").classList.add("hidden");
}

/* ── 编辑（演示） ── */
function editDevice(devId) {
  const dev = DEVICES.find(d => d.id === devId);
  if (!dev) return;
  openAddModal(dev);
}

/* ── 删除（演示） ── */
function deleteDevice(devId) {
  if (!confirm(`确认删除设备 ${devId}？此操作不可撤销。`)) return;
  const idx = DEVICES.findIndex(d => d.id === devId);
  if (idx > -1) {
    DEVICES.splice(idx, 1);
    filteredDevices = filteredDevices.filter(d => d.id !== devId);
    renderTable();
    renderDeviceStats();
    showToast(`设备 ${devId} 已删除（演示模式）`, "warning");
  }
}

/* ── 新增设备弹窗 ── */
function bindAddDevice() {
  const btn = document.getElementById("addDeviceBtn");
  if (btn) btn.addEventListener("click", () => openAddModal(null));
}

function openAddModal(existing) {
  const isEdit = !!existing;
  document.getElementById("addModalTitle").textContent = isEdit ? "编辑设备" : "新增设备";

  const fields = [
    { id: "addName",     label: "设备名称",  type: "text",   val: existing?.name     || "" },
    { id: "addType",     label: "设备类型",  type: "select", opts: [["sensor","传感器"],["controller","控制器"],["gateway","网关"]], val: existing?.type || "sensor" },
    { id: "addFarm",     label: "所属农场",  type: "select", opts: FARMS.map(f => [f.id, f.name]), val: existing?.farmId || "FA" },
    { id: "addLocation", label: "安装位置",  type: "text",   val: existing?.location || "" },
    { id: "addModel",    label: "设备型号",  type: "text",   val: existing?.model    || "" }
  ];

  document.getElementById("addModalBody").innerHTML = fields.map(f => `
    <div class="form-group">
      <label>${f.label}</label>
      ${f.type === "select"
        ? `<select id="${f.id}" class="form-control">${f.opts.map(([v,l]) => `<option value="${v}" ${f.val===v?"selected":""}>${l}</option>`).join("")}</select>`
        : `<input id="${f.id}" type="text" class="form-control" value="${f.val}" placeholder="请输入${f.label}" />`
      }
    </div>
  `).join("");

  document.getElementById("addModalSave").onclick = () => {
    const name = document.getElementById("addName")?.value.trim();
    if (!name) { showToast("设备名称不能为空", "error"); return; }

    if (isEdit) {
      existing.name     = name;
      existing.type     = document.getElementById("addType").value;
      existing.farmId   = document.getElementById("addFarm").value;
      existing.location = document.getElementById("addLocation").value;
      existing.model    = document.getElementById("addModel").value;
      showToast("设备信息已更新（演示模式）", "success");
    } else {
      const newDev = {
        id: "DEV" + String(DEVICES.length + 1).padStart(3, "0"),
        name, type: document.getElementById("addType").value,
        typeLabel: { sensor:"传感器", controller:"控制器", gateway:"网关" }[document.getElementById("addType").value],
        status: "online", farmId: document.getElementById("addFarm").value,
        zoneId: "", fieldId: null,
        location: document.getElementById("addLocation").value,
        lastUpdate: new Date().toLocaleString("zh-CN"),
        model: document.getElementById("addModel").value,
        firmware: "v1.0.0"
      };
      DEVICES.push(newDev);
      showToast("设备已添加（演示模式）", "success");
    }
    filteredDevices = [...DEVICES];
    applyFilter();
    renderDeviceStats();
    closeAddModal();
  };

  document.getElementById("addDeviceModal").classList.remove("hidden");
}

function closeAddModal() {
  document.getElementById("addDeviceModal").classList.add("hidden");
}
