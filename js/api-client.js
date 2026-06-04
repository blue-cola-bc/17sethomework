/**
 * api-client.js -- optional Django backend bridge.
 * When pages are opened through Django, this script replaces the local demo data
 * with /api/v1/mock-data. When opened as file://, it keeps mock-data.js intact.
 */
(function syncBackendData() {
  "use strict";

  if (window.location.protocol === "file:") return;

  function replaceArray(target, source) {
    if (!Array.isArray(target) || !Array.isArray(source)) return;
    target.splice(0, target.length, ...source);
  }

  function replaceObject(target, source) {
    if (!target || !source || Array.isArray(target)) return;
    Object.keys(target).forEach(key => delete target[key]);
    Object.assign(target, source);
  }

  function applyData(data) {
    replaceArray(USERS, data.USERS);
    replaceArray(FARMS, data.FARMS);
    replaceArray(ZONES, data.ZONES);
    replaceArray(FIELDS, data.FIELDS);
    replaceArray(DEVICES, data.DEVICES);
    replaceArray(ALERTS, data.ALERTS);
    replaceArray(ALERT_RULES, data.ALERT_RULES);
    replaceArray(BATCHES, data.BATCHES);

    replaceObject(REALTIME_DATA, data.REALTIME_DATA);
    replaceObject(HISTORY_24H, data.HISTORY_24H);
    replaceObject(HISTORY_30D, data.HISTORY_30D);
    replaceObject(ALERT_STATS_30D, data.ALERT_STATS_30D);
    replaceObject(FIELD_RECORDS, data.FIELD_RECORDS);

    window.SMART_AGRI_BACKEND_CONNECTED = true;
  }

  try {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/v1/mock-data", false);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.send(null);
    if (xhr.status >= 200 && xhr.status < 300) {
      const payload = JSON.parse(xhr.responseText);
      if (payload && payload.code === 200 && payload.data) {
        applyData(payload.data);
      }
    }
  } catch (err) {
    window.SMART_AGRI_BACKEND_CONNECTED = false;
    console.warn("Backend data sync failed, using local mock data.", err);
  }
})();
