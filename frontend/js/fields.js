/**
 * fields.js —— 地块管理页逻辑
 */
"use strict";

let selectedFarm  = "FA";
let selectedZone  = null;

document.addEventListener("DOMContentLoaded", () => {
  initUserInfo();
  renderTreeNav();
  renderFieldCards();
  renderBatchTable();
});

function initUserInfo() {
  const user = getCurrentUser();
  const av = document.getElementById("topbarAvatar");
  const nm = document.getElementById("topbarName");
  if (av) av.textContent = user.avatar;
  if (nm) nm.textContent = user.name;
}

/* ── 树形导航 ── */
function renderTreeNav() {
  const container = document.getElementById("treeNav");
  if (!container) return;

  let html = "";
  FARMS.forEach(farm => {
    html += `
      <div class="tree-item farm ${selectedFarm === farm.id && !selectedZone ? "active" : ""}"
           onclick="selectFarm('${farm.id}')">
        🌾 ${farm.name}
      </div>
    `;
    const zones = ZONES.filter(z => z.farmId === farm.id);
    zones.forEach(zone => {
      html += `
        <div class="tree-item plot ${selectedZone === zone.id ? "active" : ""}"
             onclick="selectZone('${zone.id}', '${farm.id}')">
          ${zone.type === "温室" ? "🏠" : "🌱"} ${zone.name.replace(farm.name + "-", "")}
        </div>
      `;
    });
  });
  container.innerHTML = html;
}

function selectFarm(farmId) {
  selectedFarm  = farmId;
  selectedZone  = null;
  renderTreeNav();
  renderFieldCards();
}

function selectZone(zoneId, farmId) {
  selectedFarm  = farmId;
  selectedZone  = zoneId;
  renderTreeNav();
  renderFieldCards();
}

/* ── 地块卡片 ── */
function renderFieldCards() {
  const container = document.getElementById("fieldCards");
  if (!container) return;

  let fields = FIELDS;
  if (selectedZone) {
    fields = FIELDS.filter(f => f.zoneId === selectedZone);
  } else if (selectedFarm) {
    fields = FIELDS.filter(f => f.farmId === selectedFarm);
  }

  const farm = FARMS.find(f => f.id === selectedFarm);
  const titleEl = document.getElementById("fieldListTitle");
  if (titleEl) titleEl.textContent = selectedZone
    ? ZONES.find(z => z.id === selectedZone)?.name + " — 地块列表"
    : (farm?.name || "全部") + " — 地块列表";

  if (fields.length === 0) {
    container.innerHTML = `<div class="empty-state" style="grid-column:span 3;"><div class="empty-icon">🌱</div><p>暂无地块数据</p></div>`;
    return;
  }

  container.innerHTML = fields.map(f => {
    const batch = BATCHES.find(b => b.id === f.batch);
    const sb    = getStatusBadge(batch?.status || "growing");
    return `
      <div class="field-card" onclick="openFieldDetail('${f.id}')">
        <div class="field-card-header">
          <h3>${f.name}</h3>
          <p>面积：${f.area}亩 &nbsp;|&nbsp; ${f.soil}</p>
        </div>
        <div class="field-card-body">
          <div class="field-meta">
            <div class="field-meta-item"><label>作物品种</label><span>${f.crop}</span></div>
            <div class="field-meta-item"><label>当前批次</label><span>${f.batch}</span></div>
            <div class="field-meta-item"><label>关联设备</label><span>${f.devices} 台</span></div>
            <div class="field-meta-item"><label>负责人</label><span>${f.manager}</span></div>
          </div>
          <div style="margin-top:12px;display:flex;align-items:center;justify-content:space-between;">
            <span class="badge ${sb.cls}">${sb.label}</span>
            ${batch ? `
              <div style="font-size:12px;color:#9E9E9E;">
                进度：${batch.progress}%
                <div class="progress-bar" style="width:80px;display:inline-block;vertical-align:middle;margin-left:6px;">
                  <div class="progress-fill" style="width:${batch.progress}%;"></div>
                </div>
              </div>
            ` : ""}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

/* ── 地块详情弹窗 ── */
function openFieldDetail(fieldId) {
  const f     = FIELDS.find(x => x.id === fieldId);
  if (!f) return;
  const batch = BATCHES.find(b => b.id === f.batch);
  const devs  = DEVICES.filter(d => d.fieldId === f.id);
  const zone  = ZONES.find(z => z.id === f.zoneId);

  document.getElementById("fModalTitle").textContent = `地块详情 — ${f.name}`;
  document.getElementById("fModalBody").innerHTML = `
    <div class="detail-grid mb-4">
      <div class="detail-item"><label>地块ID</label><span>${f.id}</span></div>
      <div class="detail-item"><label>地块名称</label><span>${f.name}</span></div>
      <div class="detail-item"><label>所属区域</label><span>${zone?.name || f.zoneId}</span></div>
      <div class="detail-item"><label>地块面积</label><span>${f.area} 亩</span></div>
      <div class="detail-item"><label>土壤类型</label><span>${f.soil}</span></div>
      <div class="detail-item"><label>当前作物</label><span>${f.crop}</span></div>
      <div class="detail-item"><label>负责人</label><span>${f.manager}</span></div>
      <div class="detail-item"><label>关联设备</label><span>${f.devices} 台</span></div>
    </div>
    ${batch ? `
      <div style="background:#F1F8E9;border-radius:8px;padding:14px 16px;margin-bottom:16px;">
        <div style="font-weight:700;color:#1B5E20;margin-bottom:8px;">📋 当前批次信息</div>
        <div class="detail-grid">
          <div class="detail-item"><label>批次号</label><span>${batch.id}</span></div>
          <div class="detail-item"><label>品种</label><span>${batch.variety}</span></div>
          <div class="detail-item"><label>播种日期</label><span>${batch.sowDate}</span></div>
          <div class="detail-item"><label>预计收获</label><span>${batch.harvestDate}</span></div>
        </div>
        <div style="margin-top:10px;">
          <div style="font-size:12px;color:#616161;margin-bottom:4px;">生长进度 ${batch.progress}%</div>
          <div class="progress-bar"><div class="progress-fill" style="width:${batch.progress}%;"></div></div>
        </div>
      </div>
    ` : ""}
    <div style="font-weight:600;color:#1B5E20;margin-bottom:8px;font-size:13px;">📡 关联设备（${devs.length}台）</div>
    ${devs.length > 0
      ? devs.map(d => {
          const sb = getStatusBadge(d.status);
          return `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #F5F5F5;font-size:13px;">
            <span>${d.name}</span>
            <span class="badge ${sb.cls}">● ${sb.label}</span>
          </div>`;
        }).join("")
      : '<p style="color:#9E9E9E;font-size:13px;">暂无关联设备</p>'
    }
  `;
  document.getElementById("fieldModal").classList.remove("hidden");
}

function closeFieldModal() {
  document.getElementById("fieldModal").classList.add("hidden");
}

/* ── 批次表格 ── */
function renderBatchTable() {
  const tbody = document.getElementById("batchTableBody");
  if (!tbody) return;

  tbody.innerHTML = BATCHES.map(b => {
    const sb = getStatusBadge(b.status);
    return `
      <tr>
        <td><code style="font-size:12px;background:#F5F5F5;padding:2px 6px;border-radius:4px;">${b.id}</code></td>
        <td>
          <div style="font-weight:600;">${b.crop}</div>
          <div style="font-size:11px;color:#9E9E9E;">${b.variety}</div>
        </td>
        <td>${b.sowDate}</td>
        <td>${b.harvestDate}</td>
        <td>${b.area} 亩</td>
        <td>${b.manager}</td>
        <td>
          <span class="badge ${sb.cls}">${sb.label}</span>
          <div class="progress-bar" style="width:80px;margin-top:4px;">
            <div class="progress-fill" style="width:${b.progress}%;"></div>
          </div>
          <div style="font-size:11px;color:#9E9E9E;margin-top:2px;">${b.progress}%</div>
        </td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="viewBatchDetail('${b.id}')">查看</button>
          <a href="tracing.html?batch=${b.id}" class="btn btn-sm btn-primary" style="margin-left:4px;">追溯</a>
        </td>
      </tr>
    `;
  }).join("");
}

function viewBatchDetail(batchId) {
  const b = BATCHES.find(x => x.id === batchId);
  if (!b) return;
  const sb = getStatusBadge(b.status);
  alert([
    `批次号：${b.id}`,
    `作物：${b.crop}（${b.variety}）`,
    `播种：${b.sowDate}`,
    `预计收获：${b.harvestDate}`,
    `面积：${b.area}亩`,
    `负责人：${b.manager}`,
    `状态：${sb.label}`,
    `进度：${b.progress}%`,
    ``,
    `说明：${b.desc}`
  ].join("\n"));
}
