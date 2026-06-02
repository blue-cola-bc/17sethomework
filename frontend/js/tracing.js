/**
 * tracing.js —— 追溯档案页逻辑
 */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  initUserInfo();
  populateBatchSelect();

  // 读取 URL 参数
  const params = new URLSearchParams(window.location.search);
  const batchId = params.get("batch");
  if (batchId) {
    const sel = document.getElementById("batchSelect");
    if (sel) sel.value = batchId;
    renderTrace(batchId);
  } else {
    renderTrace("B2024001");
  }

  const sel = document.getElementById("batchSelect");
  if (sel) sel.addEventListener("change", e => renderTrace(e.target.value));

  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) searchBtn.addEventListener("click", () => {
    const v = document.getElementById("batchInput")?.value.trim();
    if (!v) { showToast("请输入批次号", "warning"); return; }
    const found = BATCHES.find(b => b.id === v);
    if (!found) { showToast(`未找到批次 ${v}`, "error"); return; }
    document.getElementById("batchSelect").value = v;
    renderTrace(v);
  });
});

function initUserInfo() {
  const user = getCurrentUser();
  const av = document.getElementById("topbarAvatar");
  const nm = document.getElementById("topbarName");
  if (av) av.textContent = user.avatar;
  if (nm) nm.textContent = user.name;
}

function populateBatchSelect() {
  const sel = document.getElementById("batchSelect");
  if (!sel) return;
  sel.innerHTML = BATCHES.map(b =>
    `<option value="${b.id}">${b.id} — ${b.crop}</option>`
  ).join("");
}

/* ── 渲染追溯内容 ── */
function renderTrace(batchId) {
  const batch   = BATCHES.find(b => b.id === batchId);
  const records = FIELD_RECORDS[batchId] || [];

  // 基本信息
  renderBatchInfo(batch);

  // 进度条节点
  renderProgressSteps(records);

  // 时间线
  renderTimeline(records);
}

function renderBatchInfo(batch) {
  const el = document.getElementById("batchInfoCard");
  if (!el || !batch) return;
  const sb = getStatusBadge(batch.status);
  el.innerHTML = `
    <div class="detail-grid">
      <div class="detail-item"><label>批次号</label><span>${batch.id}</span></div>
      <div class="detail-item"><label>作物品种</label><span>${batch.crop}</span></div>
      <div class="detail-item"><label>具体品种</label><span>${batch.variety}</span></div>
      <div class="detail-item"><label>种植面积</label><span>${batch.area} 亩</span></div>
      <div class="detail-item"><label>播种日期</label><span>${batch.sowDate}</span></div>
      <div class="detail-item"><label>预计收获</label><span>${batch.harvestDate}</span></div>
      <div class="detail-item"><label>负责人</label><span>${batch.manager}</span></div>
      <div class="detail-item"><label>当前状态</label><span><span class="badge ${sb.cls}">${sb.label}</span></span></div>
    </div>
    <div style="margin-top:14px;">
      <div style="font-size:12px;color:#616161;margin-bottom:6px;">生长进度 ${batch.progress}%</div>
      <div class="progress-bar" style="height:10px;"><div class="progress-fill" style="width:${batch.progress}%;"></div></div>
    </div>
    <div style="margin-top:12px;font-size:13px;color:#424242;line-height:1.8;">${batch.desc}</div>
  `;
}

const STEP_TYPES = ["播种", "施肥", "除草", "病虫害防治", "灌溉", "采收"];
const STEP_ICONS = { "播种": "🌱", "施肥": "🧪", "除草": "🌿", "病虫害防治": "🐛", "灌溉": "💧", "采收": "🌾" };

function renderProgressSteps(records) {
  const el = document.getElementById("progressSteps");
  if (!el) return;

  const completed = new Set(records.map(r => r.type));

  el.innerHTML = STEP_TYPES.map((step, idx) => {
    const done = completed.has(step);
    return `
      <div style="display:flex;flex-direction:column;align-items:center;flex:1;position:relative;">
        ${idx > 0 ? `<div style="position:absolute;top:20px;left:0;width:50%;height:3px;background:${done?"#2E7D32":"#E0E0E0"};"></div>` : ""}
        ${idx < STEP_TYPES.length - 1 ? `<div style="position:absolute;top:20px;right:0;width:50%;height:3px;background:${completed.has(STEP_TYPES[idx+1])?"#2E7D32":"#E0E0E0"};"></div>` : ""}
        <div style="width:42px;height:42px;border-radius:50%;background:${done?"#2E7D32":"#F5F5F5"};
             border:3px solid ${done?"#2E7D32":"#E0E0E0"};
             display:flex;align-items:center;justify-content:center;
             font-size:18px;position:relative;z-index:1;">
          ${done ? STEP_ICONS[step] : "○"}
        </div>
        <div style="font-size:12px;margin-top:6px;color:${done?"#2E7D32":"#9E9E9E"};font-weight:${done?"600":"400"};">${step}</div>
      </div>
    `;
  }).join("");
}

function renderTimeline(records) {
  const el = document.getElementById("tracingTimeline");
  if (!el) return;

  if (records.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>暂无田间记录</p></div>`;
    return;
  }

  el.innerHTML = `<div class="timeline">` + records.map(r => {
    const icon = STEP_ICONS[r.type] || "📝";
    return `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="flex-between">
            <h4>${icon} ${r.title}</h4>
            <span class="badge badge-info">${r.type}</span>
          </div>
          <div class="t-date">📅 ${r.date} &nbsp;|&nbsp; 操作人：${r.operator}</div>
          <div class="t-body">${r.content}</div>
          <div class="t-tags">
            ${r.materials.map(m => m !== "无" ? `<span class="t-tag">📦 ${m}</span>` : "").join("")}
          </div>
          ${r.notes ? `<div style="margin-top:8px;font-size:12px;color:#9E9E9E;">💬 备注：${r.notes}</div>` : ""}
        </div>
      </div>
    `;
  }).join("") + `</div>`;
}
