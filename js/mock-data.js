/**
 * mock-data.js —— 智能农业物联网监控平台 模拟数据
 * 包含：用户、农场、区域、地块、设备、传感数据、告警、批次、田间记录
 */

// =====================================================
// 1. 用户
// =====================================================
const USERS = [
  { id: 1, name: "刘芮宏", role: "admin",  roleLabel: "组长/管理员",  avatar: "刘", color: "#2E7D32" },
  { id: 2, name: "王攀杰", role: "viewer", roleLabel: "前端开发",      avatar: "王", color: "#1976D2" },
  { id: 3, name: "常琳昊", role: "viewer", roleLabel: "后端开发",      avatar: "常", color: "#1976D2" },
  { id: 4, name: "杨航",   role: "tester", roleLabel: "测试工程师",    avatar: "杨", color: "#F57C00" }
];

// =====================================================
// 2. 农场
// =====================================================
const FARMS = [
  { id: "FA", name: "农场A", location: "江苏省南京市浦口区",  area: 520, manager: "刘芮宏" },
  { id: "FB", name: "农场B", location: "江苏省南京市溧水区",  area: 380, manager: "王攀杰" },
  { id: "FC", name: "农场C", location: "江苏省南京市高淳区",  area: 460, manager: "常琳昊" }
];

// =====================================================
// 3. 区域（每个农场2-3个区域）
// =====================================================
const ZONES = [
  { id: "FA-Z1", farmId: "FA", name: "农场A-露天区1", type: "露天",   area: 180 },
  { id: "FA-Z2", farmId: "FA", name: "农场A-温室1",   type: "温室",   area: 120 },
  { id: "FA-Z3", farmId: "FA", name: "农场A-温室2",   type: "温室",   area: 100 },
  { id: "FB-Z1", farmId: "FB", name: "农场B-露天区1", type: "露天",   area: 200 },
  { id: "FB-Z2", farmId: "FB", name: "农场B-温室1",   type: "温室",   area: 80  },
  { id: "FC-Z1", farmId: "FC", name: "农场C-露天区1", type: "露天",   area: 220 },
  { id: "FC-Z2", farmId: "FC", name: "农场C-露天区2", type: "露天",   area: 160 },
  { id: "FC-Z3", farmId: "FC", name: "农场C-温室1",   type: "温室",   area: 90  }
];

// =====================================================
// 4. 地块
// =====================================================
const FIELDS = [
  { id: "F001", zoneId: "FA-Z1", farmId: "FA", name: "水稻A1地块", area: 45, crop: "水稻",     batch: "B2024001", devices: 4, manager: "刘芮宏", soil: "壤土" },
  { id: "F002", zoneId: "FA-Z1", farmId: "FA", name: "水稻A2地块", area: 50, crop: "水稻",     batch: "B2024001", devices: 3, manager: "刘芮宏", soil: "壤土" },
  { id: "F003", zoneId: "FA-Z2", farmId: "FA", name: "蔬菜温室1",  area: 30, crop: "番茄",     batch: "B2024002", devices: 6, manager: "王攀杰", soil: "腐殖土" },
  { id: "F004", zoneId: "FA-Z3", farmId: "FA", name: "蔬菜温室2",  area: 28, crop: "黄瓜",     batch: "B2024002", devices: 5, manager: "王攀杰", soil: "腐殖土" },
  { id: "F005", zoneId: "FB-Z1", farmId: "FB", name: "果树B1地块", area: 60, crop: "苹果",     batch: "B2024003", devices: 3, manager: "常琳昊", soil: "砂壤土" },
  { id: "F006", zoneId: "FB-Z2", farmId: "FB", name: "果树温室1",  area: 25, crop: "草莓",     batch: "B2024003", devices: 5, manager: "常琳昊", soil: "腐殖土" },
  { id: "F007", zoneId: "FC-Z1", farmId: "FC", name: "水稻C1地块", area: 55, crop: "水稻",     batch: "B2024001", devices: 4, manager: "杨航",   soil: "黏土" },
  { id: "F008", zoneId: "FC-Z2", farmId: "FC", name: "水稻C2地块", area: 48, crop: "水稻",     batch: "B2024001", devices: 3, manager: "杨航",   soil: "黏土" }
];

// =====================================================
// 5. 设备（15-20个）
// =====================================================
const DEVICES = [
  { id: "DEV001", name: "温湿度传感器-A1-01", type: "sensor",     typeLabel: "传感器",  status: "online",  farmId: "FA", zoneId: "FA-Z1", fieldId: "F001", location: "水稻A1地块北部", lastUpdate: "2024-06-03 10:42:15", model: "DHT22-Pro",    firmware: "v2.3.1" },
  { id: "DEV002", name: "土壤传感器-A1-02",   type: "sensor",     typeLabel: "传感器",  status: "online",  farmId: "FA", zoneId: "FA-Z1", fieldId: "F001", location: "水稻A1地块中部", lastUpdate: "2024-06-03 10:41:58", model: "SoilSense-S3", firmware: "v1.8.2" },
  { id: "DEV003", name: "CO₂传感器-A2-01",    type: "sensor",     typeLabel: "传感器",  status: "online",  farmId: "FA", zoneId: "FA-Z2", fieldId: "F003", location: "蔬菜温室1入口",  lastUpdate: "2024-06-03 10:43:01", model: "CO2-Sense-X1", firmware: "v3.0.0" },
  { id: "DEV004", name: "光照传感器-A2-02",   type: "sensor",     typeLabel: "传感器",  status: "online",  farmId: "FA", zoneId: "FA-Z2", fieldId: "F003", location: "蔬菜温室1顶部",  lastUpdate: "2024-06-03 10:40:22", model: "LuxSense-L2",  firmware: "v2.1.0" },
  { id: "DEV005", name: "灌溉控制器-A1-01",   type: "controller", typeLabel: "控制器",  status: "online",  farmId: "FA", zoneId: "FA-Z1", fieldId: "F001", location: "水稻A1地块泵房",  lastUpdate: "2024-06-03 10:38:45", model: "IrriCtrl-V3",  firmware: "v4.1.2" },
  { id: "DEV006", name: "通风控制器-A2-01",   type: "controller", typeLabel: "控制器",  status: "online",  farmId: "FA", zoneId: "FA-Z2", fieldId: "F003", location: "蔬菜温室1通风口", lastUpdate: "2024-06-03 10:39:12", model: "VentCtrl-V2",  firmware: "v3.2.0" },
  { id: "DEV007", name: "网关设备-A-GW01",    type: "gateway",    typeLabel: "网关",    status: "online",  farmId: "FA", zoneId: "FA-Z1", fieldId: null,   location: "农场A中心机房",   lastUpdate: "2024-06-03 10:44:00", model: "IoT-GW-5G",    firmware: "v5.0.3" },
  { id: "DEV008", name: "温湿度传感器-A3-01", type: "sensor",     typeLabel: "传感器",  status: "offline", farmId: "FA", zoneId: "FA-Z3", fieldId: "F004", location: "蔬菜温室2东角",   lastUpdate: "2024-06-03 08:15:32", model: "DHT22-Pro",    firmware: "v2.3.1" },
  { id: "DEV009", name: "土壤传感器-B1-01",   type: "sensor",     typeLabel: "传感器",  status: "online",  farmId: "FB", zoneId: "FB-Z1", fieldId: "F005", location: "果树B1地块西侧",  lastUpdate: "2024-06-03 10:42:50", model: "SoilSense-S3", firmware: "v1.8.2" },
  { id: "DEV010", name: "pH传感器-B1-02",     type: "sensor",     typeLabel: "传感器",  status: "fault",   farmId: "FB", zoneId: "FB-Z1", fieldId: "F005", location: "果树B1地块中部",  lastUpdate: "2024-06-03 07:30:18", model: "pHSense-P1",   firmware: "v1.5.0" },
  { id: "DEV011", name: "灌溉控制器-B1-01",   type: "controller", typeLabel: "控制器",  status: "online",  farmId: "FB", zoneId: "FB-Z1", fieldId: "F005", location: "果树B1地块泵房",  lastUpdate: "2024-06-03 10:37:22", model: "IrriCtrl-V3",  firmware: "v4.1.2" },
  { id: "DEV012", name: "网关设备-B-GW01",    type: "gateway",    typeLabel: "网关",    status: "online",  farmId: "FB", zoneId: "FB-Z1", fieldId: null,   location: "农场B中心机房",   lastUpdate: "2024-06-03 10:44:00", model: "IoT-GW-5G",    firmware: "v5.0.3" },
  { id: "DEV013", name: "温湿度传感器-C1-01", type: "sensor",     typeLabel: "传感器",  status: "online",  farmId: "FC", zoneId: "FC-Z1", fieldId: "F007", location: "水稻C1地块南部",  lastUpdate: "2024-06-03 10:41:10", model: "DHT22-Pro",    firmware: "v2.3.1" },
  { id: "DEV014", name: "CO₂传感器-C1-02",    type: "sensor",     typeLabel: "传感器",  status: "online",  farmId: "FC", zoneId: "FC-Z1", fieldId: "F007", location: "水稻C1地块监测点", lastUpdate: "2024-06-03 10:40:55", model: "CO2-Sense-X1", firmware: "v3.0.0" },
  { id: "DEV015", name: "土壤传感器-C2-01",   type: "sensor",     typeLabel: "传感器",  status: "online",  farmId: "FC", zoneId: "FC-Z2", fieldId: "F008", location: "水稻C2地块中心",  lastUpdate: "2024-06-03 10:43:30", model: "SoilSense-S3", firmware: "v1.8.2" },
  { id: "DEV016", name: "通风控制器-C3-01",   type: "controller", typeLabel: "控制器",  status: "offline", farmId: "FC", zoneId: "FC-Z3", fieldId: null,   location: "农场C温室1",      lastUpdate: "2024-06-03 09:05:44", model: "VentCtrl-V2",  firmware: "v3.2.0" },
  { id: "DEV017", name: "网关设备-C-GW01",    type: "gateway",    typeLabel: "网关",    status: "online",  farmId: "FC", zoneId: "FC-Z1", fieldId: null,   location: "农场C中心机房",   lastUpdate: "2024-06-03 10:44:00", model: "IoT-GW-5G",    firmware: "v5.0.3" }
];

// =====================================================
// 6. 实时传感器数据（当前值）
// =====================================================
const REALTIME_DATA = {
  "FA": {
    temperature:  { value: 26.4, unit: "°C",   trend: "up",     status: "normal",  icon: "🌡️" },
    humidity:     { value: 72.3, unit: "%",    trend: "stable", status: "normal",  icon: "💧" },
    soilMoisture: { value: 58.1, unit: "%",    trend: "down",   status: "normal",  icon: "🌱" },
    co2:          { value: 412,  unit: "ppm",  trend: "up",     status: "warning", icon: "🌫️" },
    light:        { value: 8500, unit: "lux",  trend: "up",     status: "normal",  icon: "☀️" },
    ph:           { value: 6.8,  unit: "pH",   trend: "stable", status: "normal",  icon: "⚗️" }
  },
  "FB": {
    temperature:  { value: 28.1, unit: "°C",   trend: "up",     status: "warning", icon: "🌡️" },
    humidity:     { value: 65.8, unit: "%",    trend: "down",   status: "normal",  icon: "💧" },
    soilMoisture: { value: 42.5, unit: "%",    trend: "down",   status: "warning", icon: "🌱" },
    co2:          { value: 398,  unit: "ppm",  trend: "stable", status: "normal",  icon: "🌫️" },
    light:        { value: 9200, unit: "lux",  trend: "stable", status: "normal",  icon: "☀️" },
    ph:           { value: 5.9,  unit: "pH",   trend: "down",   status: "danger",  icon: "⚗️" }
  },
  "FC": {
    temperature:  { value: 24.8, unit: "°C",   trend: "stable", status: "normal",  icon: "🌡️" },
    humidity:     { value: 78.6, unit: "%",    trend: "up",     status: "normal",  icon: "💧" },
    soilMoisture: { value: 65.2, unit: "%",    trend: "up",     status: "normal",  icon: "🌱" },
    co2:          { value: 385,  unit: "ppm",  trend: "down",   status: "normal",  icon: "🌫️" },
    light:        { value: 7800, unit: "lux",  trend: "down",   status: "normal",  icon: "☀️" },
    ph:           { value: 7.1,  unit: "pH",   trend: "stable", status: "normal",  icon: "⚗️" }
  }
};

// =====================================================
// 7. 24小时历史传感数据（用于折线图）
// =====================================================
function generate24HData(base, variance, hours = 24) {
  const data = [];
  const now = new Date();
  for (let i = hours - 1; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600000);
    const hh = t.getHours().toString().padStart(2, "0");
    const noise = (Math.random() - 0.5) * variance * 2;
    data.push({ time: hh + ":00", value: parseFloat((base + noise).toFixed(1)) });
  }
  return data;
}

const HISTORY_24H = {
  "FA": {
    temperature:  generate24HData(26, 3),
    humidity:     generate24HData(72, 8),
    soilMoisture: generate24HData(58, 6),
    co2:          generate24HData(410, 30),
    light:        generate24HData(6000, 3000),
    ph:           generate24HData(6.8, 0.3)
  },
  "FB": {
    temperature:  generate24HData(28, 3),
    humidity:     generate24HData(66, 8),
    soilMoisture: generate24HData(43, 6),
    co2:          generate24HData(400, 25),
    light:        generate24HData(7000, 3200),
    ph:           generate24HData(6.0, 0.4)
  },
  "FC": {
    temperature:  generate24HData(25, 2.5),
    humidity:     generate24HData(78, 6),
    soilMoisture: generate24HData(65, 5),
    co2:          generate24HData(385, 20),
    light:        generate24HData(5800, 2800),
    ph:           generate24HData(7.1, 0.2)
  }
};

// =====================================================
// 8. 30天历史数据（用于报表）
// =====================================================
function generate30DData(base, variance) {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 86400000);
    const mm = (t.getMonth() + 1).toString().padStart(2, "0");
    const dd = t.getDate().toString().padStart(2, "0");
    const noise = (Math.random() - 0.5) * variance * 2;
    data.push({ date: mm + "-" + dd, value: parseFloat((base + noise).toFixed(1)) });
  }
  return data;
}

const HISTORY_30D = {
  temperature:  generate30DData(26.5, 4),
  humidity:     generate30DData(70,   10),
  co2:          generate30DData(405,  35)
};

// =====================================================
// 9. 告警记录（25条）
// =====================================================
const ALERTS = [
  { id: "AL001", deviceId: "DEV010", deviceName: "pH传感器-B1-02",     metric: "pH值",    currentVal: "5.1", threshold: "5.5~7.5", level: "critical", time: "2024-06-03 07:28:00", status: "unhandled", notes: "" },
  { id: "AL002", deviceId: "DEV008", deviceName: "温湿度传感器-A3-01", metric: "设备离线", currentVal: "—",   threshold: "在线",    level: "critical", time: "2024-06-03 08:15:00", status: "unhandled", notes: "" },
  { id: "AL003", deviceId: "DEV016", deviceName: "通风控制器-C3-01",   metric: "设备离线", currentVal: "—",   threshold: "在线",    level: "warning",  time: "2024-06-03 09:05:00", status: "confirmed", notes: "已派人检查" },
  { id: "AL004", deviceId: "DEV001", deviceName: "温湿度传感器-A1-01", metric: "温度",    currentVal: "32.1°C", threshold: "≤30°C", level: "warning",  time: "2024-06-03 06:40:00", status: "confirmed", notes: "启动通风" },
  { id: "AL005", deviceId: "DEV003", deviceName: "CO₂传感器-A2-01",   metric: "CO₂浓度", currentVal: "520ppm", threshold: "≤500ppm",level:"warning",  time: "2024-06-03 05:10:00", status: "closed",    notes: "已通风处理" },
  { id: "AL006", deviceId: "DEV009", deviceName: "土壤传感器-B1-01",   metric: "土壤水分", currentVal: "38%",threshold: "≥45%",  level: "warning",  time: "2024-06-02 22:30:00", status: "closed",    notes: "已补充灌溉" },
  { id: "AL007", deviceId: "DEV002", deviceName: "土壤传感器-A1-02",   metric: "土壤pH",   currentVal: "8.2pH",threshold:"5.5~7.5",level: "warning",  time: "2024-06-02 20:15:00", status: "closed",    notes: "已调节" },
  { id: "AL008", deviceId: "DEV013", deviceName: "温湿度传感器-C1-01", metric: "湿度",    currentVal: "88%", threshold: "≤85%",   level: "info",     time: "2024-06-02 18:00:00", status: "closed",    notes: "" },
  { id: "AL009", deviceId: "DEV004", deviceName: "光照传感器-A2-02",   metric: "光照强度", currentVal: "15000lux",threshold:"≤12000lux",level:"info", time: "2024-06-02 14:20:00", status: "closed",    notes: "" },
  { id: "AL010", deviceId: "DEV010", deviceName: "pH传感器-B1-02",     metric: "pH值",    currentVal: "5.3", threshold: "5.5~7.5", level: "critical", time: "2024-06-02 10:05:00", status: "closed",    notes: "已撒石灰调节" },
  { id: "AL011", deviceId: "DEV001", deviceName: "温湿度传感器-A1-01", metric: "温度",    currentVal: "31.5°C",threshold:"≤30°C",  level: "warning",  time: "2024-06-02 08:30:00", status: "closed",    notes: "" },
  { id: "AL012", deviceId: "DEV015", deviceName: "土壤传感器-C2-01",   metric: "土壤水分", currentVal: "35%",threshold: "≥40%",   level: "warning",  time: "2024-06-01 22:00:00", status: "closed",    notes: "已灌溉" },
  { id: "AL013", deviceId: "DEV003", deviceName: "CO₂传感器-A2-01",   metric: "CO₂浓度", currentVal: "580ppm",threshold:"≤500ppm",level:"critical", time: "2024-06-01 16:45:00", status: "closed",    notes: "紧急通风" },
  { id: "AL014", deviceId: "DEV006", deviceName: "通风控制器-A2-01",   metric: "设备故障", currentVal: "ERR",threshold: "正常",    level: "critical", time: "2024-06-01 11:20:00", status: "closed",    notes: "已重启修复" },
  { id: "AL015", deviceId: "DEV009", deviceName: "土壤传感器-B1-01",   metric: "土壤水分", currentVal: "36%",threshold: "≥45%",   level: "warning",  time: "2024-06-01 09:10:00", status: "closed",    notes: "" },
  { id: "AL016", deviceId: "DEV014", deviceName: "CO₂传感器-C1-02",   metric: "CO₂浓度", currentVal: "498ppm",threshold:"≤500ppm",level:"info",     time: "2024-05-31 20:30:00", status: "closed",    notes: "" },
  { id: "AL017", deviceId: "DEV002", deviceName: "土壤传感器-A1-02",   metric: "土壤温度", currentVal: "32.5°C",threshold:"≤30°C", level: "warning",  time: "2024-05-31 14:00:00", status: "closed",    notes: "" },
  { id: "AL018", deviceId: "DEV013", deviceName: "温湿度传感器-C1-01", metric: "温度",    currentVal: "29.8°C",threshold:"≤28°C", level: "info",     time: "2024-05-30 13:20:00", status: "closed",    notes: "" },
  { id: "AL019", deviceId: "DEV005", deviceName: "灌溉控制器-A1-01",   metric: "流量异常", currentVal: "0.1L/min",threshold:"≥2L/min",level:"critical",time:"2024-05-30 08:00:00",status: "closed",    notes: "管道疏通" },
  { id: "AL020", deviceId: "DEV001", deviceName: "温湿度传感器-A1-01", metric: "电池电量", currentVal: "12%", threshold: "≥20%",   level: "info",     time: "2024-05-29 18:00:00", status: "closed",    notes: "已更换电池" },
  { id: "AL021", deviceId: "DEV004", deviceName: "光照传感器-A2-02",   metric: "数据异常", currentVal: "—",   threshold: "正常",    level: "warning",  time: "2024-05-29 12:30:00", status: "closed",    notes: "传感器清洁" },
  { id: "AL022", deviceId: "DEV011", deviceName: "灌溉控制器-B1-01",   metric: "压力过低", currentVal: "0.8bar",threshold:"≥1.5bar",level:"warning",  time: "2024-05-28 16:00:00", status: "closed",    notes: "" },
  { id: "AL023", deviceId: "DEV010", deviceName: "pH传感器-B1-02",     metric: "pH值",    currentVal: "5.4", threshold: "5.5~7.5", level: "warning",  time: "2024-05-28 10:00:00", status: "closed",    notes: "" },
  { id: "AL024", deviceId: "DEV008", deviceName: "温湿度传感器-A3-01", metric: "通信异常", currentVal: "—",   threshold: "正常",    level: "warning",  time: "2024-05-27 09:30:00", status: "closed",    notes: "" },
  { id: "AL025", deviceId: "DEV007", deviceName: "网关设备-A-GW01",    metric: "丢包率",   currentVal: "18%", threshold: "≤5%",    level: "info",     time: "2024-05-26 14:00:00", status: "closed",    notes: "网络优化" }
];

// =====================================================
// 10. 种植批次
// =====================================================
const BATCHES = [
  {
    id: "B2024001", crop: "水稻（粳稻）", variety: "南粳46",
    fields: ["F001","F002","F007","F008"],
    sowDate: "2024-04-15", harvestDate: "2024-09-20",
    area: 198, status: "growing", progress: 55,
    manager: "刘芮宏",
    desc: "本季种植南粳46，预计亩产600公斤。目前处于分蘖期，长势良好。"
  },
  {
    id: "B2024002", crop: "蔬菜（番茄+黄瓜）", variety: "金皇后/津春4号",
    fields: ["F003","F004"],
    sowDate: "2024-03-01", harvestDate: "2024-07-30",
    area: 58, status: "harvesting", progress: 80,
    manager: "王攀杰",
    desc: "温室蔬菜种植，番茄与黄瓜轮作，目前处于采摘期，日产量约120kg。"
  },
  {
    id: "B2024003", crop: "水果（苹果+草莓）", variety: "红富士/章姬",
    fields: ["F005","F006"],
    sowDate: "2024-01-10", harvestDate: "2024-12-15",
    area: 85, status: "growing", progress: 35,
    manager: "常琳昊",
    desc: "苹果与草莓混合种植区，草莓已进入采摘期，苹果处于膨大期。"
  }
];

// =====================================================
// 11. 田间作业记录（追溯用）
// =====================================================
const FIELD_RECORDS = {
  "B2024001": [
    {
      id: "TR001", type: "播种", date: "2024-04-15", operator: "刘芮宏",
      title: "播种作业",
      content: "完成南粳46育秧，播种量30kg/亩，均匀撒播。土壤温度18°C，墒情良好。",
      materials: ["南粳46种子 200kg", "育秧基质 500kg", "壮秧剂 10kg"],
      notes: "天气晴好，地表含水量适宜"
    },
    {
      id: "TR002", type: "施肥", date: "2024-04-28", operator: "王攀杰",
      title: "基肥施用",
      content: "施用氮磷钾复合肥，基肥施用量：纯氮8kg/亩、P₂O₅4kg/亩、K₂O6kg/亩。",
      materials: ["复合肥（15-15-15）60kg", "有机肥 200kg", "硼砂 2kg"],
      notes: "施肥均匀，避免局部过量"
    },
    {
      id: "TR003", type: "病虫害防治", date: "2024-05-18", operator: "常琳昊",
      title: "稻飞虱防治",
      content: "发现稻飞虱危害，及时喷施噻虫嗪防治。虫口密度约15头/百苗，低于防治阈值，预防性处理。",
      materials: ["25%噻虫嗪WG 30g", "三唑磷 200mL", "展着剂 50mL"],
      notes: "施药后禁止人员入田24小时"
    },
    {
      id: "TR004", type: "施肥", date: "2024-05-25", operator: "杨航",
      title: "穗肥施用",
      content: "在水稻幼穗分化期施用穗肥，以促进大穗形成。用量：纯氮4kg/亩。",
      materials: ["尿素（46%N）35kg", "硫酸钾 15kg"],
      notes: "施肥前排水晾田"
    },
    {
      id: "TR005", type: "灌溉", date: "2024-06-01", operator: "刘芮宏",
      title: "分蘖期水分管理",
      content: "保持浅水层（1-3cm）促分蘖，傍晚灌水，次日上午自然落干。系统自动控制灌溉。",
      materials: ["无"],
      notes: "土壤水分传感器读数维持55-65%"
    }
  ],
  "B2024002": [
    {
      id: "TR006", type: "播种", date: "2024-03-01", operator: "王攀杰",
      title: "温室定植",
      content: "番茄幼苗移栽入温室，行距60cm，株距45cm，密度3700株/亩。",
      materials: ["番茄苗（金皇后）3000株", "基质 500L", "定植水 适量"],
      notes: "温室温度调至25°C，湿度70%"
    },
    {
      id: "TR007", type: "施肥", date: "2024-04-10", operator: "王攀杰",
      title: "追肥",
      content: "结合滴灌追施钾肥，促进果实膨大，用量：硫酸钾8kg/亩。",
      materials: ["硫酸钾 30kg", "磷酸二氢钾 10kg"],
      notes: "配合灌溉系统追施，效果均匀"
    },
    {
      id: "TR008", type: "病虫害防治", date: "2024-05-05", operator: "常琳昊",
      title: "白粉病防治",
      content: "发现少量白粉病斑，及时喷施苯醚甲环唑预防蔓延。发病率约5%。",
      materials: ["43%苯醚甲环唑SC 20mL", "水 15L"],
      notes: "操作人员佩戴防护面具"
    }
  ],
  "B2024003": [
    {
      id: "TR009", type: "播种", date: "2024-01-10", operator: "常琳昊",
      title: "苹果春季修剪",
      content: "完成红富士苹果树春季修剪，疏除病弱枝、交叉枝，留单轴延伸主枝。",
      materials: ["修枝剪", "伤口愈合剂"],
      notes: "修剪后立即涂抹伤口愈合剂"
    },
    {
      id: "TR010", type: "施肥", date: "2024-02-20", operator: "常琳昊",
      title: "有机肥基施",
      content: "沿树冠滴水线开沟施有机肥，每株施腐熟鸡粪5kg + 控释肥0.5kg。",
      materials: ["腐熟鸡粪 500kg", "苹果专用控释肥 50kg"],
      notes: "施肥后覆土浇水"
    }
  ]
};

// =====================================================
// 12. 告警统计（近30天）
// =====================================================
function generateAlertStats() {
  const dates = [];
  const counts = { critical: [], warning: [], info: [] };
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 86400000);
    const mm = (t.getMonth() + 1).toString().padStart(2, "0");
    const dd = t.getDate().toString().padStart(2, "0");
    dates.push(mm + "-" + dd);
    counts.critical.push(Math.floor(Math.random() * 3));
    counts.warning.push(Math.floor(Math.random() * 5));
    counts.info.push(Math.floor(Math.random() * 4));
  }
  return { dates, counts };
}
const ALERT_STATS_30D = generateAlertStats();

// =====================================================
// 13. 告警阈值规则
// =====================================================
const ALERT_RULES = [
  { id: "R001", metric: "温度",    condition: ">30°C",    level: "warning",  enabled: true,  deviceTypes: ["sensor"] },
  { id: "R002", metric: "温度",    condition: ">35°C",    level: "critical", enabled: true,  deviceTypes: ["sensor"] },
  { id: "R003", metric: "湿度",    condition: ">85%",     level: "warning",  enabled: true,  deviceTypes: ["sensor"] },
  { id: "R004", metric: "土壤水分",condition: "<40%",     level: "warning",  enabled: true,  deviceTypes: ["sensor"] },
  { id: "R005", metric: "CO₂浓度",condition: ">500ppm",  level: "warning",  enabled: true,  deviceTypes: ["sensor"] },
  { id: "R006", metric: "CO₂浓度",condition: ">600ppm",  level: "critical", enabled: true,  deviceTypes: ["sensor"] },
  { id: "R007", metric: "pH值",    condition: "<5.5",     level: "critical", enabled: true,  deviceTypes: ["sensor"] },
  { id: "R008", metric: "pH值",    condition: ">7.5",     level: "warning",  enabled: true,  deviceTypes: ["sensor"] },
  { id: "R009", metric: "设备离线",condition: "≥10min",   level: "critical", enabled: true,  deviceTypes: ["sensor","controller","gateway"] }
];

// =====================================================
// 工具函数
// =====================================================

/**
 * 根据状态返回badge类型
 */
function getStatusBadge(status) {
  const map = {
    online:    { cls: "badge-online",  label: "在线" },
    offline:   { cls: "badge-offline", label: "离线" },
    fault:     { cls: "badge-fault",   label: "故障" },
    unhandled: { cls: "badge-danger",  label: "未处理" },
    confirmed: { cls: "badge-warning", label: "已确认" },
    closed:    { cls: "badge-default", label: "已关闭" },
    growing:   { cls: "badge-success", label: "生长中" },
    harvesting:{ cls: "badge-info",    label: "采收期" },
    finished:  { cls: "badge-default", label: "已完成" }
  };
  return map[status] || { cls: "badge-default", label: status };
}

/**
 * 根据告警等级返回样式
 */
function getAlertLevelInfo(level) {
  const map = {
    critical: { cls: "badge-danger",  label: "严重", color: "#C62828" },
    warning:  { cls: "badge-warning", label: "警告", color: "#E65100" },
    info:     { cls: "badge-info",    label: "提示", color: "#1565C0" }
  };
  return map[level] || { cls: "badge-default", label: level, color: "#616161" };
}

/**
 * 获取当前登录用户
 */
function getCurrentUser() {
  try {
    const u = sessionStorage.getItem("currentUser");
    if (u) return JSON.parse(u);
  } catch (_) {}
  return USERS[0];
}

/**
 * 设置当前用户
 */
function setCurrentUser(user) {
  sessionStorage.setItem("currentUser", JSON.stringify(user));
}

/**
 * 简单 toast 通知
 * @param {string} msg
 * @param {"success"|"error"|"warning"|"info"} type
 */
function showToast(msg, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all .3s";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * 格式化日期
 */
function fmtDate(str) {
  if (!str) return "—";
  return str.replace("T", " ").slice(0, 16);
}

/**
 * 统计设备在线情况
 */
function getDeviceStats() {
  const total   = DEVICES.length;
  const online  = DEVICES.filter(d => d.status === "online").length;
  const offline = DEVICES.filter(d => d.status === "offline").length;
  const fault   = DEVICES.filter(d => d.status === "fault").length;
  return { total, online, offline, fault };
}

/**
 * 统计告警情况
 */
function getAlertStats() {
  const total     = ALERTS.length;
  const critical  = ALERTS.filter(a => a.level === "critical").length;
  const warning   = ALERTS.filter(a => a.level === "warning").length;
  const info      = ALERTS.filter(a => a.level === "info").length;
  const unhandled = ALERTS.filter(a => a.status === "unhandled").length;
  return { total, critical, warning, info, unhandled };
}

// 全局暴露
window.USERS         = USERS;
window.FARMS         = FARMS;
window.ZONES         = ZONES;
window.FIELDS        = FIELDS;
window.DEVICES       = DEVICES;
window.REALTIME_DATA = REALTIME_DATA;
window.HISTORY_24H   = HISTORY_24H;
window.HISTORY_30D   = HISTORY_30D;
window.ALERTS        = ALERTS;
window.ALERT_STATS_30D = ALERT_STATS_30D;
window.ALERT_RULES   = ALERT_RULES;
window.BATCHES       = BATCHES;
window.FIELD_RECORDS = FIELD_RECORDS;
window.getStatusBadge  = getStatusBadge;
window.getAlertLevelInfo = getAlertLevelInfo;
window.getCurrentUser  = getCurrentUser;
window.setCurrentUser  = setCurrentUser;
window.showToast       = showToast;
window.fmtDate         = fmtDate;
window.getDeviceStats  = getDeviceStats;
window.getAlertStats   = getAlertStats;
